
import { Invoice, Project, Transaction } from '../types';

const KEYS = {
  INVOICES: 'getrich_invoices',
  PROJECTS: 'getrich_projects',
  TRANSACTIONS: 'getrich_transactions',
  SETTINGS: 'getrich_settings',
  SUPABASE_CONFIG: 'getrich_supabase_config'
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const StorageService = {
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },
  saveInvoices: (invoices: Invoice[]) => {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },
  
  getProjects: (): Project[] => {
    const data = localStorage.getItem(KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },
  saveProjects: (projects: Project[]) => {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  },
  
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getSupabaseConfig: (): SupabaseConfig | null => {
    const data = localStorage.getItem(KEYS.SUPABASE_CONFIG);
    return data ? JSON.parse(data) : null;
  },
  saveSupabaseConfig: (config: SupabaseConfig) => {
    localStorage.setItem(KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  }
};
