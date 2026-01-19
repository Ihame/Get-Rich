
import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  FolderGit2, 
  Wallet, 
  Sparkles, 
  Settings,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export const NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { name: 'Invoices', icon: <Receipt size={20} />, path: '/invoices' },
  { name: 'Projects', icon: <FolderGit2 size={20} />, path: '/projects' },
  { name: 'Transactions', icon: <Wallet size={20} />, path: '/transactions' },
  { name: 'AI Insights', icon: <Sparkles size={20} />, path: '/ai' },
  { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

export const CATEGORIES = [
  'Software Subscription',
  'Domain/Hosting',
  'Marketing',
  'Office Rent',
  'Travel',
  'Consulting',
  'Salary/Owner Draw',
  'Taxes',
  'Other'
];

export const BUSINESS_CONFIG = {
  vatRate: 0.18,
  earningRate: 0.21,
  businessName: 'South Korea Vehicles'
};
