
import { createClient } from '@supabase/supabase-js';
import { Invoice, Project, Transaction } from '../types';
import { StorageService } from './storage';

const getConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }
  
  const stored = StorageService.getSupabaseConfig();
  return stored || { url: '', anonKey: '' };
};

const config = getConfig();

// Initialize with empty strings if not found; user will be prompted in UI
export const supabase = createClient(config.url || 'https://placeholder.supabase.co', config.anonKey || 'placeholder');

export const DBService = {
  isConfigured: () => {
    const c = getConfig();
    return c.url !== '' && c.anonKey !== '';
  },

  // Invoices
  getInvoices: async () => {
    if (!DBService.isConfigured()) return [];
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Invoice[];
  },
  addInvoice: async (invoice: Omit<Invoice, 'id'>) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select();
    if (error) throw error;
    return data[0] as Invoice;
  },
  updateInvoice: async (id: string, updates: Partial<Invoice>) => {
    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  // Projects
  getProjects: async () => {
    if (!DBService.isConfigured()) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Project[];
  },
  addProject: async (project: Omit<Project, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select();
    if (error) throw error;
    return data[0] as Project;
  }
};
