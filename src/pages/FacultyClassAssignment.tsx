// Faculty Class Assignment Component
// Allows admins to assign classes and subjects to faculty members

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { useUser } from '@/UserContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  UserPlus, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { fetchAllSubjects, type Subject } from '@/services/subjectService';
import {
  assignClassToFaculty,
  getFacultyAssignments,
  deleteClassAssignment,
  type FacultyAssignmentView
} from '@/services/facultyAssignmentService';

interface Faculty {
  user_id: string;
  name: string;
  email: string;
  department: string;
}

interface ClassDetail {
  class_id: string;
  class_name: string;
  department: string;
  semester: number;
  academic_year: string;
}

const FacultyClassAssignmentManagement: React.FC = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classes, setClasses] = useState<ClassDetail[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<FacultyAssignmentView[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!userData || userData.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to administrators.',
        variant: 'destructive'
      });
      navigate('/Index');
    }
  }, [userData, navigate, toast]);

  // Load initial data
  useEffect(() => {
    loadFaculties();
    loadClasses();
    loadSubjects();
  }, []);

  // Load assignments when faculty is selected
  useEffect(() => {
    if (selectedFaculty) {
      loadAssignments(selectedFaculty);
    } else {
      setAssignments([]);
    }
  }, [selectedFaculty]);

  const loadFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('user_id, fname, lname, email, department');

      if (error) throw error;
      
      // Map the data to include a combined name field
      const facultiesWithName = data?.map(f => ({
        user_id: f.user_id,
        name: `${f.fname} ${f.lname}`,
        email: f.email,
        department: f.department
      })).sort((a, b) => a.name.localeCompare(b.name)) || [];
      
      setFaculties(facultiesWithName);
    } catch (error) {
      console.error('Error loading faculties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load faculty members.',
        variant: 'destructive'
      });
    }
  };

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('class_details')
        .select('class_id, class_name, department, semester, academic_year')
        .order('department, semester, class_name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes.',
        variant: 'destructive'
      });
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await fetchAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects.',
        variant: 'destructive'
      });
    }
  };

  const loadAssignments = async (facultyId: string) => {
    try {
      setLoading(true);
      const data = await getFacultyAssignments(facultyId);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedFaculty) {
      toast({
        title: 'Missing Information',
        description: 'Please select a faculty member.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedClasses.length === 0 || selectedSubjects.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select at least one class and one subject.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAssignmentLoading(true);
      let successCount = 0;
      let failCount = 0;

      // Create assignments for each combination of class and subject
      for (const classId of selectedClasses) {
        for (const subjectId of selectedSubjects) {
          try {
            await assignClassToFaculty(selectedFaculty, classId, subjectId);
            successCount++;
          } catch (error: any) {
            if (!error.message?.includes('unique_faculty_class_subject')) {
              failCount++;
              console.error('Error assigning:', error);
            }
            // Skip duplicates silently
          }
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `${successCount} assignment(s) created successfully.`,
        });
      }

      if (failCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${failCount} assignment(s) failed. Some may already exist.`,
          variant: 'default'
        });
      }

      // Reload assignments
      await loadAssignments(selectedFaculty);

      // Clear selections
      setSelectedClasses([]);
      setSelectedSubjects([]);
    } catch (error: any) {
      console.error('Error assigning classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign classes to faculty.',
        variant: 'destructive'
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await deleteClassAssignment(assignmentId);

      if (success) {
        toast({
          title: 'Success',
          description: 'Assignment removed successfully.',
        });

        // Reload assignments
        if (selectedFaculty) {
          await loadAssignments(selectedFaculty);
        }
      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove assignment.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedFacultyData = faculties.find(f => f.user_id === selectedFaculty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Faculty Class Assignment
          </h1>
          <p className="text-gray-600">
            Assign classes and subjects to faculty members
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                New Assignment
              </CardTitle>
              <CardDescription>
                Assign a class and subject to a faculty member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Faculty Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Faculty Member</label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty..." />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.user_id} value={faculty.user_id}>
                        {faculty.name} - {faculty.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFacultyData && (
                <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedFacultyData.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    {selectedFacultyData.department}
                  </p>
                </div>
              )}

              {/* Class Selection with Checkboxes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Classes</label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {classes.length === 0 ? (
                    <p className="text-sm text-gray-500">No classes available</p>
                  ) : (
                    classes.map((cls) => (
                      <div key={cls.class_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${cls.class_id}`}
                          checked={selectedClasses.includes(cls.class_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedClasses([...selectedClasses, cls.class_id]);
                            } else {
                              setSelectedClasses(selectedClasses.filter(id => id !== cls.class_id));
                            }
                          }}
                          disabled={!selectedFaculty}
                        />
                        <label
                          htmlFor={`class-${cls.class_id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {cls.class_name} - Sem {cls.semester}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedClasses.length > 0 && (
                  <p className="text-xs text-blue-600">{selectedClasses.length} class(es) selected</p>
                )}
              </div>

              {/* Subject Selection with Checkboxes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subjects</label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-gray-500">No subjects available</p>
                  ) : (
                    subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject.id}`}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSubjects([...selectedSubjects, subject.id]);
                            } else {
                              setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
                            }
                          }}
                          disabled={selectedClasses.length === 0}
                        />
                        <label
                          htmlFor={`subject-${subject.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {subject.name} ({subject.code})
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedSubjects.length > 0 && (
                  <p className="text-xs text-blue-600">{selectedSubjects.length} subject(s) selected</p>
                )}
              </div>

              <Button 
                onClick={handleAssign} 
                disabled={!selectedFaculty || selectedClasses.length === 0 || selectedSubjects.length === 0 || assignmentLoading}
                className="w-full"
              >
                {assignmentLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Assign to Faculty ({selectedClasses.length} × {selectedSubjects.length} = {selectedClasses.length * selectedSubjects.length})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Current Assignments
              </CardTitle>
              <CardDescription>
                {selectedFacultyData 
                  ? `Showing assignments for ${selectedFacultyData.name}` 
                  : 'Select a faculty member to view their assignments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFaculty ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Please select a faculty member to view assignments</p>
                </div>
              ) : loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-600">Loading assignments...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No assignments found for this faculty member</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.class_name}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assignment.subject_name}</p>
                              <p className="text-xs text-gray-500">{assignment.subject_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.class_department}
                            </Badge>
                          </TableCell>
                          <TableCell>{assignment.semester}</TableCell>
                          <TableCell>{assignment.academic_year}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(assignment.id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        {selectedFaculty && assignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Classes</p>
                    <p className="text-2xl font-bold">
                      {new Set(assignments.map(a => a.class_id)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Subjects</p>
                    <p className="text-2xl font-bold">
                      {new Set(assignments.map(a => a.subject_id)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold">{assignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FacultyClassAssignmentManagement;
