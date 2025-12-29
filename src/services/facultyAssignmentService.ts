// Faculty Assignment Service
// Handles all faculty class and subject assignment operations

import { supabase } from '@/supabase/supabaseClient';

export interface FacultyClassAssignment {
  id?: number;
  faculty_id: string;
  class_id: string;
  subject_id: number;
  assigned_at?: string;
  is_active?: boolean;
}

export interface FacultyAssignmentView {
  id: number;
  faculty_id: string;
  faculty_name: string;
  faculty_department: string;
  class_id: string;
  class_name: string;
  class_department: string;
  semester: number;
  academic_year: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  assigned_at: string;
  is_active: boolean;
}

export interface ClassDetail {
  class_id: string;
  class_name: string;
  department: string;
  semester: number;
  academic_year: string;
  subject_count?: number;
}

export interface SubjectForClass {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  description: string;
}

/**
 * Get all classes assigned to a faculty member
 * If no specific class assignments exist but faculty has subjects, return all classes
 */
export const getFacultyClasses = async (facultyId: string): Promise<ClassDetail[]> => {
  try {
    // Try to get specific class assignments from new system (faculty_classes table)
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('faculty_classes')
      .select(`
        class_id,
        class_details:class_id (
          class_id,
          class_name,
          department,
          semester,
          academic_year
        )
      `)
      .eq('faculty_id', facultyId)
      .eq('is_active', true);

    if (assignmentsError) {
      console.error('Error querying faculty_classes:', assignmentsError);
    }

    if (assignmentsData && assignmentsData.length > 0) {
      // Extract unique classes from assignments
      const uniqueClasses = new Map<string, ClassDetail>();
      
      assignmentsData.forEach((assignment: any) => {
        if (assignment.class_details) {
          const classDetail = assignment.class_details;
          if (!uniqueClasses.has(classDetail.class_id)) {
            uniqueClasses.set(classDetail.class_id, {
              class_id: classDetail.class_id,
              class_name: classDetail.class_name,
              department: classDetail.department,
              semester: classDetail.semester,
              academic_year: classDetail.academic_year,
              subject_count: 0
            });
          }
        }
      });

      const classes = Array.from(uniqueClasses.values());
      console.log('Found classes from faculty_classes:', classes);
      return classes;
    }

    // If no class assignments but faculty has subjects in old system, return all classes
    console.log('No class assignments found, checking if faculty has subjects...');
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('faculty_subjects')
      .select('subject_id')
      .eq('faculty_id', facultyId)
      .limit(1);

    if (!subjectsError && subjectsData && subjectsData.length > 0) {
      // Faculty has subjects but no class assignments, return all classes
      console.log('Faculty has subjects, returning all classes');
      const { data: allClasses, error: classError } = await supabase
        .from('class_details')
        .select('class_id, class_name, department, semester, academic_year')
        .order('department, semester, class_name');

      if (classError) throw classError;

      return allClasses?.map(c => ({
        ...c,
        subject_count: 0
      })) || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching faculty classes:', error);
    return [];
  }
};

/**
 * Get all subjects a faculty teaches for a specific class
 */
export const getFacultySubjectsForClass = async (
  facultyId: string,
  classId: string
): Promise<SubjectForClass[]> => {
  try {
    // Query faculty_classes table with subject details
    const { data, error } = await supabase
      .from('faculty_classes')
      .select(`
        subject_id,
        subjects:subject_id (
          id,
          name,
          code,
          description
        )
      `)
      .eq('faculty_id', facultyId)
      .eq('class_id', classId)
      .eq('is_active', true);

    if (error) throw error;

    // Map to SubjectForClass interface
    const subjects = (data || []).map((item: any) => ({
      subject_id: item.subjects?.id || item.subject_id,
      subject_name: item.subjects?.name || '',
      subject_code: item.subjects?.code || '',
      description: item.subjects?.description || ''
    })).filter(s => s.subject_name);

    console.log('Found subjects for class:', subjects);
    return subjects;
  } catch (error) {
    console.error('Error fetching faculty subjects for class:', error);
    return [];
  }
};

/**
 * Check if faculty can teach a subject to a class
 */
export const canFacultyTeachSubjectToClass = async (
  facultyId: string,
  classId: string,
  subjectId: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('faculty_classes')
      .select('id')
      .eq('faculty_id', facultyId)
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Error checking faculty permission:', error);
    return false;
  }
};

/**
 * Get all assignments for a faculty member
 */
export const getFacultyAssignments = async (facultyId: string): Promise<FacultyAssignmentView[]> => {
  try {
    const { data, error } = await supabase
      .from('faculty_assignment_view')
      .select('*')
      .eq('faculty_id', facultyId)
      .eq('is_active', true)
      .order('class_name', { ascending: true })
      .order('subject_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching faculty assignments:', error);
    return [];
  }
};

/**
 * Assign a class and subject to a faculty member (Admin only)
 */
export const assignClassToFaculty = async (
  facultyId: string,
  classId: string,
  subjectId: number
): Promise<FacultyClassAssignment | null> => {
  try {
    const { data, error } = await supabase
      .from('faculty_classes')
      .insert([{
        faculty_id: facultyId,
        class_id: classId,
        subject_id: subjectId,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error assigning class to faculty:', error);
    throw error;
  }
};

/**
 * Remove a class assignment from faculty (Admin only)
 */
export const removeClassFromFaculty = async (assignmentId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('faculty_classes')
      .update({ is_active: false })
      .eq('id', assignmentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing class from faculty:', error);
    return false;
  }
};

/**
 * Delete a class assignment permanently (Admin only)
 */
export const deleteClassAssignment = async (assignmentId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('faculty_classes')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting class assignment:', error);
    return false;
  }
};

/**
 * Get all assignments for a specific class (Admin view)
 */
export const getClassAssignments = async (classId: string): Promise<FacultyAssignmentView[]> => {
  try {
    const { data, error } = await supabase
      .from('faculty_assignment_view')
      .select('*')
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('subject_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    return [];
  }
};

/**
 * Get all subjects assigned to a faculty (across all classes)
 * Checks both new faculty_classes table and old faculty_subjects table
 */
export const getAllFacultySubjects = async (facultyId: string): Promise<SubjectForClass[]> => {
  try {
    // First, try the new faculty_classes table
    const { data: newData, error: newError } = await supabase
      .from('faculty_assignment_view')
      .select('subject_id, subject_name, subject_code')
      .eq('faculty_id', facultyId)
      .eq('is_active', true);

    if (!newError && newData && newData.length > 0) {
      // Remove duplicates based on subject_id
      const uniqueSubjects = newData.reduce((acc: SubjectForClass[], curr) => {
        if (!acc.find(s => s.subject_id === curr.subject_id)) {
          acc.push({
            subject_id: curr.subject_id,
            subject_name: curr.subject_name,
            subject_code: curr.subject_code,
            description: ''
          });
        }
        return acc;
      }, []);

      return uniqueSubjects;
    }

    // Fallback to old faculty_subjects table if new table has no data
    console.log('No assignments in faculty_classes, checking faculty_subjects...');
    const { data: oldData, error: oldError } = await supabase
      .from('faculty_subjects')
      .select(`
        subject_id,
        subjects:subject_id (
          id,
          name,
          code,
          description
        )
      `)
      .eq('faculty_id', facultyId);

    if (oldError) {
      console.error('Error fetching from faculty_subjects:', oldError);
      return [];
    }

    // Map old data format to new format
    const subjects = oldData?.map((item: any) => ({
      subject_id: item.subjects?.id || item.subject_id,
      subject_name: item.subjects?.name || '',
      subject_code: item.subjects?.code || '',
      description: item.subjects?.description || ''
    })).filter(s => s.subject_name) || [];

    return subjects;
  } catch (error) {
    console.error('Error fetching all faculty subjects:', error);
    return [];
  }
};

/**
 * Bulk assign multiple subjects to a faculty for a class
 */
export const bulkAssignSubjectsToClass = async (
  facultyId: string,
  classId: string,
  subjectIds: number[]
): Promise<boolean> => {
  try {
    const assignments = subjectIds.map(subjectId => ({
      faculty_id: facultyId,
      class_id: classId,
      subject_id: subjectId,
      is_active: true
    }));

    const { error } = await supabase
      .from('faculty_classes')
      .insert(assignments);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error bulk assigning subjects:', error);
    return false;
  }
};
