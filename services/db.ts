
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Invoice, Project, Transaction } from '../types';
import { StorageService } from './storage';

const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }
  
  const stored = StorageService.getSupabaseConfig();
  return stored || { url: '', anonKey: '' };
};

let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (_supabase) return _supabase;

  const config = getSupabaseConfig();
  const url = config.url && config.url.startsWith('http') ? config.url : 'https://placeholder.supabase.co';
  const key = config.anonKey || 'placeholder';

  _supabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  return _supabase;
};

export const DBService = {
  isConfigured: () => {
    const config = getSupabaseConfig();
    return !!(config.url?.startsWith('https://') && config.anonKey?.length > 20);
  },

  reinitialize: () => {
    _supabase = null;
    return getSupabase();
  },

  getInvoices: async () => {
    if (!DBService.isConfigured()) return [];
    try {
      const { data, error } = await getSupabase()
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    } catch (e) {
      console.warn("Table 'invoices' error:", e);
      return [];
    }
  },

  addInvoice: async (invoice: Omit<Invoice, 'id'>) => {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from('invoices')
      .insert([{ ...invoice, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0] as Invoice;
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>) => {
    const { error } = await getSupabase().from('invoices').update(updates).eq('id', id);
    if (error) throw error;
  },

  deleteInvoice: async (id: string) => {
    const { error } = await getSupabase().from('invoices').delete().eq('id', id);
    if (error) throw error;
  },

  getProjects: async () => {
    if (!DBService.isConfigured()) return [];
    try {
      const { data, error } = await getSupabase()
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    } catch (e) {
      console.warn("Table 'projects' error:", e);
      return [];
    }
  },

  addProject: async (project: Omit<Project, 'id' | 'createdAt'>) => {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from('projects')
      .insert([{ ...project, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0] as Project;
  },

  deleteProject: async (id: string) => {
    const { error } = await getSupabase().from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  getTransactions: async () => {
    if (!DBService.isConfigured()) return [];
    try {
      const { data, error } = await getSupabase()
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    } catch (e) {
      console.warn("Table 'transactions' error:", e);
      return [];
    }
  },

  addTransaction: async (tx: Omit<Transaction, 'id'>) => {
    const client = getSupabase();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from('transactions')
      .insert([{ ...tx, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0] as Transaction;
  },

  deleteTransaction: async (id: string) => {
    const { error } = await getSupabase().from('transactions').delete().eq('id', id);
    if (error) throw error;
  }
};
