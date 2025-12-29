import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/supabase/supabaseClient';
import { useUser } from '@/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit2, BookOpen, Search } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  semester: number;
  is_active: boolean;
  created_at: string;
}

const SubjectManagement = () => {
  const { userData } = useUser();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    semester: 1,
  });

  const departments = ['IT', 'CE', 'CS', 'DIT', 'DCE', 'DCS'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    if (userData?.role === 'admin') {
      fetchSubjects();
    }
  }, [userData]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('department, semester, name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load subjects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      if (!formData.name.trim() || !formData.code.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Subject name and code are required',
          variant: 'destructive',
        });
        return;
      }

      // Check if subject code already exists
      const { data: existingSubject, error: checkError } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', formData.code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (existingSubject) {
        toast({
          title: 'Error',
          description: 'Subject code already exists',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('subjects')
        .insert({
          ...formData,
          code: formData.code.toUpperCase(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSubjects([...subjects, data]);
      setFormData({
        name: '',
        code: '',
        description: '',
        department: '',
        semester: 1,
      });
      setCreateDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Subject created successfully',
      });
    } catch (error: any) {
      console.error('Error creating subject:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subject',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubject = async () => {
    try {
      if (!editingSubject || !formData.name.trim() || !formData.code.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Subject name and code are required',
          variant: 'destructive',
        });
        return;
      }

      // Check if subject code is used by another subject
      const { data: existingSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', formData.code.toUpperCase())
        .neq('id', editingSubject.id)
        .eq('is_active', true)
        .single();

      if (existingSubject) {
        toast({
          title: 'Error',
          description: 'Subject code already exists',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('subjects')
        .update({
          ...formData,
          code: formData.code.toUpperCase(),
        })
        .eq('id', editingSubject.id)
        .select()
        .single();

      if (error) throw error;

      setSubjects(subjects.map(s => s.id === editingSubject.id ? data : s));
      setFormData({
        name: '',
        code: '',
        description: '',
        department: '',
        semester: 1,
      });
      setEditingSubject(null);
      setEditDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Subject updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subject',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubjects(subjects.filter(s => s.id !== id));
      toast({
        title: 'Success',
        description: 'Subject deleted permanently from database',
      });
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subject',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      department: subject.department,
      semester: subject.semester,
    });
    setEditDialogOpen(true);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const key = `${subject.department}-${subject.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  if (userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">Only administrators can manage subjects</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-campusteal-600" />
                Subject Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage all subjects in the system</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-campusteal-600 hover:bg-campusteal-700 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                  <DialogDescription>
                    Add a new subject to the system. It will be available for use across all modules.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Subject Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Data Structures"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Subject Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., CS101"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <select
                      id="semester"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Subject description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateSubject}
                    className="w-full bg-campusteal-600 hover:bg-campusteal-700"
                  >
                    Create Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Subjects List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Subjects Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Create your first subject to get started'}
              </p>
              {!searchTerm && (
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-campusteal-600 hover:bg-campusteal-700 gap-2">
                      <Plus className="h-4 w-4" />
                      Create Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Subject</DialogTitle>
                      <DialogDescription>
                        Add a new subject to the system. It will be available for use across all modules.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Subject Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Data Structures"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="code">Subject Code *</Label>
                        <Input
                          id="code"
                          placeholder="e.g., CS101"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <select
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="semester">Semester</Label>
                        <select
                          id="semester"
                          value={formData.semester}
                          onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        >
                          {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Subject description..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleCreateSubject}
                        className="w-full bg-campusteal-600 hover:bg-campusteal-700"
                      >
                        Create Subject
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSubjects).map(([key, groupSubjects]) => {
              const [dept, sem] = key.split('-');
              return (
                <div key={key}>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {dept} - Semester {sem}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupSubjects.map(subject => (
                      <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{subject.name}</CardTitle>
                              <p className="text-sm text-gray-600 font-mono mt-1">{subject.code}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {subject.description && (
                            <p className="text-sm text-gray-600">{subject.description}</p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-xs text-gray-500">
                              Created: {new Date(subject.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Dialog open={editDialogOpen && editingSubject?.id === subject.id} onOpenChange={setEditDialogOpen}>
                                <AlertDialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditClick(subject)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </AlertDialog>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{subject.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSubject(subject.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update subject details. Changes will be applied system-wide.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Subject Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Data Structures"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Subject Code *</Label>
                <Input
                  id="edit-code"
                  placeholder="e.g., CS101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <select
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-semester">Semester</Label>
                <select
                  id="edit-semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Subject description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleUpdateSubject}
                className="w-full bg-campusteal-600 hover:bg-campusteal-700"
              >
                Update Subject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default SubjectManagement;
