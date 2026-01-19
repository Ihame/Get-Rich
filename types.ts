
export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  ARCHIVED = 'Archived'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  techStack: string[];
  credentials?: Record<string, string>;
  domainName?: string;
  domainExpiry?: string;
  hostingProvider?: string;
  hostingRenewal?: string;
  createdAt: string;
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid'
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  amount: number;
  vatAmount: number; // 18%
  earning: number;    // 21%
  status: PaymentStatus;
  paymentDate?: string;
  notes?: string;
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  projectId?: string;
  description: string;
}

export interface UserStats {
  totalPaid: number;
  totalUnpaid: number;
  expectedIncome: number;
  monthlyEarnings: number;
}

export interface AIInsight {
  title: string;
  content: string;
  type: 'suggestion' | 'warning' | 'tip';
}
