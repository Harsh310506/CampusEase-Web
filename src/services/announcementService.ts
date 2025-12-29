import { supabase } from '@/supabase/supabaseClient';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  theme: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'gradient';
  language: 'en' | 'hi' | 'gu' | 'es' | 'fr' | 'de';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience: 'all' | 'students' | 'faculty' | 'admin';
  is_active: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

export const fetchAllAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const fetchAnnouncementsByAudience = async (role: string): Promise<Announcement[]> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`target_audience.eq.all,target_audience.eq.${role}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching announcements by audience:', error);
    return [];
  }
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement | null> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const updateAnnouncement = async (id: number, updates: Partial<Announcement>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating announcement:', error);
    return false;
  }
};

export const deleteAnnouncement = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }
};

export const toggleAnnouncementStatus = async (id: number, isActive: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    return false;
  }
};
