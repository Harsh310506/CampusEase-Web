import { supabase } from '@/supabase/supabaseClient';
import * as XLSX from 'xlsx';

export interface AttendanceRecord {
  id: number;
  user_id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  class_id: string;
  department: string;
  date: string;
  subject: string;
  class_type: string;
  status: string;
  marked_by: string;
  faculty_name: string;
}

export interface ClassAttendanceStats {
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  attendance_percentage: number;
}

/**
 * Fetch attendance records for a specific class within a date range
 */
export async function fetchClassAttendance(
  classId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('student_name', { ascending: true });

  if (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get list of students enrolled in a class
 */
export async function fetchClassStudents(classId: string) {
  const { data, error } = await supabase
    .from('student_records')
    .select('user_id, fname, lname, roll_no')
    .eq('class_id', classId)
    .order('roll_no', { ascending: true });

  if (error) {
    console.error('Error fetching students:', error);
    throw error;
  }

  return data || [];
}

/**
 * Generate attendance statistics by date
 */
export function generateAttendanceStatsByDate(
  records: AttendanceRecord[]
): ClassAttendanceStats[] {
  const dateMap = new Map<string, ClassAttendanceStats>();

  records.forEach((record) => {
    const date = record.date;
    
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        total_students: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendance_percentage: 0,
      });
    }

    const stats = dateMap.get(date)!;
    stats.total_students++;

    if (record.status === 'present') {
      stats.present++;
    } else if (record.status === 'absent') {
      stats.absent++;
    } else if (record.status === 'late') {
      stats.late++;
    }

    stats.attendance_percentage = Math.round((stats.present / stats.total_students) * 100);
  });

  return Array.from(dateMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Export class attendance to Excel for a week
 */
export async function exportClassAttendanceToExcel(
  classId: string,
  className: string,
  startDate: string,
  endDate: string
): Promise<void> {
  try {
    // Fetch attendance records
    const attendanceRecords = await fetchClassAttendance(classId, startDate, endDate);
    
    // Fetch all students in the class
    const students = await fetchClassStudents(classId);

    if (students.length === 0) {
      throw new Error('No students found in this class');
    }

    // Get unique dates from attendance records
    const uniqueDates = Array.from(
      new Set(attendanceRecords.map(r => r.date))
    ).sort();

    // Create attendance lookup map: student_user_id -> date -> status
    const attendanceMap = new Map<string, Map<string, string>>();
    
    attendanceRecords.forEach((record) => {
      if (!attendanceMap.has(record.user_id)) {
        attendanceMap.set(record.user_id, new Map());
      }
      attendanceMap.get(record.user_id)!.set(record.date, record.status);
    });

    // Prepare Excel data
    const excelData: any[] = [];

    // Header row with student info and dates
    const headerRow = ['Roll No', 'Student Name', 'User ID', ...uniqueDates, 'Total Present', 'Total Absent', 'Attendance %'];
    excelData.push(headerRow);

    // Student rows
    students.forEach((student) => {
      const studentName = `${student.fname} ${student.lname}`;
      const row: any[] = [student.roll_no, studentName, student.user_id];

      let totalPresent = 0;
      let totalRecorded = 0;

      // Add status for each date
      uniqueDates.forEach((date) => {
        const studentDateMap = attendanceMap.get(student.user_id);
        const status = studentDateMap?.get(date) || '-';
        
        // Use symbols for better readability
        let displayStatus = '-';
        if (status === 'present') {
          displayStatus = 'P';
          totalPresent++;
          totalRecorded++;
        } else if (status === 'absent') {
          displayStatus = 'A';
          totalRecorded++;
        } else if (status === 'late') {
          displayStatus = 'L';
          totalPresent++; // Count late as present for percentage
          totalRecorded++;
        }
        
        row.push(displayStatus);
      });

      // Add summary columns
      const totalAbsent = totalRecorded - totalPresent;
      const attendancePercentage = totalRecorded > 0 
        ? Math.round((totalPresent / totalRecorded) * 100) 
        : 0;

      row.push(totalPresent, totalAbsent, `${attendancePercentage}%`);
      excelData.push(row);
    });

    // Add summary row
    excelData.push([]); // Empty row
    excelData.push(['Summary Statistics']);
    excelData.push(['Date', 'Total Students', 'Present', 'Absent', 'Late', 'Attendance %']);

    uniqueDates.forEach((date) => {
      const dateRecords = attendanceRecords.filter(r => r.date === date);
      const present = dateRecords.filter(r => r.status === 'present').length;
      const absent = dateRecords.filter(r => r.status === 'absent').length;
      const late = dateRecords.filter(r => r.status === 'late').length;
      const total = dateRecords.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      excelData.push([
        date,
        total,
        present,
        absent,
        late,
        `${percentage}%`
      ]);
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 10 },  // Roll No
      { wch: 25 },  // Student Name
      { wch: 15 },  // User ID
      ...uniqueDates.map(() => ({ wch: 12 })), // Date columns
      { wch: 12 },  // Total Present
      { wch: 12 },  // Total Absent
      { wch: 12 },  // Attendance %
    ];
    worksheet['!cols'] = colWidths;

    // Apply styles to header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'CCCCCC' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    // Generate filename
    const fromDate = new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-');
    const toDate = new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-');
    const filename = `${className}_Attendance_${fromDate}_to_${toDate}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting attendance:', error);
    throw error;
  }
}

/**
 * Get date range for current week (Monday to Sunday)
 */
export function getCurrentWeekDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Calculate Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
  };
}

/**
 * Get date range for previous week
 */
export function getPreviousWeekDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Calculate Monday of previous week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
  monday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday of previous week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
  };
}

/**
 * Get custom date range
 */
export function getCustomDateRange(weeksAgo: number): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Calculate Monday of target week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - (weeksAgo * 7));
  monday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday of target week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
  };
}
