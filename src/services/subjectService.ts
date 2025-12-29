import { supabase } from '@/supabase/supabaseClient';

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  semester: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Fetch all active subjects from the database
 * Used across Resources, Attendance, and other modules
 */
export const fetchAllSubjects = async (): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('department, semester, name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

/**
 * Fetch subjects by department and semester
 */
export const fetchSubjectsByDepartmentAndSemester = async (
  department: string,
  semester: number
): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('department', department)
      .eq('semester', semester)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

/**
 * Fetch subjects by department
 */
export const fetchSubjectsByDepartment = async (department: string): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('department', department)
      .eq('is_active', true)
      .order('semester, name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

/**
 * Get subject by code
 */
export const getSubjectByCode = async (code: string): Promise<Subject | null> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
};

/**
 * Get subject name by ID
 */
export const getSubjectName = async (subjectId: number): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single();

    if (error) throw error;
    return data?.name || 'Unknown Subject';
  } catch (error) {
    console.error('Error fetching subject name:', error);
    return 'Unknown Subject';
  }
};

/**
 * Create subject (admin only)
 */
export const createSubject = async (subject: Omit<Subject, 'id' | 'created_at' | 'is_active'>) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        ...subject,
        code: subject.code.toUpperCase(),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

/**
 * Update subject (admin only)
 */
export const updateSubject = async (
  id: number,
  updates: Partial<Omit<Subject, 'id' | 'created_at'>>
) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update({
        ...updates,
        ...(updates.code && { code: updates.code.toUpperCase() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

/**
 * Delete subject permanently from database (admin only)
 */
export const deleteSubject = async (id: number) => {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
