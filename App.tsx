
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Plus, Menu, X, ChevronRight, TrendingUp, TrendingDown, DollarSign, 
  FileText, Calendar, AlertCircle, Lightbulb, ShieldCheck, 
  Receipt, Sparkles, FolderGit2, Clock, LogOut, Lock, User,
  Settings as SettingsIcon, Database, Save, CheckCircle2, RefreshCw,
  Trash2, ExternalLink, Key, LayoutDashboard, Wallet, CreditCard,
  AlertTriangle, Info, Globe, Shield, Mail
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { NAVIGATION, BUSINESS_CONFIG, CATEGORIES } from './constants';
import { Invoice, Project, Transaction, ProjectStatus, PaymentStatus, AIInsight, TransactionType } from './types';
import { DBService, getSupabase } from './services/db';
import { AIService } from './services/gemini';
import { StorageService } from './services/storage';

// --- Components ---

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; subtitle?: string }> = ({ title, children, className = "", subtitle }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

// --- Setup Screen ---

const SetupScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sanitizedUrl = url.trim()
      .replace(/\/+$/, "")
      .replace(/https?:\/\/https?:\/\//g, "https://");
    
    StorageService.saveSupabaseConfig({ url: sanitizedUrl, anonKey: key.trim() });
    DBService.reinitialize();
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="text-center mb-10 relative">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20">
            <Database size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-3">Initialize OS</h1>
          <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Link your Supabase instance to establish the secure backbone.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Supabase URL</label>
            <input 
              type="url" value={url} onChange={e => setUrl(e.target.value)} required
              className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="https://xyz.supabase.co"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Anon Public Key</label>
            <input 
              type="password" value={key} onChange={e => setKey(e.target.value)} required
              className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="sb_publishable_..."
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all shadow-xl uppercase tracking-widest text-xs mt-4">
            {loading ? 'CONNECTING...' : 'START SYSTEM INITIALIZATION'}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-slate-800/50 text-center">
           <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-slate-600 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto">
             <RefreshCw size={12} /> Wipe Storage & Reset
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Auth Screen ---

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = isLogin 
        ? await getSupabase().auth.signInWithPassword({ email, password })
        : await getSupabase().auth.signUp({ email, password });
      
      if (error) throw error;

      if (!isLogin) {
        // Just registered, show a success hint if confirmation is likely needed
        setError("Account created! If you cannot log in, check your email for a confirmation link.");
        setIsLogin(true);
      }
    } catch (err: any) {
      const msg = err.message || "Authentication failed";
      if (msg.toLowerCase().includes("email not confirmed")) {
        setError("EMAIL NOT CONFIRMED: Please check your inbox or disable 'Confirm Email' in Supabase -> Auth -> Providers -> Email settings.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full"></div>
        <div className="text-center mb-10 relative">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">{isLogin ? 'Access OS' : 'Initialize Account'}</h1>
          <p className="text-slate-500 text-[10px] mt-2 font-black uppercase tracking-widest">Administrator Credentials Required</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 relative">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@os.system" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" required />
          
          {error && (
            <div className={`p-5 rounded-2xl border text-center text-[10px] font-black uppercase leading-relaxed ${
              error.includes("Account created") 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {error.includes("Account created") ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
                <span>Status Update</span>
              </div>
              {error}
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all text-xs uppercase tracking-[0.2em]">
            {loading ? 'VERIFYING...' : isLogin ? 'AUTHORIZE' : 'REGISTER OPERATOR'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-blue-500 text-[10px] mt-8 hover:text-white font-black uppercase tracking-widest transition-colors">
          {isLogin ? "Create Operator Account" : "Back to Authorization"}
        </button>
      </div>
      
      {/* Troubleshooting hint */}
      <div className="mt-8 flex items-center gap-2 text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
        <Info size={12} />
        <span>Tip: Disable 'Confirm Email' in Supabase Auth settings to skip verification</span>
      </div>
    </div>
  );
};

// --- Pages ---

const Dashboard: React.FC<{ invoices: Invoice[]; transactions: Transaction[]; insights: AIInsight[] }> = ({ invoices, transactions, insights }) => {
  const stats = useMemo(() => {
    const revenue = invoices.filter(i => i.status === PaymentStatus.PAID).reduce((a, b) => a + b.amount, 0);
    const pending = invoices.filter(i => i.status === PaymentStatus.UNPAID).reduce((a, b) => a + b.amount, 0);
    const profit = invoices.filter(i => i.status === PaymentStatus.PAID).reduce((a, b) => a + b.earning, 0);
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0);
    return { revenue, pending, profit, expenses };
  }, [invoices, transactions]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Revenue', val: stats.revenue, icon: <TrendingUp size={18}/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Outstanding', val: stats.pending, icon: <Clock size={18}/>, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Profit', val: stats.profit, icon: <DollarSign size={18}/>, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Expenses', val: stats.expenses, icon: <CreditCard size={18}/>, color: 'text-rose-500', bg: 'bg-rose-500/10' }
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</span>
              <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-black tabular-nums">{s.val.toLocaleString()} <span className="text-xs font-bold text-slate-400 ml-1">RWF</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Intelligence Stream">
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-5 p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group">
                  <div className={`p-3 rounded-2xl h-fit ${insight.type === 'warning' ? 'bg-rose-500' : 'bg-blue-500'} text-white shadow-lg`}>
                    {insight.type === 'warning' ? <AlertTriangle size={20}/> : <Sparkles size={20}/>}
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight group-hover:text-blue-600 transition-colors">{insight.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">{insight.content}</p>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <Sparkles size={40} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Analyzing capital patterns...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-8">
          <div className="bg-slate-900 dark:bg-blue-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[300px]">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-white/20 transition-all duration-700"></div>
             <div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-10">Quick Launch</h3>
               <div className="space-y-4">
                 <Link to="/invoices" className="flex items-center justify-between p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5">
                   <span className="text-xs font-bold uppercase tracking-widest">Billing Terminal</span>
                   <Receipt size={18} />
                 </Link>
                 <Link to="/transactions" className="flex items-center justify-between p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5">
                   <span className="text-xs font-bold uppercase tracking-widest">Capital Ledger</span>
                   <Wallet size={18} />
                 </Link>
               </div>
             </div>
             <div className="pt-8 border-t border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">OS Status</p>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Operational • Cloud Link Active</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoicesPage: React.FC<{ invoices: Invoice[]; onRefresh: () => void }> = ({ invoices, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    clientName: '',
    amount: 0,
    status: PaymentStatus.UNPAID,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = Number(formData.amount || 0);
      await DBService.addInvoice({
        invoiceNumber: formData.invoiceNumber || '',
        clientName: formData.clientName || '',
        date: formData.date || '',
        amount,
        vatAmount: amount * BUSINESS_CONFIG.vatRate,
        earning: amount * BUSINESS_CONFIG.earningRate,
        status: formData.status as PaymentStatus,
        notes: formData.notes
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert("Error saving record. Check your Supabase tables.");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete record?")) return;
    await DBService.deleteInvoice(id);
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Billing</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">South Korea Vehicles Operating System</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-950 dark:bg-white dark:text-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:opacity-90 transition-all">
          New Invoice
        </button>
      </div>

      <Card title="Billing History" subtitle="Tracking VAT (18%) and Earnings (21%)">
        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50">
                <th className="py-5 px-8">ID / Client</th>
                <th className="py-5 px-8 text-right">Revenue</th>
                <th className="py-5 px-8 text-right">Your Net (21%)</th>
                <th className="py-5 px-8 text-center">Status</th>
                <th className="py-5 px-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-6 px-8">
                    <div className="font-black text-slate-800 dark:text-slate-100">{inv.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{inv.invoiceNumber} • {inv.date}</div>
                  </td>
                  <td className="py-6 px-8 text-right font-bold">{inv.amount.toLocaleString()}</td>
                  <td className="py-6 px-8 text-right font-black text-blue-600 dark:text-blue-400">{inv.earning.toLocaleString()}</td>
                  <td className="py-6 px-8 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${inv.status === PaymentStatus.PAID ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <button onClick={() => deleteInvoice(inv.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Invoice Entry">
        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Client Name</label>
             <input type="text" placeholder="e.g. Samsung Logistics" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Total Amount</label>
               <input type="number" placeholder="RWF" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Date</label>
               <input type="date" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
             </div>
           </div>
           <button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-4">
             {loading ? 'SYNCING...' : 'SAVE TO CLOUD'}
           </button>
        </form>
      </Modal>
    </div>
  );
};

const TransactionsPage: React.FC<{ transactions: Transaction[]; onRefresh: () => void }> = ({ transactions, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({ type: TransactionType.EXPENSE, amount: 0, date: new Date().toISOString().split('T')[0], category: CATEGORIES[0], description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DBService.addTransaction({
        type: formData.type as TransactionType,
        amount: Number(formData.amount),
        date: formData.date || '',
        category: formData.category || 'Other',
        description: formData.description || ''
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert("Error saving transaction.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Ledger</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tracking Business Expenses & Income</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700 transition-all">
          Log Entry
        </button>
      </div>

      <Card title="Cash Flow Records">
        <div className="overflow-x-auto -mx-8">
           <table className="w-full text-left">
             <thead>
               <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50">
                 <th className="py-5 px-8">Description</th>
                 <th className="py-5 px-8 text-right">Amount</th>
                 <th className="py-5 px-8 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {transactions.map(t => (
                 <tr key={t.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                   <td className="py-6 px-8">
                      <div className="font-bold">{t.description}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t.category} • {t.date}</div>
                   </td>
                   <td className={`py-6 px-8 text-right font-black ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                   </td>
                   <td className="py-6 px-8 text-right">
                      <button onClick={() => DBService.deleteTransaction(t.id).then(onRefresh)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Ledger Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
           <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}>
             <option value={TransactionType.EXPENSE}>Expense</option>
             <option value={TransactionType.INCOME}>Income</option>
           </select>
           <input placeholder="Description" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
           <input type="number" placeholder="Amount (RWF)" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
           <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
           <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">COMMIT RECORD</button>
        </form>
      </Modal>
    </div>
  );
};

const ProjectsPage: React.FC<{ projects: Project[]; onRefresh: () => void }> = ({ projects, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({ name: '', description: '', status: ProjectStatus.ACTIVE });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DBService.addProject({
        name: formData.name || '',
        description: formData.description || '',
        status: formData.status as ProjectStatus,
        techStack: []
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert("Error saving project.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Projects</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Life & Business Memory Hub</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-700 transition-all">
          Initialize Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><FolderGit2 size={24}/></div>
               <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{p.status}</span>
            </div>
            <h3 className="text-xl font-black mb-3">{p.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-8 min-h-[4.5rem]">{p.description}</p>
            <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
               <div className="flex items-center gap-4">
                 <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline">Manage Keys</button>
               </div>
               <button onClick={() => DBService.deleteProject(p.id).then(onRefresh)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Project Module">
        <form onSubmit={handleSubmit} className="space-y-5">
           <input placeholder="Project Name (e.g. SmartGarage)" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
           <textarea placeholder="Description and Objectives" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
           <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">COMMIT TO MEMORY</button>
        </form>
      </Modal>
    </div>
  );
};

// --- Layout ---

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) fetchData();
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!DBService.isConfigured()) return;
    setLoading(true);
    try {
      const [invData, projData, txData] = await Promise.all([
        DBService.getInvoices(),
        DBService.getProjects(),
        DBService.getTransactions()
      ]);
      setInvoices(invData || []);
      setProjects(projData || []);
      setTransactions(txData || []);
      const aiInsights = await AIService.generateInsights(invData || [], txData || [], projData || []);
      setInsights(aiInsights || []);
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!DBService.isConfigured()) return <SetupScreen />;
  if (loading && !user) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">Initializing OS Kernel</p>
    </div>
  );
  if (!user) return <AuthScreen />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 lg:translate-x-0 border-r border-slate-200 dark:border-slate-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center px-10 border-b border-slate-100 dark:border-slate-800">
           <div className="w-10 h-10 bg-slate-950 dark:bg-white rounded-xl flex items-center justify-center mr-4">
              <TrendingUp size={20} className="text-white dark:text-slate-950" />
           </div>
           <span className="font-black text-xl tracking-tighter uppercase">OS.SYS</span>
        </div>
        <nav className="p-8 space-y-3">
           {NAVIGATION.map(item => (
             <Link key={item.name} to={item.path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xl' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {item.icon}<span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
             </Link>
           ))}
           <button onClick={() => getSupabase().auth.signOut()} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all mt-12">
             <LogOut size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
           </button>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 md:p-12 lg:p-16 max-w-screen-2xl mx-auto w-full">
         <header className="flex justify-between items-center mb-16">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><Menu size={20}/></button>
            <div className="hidden lg:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Module</p>
              <h2 className="text-sm font-bold uppercase mt-1">{NAVIGATION.find(n => n.path === location.pathname)?.name || 'OS System'}</h2>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Active</p>
                 <p className="text-xs font-bold mt-0.5">{user.email}</p>
               </div>
               <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[1.25rem] flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                  <User size={22} className="text-slate-600 dark:text-slate-400" />
               </div>
            </div>
         </header>

         <Routes>
           <Route path="/" element={<Dashboard invoices={invoices} transactions={transactions} insights={insights} />} />
           <Route path="/invoices" element={<InvoicesPage invoices={invoices} onRefresh={fetchData} />} />
           <Route path="/projects" element={<ProjectsPage projects={projects} onRefresh={fetchData} />} />
           <Route path="/transactions" element={<TransactionsPage transactions={transactions} onRefresh={fetchData} />} />
           <Route path="/ai" element={
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl font-black uppercase tracking-tight">AI Strategy Hub</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {insights.map((insight, idx) => (
                    <div key={idx} className={`p-10 rounded-[3rem] border ${
                      insight.type === 'warning' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900'
                    }`}>
                      <h3 className="text-2xl font-black mb-4">{insight.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{insight.content}</p>
                    </div>
                  ))}
                </div>
              </div>
           } />
           <Route path="/settings" element={
              <div className="max-w-xl space-y-12">
                 <h1 className="text-4xl font-black uppercase tracking-tight">Core</h1>
                 <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-10">Infrastructure Status</h3>
                    <div className="flex items-center gap-4 p-6 bg-emerald-500/10 text-emerald-600 rounded-[1.5rem] mb-10 border border-emerald-500/20">
                      <Shield size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Backbone Active</span>
                    </div>
                    <button onClick={() => { StorageService.saveSupabaseConfig({ url: '', anonKey: '' }); window.location.reload(); }} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all">
                      Disconnect Cloud Link
                    </button>
                 </div>
              </div>
           } />
           <Route path="*" element={<Navigate to="/" />} />
         </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
       <MainLayout />
    </HashRouter>
  );
}
