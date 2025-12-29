import { supabase } from '@/supabase/supabaseClient';

export interface ReportFieldConfig {
  id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'file';
  options: string[];
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWeight {
  id: number;
  category: string;
  weight: number;
  is_active: boolean;
}

export interface ImpactWeight {
  id: number;
  impact_scope: string;
  weight: number;
  is_active: boolean;
}

export interface OccurrenceWeight {
  id: number;
  occurrence_pattern: string;
  weight: number;
  is_active: boolean;
}

// Fetch all active report field configurations
export const fetchReportFieldConfigs = async (): Promise<ReportFieldConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('report_field_config')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching report field configs:', error);
    return [];
  }
};

// Fetch all report field configurations (including inactive)
export const fetchAllReportFieldConfigs = async (): Promise<ReportFieldConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('report_field_config')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all report field configs:', error);
    return [];
  }
};

// Create a new field configuration
export const createFieldConfig = async (config: Omit<ReportFieldConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ReportFieldConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('report_field_config')
      .insert([config])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating field config:', error);
    throw error;
  }
};

// Update field configuration
export const updateFieldConfig = async (id: number, updates: Partial<ReportFieldConfig>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('report_field_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating field config:', error);
    return false;
  }
};

// Delete field configuration
export const deleteFieldConfig = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('report_field_config')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting field config:', error);
    return false;
  }
};

// Category Weights
export const fetchCategoryWeights = async (): Promise<CategoryWeight[]> => {
  try {
    const { data, error } = await supabase
      .from('category_weights')
      .select('*')
      .eq('is_active', true)
      .order('category');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching category weights:', error);
    return [];
  }
};

export const updateCategoryWeight = async (id: number, weight: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('category_weights')
      .update({ weight, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating category weight:', error);
    return false;
  }
};

export const createCategoryWeight = async (category: string, weight: number): Promise<CategoryWeight | null> => {
  try {
    const { data, error } = await supabase
      .from('category_weights')
      .insert([{ category, weight, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category weight:', error);
    throw error;
  }
};

// Impact Weights
export const fetchImpactWeights = async (): Promise<ImpactWeight[]> => {
  try {
    const { data, error } = await supabase
      .from('impact_weights')
      .select('*')
      .eq('is_active', true)
      .order('impact_scope');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching impact weights:', error);
    return [];
  }
};

export const updateImpactWeight = async (id: number, weight: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('impact_weights')
      .update({ weight })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating impact weight:', error);
    return false;
  }
};

// Occurrence Weights
export const fetchOccurrenceWeights = async (): Promise<OccurrenceWeight[]> => {
  try {
    const { data, error } = await supabase
      .from('occurrence_weights')
      .select('*')
      .eq('is_active', true)
      .order('occurrence_pattern');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching occurrence weights:', error);
    return [];
  }
};

export const updateOccurrenceWeight = async (id: number, weight: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('occurrence_weights')
      .update({ weight })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating occurrence weight:', error);
    return false;
  }
};

// Sync weights to ML service
export const syncWeightsToMLService = async (): Promise<boolean> => {
  try {
    const [categories, impacts, occurrences] = await Promise.all([
      fetchCategoryWeights(),
      fetchImpactWeights(),
      fetchOccurrenceWeights()
    ]);

    // Send to ML service
    const response = await fetch('http://localhost:5000/sync_weights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_weights: categories.reduce((acc, c) => ({ ...acc, [c.category]: c.weight }), {}),
        impact_weights: impacts.reduce((acc, i) => ({ ...acc, [i.impact_scope]: i.weight }), {}),
        occurrence_weights: occurrences.reduce((acc, o) => ({ ...acc, [o.occurrence_pattern]: o.weight }), {})
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error syncing weights to ML service:', error);
    return false;
  }
};
