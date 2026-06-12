import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Paperclip, 
  BarChart3, LogOut, Plus, Trash2, Edit2, Download, 
  TrendingUp, Users, Eye, Target, X, MessageCircle, Heart,
  CheckSquare, Settings, Menu, Calendar as CalendarIcon, 
  Layers, User, Moon, Sun, MonitorSmartphone, Link as LinkIcon,
  FileText, ChevronDown, ChevronRight, Lock, Unlock, PlayCircle, Send, Music, LayoutDashboard,
  PanelLeftClose, PanelLeftOpen, ChevronLeft, Globe, ArrowDownToLine
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const Instagram = Globe;
const Facebook = Users;
const Youtube = PlayCircle;


const INITIAL_USERS = {
  admin: { id: 1, login: 'admin', role: 'admin', pass: '@Pokiza4565@', name: 'Руководитель', email: 'ceo@pokiza.com' },
  smm: { id: 2, login: 'smm', role: 'smm', pass: '@Smm4565@', name: 'SMM Специалист', email: 'smm@pokiza.com' }
};

const MONTHS = [
  { value: '2026-05', label: 'Май 2026' },
  { value: '2026-06', label: 'Июнь 2026' },
  { value: '2026-07', label: 'Июль 2026' },
];

const PLATFORM_ICONS = [
  { id: 'instagram', icon: Instagram, name: 'Instagram' },
  { id: 'facebook', icon: Facebook, name: 'Facebook' },
  { id: 'tiktok', icon: Music, name: 'TikTok' },
  { id: 'youtube', icon: Youtube, name: 'YouTube' },
  { id: 'telegram', icon: Send, name: 'Telegram' },
  { id: 'globe', icon: Globe, name: 'Сайт/Другое' },
];

const FORMAT_COLORS = [
  { id: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', name: 'Синий' },
  { id: 'red', bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', name: 'Красный' },
  { id: 'purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', name: 'Фиолетовый' },
  { id: 'green', bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', name: 'Зеленый' },
  { id: 'orange', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', name: 'Оранжевый' },
  { id: 'teal', bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500', name: 'Бирюзовый' },
];

const INITIAL_PLATFORMS = [
  { id: 'p1', name: 'Instagram', account: '@pokiza_tj', iconName: 'instagram' },
  { id: 'p2', name: 'Facebook', account: 'Pokiza Official', iconName: 'facebook' },
  { id: 'p3', name: 'TikTok', account: '@pokiza_brand', iconName: 'tiktok' },
];

const INITIAL_KPIS = [
  { id: 'k1', platformId: 'p1', title: 'Статичные посты', target: 3, colorId: 'teal' },
  { id: 'k2', platformId: 'p1', title: 'Reels-видео', target: 10, colorId: 'purple' },
  { id: 'k3', platformId: 'p1', title: 'Интерактивные Stories', target: 12, colorId: 'orange' },
  { id: 'k4', platformId: 'p1', title: 'Акции/Розыгрыши', target: 1, colorId: 'red' },
  { id: 'k5', platformId: 'p2', title: 'Статичные посты', target: 5, colorId: 'blue' },
  { id: 'k6', platformId: 'p3', title: 'TikTok видео', target: 8, colorId: 'green' },
];

const INITIAL_TASKS = [
  { id: 1, month: '2026-06', title: 'Розыгрыш техники', text: 'Условия конкурса: подписка, лайк...', kpiIds: ['k2', 'k4'], platformId: 'p1', status: 'completed', date: '2026-06-12', link: 'https://inst.com/p/1' },
  { id: 2, month: '2026-06', title: 'Опрос по качеству', text: 'Сториз с опросом', kpiIds: ['k3'], platformId: 'p1', status: 'pending', date: '2026-06-14', link: '' },
  { id: 3, month: '2026-06', title: 'Устаревший пост', text: 'Пост который забыли выложить', kpiIds: ['k1'], platformId: 'p1', status: 'pending', date: '2026-06-01', link: '' },
];

const INITIAL_ANALYTICS = {
  '2026-05': { followers: 12500, reach: 45000, likes: 3200, comments: 450, er: 8.11, text: 'Хороший рост за счет Reels', isSubmitted: true }
};

const getFormatColor = (kpi) => {
  if (!kpi) return FORMAT_COLORS[0];
  if (kpi.colorId) {
    const found = FORMAT_COLORS.find(c => c.id === kpi.colorId);
    if (found) return found;
  }
  let sum = 0;
  for(let i=0; i<kpi.id.length; i++) sum += kpi.id.charCodeAt(i);
  return FORMAT_COLORS[sum % FORMAT_COLORS.length];
};

const getPlatformIcon = (platform, size = 18) => {
  if (!platform) return <Globe size={size} />;
  if (platform.iconName) {
    const found = PLATFORM_ICONS.find(i => i.id === platform.iconName);
    if (found) { const Icon = found.icon; return <Icon size={size} />; }
  }
  // Fallback
  const n = platform.name?.toLowerCase() || '';
  if (n.includes('inst')) return <Instagram size={size} />;
  if (n.includes('face')) return <Facebook size={size} />;
  if (n.includes('tik')) return <Music size={size} />;
  if (n.includes('tele')) return <Send size={size} />;
  if (n.includes('you')) return <Youtube size={size} />;
  return <Globe size={size} />;
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 ${type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white'} px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300 print:hidden`}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[9990] flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200" onMouseDown={onClose}>
      <div className={`bg-white dark:bg-slate-900 rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800`} onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <Modal title="Подтверждение" onClose={onCancel}>
      <div className="space-y-5">
        <p className="text-slate-600 dark:text-slate-300 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Отмена</button>
          <button onClick={() => { onConfirm(); onCancel(); }} className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">Подтвердить</button>
        </div>
      </div>
    </Modal>
  );
}

export default function AppWrapper() {
  const [usersDb, setUsersDb] = useState(INITIAL_USERS);
  const [user, setUser] = useState(null);
  
  if (!user) return <LoginScreen usersDb={usersDb} onLogin={setUser} />;
  return <MainApp user={user} usersDb={usersDb} setUsersDb={setUsersDb} onLogout={() => setUser(null)} onUpdateUser={setUser} />;
}

function LoginScreen({ usersDb, onLogin }) {
  const [form, setForm] = useState({ login: '', pass: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = Object.values(usersDb).find(u => u.login.toLowerCase() === form.login.toLowerCase());
    if (foundUser && foundUser.pass === form.pass) onLogin(foundUser);
    else setError('Неверный логин или пароль');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center p-4 font-sans text-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-sm w-full max-w-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 tracking-tight mb-1">ПОКИЗА</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Панель управления SMM</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Логин</label>
            <input type="text" required className="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all dark:text-white" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Пароль</label>
            <input type="password" required className="w-full px-4 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all dark:text-white" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-500/10 py-2 rounded-lg">{error}</p>}
          <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-xl transition-colors mt-2 shadow-sm shadow-red-600/20">Войти</button>
        </form>
      </div>
    </div>
  );
}

function MainApp({ user, usersDb, setUsersDb, onLogout, onUpdateUser }) {
  const isAdmin = user?.role === 'admin';
  
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('tasks');
  const [currentMonth, setCurrentMonth] = useState('2026-06');
  
  // UI States
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarTimerRef = useRef(null);
  
  const [selectedDashboardPlatform, setSelectedDashboardPlatform] = useState('all');
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedKpiForDetails, setSelectedKpiForDetails] = useState(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });
  const [printMode, setPrintMode] = useState(null);

  // Data States
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [kpis, setKpis] = useState(INITIAL_KPIS);
  const [platforms, setPlatforms] = useState(INITIAL_PLATFORMS);
  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Возврат к нормальному виду после закрытия окна печати
  useEffect(() => {
    const afterPrint = () => setPrintMode(null);
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const confirmAction = (message, action) => setConfirmDialog({ isOpen: true, message, onConfirm: action });

  // Исправленная логика подготовки и вызова окна PDF
  const handlePrint = (mode) => {
    setPrintMode(mode);
    setTimeout(() => {
        window.print();
    }, 300); // Даем 300мс на отрисовку печатного листа
  };

  const monthTasks = useMemo(() => tasks.filter(t => t.month === currentMonth), [tasks, currentMonth]);
  
  const kpiProgress = useMemo(() => {
    let filteredKpis = kpis;
    if (selectedDashboardPlatform !== 'all') {
      filteredKpis = kpis.filter(k => k.platformId === selectedDashboardPlatform);
    }
    return filteredKpis.map(kpi => {
      const platform = platforms.find(p=>p.id===kpi.platformId);
      const completedTasks = monthTasks.filter(t => t.kpiIds?.includes(kpi.id) && t.status === 'completed');
      return { ...kpi, current: completedTasks.length, platformName: platform?.name, platformIconName: platform?.iconName };
    });
  }, [kpis, monthTasks, selectedDashboardPlatform, platforms]);

  const currentAnalytics = analytics[currentMonth] || { followers: '', reach: '', likes: '', comments: '', er: 0, text: '', isSubmitted: false };
  
  const prevAnalytics = useMemo(() => {
    const prevMonthIndex = MONTHS.findIndex(m => m.value === currentMonth) - 1;
    if (prevMonthIndex >= 0) {
      const pa = analytics[MONTHS[prevMonthIndex].value];
      if (pa && pa.isSubmitted) return pa;
    }
    return null;
  }, [analytics, currentMonth]);

  const checkKpiLimits = (kpiIdsToCheck, currentTaskId = null) => {
    for (let kpiId of (kpiIdsToCheck || [])) {
       const kpi = kpis.find(k => k.id === kpiId);
       if (!kpi) continue;
       const currentCount = monthTasks.filter(t => t.kpiIds?.includes(kpiId) && t.id !== currentTaskId).length;
       if (currentCount >= kpi.target) {
          showToast(`Лимит формата "${kpi.title}" исчерпан (${kpi.target} макс)`, 'error');
          return false;
       }
    }
    return true;
  };

  const saveTask = (taskData) => {
    if (!checkKpiLimits(taskData.kpiIds, taskData.id)) return false;
    if (taskData.id) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
      showToast('Задача обновлена');
    } else {
      setTasks(prev => [{ id: Date.now(), month: currentMonth, status: taskData.link ? 'completed' : 'pending', ...taskData }, ...prev]);
      showToast('Успешно сохранено');
    }
    setActiveModal(null);
    setEditingItem(null);
    return true;
  };

  const completeTask = (taskId, link) => {
    if (!link.trim()) return showToast('Укажите ссылку', 'error');
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', link } : t));
    showToast('Успешно сдано');
  };

  const deleteTask = (id) => confirmAction('Точно удалить эту задачу?', () => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Удалено');
  });

  const saveKpi = (kpiData) => {
    if (kpiData.id) setKpis(prev => prev.map(k => k.id === kpiData.id ? { ...k, ...kpiData } : k));
    else setKpis(prev => [...prev, { ...kpiData, id: `kpi_${Date.now()}` }]);
    showToast('Формат сохранен');
    setActiveModal(null);
  };

  const deleteKpi = (id) => confirmAction('Удалить этот формат контента?', () => {
    setKpis(prev => prev.filter(k => k.id !== id));
    showToast('Удалено');
  });

  const savePlatform = (platData) => {
    if (platData.id) setPlatforms(prev => prev.map(p => p.id === platData.id ? { ...p, ...platData } : p));
    else setPlatforms(prev => [...prev, { ...platData, id: `p_${Date.now()}` }]);
    showToast('Платформа сохранена');
    setActiveModal(null);
  };

  const deletePlatform = (id) => confirmAction('Удалить платформу и все её форматы?', () => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
    setKpis(prev => prev.filter(k => k.platformId !== id));
    showToast('Платформа удалена');
  });

  const NAV_ITEMS = [
    { id: 'tasks', label: 'Сводка и Задачи', icon: LayoutDashboard, roles: ['admin', 'smm'] },
    { id: 'content-plan', label: 'Контент-план', icon: FileText, roles: ['admin', 'smm'] },
    { id: 'calendar', label: 'Календарь', icon: CalendarIcon, roles: ['admin', 'smm'] },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, roles: ['admin', 'smm'] },
    { id: 'platforms', label: 'Платформы и KPI', icon: Layers, roles: ['admin'] },
    { id: 'settings', label: 'Настройки', icon: Settings, roles: ['admin', 'smm'] },
  ];

  const MOBILE_NAV_ITEMS = [
    { id: 'tasks', label: 'Сводка', icon: LayoutDashboard },
    { id: 'content-plan', label: 'План', icon: FileText },
    { id: 'analytics', label: 'Анализ', icon: BarChart3 },
    { id: 'calendar', label: 'Календарь', icon: CalendarIcon },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
    <div className={`h-screen overflow-hidden font-sans flex text-[13px] md:text-sm transition-colors duration-300 ${printMode ? 'hidden' : ''} ${theme==='dark'?'bg-[#0A0A0A] text-slate-200':'bg-[#FAFAFA] text-slate-800'}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal {...confirmDialog} onCancel={() => setConfirmDialog({isOpen: false})} />

      {/* Desktop Sidebar (Toggle, pushing layout instead of overlaying) */}
      <aside 
        className={`hidden md:flex flex-col border-r transition-all duration-300 ease-in-out z-40 h-full bg-inherit shrink-0 ${isSidebarExpanded ? 'w-64' : 'w-20'} ${theme==='dark'?'bg-[#111] border-slate-800':'bg-white border-slate-200'}`}
      >
        <div className={`h-16 flex items-center border-b shrink-0 transition-all ${isSidebarExpanded ? 'justify-between px-6' : 'justify-center'} ${theme==='dark'?'border-slate-800':'border-slate-100'}`}>
          {isSidebarExpanded && <h1 className="text-lg font-bold tracking-tight text-red-600 flex items-center gap-2"><TrendingUp size={20} /> ПОКИЗА</h1>}
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Меню">
            {isSidebarExpanded ? <PanelLeftClose size={20}/> : <Menu size={24} className="text-red-600"/>}
          </button>
        </div>
        
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          {isSidebarExpanded && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-2 px-3">Меню</div>}
          {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} title={!isSidebarExpanded ? item.label : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!isSidebarExpanded ? 'justify-center' : ''} ${activeTab === item.id ? (theme==='dark'?'bg-red-500/10 text-red-400':'bg-red-50 text-red-600') : (theme==='dark'?'text-slate-400 hover:bg-slate-800 hover:text-white':'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}`}>
              <item.icon size={20} className="shrink-0" /> {isSidebarExpanded && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className={`p-4 border-t shrink-0 flex flex-col gap-4 ${theme==='dark'?'border-slate-800':'border-slate-100'}`}>
          <div className={`flex items-center gap-3 transition-all ${!isSidebarExpanded ? 'justify-center px-0' : 'px-2'}`}>
            <div onClick={() => {setEditingItem(user); setActiveModal('editProfile');}} className={`w-9 h-9 rounded-full shadow-sm border flex items-center justify-center font-bold text-sm uppercase shrink-0 cursor-pointer ${theme==='dark'?'bg-slate-800 border-slate-700 text-red-400':'bg-white border-slate-200 text-red-600'}`}>
              {user.name[0]}
            </div>
            {isSidebarExpanded && (
              <>
                <div className="flex-1 overflow-hidden cursor-pointer group" onClick={() => {setEditingItem(user); setActiveModal('editProfile');}}>
                  <div className="text-sm font-bold leading-tight truncate group-hover:text-red-500 transition-colors">{user.name}</div>
                  <div className="text-[11px] font-medium text-slate-500 capitalize">{user.role === 'admin' ? 'Администратор' : 'SMM'}</div>
                </div>
                <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-slate-50 dark:bg-slate-800 rounded-lg" title="Выйти"><LogOut size={16} /></button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area (Closes sidebar on click) */}
      <div 
        onClick={() => { if(isSidebarExpanded) setIsSidebarExpanded(false); }}
        className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 min-w-0`}
      >
        
        {/* Mobile Top Header */}
        <header className={`md:hidden h-14 flex items-center justify-between px-4 shrink-0 border-b z-30 ${theme==='dark'?'bg-[#111] border-slate-800':'bg-white border-slate-200'}`}>
           <div className="flex items-center gap-2">
             <TrendingUp size={20} className="text-red-600" />
             <span className="font-bold tracking-tight text-base text-slate-900 dark:text-white">ПОКИЗА</span>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={()=>setTheme(theme==='light'?'dark':'light')} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white">
               {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
             </button>
             <div onClick={() => {setEditingItem(user); setActiveModal('editProfile');}} className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs uppercase cursor-pointer ${theme==='dark'?'bg-slate-800 border-slate-700 text-red-400':'bg-slate-100 border-slate-200 text-red-600'}`}>
                {user.name[0]}
             </div>
           </div>
        </header>

        {/* Desktop Header */}
        <header className={`hidden md:flex h-16 backdrop-blur-md border-b items-center justify-between px-6 shrink-0 z-30 ${theme==='dark'?'bg-[#0A0A0A]/80 border-slate-800':'bg-white/80 border-slate-200'}`}>
          <h2 className="text-lg font-bold">
            {NAV_ITEMS.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-colors ${theme==='dark'?'bg-slate-900 border-slate-700 hover:border-slate-600':'bg-white border-slate-200 hover:border-slate-300'}`}>
              <CalendarIcon size={14} className="text-slate-400" />
              <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer border-none p-0 focus:ring-0 dark:text-white">
                {MONTHS.map(m => <option key={m.value} value={m.value} className="dark:bg-slate-800">{m.label}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative scroll-smooth custom-scrollbar pb-24 md:pb-6 print:p-0">
          <div className="max-w-6xl mx-auto print:hidden space-y-6 h-full">
            
            {/* Mobile Context Header */}
            <div className="md:hidden flex items-center justify-between mb-4">
               <h2 className="text-base font-bold">{NAV_ITEMS.find(i => i.id === activeTab)?.label}</h2>
               <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`}>
                 <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="bg-transparent text-xs font-bold outline-none cursor-pointer border-none p-0 focus:ring-0 dark:text-white">
                    {MONTHS.map(m => <option key={m.value} value={m.value} className="dark:bg-slate-800">{m.label}</option>)}
                 </select>
               </div>
            </div>

            {}
            {activeTab === 'tasks' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button onClick={() => setSelectedDashboardPlatform('all')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedDashboardPlatform === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : (theme==='dark'?'bg-slate-800 text-slate-400 hover:text-white':'bg-white text-slate-600 border border-slate-200 hover:border-slate-300')}`}>
                    Сводка: Все
                  </button>
                  {platforms.map(p => (
                     <button key={p.id} onClick={() => setSelectedDashboardPlatform(p.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedDashboardPlatform === p.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : (theme==='dark'?'bg-slate-800 text-slate-400 hover:text-white':'bg-white text-slate-600 border border-slate-200 hover:border-slate-300')}`}>
                      {getPlatformIcon(p, 16)} {p.name}
                    </button>
                  ))}
                </div>

                <section>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Target size={20} className="text-red-500"/> Выполнение плана ({MONTHS.find(m=>m.value===currentMonth)?.label})</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {kpiProgress.map((kpi) => (
                      <div key={kpi.id} onClick={() => setSelectedKpiForDetails(kpi)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] group ${theme==='dark'?'bg-slate-900/50 border-slate-800 hover:border-slate-600':'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md shadow-sm'}`}>
                        <div>
                           <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1 line-clamp-1">{getPlatformIcon({name: kpi.platformName, iconName: kpi.platformIconName}, 12)} {kpi.platformName}</div>
                           <h3 className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 break-words line-clamp-2">{kpi.title}</h3>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-baseline gap-1.5 mb-2">
                            <span className={`text-3xl font-black tracking-tight ${kpi.current >= kpi.target ? 'text-green-500' : (theme==='dark'?'text-white':'text-slate-900')}`}>{kpi.current}</span>
                            <span className="text-slate-400 font-bold text-sm">/ {kpi.target}</span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme==='dark'?'bg-slate-800':'bg-slate-100'}`}>
                            <div className={`h-full rounded-full transition-all duration-700 ease-out ${kpi.current >= kpi.target ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {kpiProgress.length === 0 && <div className="col-span-full py-10 text-center text-slate-400 border-2 border-dashed rounded-2xl dark:border-slate-800 font-medium text-sm">Нет форматов контента для выбранной платформы.</div>}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2"><CheckSquare size={20} className="text-blue-500"/> Задачи на месяц</h2>
                  </div>
                  <div className={`border rounded-2xl shadow-sm overflow-hidden ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-white border-slate-100'}`}>
                    {monthTasks.filter(t => selectedDashboardPlatform === 'all' || t.platformId === selectedDashboardPlatform).length === 0 ? (
                      <div className="p-12 text-center text-slate-400 font-medium flex flex-col items-center gap-3 text-sm">
                         <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><FileText size={24} className="text-slate-300 dark:text-slate-600"/></div>
                         Задач пока нет. Создайте их в Контент-плане.
                      </div>
                    ) : (
                      <div className={`divide-y ${theme==='dark'?'divide-slate-800/50':'divide-slate-100'}`}>
                        {monthTasks
                          .filter(t => selectedDashboardPlatform === 'all' || t.platformId === selectedDashboardPlatform)
                          .map(task => (
                            <TaskRow 
                              key={task.id} task={task} theme={theme}
                              platforms={platforms} kpis={kpis} todayStr={todayStr}
                              onComplete={completeTask} onDelete={() => deleteTask(task.id)}
                              onEdit={() => { setEditingItem(task); setActiveModal('addTask'); }}
                            />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {}
            {activeTab === 'content-plan' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-orange-500"/> Контент-план</h2>
                    <p className="text-xs text-slate-500 mt-1">Таблица планирования идей и форматов</p>
                  </div>
                  <button onClick={() => handlePrint('plan')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Download size={16}/> Скачать PDF
                  </button>
                </div>
                
                <div className={`border rounded-2xl shadow-sm overflow-x-auto ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-white border-slate-100'}`}>
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${theme==='dark'?'border-slate-800 text-slate-400':'border-slate-200 text-slate-500 bg-slate-50/50'}`}>
                        <th className="p-4 w-32">Дата</th>
                        <th className="p-4 w-48">Платформа / Формат</th>
                        <th className="p-4 min-w-[250px]">Тема / Текст публикации</th>
                        <th className="p-4 w-32 text-right">Статус</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme==='dark'?'divide-slate-800/50':'divide-slate-100'}`}>
                      <InlineTaskEditor 
                        currentMonth={currentMonth} platforms={platforms} kpis={kpis} theme={theme} 
                        onSave={saveTask} 
                      />
                      
                      {monthTasks.sort((a,b) => new Date(a.date) - new Date(b.date)).map(task => {
                           const platform = platforms.find(p => p.id === task.platformId);
                           const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];
                           const isOverdue = task.status !== 'completed' && task.date < todayStr;

                           return (
                             <tr key={task.id} className={`transition-colors group ${theme==='dark'?'hover:bg-slate-800/30':'hover:bg-slate-50/50'}`}>
                                <td className="p-4 align-top">
                                  <div className="font-bold text-sm">{task.date.split('-').reverse().join('.')}</div>
                                </td>
                                <td className="p-4 align-top">
                                  <div className="flex flex-col gap-1.5">
                                    <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${theme==='dark'?'text-slate-300':'text-slate-700'}`}>{getPlatformIcon(platform, 12)} {platform?.name}</span>
                                    <div className="flex flex-col gap-1">
                                      {taskKpis.map((k, i) => {
                                        const colorClass = getFormatColor(k);
                                        return <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 w-fit ${theme==='dark' ? `bg-slate-800 ${colorClass.border} ${colorClass.text}` : `bg-white shadow-sm ${colorClass.border} ${colorClass.text}`}`}><div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>{k.title}</span>
                                      })}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 align-top">
                                  <div className="font-bold text-sm mb-1 text-slate-900 dark:text-white">{task.title}</div>
                                  {task.text && <div className="text-xs font-medium text-slate-500 line-clamp-2">{task.text}</div>}
                                </td>
                                <td className="p-4 text-right align-top">
                                  <div className="flex flex-col items-end gap-2">
                                    {task.status === 'completed' ? (
                                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20 whitespace-nowrap"><CheckCircle2 size={12}/> Готово</span>
                                    ) : isOverdue ? (
                                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap"><AlertCircle size={12}/> Просрочено</span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 whitespace-nowrap"><Clock size={12}/> В плане</span>
                                    )}
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={()=> {setEditingItem(task); setActiveModal('addTask');}} className="p-1.5 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-800 rounded transition-colors"><Edit2 size={14}/></button>
                                      <button onClick={()=> deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                  </div>
                                </td>
                             </tr>
                           )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === 'calendar' && (
              <CalendarView 
                currentMonth={currentMonth} tasks={monthTasks} theme={theme} kpis={kpis}
                onDayClick={(date, dayTasks) => {
                  setEditingItem({ _date: date, _tasks: dayTasks }); 
                  setActiveModal('dayTasks');
                }} 
              />
            )}

            {}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in">
                <section className={`border rounded-2xl p-5 sm:p-8 shadow-sm ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-white border-slate-100'}`}>
                  <div className={`mb-6 border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme==='dark'?'border-slate-800':'border-slate-100'}`}>
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={20} className="text-indigo-500"/> Сводка за {MONTHS.find(m=>m.value===currentMonth)?.label}</h2>
                      <p className="text-xs text-slate-500 mt-1">Отчет сдается в начале следующего месяца.</p>
                    </div>
                    {currentAnalytics.isSubmitted ? (
                      <div className="flex flex-col sm:items-end gap-2">
                        <span className="px-3 py-1.5 bg-green-500/10 text-green-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-green-500/20 flex items-center gap-1.5 inline-flex w-fit"><Lock size={14}/> Отчет сдан</span>
                        {isAdmin && <button onClick={()=>setAnalytics(prev=>({...prev, [currentMonth]:{...currentAnalytics, isSubmitted: false}}))} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"><Unlock size={12}/> Открыть для ред.</button>}
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-amber-500/20 inline-flex w-fit">Ожидает сдачи</span>
                    )}
                  </div>

                  {!currentAnalytics.isSubmitted ? (
                    <AnalyticsInputForm theme={theme} currentData={currentAnalytics} onSave={(data) => {
                      setAnalytics(prev => ({ ...prev, [currentMonth]: { ...data, isSubmitted: true } }));
                      showToast('Отчет успешно сохранен');
                    }} />
                  ) : (
                    <AnalyticsDashboard data={currentAnalytics} prevData={prevAnalytics} theme={theme} allData={analytics} months={MONTHS} onPrint={()=>handlePrint('analytics')} />
                  )}
                </section>
              </div>
            )}

            {}
            {isAdmin && activeTab === 'platforms' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2"><Layers size={20} className="text-teal-500"/> Платформы и Форматы (KPI)</h2>
                      <p className="text-xs text-slate-500 mt-1">Настройка площадок и плановых показателей</p>
                    </div>
                    <button onClick={() => { setEditingItem({id:''}); setActiveModal('editPlatform'); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-transform active:scale-95 shadow-sm">
                      <Plus size={16} /> Добавить Платформу
                    </button>
                </div>
                  
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                   {platforms.map(p => {
                     const isExpanded = expandedPlatforms[p.id] !== false; 
                     return (
                       <div key={p.id} className={`rounded-2xl border transition-all overflow-hidden ${theme==='dark'?'bg-slate-900/80 border-slate-800':'bg-white border-slate-200 shadow-sm'}`}>
                          <div className="flex justify-between items-center p-5 cursor-pointer select-none" onClick={() => setExpandedPlatforms(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner bg-slate-800 dark:bg-slate-700`}>
                                {getPlatformIcon(p, 20)}
                              </div>
                              <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{p.name}</h3>
                                <span className="text-[11px] font-bold text-slate-500">{p.account}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <button onClick={(e) => { e.stopPropagation(); setEditingItem(p); setActiveModal('editPlatform'); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"><Edit2 size={14}/></button>
                               <button onClick={(e) => { e.stopPropagation(); deletePlatform(p.id); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"><Trash2 size={14}/></button>
                               <div className={`p-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={18} className="text-slate-400"/></div>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className={`p-5 border-t ${theme==='dark'?'border-slate-800 bg-slate-900':'border-slate-100 bg-slate-50/50'}`}>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                                 Форматы контента
                                 <button onClick={(e) => { e.stopPropagation(); setEditingItem({platformId: p.id}); setActiveModal('editKpi'); }} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"><Plus size={12}/> Добавить</button>
                               </div>
                               <div className="space-y-2">
                                 {kpis.filter(k=>k.platformId === p.id).map(kpi => {
                                    const colorClass = getFormatColor(kpi);
                                    return (
                                     <div key={kpi.id} className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
                                       <div className="flex items-center gap-2.5">
                                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${colorClass.bg}`}></div>
                                          <span className="font-bold text-sm">{kpi.title}</span>
                                       </div>
                                       <div className="flex items-center gap-2 shrink-0">
                                         <span className={`text-xs font-bold px-2 py-1 rounded-md ${theme==='dark'?'bg-slate-900 text-slate-300':'bg-slate-100 text-slate-600'}`}>{kpi.target} шт</span>
                                         <button onClick={(e) => { e.stopPropagation(); setEditingItem(kpi); setActiveModal('editKpi'); }} className="text-slate-400 hover:text-blue-500 transition-colors p-1"><Edit2 size={14}/></button>
                                         <button onClick={(e) => { e.stopPropagation(); deleteKpi(kpi.id); }} className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash2 size={14}/></button>
                                       </div>
                                     </div>
                                   )
                                 })}
                                 {kpis.filter(k=>k.platformId === p.id).length === 0 && <div className="p-4 text-center text-xs text-slate-400 border-2 border-dashed rounded-xl dark:border-slate-700 font-bold">Нет форматов для платформы</div>}
                               </div>
                            </div>
                          )}
                       </div>
                     )
                   })}
                </div>
              </div>
            )}

            {}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in">
                <section className={`border rounded-2xl p-5 sm:p-8 shadow-sm max-w-3xl ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-white border-slate-100'}`}>
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Settings size={20} className="text-slate-500"/> Системные настройки</h2>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 gap-4">
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2"><MonitorSmartphone size={16} className="text-blue-500"/> Тема интерфейса</div>
                      </div>
                      <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg w-fit">
                        <button onClick={()=>setTheme('light')} className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all ${theme==='light'?'bg-white shadow-sm text-slate-900':'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><Sun size={14}/> Светлая</button>
                        <button onClick={()=>setTheme('dark')} className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all ${theme==='dark'?'bg-slate-700 shadow-sm text-white':'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><Moon size={14}/> Темная</button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 gap-4">
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2"><User size={16} className="text-purple-500"/> Мой профиль</div>
                      </div>
                      <button onClick={() => {setEditingItem(user); setActiveModal('editProfile');}} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Изменить</button>
                    </div>
                  </div>
                </section>

                {isAdmin && (
                  <section className={`border rounded-2xl p-5 sm:p-8 shadow-sm max-w-3xl ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-white border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20} className="text-blue-500"/> Пользователи системы</h2>
                      <button onClick={() => { setEditingItem({id:''}); setActiveModal('addUser'); }} className="text-xs bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-3 py-2 rounded-lg font-bold shadow-sm flex items-center gap-1.5 hover:opacity-90 transition-transform active:scale-95"><Plus size={14}/> Добавить</button>
                    </div>
                    <div className={`border rounded-xl overflow-hidden divide-y ${theme==='dark'?'divide-slate-800 border-slate-800':'divide-slate-200 border-slate-200'}`}>
                      {Object.values(usersDb).map(u => (
                        <div key={u.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${theme==='dark'?'bg-slate-800/30':'bg-white'}`}>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{u.name[0]}</div>
                             <div>
                               <div className="font-bold text-sm">{u.name} <span className="text-xs text-slate-400 font-medium ml-2">@{u.login}</span></div>
                               <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                             </div>
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg w-fit ${u.role==='admin'?'bg-red-500/10 text-red-600 border border-red-500/20':'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>{u.role}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
        
        {/* Mobile Bottom Nav */}
        <nav className={`md:hidden fixed bottom-0 left-0 w-full z-40 border-t pb-safe backdrop-blur-xl ${theme==='dark'?'bg-[#111]/90 border-slate-800':'bg-white/90 border-slate-200'}`}>
           <div className="flex justify-around items-end h-14 px-2 pb-1">
              {MOBILE_NAV_ITEMS.slice(0,2).map(item => (
                 <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${activeTab === item.id ? (theme==='dark'?'text-red-400':'text-red-600') : 'text-slate-500'}`}>
                    <item.icon size={20} className={activeTab === item.id ? 'fill-current opacity-20' : ''}/>
                    <span className="text-[9px] font-bold">{item.label}</span>
                 </button>
              ))}
              
              <div className="relative -top-4 z-50">
                 <button onClick={() => { setEditingItem({ date: `${currentMonth}-01`, platformId: platforms[0]?.id, kpiIds: [] }); setActiveModal('addTask'); }} className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 border-[3px] border-white dark:border-[#111]">
                    <Plus size={24} />
                 </button>
              </div>

              {MOBILE_NAV_ITEMS.slice(2,4).map(item => (
             <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${activeTab === item.id ? (theme==='dark'?'text-red-400':'text-red-600') : 'text-slate-500'}`}>
                <item.icon size={20} className={activeTab === item.id ? 'fill-current opacity-20' : ''}/>
                <span className="text-[9px] font-bold">{item.label}</span>
             </button>
          ))}
       </div>
    </nav>
  </div>

  {selectedKpiForDetails && (() => {
    const platform = platforms.find(p => p.id === selectedKpiForDetails.platformId);
        const relatedTasks = monthTasks.filter(t => t.kpiIds?.includes(selectedKpiForDetails.id));
        const emptySlotsCount = Math.max(0, selectedKpiForDetails.target - relatedTasks.length);
        const colorClass = getFormatColor(selectedKpiForDetails);
        
        return (
          <Modal title={selectedKpiForDetails.title} onClose={() => setSelectedKpiForDetails(null)} maxWidth="max-w-2xl">
            <div className="space-y-5">
              <div className={`flex justify-between items-center p-5 rounded-2xl ${theme==='dark'?'bg-slate-800':'bg-slate-50 border border-slate-100'}`}>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 text-slate-500">{getPlatformIcon(platform, 12)} {platform?.name}</div>
                  <div className="text-3xl font-black flex items-baseline gap-2">
                    {relatedTasks.length} <span className="text-slate-400 text-lg font-bold">/ {selectedKpiForDetails.target}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center opacity-20 ${colorClass.bg}`}><Target size={24} className="text-white"/></div>
              </div>
              
              <h4 className="font-bold text-sm flex justify-between items-center">
                Список задач:
              </h4>
              <div className={`border rounded-xl overflow-hidden divide-y ${theme==='dark'?'divide-slate-800 border-slate-800':'divide-slate-200 border-slate-200'}`}>
                {relatedTasks.map(task => (
                  <TaskRow key={task.id} task={task} theme={theme} platforms={platforms} kpis={kpis} todayStr={todayStr} onComplete={completeTask} onDelete={() => deleteTask(task.id)} onEdit={() => { setEditingItem(task); setActiveModal('addTask'); }} compact />
                ))}
                
                {Array.from({length: emptySlotsCount}).map((_, idx) => (
                  <div key={`empty-${idx}`} className={`p-4 flex items-center justify-between border-l-4 border-l-transparent hover:border-l-red-500 transition-all cursor-pointer group ${theme==='dark'?'bg-slate-900 hover:bg-slate-800':'bg-white hover:bg-slate-50'}`}
                       onClick={() => { setEditingItem({ title: `Публикация: ${selectedKpiForDetails.title}`, kpiIds: [selectedKpiForDetails.id], platformId: selectedKpiForDetails.platformId, date: `${currentMonth}-01` }); setActiveModal('addTask'); }}>
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:border-red-500 group-hover:text-red-500 transition-colors"><Plus size={12}/></div>
                      <span className="text-xs font-bold group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Свободный слот (добавить)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        );
      })()}

      {activeModal === 'dayTasks' && editingItem?._date && (
        <Modal title={`Задачи на ${editingItem._date.split('-').reverse().join('.')}`} onClose={() => {setActiveModal(null); setEditingItem(null);}} maxWidth="max-w-2xl">
           <div className={`border rounded-xl overflow-hidden divide-y ${theme==='dark'?'divide-slate-800 border-slate-800':'divide-slate-200 border-slate-200'}`}>
             {editingItem._tasks.length > 0 ? (
               editingItem._tasks.map(task => (
                  <TaskRow key={task.id} task={task} theme={theme} platforms={platforms} kpis={kpis} todayStr={todayStr} onComplete={completeTask} onDelete={() => deleteTask(task.id)} onEdit={() => { setEditingItem(task); setActiveModal('addTask'); }} compact />
               ))
             ) : (
               <div className="p-8 text-center text-slate-400 font-bold text-sm">На этот день задач нет.</div>
             )}
           </div>
           <button onClick={() => { setActiveModal('addTask'); setEditingItem({ date: editingItem._date, kpiIds: [], platformId: platforms[0]?.id }); }} className="w-full mt-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm">
              <Plus size={16}/> Запланировать задачу
           </button>
        </Modal>
      )}

      {}
      {isAdmin && activeModal === 'editPlatform' && (
        <Modal title={editingItem?.id ? 'Редактировать платформу' : 'Новая платформа'} onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Название платформы</label>
              <input type="text" id="platName" defaultValue={editingItem?.name || ''} placeholder="Например: ВКонтакте" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">Аккаунт / Ссылка</label>
              <input type="text" id="platAccount" defaultValue={editingItem?.account || ''} placeholder="@username" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
               <label className="block text-xs font-bold mb-1.5">Иконка</label>
               <div className="grid grid-cols-6 gap-2">
                 {PLATFORM_ICONS.map(pi => (
                   <label key={pi.id} className={`flex justify-center items-center p-2 border rounded-lg cursor-pointer transition-colors ${editingItem?.iconName === pi.id || (!editingItem?.iconName && pi.id === 'globe') ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-500/10' : (theme==='dark'?'border-slate-700 hover:bg-slate-800':'border-slate-200 hover:bg-slate-50')}`}>
                     <input type="radio" name="iconName" value={pi.id} className="hidden" defaultChecked={editingItem?.iconName === pi.id} onChange={(e) => setEditingItem({...editingItem, iconName: e.target.value})} />
                     <pi.icon size={20} />
                   </label>
                 ))}
               </div>
            </div>
            <button onClick={() => {
                const name = document.getElementById('platName').value;
                const account = document.getElementById('platAccount').value;
                const iconName = editingItem.iconName || 'globe';
                if(!name) return showToast('Введите название', 'error');
                savePlatform({ ...(editingItem || {}), name, account, iconName });
              }} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 mt-2 shadow-sm text-sm active:scale-95 transition-transform">Сохранить</button>
          </div>
        </Modal>
      )}

      {isAdmin && activeModal === 'editKpi' && (
        <Modal title={editingItem?.id ? 'Редактировать Формат' : 'Новый Формат Контента'} onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold mb-1.5">Платформа</label>
               <select id="kpiPlatform" defaultValue={editingItem?.platformId || platforms[0]?.id} className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                 {platforms.map(p => <option key={p.id} value={p.id}>{p.name} ({p.account})</option>)}
               </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">Название формата</label>
              <input type="text" id="kpiTitle" defaultValue={editingItem?.title || ''} placeholder="Например: Съемка Reels" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">План на месяц (шт)</label>
              <input type="number" id="kpiTarget" defaultValue={editingItem?.target || 1} min="1" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 flex items-center gap-2">Цвет <span className="text-[10px] font-normal text-slate-400">(Для календаря)</span></label>
              <div className="flex flex-wrap gap-2">
                 {FORMAT_COLORS.map(c => (
                   <label key={c.id} className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all ${editingItem?.colorId === c.id || (!editingItem?.colorId && c.id === 'blue') ? 'border-slate-800 dark:border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'} ${c.bg}`}>
                     <input type="radio" name="colorId" value={c.id} className="hidden" defaultChecked={editingItem?.colorId === c.id} onChange={(e) => setEditingItem({...editingItem, colorId: e.target.value})} />
                     {(editingItem?.colorId === c.id || (!editingItem?.colorId && c.id === 'blue')) && <CheckCircle2 size={14} className="text-white"/>}
                   </label>
                 ))}
              </div>
            </div>
            <button onClick={() => {
                const title = document.getElementById('kpiTitle').value;
                const target = Number(document.getElementById('kpiTarget').value);
                const platformId = document.getElementById('kpiPlatform').value;
                const colorId = editingItem.colorId || 'blue';
                if(!title) return showToast('Введите название', 'error');
                if(target < 1) return showToast('План должен быть больше 0', 'error');
                saveKpi({ ...(editingItem || {}), title, target, platformId, colorId });
              }} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 mt-2 shadow-sm text-sm active:scale-95 transition-transform">Сохранить</button>
          </div>
        </Modal>
      )}

      {isAdmin && activeModal === 'addUser' && (
        <Modal title="Новый пользователь" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">ФИО</label>
              <input type="text" id="addUserName" placeholder="Иван Иванов" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">Логин</label>
              <input type="text" id="addUserLogin" placeholder="new_smm" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">Пароль</label>
              <input type="text" id="addUserPass" placeholder="Пароль" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
               <label className="block text-xs font-bold mb-1.5">Роль</label>
               <select id="addUserRole" className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                 <option value="smm">SMM Специалист</option>
                 <option value="admin">Администратор</option>
               </select>
            </div>
            <button onClick={() => {
                const name = document.getElementById('addUserName').value;
                const login = document.getElementById('addUserLogin').value;
                const pass = document.getElementById('addUserPass').value;
                const role = document.getElementById('addUserRole').value;
                if(!name || !login || !pass) return showToast('Заполните все поля', 'error');
                
                const newKey = login.toLowerCase();
                if(usersDb[newKey]) return showToast('Логин занят', 'error');

                setUsersDb(prev => ({ ...prev, [newKey]: { name, login, pass, role, email: `${login}@pokiza.com`, id: Date.now() } }));
                showToast('Пользователь добавлен');
                setActiveModal(null);
              }} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-3 rounded-xl mt-2 shadow-sm text-sm active:scale-95 transition-transform">Создать</button>
          </div>
        </Modal>
      )}

      {}
      {activeModal === 'editProfile' && (
        <Modal title="Мой профиль" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Отображаемое имя</label>
              <input type="text" id="profileName" defaultValue={editingItem?.name || ''} className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <button onClick={() => {
                const newName = document.getElementById('profileName').value;
                if(!newName) return showToast('Имя не может быть пустым', 'error');
                
                const userKey = Object.keys(usersDb).find(k => usersDb[k].id === user.id);
                setUsersDb(prev => ({ ...prev, [userKey]: { ...prev[userKey], name: newName } }));
                onUpdateUser(prev => ({ ...prev, name: newName }));
                showToast('Имя обновлено');
                setActiveModal(null);
              }} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-3 rounded-xl mt-2 text-sm active:scale-95 transition-transform">Сохранить</button>
          </div>
        </Modal>
      )}

      {activeModal === 'addTask' && (
        <TaskFormModal task={editingItem} kpis={kpis} platforms={platforms} theme={theme} onSave={saveTask} onClose={() => {setActiveModal(null); setEditingItem(null);}} />
      )}
    </div>

    {/* Print Views (Rendered purely for printing PDF) */}
    {printMode && (
      <div className="bg-white font-sans text-black p-8 print:p-0 min-h-screen">
        {printMode === 'analytics' && <AnalyticsPrintView data={currentAnalytics} currentMonth={MONTHS.find(m=>m.value===currentMonth)?.label} kpiProgress={kpiProgress} />}
        {printMode === 'plan' && <ContentPlanPrintView currentMonthLabel={MONTHS.find(m=>m.value===currentMonth)?.label} monthTasks={monthTasks.sort((a,b) => new Date(a.date) - new Date(b.date))} platforms={platforms} kpis={kpis} />}
      </div>
    )}
    </>
  );
}

function TaskRow({ task, theme, platforms, kpis, onComplete, onDelete, onEdit, compact = false, todayStr }) {
  const [linkInput, setLinkInput] = useState(task.link || '');
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && task.date < todayStr;
  
  const platform = platforms.find(p => p.id === task.platformId);
  const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];

  return (
    <div className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${theme==='dark'?'hover:bg-slate-800/30':'hover:bg-slate-50'} ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {isCompleted ? <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} /> : <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>}
        <div className="min-w-0 space-y-1">
          <h4 className={`font-bold text-sm truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${theme==='dark'?'bg-slate-800 text-slate-300':'bg-slate-100 text-slate-600'}`}>{task.date.split('-').reverse().join('.')}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 ${theme==='dark'?'bg-slate-800 text-red-400':'bg-slate-100 text-red-500'}`}>{getPlatformIcon(platform, 10)} {platform?.name}</span>
            {taskKpis.map((k, i) => {
               const colorClass = getFormatColor(k);
               return <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate max-w-[120px] flex items-center gap-1 ${theme==='dark' ? `bg-slate-800 ${colorClass.border} ${colorClass.text}` : `bg-white ${colorClass.border} ${colorClass.text}`}`} title="Связанный формат"><div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>{k.title}</span>
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
        {!isCompleted ? (
          <div className="flex w-full gap-2">
            <input type="text" placeholder="Ссылка..." value={linkInput} onChange={e => setLinkInput(e.target.value)} className={`flex-1 md:w-48 px-3 py-1.5 border text-xs font-bold rounded-lg outline-none focus:border-red-600 transition-colors ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-white border-slate-200'}`} />
            <div className="flex gap-1">
              <button onClick={() => onComplete(task.id, linkInput)} className="px-3 py-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-lg hover:opacity-80 shrink-0 shadow-sm transition-opacity">Сдать</button>
              <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors shrink-0"><Edit2 size={16}/></button>
              <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 size={16}/></button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between md:justify-end w-full gap-3">
            {task.link ? (
              <a href={task.link} target="_blank" rel="noreferrer" className={`text-xs font-bold hover:underline truncate max-w-[150px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme==='dark'?'text-blue-400 bg-blue-500/10 border-blue-500/20':'text-blue-600 bg-blue-50 border-blue-100'}`}><Paperclip size={14} className="shrink-0"/> <span className="truncate">{task.link}</span></a>
            ) : (
              <span className="text-xs font-bold text-slate-400 italic">Сдано без ссылки</span>
            )}
            <div className="flex gap-1 shrink-0">
               <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Edit2 size={14}/></button>
               <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InlineTaskEditor({ currentMonth, platforms, kpis, theme, onSave }) {
  const [data, setData] = useState({ date: `${currentMonth}-01`, title: '', text: '', platformId: platforms[0]?.id || '', kpiIds: [] });

  const handleSave = () => {
    if(!data.title) return;
    const success = onSave(data);
    if (success) setData(prev => ({ ...prev, title: '', text: '', kpiIds: [] }));
  };

  const availableKpis = kpis.filter(k => k.platformId === data.platformId);

  return (
    <tr className={`border-b-2 ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-slate-50/50 border-slate-200'}`}>
      <td className="p-3 align-top">
        <input type="date" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className={`w-full px-2 py-1.5 text-xs font-bold border rounded-lg outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-700':'border-slate-300'}`}/>
      </td>
      <td className="p-3 space-y-2 align-top">
        <select value={data.platformId} onChange={e=>setData({...data, platformId: e.target.value, kpiIds: []})} className={`w-full px-2 py-1.5 text-xs font-bold border rounded-lg outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-700 text-slate-200':'border-slate-300 text-slate-800'}`}>
          {platforms.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-800">{p.name}</option>)}
        </select>
        {availableKpis.length > 0 && (
          <select value={data.kpiIds[0] || ''} onChange={e=>setData({...data, kpiIds: e.target.value ? [e.target.value] : []})} className={`w-full px-2 py-1.5 text-[11px] font-bold border rounded-lg outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-700 text-slate-400':'border-slate-300 text-slate-600'}`}>
            <option value="">-- Формат контента --</option>
            {availableKpis.map(k => <option key={k.id} value={k.id} className="dark:bg-slate-800">{k.title}</option>)}
          </select>
        )}
      </td>
      <td className="p-3 align-top">
        <input type="text" placeholder="Тема / Идея публикации..." value={data.title} onChange={e=>setData({...data, title: e.target.value})} onKeyDown={e=>{if(e.key==='Enter')handleSave()}} className={`w-full px-3 py-1.5 text-sm font-bold border rounded-lg outline-none focus:border-red-600 bg-transparent mb-1.5 ${theme==='dark'?'border-slate-700 placeholder-slate-500':'border-slate-300'}`}/>
        <textarea rows="1" placeholder="Текст или сценарий (необязательно)..." value={data.text} onChange={e=>setData({...data, text: e.target.value})} onKeyDown={e=>{if(e.key==='Enter' && e.ctrlKey)handleSave()}} className={`w-full px-3 py-1.5 text-xs font-medium border rounded-lg outline-none focus:border-red-600 bg-transparent resize-none ${theme==='dark'?'border-slate-700 placeholder-slate-600':'border-slate-300'}`}/>
      </td>
      <td className="p-3 text-right align-top">
         <button onClick={handleSave} disabled={!data.title} className="w-full py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex justify-center items-center gap-1 transition-transform active:scale-95 shadow-sm shadow-red-600/20"><Plus size={16}/> В план</button>
      </td>
    </tr>
  )
}

function TaskFormModal({ task, kpis, platforms, theme, onSave, onClose }) {
  const [formData, setFormData] = useState(task || { title: '', text: '', date: '2026-06-01', platformId: platforms[0]?.id || '', kpiIds: [], link: '' });

  const handlePlatformChange = (e) => {
    setFormData({...formData, platformId: e.target.value, kpiIds: []});
  };

  const toggleKpi = (kpiId) => {
    setFormData(prev => {
      const ids = prev.kpiIds || [];
      if(ids.includes(kpiId)) return { ...prev, kpiIds: ids.filter(id => id !== kpiId) };
      return { ...prev, kpiIds: [...ids, kpiId] };
    });
  };

  const availableKpis = kpis.filter(k => k.platformId === formData.platformId);

  return (
    <Modal title={task?.id ? 'Редактировать задачу' : 'Новая задача'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1.5">Название / Тема</label>
          <input type="text" placeholder="Например: Съемка Reels с обзором" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5">Текст / Сценарий</label>
          <textarea rows="2" placeholder="Опишите задачу..." value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 resize-none font-medium ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5">Дата</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">Платформа</label>
            <select value={formData.platformId} onChange={handlePlatformChange} className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-red-600 font-bold ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-slate-50 border-slate-200'}`}>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold mb-2 flex flex-col">
            Форматы контента (KPI)
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">Выберите один или несколько</span>
          </label>
          <div className={`border rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-slate-50/50 border-slate-200'}`}>
            {availableKpis.length === 0 ? <p className="text-xs text-slate-400 font-bold text-center py-2">Нет форматов</p> : null}
            {availableKpis.map(k => {
               const colorClass = getFormatColor(k);
               return (
                <label key={k.id} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer group transition-colors ${formData.kpiIds?.includes(k.id) ? (theme==='dark'?'bg-slate-800':'bg-white shadow-sm border border-slate-100') : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} onClick={() => toggleKpi(k.id)}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${formData.kpiIds?.includes(k.id) ? 'bg-red-600 border-red-600' : (theme==='dark'?'border-slate-600 group-hover:border-slate-500':'border-slate-300 group-hover:border-slate-400')}`}>
                    {formData.kpiIds?.includes(k.id) && <CheckCircle2 size={12} className="text-white"/>}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${colorClass.bg}`}></div>
                  <span className="text-xs font-bold select-none">{k.title}</span>
                </label>
              )
            })}
          </div>
        </div>

        <button onClick={() => onSave(formData)} disabled={!formData.title} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-3 rounded-xl disabled:opacity-50 mt-2 transition-transform active:scale-95 shadow-sm text-sm">
          Сохранить задачу
        </button>
      </div>
    </Modal>
  );
}

function CalendarView({ currentMonth, tasks, theme, kpis, onDayClick }) {
  const daysInMonth = new Date(currentMonth.split('-')[0], currentMonth.split('-')[1], 0).getDate();
  const firstDay = new Date(currentMonth.split('-')[0], currentMonth.split('-')[1] - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
  
  const days = Array.from({length: daysInMonth}, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${currentMonth}-${dayNum.toString().padStart(2, '0')}`;
    return { dayNum, dateStr, dayTasks: tasks.filter(t => t.date === dateStr) };
  });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const usedKpisMap = new Map();
  tasks.forEach(t => t.kpiIds?.forEach(kId => {
    if (!usedKpisMap.has(kId)) {
      const k = kpis.find(x => x.id === kId);
      if (k) usedKpisMap.set(kId, k);
    }
  }));
  const legendItems = Array.from(usedKpisMap.values());

  return (
    <section className={`border rounded-2xl p-5 sm:p-8 shadow-sm ${theme==='dark'?'bg-slate-900/50 border-slate-800':'bg-white border-slate-100'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2"><CalendarIcon size={20} className="text-blue-500"/> Календарь публикаций</h2>
        
        {legendItems.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Форматы:</span>
            {legendItems.map(k => {
               const colorClass = getFormatColor(k);
               return (
                 <div key={k.id} className={`text-[10px] font-bold flex items-center gap-1.5 px-2 py-1 rounded border ${theme==='dark' ? `bg-slate-800 ${colorClass.border} ${colorClass.text}` : `bg-white shadow-sm ${colorClass.border} ${colorClass.text}`}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>
                   {k.title}
                 </div>
               )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{weekDays.map(d => <div key={d}>{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
        {Array.from({length: startOffset}).map((_, i) => <div key={`empty-${i}`} className={`aspect-square rounded-xl ${theme==='dark'?'bg-slate-900/20':'bg-slate-50/30'}`}></div>)}
        {days.map(({ dayNum, dateStr, dayTasks }) => {
          const hasTasks = dayTasks.length > 0;
          
          return (
            <div key={dayNum} onClick={() => onDayClick(dateStr, dayTasks)} className={`aspect-square rounded-xl sm:rounded-2xl border relative p-1.5 sm:p-3 cursor-pointer transition-all flex flex-col justify-between hover:shadow-md ${hasTasks ? (theme==='dark'?'bg-slate-800 border-slate-700 hover:border-slate-500':'bg-white border-slate-200 hover:border-slate-300 shadow-sm') : (theme==='dark'?'bg-slate-900/50 border-dashed border-slate-800 hover:border-slate-600':'bg-slate-50/50 border-dashed border-slate-200 hover:border-slate-300')}`}>
              <span className={`text-xs sm:text-base font-bold ${hasTasks ? (theme==='dark'?'text-white':'text-slate-900') : 'text-slate-400'}`}>{dayNum}</span>
              {hasTasks && (
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1 mb-1 sm:mb-1.5">
                    {dayTasks.map(t =>
                      t.kpiIds?.map((kId, idx) => {
                         const colorClass = getFormatColor(kpis.find(k=>k.id===kId)).bg;
                         return <div key={`${t.id}-${kId}-${idx}`} className={`h-1 sm:h-1.5 w-full max-w-[8px] sm:max-w-[12px] rounded-full ${colorClass} shadow-sm`} title={t.title}></div>
                      })
                    )}
                  </div>
                  <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider pt-0.5 sm:pt-1 border-t ${theme==='dark'?'border-slate-700 text-slate-400':'border-slate-100 text-slate-500'} block truncate`}>{dayTasks.length} задач</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  );
}

function AnalyticsInputForm({ onSave, currentData, theme }) {
  const [data, setData] = useState(currentData);
  const er = useMemo(() => {
    const r = Number(data.reach) || 0;
    if (r === 0) return 0;
    return ((((Number(data.likes) || 0) + (Number(data.comments) || 0)) / r) * 100).toFixed(2);
  }, [data]);

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {id:'followers', icon:Users, label:'Подписчики'}, {id:'reach', icon:Eye, label:'Охват'},
          {id:'likes', icon:Heart, label:'Лайки'}, {id:'comments', icon:MessageCircle, label:'Комментарии'}
        ].map(f => (
          <div key={f.id}>
            <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><f.icon size={14}/> {f.label}</label>
            <input type="number" value={data[f.id]} onChange={e=>setData({...data, [f.id]: e.target.value})} className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-red-600 font-bold text-sm ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-slate-50 border-slate-200'}`} />
          </div>
        ))}
      </div>
      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between border shadow-sm gap-3 ${theme==='dark'?'bg-red-500/10 border-red-500/20':'bg-red-50 border-red-100'}`}>
        <span className={`font-bold text-sm ${theme==='dark'?'text-red-400':'text-red-800'}`}>Авто-расчет ER (Вовлеченность):</span>
        <span className="text-2xl font-black text-red-600">{er}%</span>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Выводы и инсайты</label>
        <textarea rows="4" placeholder="Краткое резюме проделанной работы..." value={data.text} onChange={e=>setData({...data, text: e.target.value})} className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-red-600 resize-none font-medium text-sm ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-slate-50 border-slate-200'}`} />
      </div>
      <button onClick={() => { if(!data.reach) return showToast('Введите охват', 'error'); onSave({...data, er}); }} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 w-full sm:w-auto text-sm"><Lock size={16}/> Отправить отчет</button>
    </div>
  );
}

function AnalyticsDashboard({ data, prevData, theme, allData, months, onPrint }) {
  const chartData = useMemo(() => {
    return months.map(m => {
      const d = allData[m.value];
      return {
        name: m.label.split(' ')[0],
        followers: d?.isSubmitted ? Number(d.followers) : 0,
        reach: d?.isSubmitted ? Number(d.reach) : 0,
      }
    });
  }, [allData, months]);

  const renderStat = (title, val, prevVal, icon) => {
    const diff = prevVal != null ? Number(val) - Number(prevVal) : 0;
    const isPos = diff > 0;
    const isNeg = diff < 0;
    
    return (
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-white border-slate-100'}`}>
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">{icon}</div>
        <div className="text-[10px] sm:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{title}</div>
        <div className="text-2xl sm:text-4xl font-black mb-3 text-slate-900 dark:text-white">{Number(val).toLocaleString('ru')}</div>
        {prevVal != null ? (
          <div className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded w-fit ${isPos ? 'bg-green-500/10 text-green-500' : (isNeg ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}`}>
            {isPos ? '▲' : (isNeg ? '▼' : '▬')} {Math.abs(diff).toLocaleString('ru')}
          </div>
        ) : (
           <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded w-fit">Первый месяц</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {renderStat('Подписчики', data.followers, prevData?.followers, <Users size={100} className="text-blue-500"/>)}
        {renderStat('Охват', data.reach, prevData?.reach, <Eye size={100} className="text-purple-500"/>)}
        {renderStat('Взаимодействия', Number(data.likes) + Number(data.comments), prevData ? Number(prevData.likes) + Number(prevData.comments) : null, <Heart size={100} className="text-pink-500"/>)}
        {renderStat('ER (%)', data.er, prevData?.er, <TrendingUp size={100} className="text-red-500"/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className={`p-4 sm:p-6 rounded-2xl border shadow-sm ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-white border-slate-100'}`}>
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 text-slate-500 flex justify-between">Динамика Охвата <button onClick={onPrint} className="text-blue-500 flex items-center gap-1 hover:underline"><Download size={12}/> Скачать отчет</button></h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme==='dark'?'#333':'#eee'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 600}} />
                <RechartsTooltip cursor={{fill: theme==='dark'?'#222':'#f5f5f5'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}} />
                <Bar dataKey="reach" fill="#E53935" radius={[4, 4, 0, 0]} name="Охват" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-4 sm:p-6 rounded-2xl border shadow-sm ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-white border-slate-100'}`}>
          <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 text-slate-500">Рост Подписчиков</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme==='dark'?'#333':'#eee'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 600}} domain={['dataMin - 1000', 'dataMax + 1000']}/>
                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}} />
                <Line type="monotone" dataKey="followers" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: theme==='dark'?'#111':'#fff'}} name="Подписчики" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${theme==='dark'?'bg-slate-900 border-slate-800':'bg-slate-50 border-slate-100'}`}>
        <h3 className="text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5"><MessageCircle size={14} className="text-red-500"/> Резюме SMM специалиста</h3>
        <p className={`leading-relaxed italic border-l-4 border-red-500 pl-4 text-sm font-medium ${theme==='dark'?'text-slate-300':'text-slate-700'}`}>{data.text || 'Комментарии не добавлены.'}</p>
      </div>
    </div>
  );
}

// Print View for Analytics
function AnalyticsPrintView({ data, currentMonth, kpiProgress }) {
  return (
    <div>
      <div className="border-b-4 border-red-600 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-red-600 uppercase tracking-wider mb-1 flex items-center gap-2"><TrendingUp size={24}/> ПОКИЗА</h1>
          <p className="text-sm text-slate-600 font-bold">Аналитический отчет • {currentMonth}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-red-600"/> Ключевые показатели</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 border-2 border-slate-100 rounded-xl bg-slate-50"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Подписчики</div><div className="text-2xl font-black text-slate-900">{data.followers}</div></div>
          <div className="p-4 border-2 border-slate-100 rounded-xl bg-slate-50"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Охват</div><div className="text-2xl font-black text-slate-900">{data.reach}</div></div>
          <div className="p-4 border-2 border-slate-100 rounded-xl bg-slate-50"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Взаимодействия</div><div className="text-2xl font-black text-slate-900">{Number(data.likes) + Number(data.comments)}</div></div>
          <div className="p-4 border-2 border-red-100 rounded-xl bg-red-50"><div className="text-[10px] text-red-600 uppercase font-bold tracking-wider mb-1">ER (Вовлеченность)</div><div className="text-2xl font-black text-red-600">{data.er}%</div></div>
        </div>
      </div>

      <div className="mb-8 break-inside-avoid">
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><CheckSquare size={20} className="text-blue-600"/> Выполнение планов (KPI)</h2>
        <div className="grid grid-cols-2 gap-4">
          {kpiProgress.map(kpi => (
            <div key={kpi.id} className="flex justify-between items-center p-3 border-2 border-slate-100 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{kpi.platformName}</span>
                <span className="font-bold text-sm text-slate-800">{kpi.title}</span>
              </div>
              <div className="text-right">
                  <span className="text-xl font-black text-slate-900">{kpi.current}</span>
                  <span className="text-slate-500 font-bold text-sm"> / {kpi.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {data.text && (
        <div className="break-inside-avoid mt-6">
          <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><FileText size={20} className="text-green-600"/> Резюме специалиста</h2>
          <div className="text-slate-800 text-sm font-medium leading-relaxed bg-slate-50 p-4 border-2 border-slate-100 rounded-xl italic">"{data.text}"</div>
        </div>
      )}
    </div>
  );
}

// Print View for Content Plan
function ContentPlanPrintView({ currentMonthLabel, monthTasks, platforms, kpis }) {
  return (
    <div>
      <div className="border-b-4 border-red-600 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-red-600 uppercase tracking-wider mb-1 flex items-center gap-2"><TrendingUp size={24}/> ПОКИЗА</h1>
          <p className="text-sm text-slate-600 font-bold">Контент-план • {currentMonthLabel}</p>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Дата генерации</div>
           <div className="text-sm font-bold">{new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-slate-200 text-sm">
         <thead>
             <tr className="bg-slate-100">
                 <th className="border border-slate-200 p-2 font-bold w-24">Дата</th>
                 <th className="border border-slate-200 p-2 font-bold w-48">Платформа / Форматы</th>
                 <th className="border border-slate-200 p-2 font-bold">Тема / Описание</th>
                 <th className="border border-slate-200 p-2 font-bold w-24 text-center">Статус</th>
             </tr>
         </thead>
         <tbody>
            {monthTasks.length === 0 ? <tr><td colSpan="4" className="text-center p-4 text-slate-500 font-medium">Нет задач в этом месяце</td></tr> : null}
            {monthTasks.map(task => {
                const platform = platforms.find(p => p.id === task.platformId);
                const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];
                return (
                  <tr key={task.id}>
                    <td className="border border-slate-200 p-2 align-top font-semibold">{task.date.split('-').reverse().join('.')}</td>
                    <td className="border border-slate-200 p-2 align-top">
                      <div className="font-bold text-[10px] uppercase text-slate-500 mb-1">{platform?.name}</div>
                      <div className="text-xs font-semibold">{taskKpis.map(k=>k.title).join(', ')}</div>
                    </td>
                    <td className="border border-slate-200 p-2 align-top">
                      <div className="font-bold text-slate-900 mb-1">{task.title}</div>
                      <div className="text-xs text-slate-600">{task.text}</div>
                    </td>
                    <td className="border border-slate-200 p-2 align-top text-center font-bold text-xs">
                      {task.status === 'completed' ? <span className="text-green-600">Готово</span> : <span className="text-amber-600">В плане</span>}
                    </td>
                  </tr>
                )
            })}
         </tbody>
      </table>
    </div>
  );
}
