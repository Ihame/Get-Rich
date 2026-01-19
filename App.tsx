
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Plus, Menu, X, ChevronRight, TrendingUp, TrendingDown, DollarSign, 
  FileText, Calendar, AlertCircle, Lightbulb, ShieldCheck, 
  Receipt, Sparkles, FolderGit2, Clock, LogOut, Lock, User,
  Settings as SettingsIcon, Database, Save, CheckCircle2, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { NAVIGATION, BUSINESS_CONFIG } from './constants';
import { Invoice, Project, Transaction, ProjectStatus, PaymentStatus, AIInsight } from './types';
import { DBService, supabase } from './services/db';
import { AIService } from './services/gemini';
import { StorageService } from './services/storage';

// --- Shared Components ---

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; subtitle?: string }> = ({ title, children, className = "", subtitle }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// --- Pages ---

const SettingsPage: React.FC<{ user: any }> = ({ user }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = StorageService.getSupabaseConfig();
    if (config) {
      setUrl(config.url);
      setKey(config.anonKey);
    }
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSupabaseConfig({ url, anonKey: key });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Reload page to re-initialize Supabase client with new keys
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-slate-500">Configure your private OS infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card title="Database Configuration" subtitle="Link your Supabase project to enable cloud sync and security.">
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Supabase Project URL</label>
                <div className="relative">
                  <Database size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="url" 
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Anon Public Key</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="password" 
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    placeholder="eyJhbG..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-lg flex gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Changes require a page refresh to take effect. If keys are invalid, the app will redirect to the initialization screen.
                </p>
              </div>

              <button 
                type="submit"
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
              >
                {saved ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Save size={18} />}
                {saved ? 'Settings Saved' : 'Save Configuration'}
              </button>
            </form>
          </Card>

          <Card title="Personal Profile">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                <User size={32} />
              </div>
              <div>
                <p className="font-bold text-lg">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">ID: {user?.id?.slice(0, 8)}...</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="System Status">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Database Connection</span>
                <span className={`flex items-center gap-1.5 font-bold ${DBService.isConfigured() ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${DBService.isConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {DBService.isConfigured() ? 'Active' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">AI Intelligence</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                 <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                   <RefreshCw size={12} /> Clear Local Cache
                 </button>
              </div>
            </div>
          </Card>

          <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
            <TrendingUp size={80} className="absolute -bottom-4 -right-4 text-white/5 rotate-12" />
            <h4 className="font-bold text-lg mb-2">Get Rich v1.0</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Your personal business and life operating system is now running on a cloud-backed architecture.</p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">Secured</span>
              <span className="px-2 py-0.5 bg-indigo-600 rounded text-[9px] font-bold uppercase tracking-wider">Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!DBService.isConfigured()) {
       setError("System not configured. Please enter your Supabase credentials in the fallback setup below.");
       return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Get Rich OS</h1>
          <p className="text-slate-400 mt-2">Personal Operating System</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-3 text-slate-500" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Secure Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3 text-slate-500" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-lg text-center">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Access Platform' : 'Initialize Account'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-slate-500 text-sm mt-6 hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Log in"}
        </button>
      </div>

      {!DBService.isConfigured() && (
        <div className="mt-8 max-w-md w-full p-6 bg-slate-900 border border-blue-500/30 rounded-2xl animate-pulse">
           <div className="flex items-center gap-3 mb-4 text-blue-400">
             <SettingsIcon size={20} />
             <h3 className="font-bold">Initial Configuration Required</h3>
           </div>
           <p className="text-xs text-slate-400 mb-4 leading-relaxed">
             The OS environment needs a Supabase project to store your business data securely. Please configure your settings if you haven't yet.
           </p>
           <button 
            onClick={() => {
              const url = prompt("Enter Supabase URL:");
              const key = prompt("Enter Supabase Anon Key:");
              if(url && key) {
                StorageService.saveSupabaseConfig({ url, anonKey: key });
                window.location.reload();
              }
            }}
            className="text-xs font-bold text-blue-500 hover:underline"
           >
             Paste Configuration Keys Now
           </button>
        </div>
      )}
    </div>
  );
};

// --- Main Layout Components ---

const Dashboard: React.FC<{ invoices: Invoice[]; projects: Project[]; insights: AIInsight[] }> = ({ invoices, projects, insights }) => {
  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
    const unpaid = invoices.filter(i => i.status === 'Unpaid').reduce((acc, i) => acc + i.amount, 0);
    const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length;
    const earnings = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.earning, 0);
    return { paid, unpaid, unpaidCount, earnings };
  }, [invoices]);

  const formatCurrency = (val: number) => `${val.toLocaleString()} RWF`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Paid Invoices</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-amber-500/10 text-amber-600 rounded-bl-xl font-bold text-xs">{stats.unpaidCount} Pending</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unpaid Total</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.unpaid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">My Earnings (21%)</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.earnings)}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
          <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Active Projects</p>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Business Insights (AI)" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  {insight.type === 'warning' ? <AlertCircle size={16} className="text-rose-500" /> : <Lightbulb size={16} className="text-amber-500" />}
                  <span className="text-sm font-bold">{insight.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{insight.content}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="col-span-2 text-center py-10">
                <Sparkles size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">Run an analysis to see insights</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Quick Actions">
          <div className="space-y-3">
             <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 transition-colors">
               <span className="text-sm font-medium">New Project</span>
               <Plus size={16} />
             </button>
             <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 transition-colors">
               <span className="text-sm font-medium">Add Credential</span>
               <Lock size={16} />
             </button>
             <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 transition-colors">
               <span className="text-sm font-medium">Tax Export</span>
               <FileText size={16} />
             </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Entry ---

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) fetchData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!DBService.isConfigured()) {
        console.warn("DB not configured yet.");
        setLoading(false);
        return;
      }
      const [invData, projData] = await Promise.all([
        DBService.getInvoices(),
        DBService.getProjects()
      ]);
      setInvoices(invData);
      setProjects(projData);
      
      const aiInsights = await AIService.generateInsights(invData, [], projData);
      setInsights(aiInsights);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Synchronizing Secure OS...</p>
    </div>
  );

  if (!user) return <AuthScreen />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-950 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
             <TrendingUp size={18} />
          </div>
          <span className="font-bold tracking-tight">GET RICH OS</span>
        </div>
        <nav className="p-4 space-y-1">
          {NAVIGATION.map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all mt-10">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex justify-between items-center mb-10">
           <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500">
             <Menu size={24} />
           </button>
           <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-slate-500 uppercase">Authenticated Session</p>
               <p className="text-sm font-semibold truncate max-w-[150px]">{user.email}</p>
             </div>
             <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-300 dark:border-slate-700">
                <User size={20} className="text-slate-500" />
             </div>
           </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard invoices={invoices} projects={projects} insights={insights} />} />
          <Route path="/invoices" element={<div className="p-20 text-center">Invoices List (Connected to DB)</div>} />
          <Route path="/projects" element={<div className="p-20 text-center">Projects Repository (Connected to DB)</div>} />
          <Route path="/settings" element={<SettingsPage user={user} />} />
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
