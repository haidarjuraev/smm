import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Paperclip, 
  BarChart3, LogOut, Plus, Trash2, Edit2, Download, 
  TrendingUp, Users, Eye, Target, X, MessageCircle, Heart,
  CheckSquare, Settings, Calendar as CalendarIcon, 
  Layers, User, Moon, Sun, MonitorSmartphone,
  FileText, ChevronDown, ChevronRight, Lock, Unlock,
  PlayCircle, Send, Music, LayoutDashboard,
  PanelLeftClose, Globe, Menu, GripVertical, Image as ImageIcon
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const APP_VERSION = 'd1-sync-v15-dynamic-months-2026-06-13';

const Instagram = Globe;
const Facebook = Users;
const Youtube = PlayCircle;

const INITIAL_USERS = {
  admin: { id: 1, login: 'admin', role: 'admin', pass: '@Pokiza4565@', name: 'Руководитель', email: 'ceo@pokiza.com' },
  smm: { id: 2, login: 'smm', role: 'smm', pass: '@Smm4565@', name: 'SMM Специалист', email: 'smm@pokiza.com' }
};


const RU_MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const pad2 = (num) => String(num).padStart(2, '0');

const getMonthValue = (date = new Date()) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

const getMonthLabel = (value) => {
  const [yearRaw, monthRaw] = String(value || getMonthValue()).split('-');
  const year = Number(yearRaw) || new Date().getFullYear();
  const monthIndex = Math.min(11, Math.max(0, (Number(monthRaw) || 1) - 1));
  return `${RU_MONTH_NAMES[monthIndex]} ${year}`;
};

const addMonths = (value, delta) => {
  const [yearRaw, monthRaw] = String(value || getMonthValue()).split('-');
  const year = Number(yearRaw) || new Date().getFullYear();
  const monthIndex = Math.min(11, Math.max(0, (Number(monthRaw) || 1) - 1));
  const date = new Date(year, monthIndex + delta, 1);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
};

const buildYearMonths = (year) => {
  const safeYear = Number(year) || new Date().getFullYear();
  return RU_MONTH_NAMES.map((label, index) => ({
    value: `${safeYear}-${pad2(index + 1)}`,
    label: `${label} ${safeYear}`
  }));
};

const buildTimelineMonths = (centerValue, count = 12) => {
  const total = Math.max(1, Number(count) || 12);
  const startOffset = -(total - 1);
  return Array.from({ length: total }, (_, index) => {
    const value = addMonths(centerValue, startOffset + index);
    return { value, label: getMonthLabel(value) };
  });
};


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

const getLocalISODate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const getFormatColor = (kpi) => {
  if (!kpi) return FORMAT_COLORS[0];
  if (kpi.colorId) {
    const found = FORMAT_COLORS.find(c => c.id === kpi.colorId);
    if (found) return found;
  }
  let sum = 0;
  const strId = String(kpi.id || '');
  for(let i=0; i<strId.length; i++) sum += strId.charCodeAt(i);
  return FORMAT_COLORS[sum % FORMAT_COLORS.length] || FORMAT_COLORS[0];
};

const getPlatformIcon = (platform, size = 18) => {
  if (!platform) return <Globe size={size} strokeWidth={1.5} />;
  if (platform.iconName) {
    const found = PLATFORM_ICONS.find(i => i.id === platform.iconName);
    if (found) { const Icon = found.icon; return <Icon size={size} strokeWidth={1.5} />; }
  }
  const n = String(platform.name || '').toLowerCase();
  if (n.includes('inst')) return <Instagram size={size} strokeWidth={1.5} />;
  if (n.includes('face')) return <Facebook size={size} strokeWidth={1.5} />;
  if (n.includes('tik')) return <Music size={size} strokeWidth={1.5} />;
  if (n.includes('tele')) return <Send size={size} strokeWidth={1.5} />;
  if (n.includes('you')) return <Youtube size={size} strokeWidth={1.5} />;
  return <Globe size={size} strokeWidth={1.5} />;
};

const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline break-all" onClick={(e) => e.stopPropagation()}>
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const withTs = (path) => {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}ts=${Date.now()}`;
};

const requestJson = async (path, options = {}) => {
  const method = options.method ? String(options.method).toUpperCase() : 'GET';
  const response = await fetch(method === 'GET' ? withTs(path) : path, {
    ...options,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try { data = JSON.parse(text); }
    catch { data = text; }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Ошибка API ${response.status}`);
  }

  return data;
};

const AppLogo = ({ settings, size = 24, className = "text-red-600" }) => {
  if (settings?.logoUrl) {
    return <img src={settings.logoUrl} alt="Logo" style={{width: size, height: size, objectFit: 'contain'}} />;
  }
  return <TrendingUp size={size} className={className} strokeWidth={2.5} />;
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 ${type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 dark:bg-white dark:text-slate-900 text-white'} px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300 print:hidden`}>
      {type === 'error' ? <AlertCircle size={18} strokeWidth={2} /> : <CheckCircle2 size={18} strokeWidth={2} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm z-[9990] flex items-center justify-center p-3 sm:p-4 print:hidden animate-in fade-in duration-200" onMouseDown={onClose}>
      <div className={`bg-white dark:bg-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100dvh_-_2rem_-_env(safe-area-inset-bottom))] sm:max-h-[90vh] border border-slate-200 dark:border-slate-700`} onMouseDown={e => e.stopPropagation()}>
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate pr-3">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95 shrink-0"><X size={20}/></button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <Modal title="Подтверждение" onClose={onCancel}>
      <div className="space-y-6">
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 text-slate-700 dark:text-slate-300">Отмена</button>
          <button onClick={() => { onConfirm(); onCancel(); }} className="px-4 py-2 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors active:scale-95 shadow-sm shadow-red-600/20">Подтвердить</button>
        </div>
      </div>
    </Modal>
  );
}

export default function AppWrapper() {
  const [theme, setTheme] = useState('light');
  const [appSettings, setAppSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('pokiza_settings');
      return saved ? JSON.parse(saved) : { appName: 'ПОКИЗА', logoUrl: '' };
    } catch { return { appName: 'ПОКИЗА', logoUrl: '' }; }
  });
  const [usersDb, setUsersDb] = useState(INITIAL_USERS);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pokiza_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const loadUsersAndSettings = useCallback(async () => {
    try {
      const [usersData, settingsData] = await Promise.all([
        requestJson('/api/users'),
        requestJson('/api/settings')
      ]);

      if (usersData && typeof usersData === 'object') {
        setUsersDb(usersData);
        if (user?.login) {
          const freshUser = usersData[String(user.login).toLowerCase()];
          if (freshUser) setUser(freshUser);
        }
      }

      if (settingsData && typeof settingsData === 'object') {
        const nextSettings = {
          appName: settingsData.appName || 'ПОКИЗА',
          logoUrl: settingsData.logoUrl || ''
        };
        setAppSettings(nextSettings);
        localStorage.setItem('pokiza_settings', JSON.stringify(nextSettings));
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей/настроек:', error);
    }
  }, [user?.login]);

  useEffect(() => {
    loadUsersAndSettings();
  }, []);

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#FAFAFA';

    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';

    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = theme === 'dark' ? '#0f172a' : '#FAFAFA';

    if (!document.querySelector('link[rel="manifest"]')) {
       const manifest = {
          name: appSettings.appName || "Pokiza SMM",
          short_name: appSettings.appName || "Pokiza",
          display: "standalone",
          background_color: "#FAFAFA",
          theme_color: "#FAFAFA",
          icons: [{ src: "https://cdn-icons-png.flaticon.com/512/3254/3254068.png", sizes: "512x512", type: "image/png" }]
       };
       const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
       const manifestURL = URL.createObjectURL(blob);
       const link = document.createElement('link');
       link.rel = 'manifest';
       link.href = manifestURL;
       document.head.appendChild(link);
    }
  }, [theme, appSettings.appName]);

  useEffect(() => {
    localStorage.setItem('pokiza_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    if (user) localStorage.setItem('pokiza_user', JSON.stringify(user));
    else localStorage.removeItem('pokiza_user');
  }, [user]);

  if (!user) return <LoginScreen usersDb={usersDb} onLogin={setUser} theme={theme} appSettings={appSettings} />;
  return <MainApp user={user} usersDb={usersDb} setUsersDb={setUsersDb} onLogout={() => setUser(null)} onUpdateUser={setUser} theme={theme} setTheme={setTheme} appSettings={appSettings} setAppSettings={setAppSettings} reloadUsersAndSettings={loadUsersAndSettings} />;
}

function LoginScreen({ usersDb, onLogin, theme, appSettings }) {
  const [form, setForm] = useState({ login: '', pass: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = Object.values(usersDb).find(u => u.login.toLowerCase() === form.login.toLowerCase());
    if (foundUser && foundUser.pass === form.pass) onLogin(foundUser);
    else setError('Неверный логин или пароль');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm w-full max-w-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
            <AppLogo settings={appSettings} size={28} />
          </div>
          <h1 className="text-2xl font-bold text-red-600 tracking-tight mb-1">{appSettings.appName || 'ПОКИЗА'}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Панель управления SMM</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Логин</label>
            <input type="text" required className="w-full px-4 py-2.5 text-base md:text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all dark:text-white" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Пароль</label>
            <input type="password" required className="w-full px-4 py-2.5 text-base md:text-sm font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all dark:text-white" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
          </div>
          {error && <p className="text-red-500 text-xs font-medium text-center bg-red-50 dark:bg-red-500/10 py-2 rounded-xl">{error}</p>}
          <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors mt-2 shadow-sm shadow-red-600/20 active:scale-95">Войти</button>
        </form>
      </div>
    </div>
  );
}


function MonthSelector({ currentMonth, onChange, theme }) {
  const year = Number(String(currentMonth).slice(0, 4)) || new Date().getFullYear();
  const options = useMemo(() => buildYearMonths(year), [year]);

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border shadow-sm transition-colors ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
      <button
        type="button"
        onClick={() => onChange(addMonths(currentMonth, -12))}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
        title="Предыдущий год"
      >
        ‹
      </button>
      <CalendarIcon size={16} className="text-slate-400 shrink-0" />
      <select
        value={currentMonth}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-base md:text-sm font-semibold outline-none cursor-pointer border-none p-0 focus:ring-0 dark:text-white min-w-[120px]"
      >
        {options.map(m => <option key={m.value} value={m.value} className="dark:bg-slate-800">{m.label}</option>)}
      </select>
      <button
        type="button"
        onClick={() => onChange(addMonths(currentMonth, 12))}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
        title="Следующий год"
      >
        ›
      </button>
    </div>
  );
}

function MainApp({ user, usersDb, setUsersDb, onLogout, onUpdateUser, theme, setTheme, appSettings, setAppSettings, reloadUsersAndSettings }) {
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('tasks');
  const [currentMonth, setCurrentMonth] = useState(() => {
    try {
      return localStorage.getItem('pokiza_currentMonth') || getMonthValue();
    } catch {
      return getMonthValue();
    }
  });
  const timelineMonths = useMemo(() => buildTimelineMonths(currentMonth, 12), [currentMonth]);

  useEffect(() => {
    try { localStorage.setItem('pokiza_currentMonth', currentMonth); } catch {}
  }, [currentMonth]);
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedDashboardPlatform, setSelectedDashboardPlatform] = useState('all');
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedKpiForDetails, setSelectedKpiForDetails] = useState(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });
  
  const [printMode, setPrintMode] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('Pokiza_Report.pdf');
  
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const taskSaveLockRef = useRef(false);

  const [tasks, setTasks] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [analyticsDrafts, setAnalyticsDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pokiza_analytics_drafts')) || {}; } 
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('pokiza_analytics_drafts', JSON.stringify(analyticsDrafts));
  }, [analyticsDrafts]);

  useEffect(() => {
    if (activeModal || selectedKpiForDetails || confirmDialog.isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; 
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [activeModal, selectedKpiForDetails, confirmDialog.isOpen]);

  const showToast = useCallback((msg, type = 'success') => setToast({ message: msg, type }), []);
  const confirmAction = useCallback((message, action) => setConfirmDialog({ isOpen: true, message, onConfirm: action }), []);

  const apiRequest = useCallback(async (path, options = {}) => requestJson(path, options), []);

  const loadData = useCallback(async (month = currentMonth, silent = false) => {
    try {
      if (!silent) setIsLoadingData(true);

      const [platformsData, kpisData, tasksData, analyticsData, usersData, settingsData] = await Promise.all([
        apiRequest('/api/platforms'),
        apiRequest('/api/kpis'),
        apiRequest(`/api/tasks?month=${encodeURIComponent(month)}`),
        apiRequest('/api/analytics'),
        apiRequest('/api/users'),
        apiRequest('/api/settings')
      ]);

      setPlatforms(Array.isArray(platformsData) ? platformsData : []);
      setKpis(Array.isArray(kpisData) ? kpisData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setAnalytics(analyticsData && typeof analyticsData === 'object' ? analyticsData : {});

      if (usersData && typeof usersData === 'object') {
        setUsersDb(usersData);
        if (user?.login) {
          const freshUser = usersData[String(user.login).toLowerCase()];
          if (freshUser) onUpdateUser(freshUser);
        }
      }

      if (settingsData && typeof settingsData === 'object') {
        setAppSettings({
          appName: settingsData.appName || 'ПОКИЗА',
          logoUrl: settingsData.logoUrl || ''
        });
      }

      return true;
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      if (!silent) showToast(error.message || 'Не удалось загрузить данные', 'error');
      return false;
    } finally {
      if (!silent) setIsLoadingData(false);
    }
  }, [apiRequest, currentMonth, onUpdateUser, setAppSettings, setUsersDb, showToast, user?.login]);

  useEffect(() => {
    loadData(currentMonth);
    const timer = setInterval(() => {
      if (!document.hidden) loadData(currentMonth, true);
    }, 10000);
    return () => clearInterval(timer);
  }, [currentMonth, loadData]);

  const monthTasks = useMemo(() => tasks.filter(t => t.month === currentMonth), [tasks, currentMonth]);
  const sortedMonthTasks = useMemo(() => {
    return [...monthTasks].sort((a, b) => {
       const dateDiff = new Date(a.date) - new Date(b.date);
       if (dateDiff !== 0) return dateDiff;
       return (a.order || 0) - (b.order || 0);
    });
  }, [monthTasks]);

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

  const currentAnalytics = analytics[currentMonth] || { month: currentMonth, followers: '', reach: '', likes: '', comments: '', er: 0, text: '', isSubmitted: false };
  
  const prevAnalytics = useMemo(() => {
    const prevMonth = addMonths(currentMonth, -1);
    const pa = analytics[prevMonth];
    return pa && pa.isSubmitted ? pa : null;
  }, [analytics, currentMonth]);

  const handlePdfAction = useCallback(async (mode, actionType = 'download') => {
    const fileName = `Pokiza_${mode === 'analytics' ? 'Analytics' : 'ContentPlan'}_${currentMonth}.pdf`;
    const isPreview = actionType === 'preview';
    setPdfFileName(fileName);
    setPdfPreviewUrl(null);
    showToast(isPreview ? 'Генерация предпросмотра...' : 'Подготовка PDF...', 'success');

    if (isPreview) {
      setActiveModal('pdfPreview');
    }

    setPrintMode(mode);
    await new Promise(resolve => setTimeout(resolve, 450));

    const element = document.getElementById('pdf-content-wrapper');
    if (!element) {
      showToast('Ошибка: Не удалось найти контент для PDF', 'error');
      setPrintMode(null);
      return;
    }

    const processPdf = async () => {
      try {
        const isLandscape = mode === 'plan';
        const forcedWidth = isLandscape ? 1100 : 790;
        const scale = window.innerWidth < 768 ? 1.4 : 2;

        const opt = {
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: forcedWidth,
            width: forcedWidth,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: isLandscape ? 'landscape' : 'portrait' }
        };

        const blob = await window.html2pdf().set(opt).from(element).outputPdf('blob');
        const url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
        setPrintMode(null);

        if (isPreview) {
          showToast('PDF готов к просмотру');
          return;
        }

        const file = typeof File !== 'undefined' ? new File([blob], fileName, { type: 'application/pdf' }) : null;
        const canShareFile = Boolean(
          file &&
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        );

        if (canShareFile) {
          try {
            await navigator.share({
              files: [file],
              title: fileName,
              text: 'PDF отчет Pokiza SMM'
            });
            showToast('PDF готов для сохранения или отправки');
            return;
          } catch (shareError) {
            if (shareError?.name === 'AbortError') {
              showToast('Отправка отменена', 'error');
              return;
            }
            console.warn('Share failed, fallback to download:', shareError);
          }
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        if (isMobile) {
          setActiveModal('pdfPreview');
          showToast('PDF готов. Нажмите «Скачать PDF» или откройте меню браузера, чтобы поделиться.');
        } else {
          showToast('Файл успешно скачан');
        }
      } catch (err) {
        console.error('PDF Generator Error:', err);
        showToast('Ошибка при создании PDF', 'error');
        setPrintMode(null);
      }
    };

    if (window.html2pdf) {
      processPdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = processPdf;
      script.onerror = () => {
        showToast('Не удалось загрузить библиотеку для PDF', 'error');
        setPrintMode(null);
      };
      document.body.appendChild(script);
    }
  }, [currentMonth, showToast]);

  const checkKpiLimits = useCallback((kpiIdsToCheck, currentTaskId = null) => {
    for (let kpiId of (kpiIdsToCheck || [])) {
       const kpi = kpis.find(k => k.id === kpiId);
       if (!kpi) continue;
       const currentCount = monthTasks.filter(t => t.kpiIds?.includes(kpiId) && String(t.id) !== String(currentTaskId)).length;
       if (currentCount >= kpi.target) {
          showToast(`Лимит формата "${kpi.title}" исчерпан (${kpi.target} макс)`, 'error');
          return false;
       }
    }
    return true;
  }, [kpis, monthTasks, showToast]);

  const saveTask = useCallback(async (taskData, silent = false) => {
    const cleanTaskData = {
      ...taskData,
      title: (taskData.title || '').trim(),
      text: (taskData.text || '').trim(),
      link: (taskData.link || '').trim(),
      kpiIds: taskData.kpiIds || [],
    };

    if (!cleanTaskData.title) {
      if(!silent) showToast('Введите название задачи', 'error');
      return false;
    }
    if (!cleanTaskData.date) {
      if(!silent) showToast('Укажите дату задачи', 'error');
      return false;
    }

    if (!checkKpiLimits(cleanTaskData.kpiIds, cleanTaskData.id)) return false;

    if (!cleanTaskData.id && taskSaveLockRef.current) return false;
    if (!cleanTaskData.id) taskSaveLockRef.current = true;

    try {
      const id = cleanTaskData.id ? String(cleanTaskData.id) : `task_${Date.now()}`;
      const month = cleanTaskData.date ? cleanTaskData.date.slice(0, 7) : (cleanTaskData.month || currentMonth);
      const status = cleanTaskData.link ? 'completed' : cleanTaskData.status || 'pending';

      await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          id,
          month,
          title: cleanTaskData.title,
          text: cleanTaskData.text || '',
          platformId: cleanTaskData.platformId || null,
          status,
          date: cleanTaskData.date,
          link: cleanTaskData.link || '',
          kpiIds: cleanTaskData.kpiIds || [],
          order: cleanTaskData.order || 0
        })
      });

      await loadData(currentMonth, true);
      if(!silent) showToast(cleanTaskData.id ? 'Задача обновлена' : 'Успешно сохранено');
      setActiveModal(null);
      setEditingItem(null);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
      if(!silent) showToast(error.message || 'Не удалось сохранить задачу', 'error');
      return false;
    } finally {
      if (!cleanTaskData.id) {
        window.setTimeout(() => { taskSaveLockRef.current = false; }, 500);
      }
    }
  }, [apiRequest, checkKpiLimits, currentMonth, loadData, showToast]);

  const handleDropTask = async (targetId, targetDate) => {
    if (!draggedTask) return;
    setDragOverId(null);
    let updatedTask;

    if (targetId && draggedTask.id !== targetId) {
       const targetTask = sortedMonthTasks.find(t => t.id === targetId);
       if(!targetTask) return;
       updatedTask = { ...draggedTask, date: targetTask.date, order: (targetTask.order || 0) - 0.5 };
    } else if (targetDate && draggedTask.date !== targetDate) {
       updatedTask = { ...draggedTask, date: targetDate, order: 0 };
    } else {
       setDraggedTask(null);
       return;
    }
    
    await saveTask(updatedTask, true);
    setDraggedTask(null);
  };

  const completeTask = useCallback(async (taskId, link) => {
    if (!(link || '').trim()) return showToast('Укажите ссылку', 'error');
    try { new URL(link); } catch (e) {
      return showToast('Введите корректную ссылку (начиная с http:// или https://)', 'error');
    }

    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task) return showToast('Задача не найдена', 'error');

    const ok = await saveTask({ ...task, status: 'completed', link });
    if (ok) showToast('Успешно сдано');
  }, [saveTask, showToast, tasks]);

  const deleteTask = useCallback((id) => confirmAction('Точно удалить эту задачу?', async () => {
    try {
      await apiRequest(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadData(currentMonth, true);
      showToast('Удалено');
    } catch (error) {
      showToast(error.message || 'Не удалось удалить задачу', 'error');
    }
  }), [apiRequest, confirmAction, currentMonth, loadData, showToast]);

  const saveKpi = useCallback(async (kpiData) => {
    try {
      const id = kpiData.id ? String(kpiData.id) : `kpi_${Date.now()}`;
      await apiRequest('/api/kpis', {
        method: 'POST',
        body: JSON.stringify({
          id, platformId: kpiData.platformId, title: kpiData.title,
          target: Number(kpiData.target || 1), colorId: kpiData.colorId || 'blue'
        })
      });
      await loadData(currentMonth, true);
      showToast('Формат сохранен');
      setActiveModal(null);
      setEditingItem(null);
      return true;
    } catch (error) {
      showToast(error.message || 'Не удалось сохранить формат', 'error');
      return false;
    }
  }, [apiRequest, currentMonth, loadData, showToast]);

  const deleteKpi = useCallback((id) => confirmAction('Удалить этот формат контента?', async () => {
    try {
      await apiRequest(`/api/kpis/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadData(currentMonth, true);
      showToast('Удалено');
    } catch (error) {
      showToast(error.message || 'Не удалось удалить формат', 'error');
    }
  }), [apiRequest, confirmAction, currentMonth, loadData, showToast]);

  const savePlatform = useCallback(async (platData) => {
    try {
      const id = platData.id ? String(platData.id) : `p_${Date.now()}`;
      await apiRequest('/api/platforms', {
        method: 'POST',
        body: JSON.stringify({
          id, name: platData.name, account: platData.account || '', iconName: platData.iconName || 'globe'
        })
      });
      await loadData(currentMonth, true);
      showToast('Платформа сохранена');
      setActiveModal(null);
      setEditingItem(null);
      return true;
    } catch (error) {
      showToast(error.message || 'Не удалось сохранить платформу', 'error');
      return false;
    }
  }, [apiRequest, currentMonth, loadData, showToast]);

  const deletePlatform = useCallback((id) => confirmAction('Удалить платформу и все её форматы?', async () => {
    try {
      await apiRequest(`/api/platforms/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadData(currentMonth, true);
      showToast('Платформа удалена');
    } catch (error) {
      showToast(error.message || 'Не удалось удалить платформу', 'error');
    }
  }), [apiRequest, confirmAction, currentMonth, loadData, showToast]);

  const saveAnalytics = useCallback(async (data) => {
    try {
      await apiRequest('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
          month: currentMonth, followers: Number(data.followers || 0), reach: Number(data.reach || 0),
          likes: Number(data.likes || 0), comments: Number(data.comments || 0), er: Number(data.er || 0),
          text: data.text || '', isSubmitted: data.isSubmitted ?? true
        })
      });
      await loadData(currentMonth, true);
      showToast(data.isSubmitted === false ? 'Отчет открыт для редактирования' : 'Отчет успешно сохранен');
      return true;
    } catch (error) {
      showToast(error.message || 'Не удалось сохранить аналитику', 'error');
      return false;
    }
  }, [apiRequest, currentMonth, loadData, showToast]);

  const deleteUser = useCallback((login) => {
    if (login === 'admin') return showToast('Нельзя удалить главного администратора', 'error');
    if (login === user.login) return showToast('Нельзя удалить свой собственный аккаунт', 'error');

    confirmAction(`Удалить пользователя ${login}?`, async () => {
      try {
        await apiRequest(`/api/users/${encodeURIComponent(login)}`, { method: 'DELETE' });
        await loadData(currentMonth, true);
        if (reloadUsersAndSettings) await reloadUsersAndSettings();
        showToast('Пользователь удален');
      } catch (error) {
        showToast(error.message || 'Не удалось удалить пользователя', 'error');
      }
    });
  }, [apiRequest, confirmAction, currentMonth, loadData, reloadUsersAndSettings, showToast, user.login]);

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

  const todayStr = getLocalISODate();
  const pdfAnalyticsData = currentAnalytics.isSubmitted ? currentAnalytics : (analyticsDrafts[currentMonth] || currentAnalytics);

  return (
    <>
    <div className={`h-screen w-full overflow-hidden font-sans flex text-sm transition-colors duration-300 ${printMode ? 'opacity-0 pointer-events-none absolute' : ''} ${theme==='dark'?'bg-slate-900 text-slate-200':'bg-[#FAFAFA] text-slate-800'}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal {...confirmDialog} onCancel={() => setConfirmDialog({isOpen: false})} />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative z-40 h-full">
         <div className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarExpanded(false)}></div>
         <aside 
           className={`flex flex-col border-r transition-all duration-300 ease-in-out h-full shrink-0 relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${isSidebarExpanded ? 'w-64 shadow-2xl absolute left-0 top-0' : 'w-20'}`}
         >
           <div className={`h-16 flex items-center border-b shrink-0 transition-all ${isSidebarExpanded ? 'justify-between px-6' : 'justify-center'} ${theme==='dark'?'border-slate-700':'border-slate-100'}`}>
             {isSidebarExpanded ? (
               <>
                 <h1 className="text-lg font-bold tracking-tight text-red-600 flex items-center gap-2">
                   <AppLogo settings={appSettings} size={20} />
                   <span className="truncate">{appSettings.appName || 'ПОКИЗА'}</span>
                 </h1>
                 <button onClick={() => setIsSidebarExpanded(false)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"><PanelLeftClose size={18}/></button>
               </>
             ) : (
                <button onClick={() => setIsSidebarExpanded(true)} className="p-2 text-slate-500 hover:text-red-600 transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700" title="Открыть меню">
                  <Menu size={24} strokeWidth={2.5} />
                </button>
             )}
           </div>
           
           <div className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
             {isSidebarExpanded && <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-2 px-3">Меню</div>}
             {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map(item => (
               <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarExpanded(false); }} title={!isSidebarExpanded ? item.label : ''}
                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base md:text-sm font-medium transition-colors ${!isSidebarExpanded ? 'justify-center' : ''} ${activeTab === item.id ? (theme==='dark'?'bg-red-500/10 text-red-400':'bg-red-50 text-red-600') : (theme==='dark'?'text-slate-400 hover:bg-slate-700 hover:text-white':'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}`}>
                 <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className="shrink-0" /> {isSidebarExpanded && <span className="truncate">{item.label}</span>}
               </button>
             ))}
           </div>

           <div className={`p-4 border-t shrink-0 flex flex-col gap-4 ${theme==='dark'?'border-slate-700':'border-slate-100'}`}>
             <div className={`flex items-center gap-3 transition-all ${!isSidebarExpanded ? 'justify-center px-0' : 'px-2'}`}>
               <div onClick={() => {setEditingItem(user); setActiveModal('editProfile'); setIsSidebarExpanded(false);}} className={`w-10 h-10 rounded-full shadow-sm border flex items-center justify-center font-semibold text-base uppercase shrink-0 cursor-pointer ${theme==='dark'?'bg-slate-700 border-slate-600 text-red-400 hover:bg-slate-600':'bg-white border-slate-200 text-red-600 hover:bg-slate-50'}`}>
                 {user.name[0]}
               </div>
               {isSidebarExpanded && (
                 <>
                   <div className="flex-1 overflow-hidden cursor-pointer group" onClick={() => {setEditingItem(user); setActiveModal('editProfile'); setIsSidebarExpanded(false);}}>
                     <div className="text-sm font-semibold leading-tight truncate group-hover:text-red-500 transition-colors">{user.name}</div>
                     <div className="text-[11px] font-medium text-slate-500 capitalize mt-0.5">{user.role === 'admin' ? 'Администратор' : 'SMM'}</div>
                   </div>
                   <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-slate-700 rounded-xl active:scale-95" title="Выйти"><LogOut size={16} /></button>
                 </>
               )}
             </div>
           </div>
         </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 min-w-0 md:ml-0">
        
        {/* Mobile Top Header */}
        <header className={`md:hidden h-14 flex items-center justify-between px-5 shrink-0 border-b z-30 ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
           <div className="flex items-center gap-2">
             <AppLogo settings={appSettings} size={22} />
             <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-white truncate max-w-[150px]">{appSettings.appName || 'ПОКИЗА'}</span>
           </div>
           <div className="flex items-center gap-4">
             <button onClick={()=>setTheme(theme==='light'?'dark':'light')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95">
               {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
             </button>
             <div onClick={() => setActiveModal('mobileMenu')} className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm uppercase cursor-pointer ${theme==='dark'?'bg-slate-700 border-slate-600 text-red-400':'bg-slate-50 border-slate-200 text-red-600'}`}>
                {user.name[0]}
             </div>
           </div>
        </header>

        {/* Desktop Header */}
        <header className={`hidden md:flex h-16 border-b items-center justify-between px-8 shrink-0 z-30 ${theme==='dark'?'bg-slate-900/80 border-slate-700':'bg-white/80 border-slate-100'} backdrop-blur-md`}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {NAV_ITEMS.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} theme={theme} />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 sm:px-8 sm:pt-8 relative scroll-smooth custom-scrollbar pb-[calc(7rem_+_env(safe-area-inset-bottom))] md:pb-8">
          <div className="max-w-6xl mx-auto space-y-6 min-h-full pb-[calc(2rem_+_env(safe-area-inset-bottom))] md:pb-0">
            
            {/* Mobile Context Header */}
            <div className="md:hidden flex items-center justify-between mb-2">
               <h2 className="text-base font-semibold">{NAV_ITEMS.find(i => i.id === activeTab)?.label}</h2>
               <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} theme={theme} />
            </div>

            {}
            {activeTab === 'tasks' && (
              <div className="animate-in fade-in space-y-8">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button onClick={() => setSelectedDashboardPlatform('all')} className={`px-4 py-2 rounded-xl text-base md:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${selectedDashboardPlatform === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm' : (theme==='dark'?'bg-slate-800/50 text-slate-400 hover:text-white':'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm')}`}>
                    Сводка: Все
                  </button>
                  {platforms.map(p => (
                     <button key={p.id} onClick={() => setSelectedDashboardPlatform(p.id)} className={`px-4 py-2 rounded-xl text-base md:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 active:scale-95 ${selectedDashboardPlatform === p.id ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm' : (theme==='dark'?'bg-slate-800/50 text-slate-400 hover:text-white':'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm')}`}>
                      {getPlatformIcon(p, 16)} {p.name}
                    </button>
                  ))}
                </div>

                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target size={20} className="text-red-500"/> Выполнение плана</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {kpiProgress.map((kpi) => (
                      <div key={kpi.id} onClick={() => setSelectedKpiForDetails(kpi)} className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] group active:scale-95 ${theme==='dark'?'bg-slate-800 border-slate-700 hover:border-slate-600':'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md shadow-sm'}`}>
                        <div>
                           <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5 line-clamp-1">{getPlatformIcon({name: kpi.platformName, iconName: kpi.platformIconName}, 12)} {kpi.platformName}</div>
                           <h3 className="text-sm font-semibold leading-tight text-slate-800 dark:text-slate-200 break-words line-clamp-2">{kpi.title}</h3>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-baseline gap-1.5 mb-2.5">
                            <span className={`text-3xl font-bold tracking-tight ${kpi.current >= kpi.target ? 'text-green-500' : (theme==='dark'?'text-white':'text-slate-900')}`}>{kpi.current}</span>
                            <span className="text-slate-400 font-medium text-base md:text-sm">/ {kpi.target}</span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme==='dark'?'bg-slate-700':'bg-slate-100'}`}>
                            <div className={`h-full rounded-full transition-all duration-700 ease-out ${kpi.current >= kpi.target ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {kpiProgress.length === 0 && <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed rounded-3xl dark:border-slate-700 font-medium text-sm">Нет форматов контента для выбранной платформы.</div>}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><CheckSquare size={20} className="text-blue-500"/> Список задач</h2>
                  </div>
                  <div className={`border rounded-3xl shadow-sm overflow-hidden ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                    {monthTasks.filter(t => selectedDashboardPlatform === 'all' || t.platformId === selectedDashboardPlatform).length === 0 ? (
                      <div className="p-16 text-center text-slate-400 font-medium flex flex-col items-center gap-4 text-sm">
                         <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center"><FileText size={28} className="text-slate-300 dark:text-slate-500"/></div>
                         Задач пока нет. Создайте их в Контент-плане.
                      </div>
                    ) : (
                      <div className={`divide-y ${theme==='dark'?'divide-slate-700':'divide-slate-100'}`}>
                        {monthTasks
                          .filter(t => selectedDashboardPlatform === 'all' || t.platformId === selectedDashboardPlatform)
                          .map(task => (
                            <TaskRow 
                              key={task.id} task={task} theme={theme}
                              platforms={platforms} kpis={kpis} todayStr={todayStr}
                              onComplete={completeTask} onDelete={() => deleteTask(task.id)}
                              onEdit={() => { setEditingItem(task); setActiveModal('addTask'); }}
                              onView={() => { setEditingItem(task); setActiveModal('viewTask'); }}
                            />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'content-plan' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-2">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2"><FileText size={20} className="text-orange-500"/> Контент-план</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Таблица планирования идей и форматов</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button onClick={() => handlePdfAction('plan', 'preview')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-base md:text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                      <Eye size={16}/> Предпросмотр
                    </button>
                    <button onClick={() => handlePdfAction('plan', 'download')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-base md:text-sm font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-95">
                      <Download size={16}/> Скачать PDF
                    </button>
                  </div>
                </div>
                
                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                  <InlineTaskCardEditor 
                    currentMonth={currentMonth} platforms={platforms} kpis={kpis} theme={theme} 
                    onSave={saveTask} 
                  />

                  {sortedMonthTasks.length === 0 ? (
                    <div className={`p-8 text-center text-slate-400 font-medium text-sm border rounded-3xl ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>Нет задач в этом месяце</div>
                  ) : sortedMonthTasks.map(task => {
                    const platform = platforms.find(p => p.id === task.platformId);
                    const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];
                    const isOverdue = task.status !== 'completed' && task.date < todayStr;
                    const isDragOver = dragOverId === task.id;

                    return (
                      <div 
                        key={task.id} 
                        draggable
                        onDragStart={() => setDraggedTask(task)}
                        onDragEnter={() => setDragOverId(task.id)}
                        onDragLeave={() => setDragOverId(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleDropTask(task.id, task.date); }}
                        className={`p-4 rounded-3xl border shadow-sm transition-all cursor-grab active:cursor-grabbing ${draggedTask?.id === task.id ? 'opacity-50 ring-2 ring-red-500' : ''} ${isDragOver && draggedTask?.id !== task.id ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : ''} ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex gap-3 w-full">
                            <div className="text-slate-300 dark:text-slate-500 mt-0.5" onClick={(e) => e.stopPropagation()}><GripVertical size={16}/></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1">{task.date.split('-').reverse().join('.')}</div>
                              <h3 className="font-semibold text-base md:text-sm text-slate-900 dark:text-slate-200 break-words">{task.title}</h3>
                            </div>
                          </div>
                          {task.status === 'completed' ? (
                            <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20 whitespace-nowrap"><CheckCircle2 size={12}/> Готово</span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap"><AlertCircle size={12}/> Просрочено</span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 whitespace-nowrap"><Clock size={12}/> В плане</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3 pl-7">
                          <span className={`text-[10px] font-semibold uppercase flex items-center gap-1.5 px-2 py-1 rounded-lg ${theme==='dark'?'bg-slate-700 text-red-400':'bg-slate-50 text-red-600'}`}>{getPlatformIcon(platform, 12)} {platform?.name}</span>
                          {taskKpis.map((k, i) => {
                            const colorClass = getFormatColor(k);
                            return <span key={i} className={`text-[10px] font-medium px-2 py-1 rounded-lg border inline-flex items-center gap-1.5 ${theme==='dark' ? `bg-slate-700 ${colorClass.border} ${colorClass.text}` : `bg-white shadow-sm ${colorClass.border} ${colorClass.text}`}`}><div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>{k.title}</span>
                          })}
                        </div>
                        {task.text && <div className="text-sm md:text-xs font-medium text-slate-500 leading-relaxed mb-4 break-words pl-7 whitespace-pre-wrap">{renderTextWithLinks(task.text)}</div>}
                        <div className="flex justify-end gap-2">
                          <button onClick={()=> {setEditingItem(task); setActiveModal('addTask');}} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-700 rounded-xl transition-colors active:scale-95"><Edit2 size={16}/></button>
                          <button onClick={()=> deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-700 rounded-xl transition-colors active:scale-95"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop View */}
                <div className={`hidden md:block border rounded-3xl shadow-sm overflow-hidden ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className={`border-b text-[10px] font-semibold uppercase tracking-wider ${theme==='dark'?'border-slate-700 text-slate-400':'border-slate-100 text-slate-500 bg-slate-50/50'}`}>
                        <th className="p-4 w-36">Дата</th>
                        <th className="p-4 w-56">Платформа / Формат</th>
                        <th className="p-4 min-w-[250px]">Тема / Текст публикации</th>
                        <th className="p-4 w-32 text-right">Статус</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme==='dark'?'divide-slate-700':'divide-slate-100'}`}>
                      <InlineTaskEditor 
                        currentMonth={currentMonth} platforms={platforms} kpis={kpis} theme={theme} 
                        onSave={saveTask} 
                      />
                      
                      {sortedMonthTasks.map(task => {
                           const platform = platforms.find(p => p.id === task.platformId);
                           const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];
                           const isOverdue = task.status !== 'completed' && task.date < todayStr;
                           const isDragOver = dragOverId === task.id;

                           return (
                             <tr 
                               key={task.id} 
                               draggable
                               onDragStart={() => setDraggedTask(task)}
                               onDragEnter={() => setDragOverId(task.id)}
                               onDragLeave={() => setDragOverId(null)}
                               onDragOver={(e) => e.preventDefault()}
                               onDrop={(e) => { e.preventDefault(); handleDropTask(task.id, task.date); }}
                               className={`transition-colors group cursor-grab active:cursor-grabbing ${draggedTask?.id === task.id ? 'opacity-40 bg-slate-100 dark:bg-slate-700' : ''} ${isDragOver && draggedTask?.id !== task.id ? 'bg-red-50 dark:bg-red-500/10 border-t-2 border-red-500' : (theme==='dark'?'hover:bg-slate-700/50':'hover:bg-slate-50/50')}`}
                             >
                                <td className="p-4 align-top" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-2">
                                    <GripVertical size={16} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"/>
                                    <div className="font-medium text-sm text-slate-800 dark:text-slate-300">{task.date.split('-').reverse().join('.')}</div>
                                  </div>
                                </td>
                                <td className="p-4 align-top">
                                  <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] font-semibold uppercase flex items-center gap-1.5 ${theme==='dark'?'text-red-400':'text-red-600'}`}>{getPlatformIcon(platform, 12)} {platform?.name}</span>
                                    <div className="flex flex-col gap-1.5">
                                      {taskKpis.map((k, i) => {
                                        const colorClass = getFormatColor(k);
                                        return <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-md border inline-flex items-center gap-1.5 w-fit ${theme==='dark' ? `bg-slate-800 ${colorClass.border} ${colorClass.text}` : `bg-white shadow-sm ${colorClass.border} ${colorClass.text}`}`}><div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>{k.title}</span>
                                      })}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 align-top">
                                  <div className="font-semibold text-sm mb-1.5 text-slate-800 dark:text-slate-200">{task.title}</div>
                                  {task.text && <div className="text-xs font-medium text-slate-500 whitespace-pre-wrap">{renderTextWithLinks(task.text)}</div>}
                                </td>
                                <td className="p-4 text-right align-top" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex flex-col items-end gap-2">
                                    {task.status === 'completed' ? (
                                      <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20 whitespace-nowrap"><CheckCircle2 size={12}/> Готово</span>
                                    ) : isOverdue ? (
                                      <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap"><AlertCircle size={12}/> Просрочено</span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 whitespace-nowrap"><Clock size={12}/> В плане</span>
                                    )}
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={()=> {setEditingItem(task); setActiveModal('addTask');}} className="p-1.5 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors active:scale-95"><Edit2 size={14}/></button>
                                      <button onClick={()=> deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors active:scale-95"><Trash2 size={14}/></button>
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

            {activeTab === 'calendar' && (
              <CalendarView 
                currentMonth={currentMonth} tasks={monthTasks} theme={theme} kpis={kpis}
                onDayClick={(date, dayTasks) => {
                  setEditingItem({ _date: date, _tasks: dayTasks }); 
                  setActiveModal('dayTasks');
                }} 
                onDropTask={handleDropTask}
              />
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in">
                <section className={`border rounded-3xl p-6 sm:p-8 shadow-sm ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                  <div className={`mb-8 border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme==='dark'?'border-slate-700':'border-slate-100'}`}>
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart3 size={20} className="text-indigo-500"/> Сводка за {getMonthLabel(currentMonth)}</h2>
                      <p className="text-base md:text-xs text-slate-500 mt-1 font-medium">Аналитический отчет по итогам месяца</p>
                    </div>
                    {currentAnalytics.isSubmitted ? (
                      <div className="flex flex-wrap sm:flex-nowrap items-center sm:justify-end gap-2 w-full sm:w-auto">
                        <span className="px-3 py-2 bg-green-500/10 text-green-600 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-green-500/20 flex items-center gap-1.5"><Lock size={14}/> Отчет сдан</span>
                        <button onClick={() => handlePdfAction('analytics', 'preview')} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 active:scale-95"><Eye size={14}/> Превью</button>
                        <button onClick={() => handlePdfAction('analytics', 'download')} className="px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1.5 active:scale-95"><Download size={14}/> Скачать</button>
                        {isAdmin && <button onClick={() => saveAnalytics({ ...currentAnalytics, isSubmitted: false })} className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-1.5 active:scale-95"><Unlock size={14}/> Открыть</button>}
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-amber-500/20 w-fit">Ожидает сдачи</span>
                    )}
                  </div>

                  {!currentAnalytics.isSubmitted ? (
                    <AnalyticsInputForm 
                       theme={theme} 
                       currentData={analyticsDrafts[currentMonth] || currentAnalytics} 
                       onTempSave={(data) => setAnalyticsDrafts(prev => ({ ...prev, [currentMonth]: data }))}
                       onSave={(data) => {
                         saveAnalytics({ ...data, isSubmitted: true });
                         setAnalyticsDrafts(prev => { const n = {...prev}; delete n[currentMonth]; return n; });
                       }} 
                    />
                  ) : (
                    <AnalyticsDashboard data={currentAnalytics} prevData={prevAnalytics} theme={theme} allData={analytics} months={timelineMonths} />
                  )}
                </section>
              </div>
            )}

            {isAdmin && activeTab === 'platforms' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-2">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2"><Layers size={20} className="text-teal-500"/> Платформы и Форматы (KPI)</h2>
                      <p className="text-base md:text-xs text-slate-500 mt-1 font-medium">Управление площадками и плановыми показателями контента</p>
                    </div>
                    <button onClick={() => { setEditingItem({id:''}); setActiveModal('editPlatform'); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-base md:text-sm font-semibold rounded-xl transition-transform active:scale-95 shadow-sm">
                      <Plus size={16} /> Добавить Платформу
                    </button>
                </div>
                  
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {platforms.map(p => {
                     const isExpanded = expandedPlatforms[p.id] !== false; 
                     return (
                       <div key={p.id} className={`rounded-3xl border transition-all overflow-hidden ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100 hover:shadow-md shadow-sm'}`}>
                          <div className="flex justify-between items-center p-6 cursor-pointer select-none" onClick={() => setExpandedPlatforms(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${theme==='dark'?'bg-slate-700 text-white':'bg-slate-50 border border-slate-100 text-slate-800'}`}>
                                {getPlatformIcon(p, 24)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-tight mb-1">{p.name}</h3>
                                <span className="text-[11px] font-medium text-slate-500">{p.account}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={(e) => { e.stopPropagation(); setEditingItem(p); setActiveModal('editPlatform'); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-95"><Edit2 size={16}/></button>
                               <button onClick={(e) => { e.stopPropagation(); deletePlatform(p.id); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-95"><Trash2 size={16}/></button>
                               <div className={`p-1.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-slate-400"/></div>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className={`p-6 pt-0 border-t ${theme==='dark'?'border-slate-700 bg-slate-800':'border-slate-50/50 bg-white'}`}>
                               <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-4 flex justify-between items-center">
                                 Форматы контента
                                 <button onClick={(e) => { e.stopPropagation(); setEditingItem({platformId: p.id}); setActiveModal('editKpi'); }} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium active:scale-95"><Plus size={14}/> Добавить</button>
                               </div>
                               <div className="space-y-2.5">
                                 {kpis.filter(k=>k.platformId === p.id).map(kpi => {
                                    const colorClass = getFormatColor(kpi);
                                    return (
                                     <div key={kpi.id} className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all hover:shadow-sm ${theme==='dark'?'bg-slate-700/50 border-slate-600':'bg-white border-slate-100 shadow-sm'}`}>
                                       <div className="flex items-center gap-3">
                                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${colorClass.bg}`}></div>
                                          <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{kpi.title}</span>
                                       </div>
                                       <div className="flex items-center gap-2.5 shrink-0">
                                         <span className={`text-base md:text-xs font-semibold px-2.5 py-1 rounded-lg ${theme==='dark'?'bg-slate-800 text-slate-300':'bg-slate-100 text-slate-600'}`}>{kpi.target} шт/мес</span>
                                         <button onClick={(e) => { e.stopPropagation(); setEditingItem(kpi); setActiveModal('editKpi'); }} className="text-slate-400 hover:text-blue-500 transition-colors p-1 active:scale-95"><Edit2 size={14}/></button>
                                         <button onClick={(e) => { e.stopPropagation(); deleteKpi(kpi.id); }} className="text-slate-400 hover:text-red-500 transition-colors p-1 active:scale-95"><Trash2 size={14}/></button>
                                       </div>
                                     </div>
                                   )
                                 })}
                                 {kpis.filter(k=>k.platformId === p.id).length === 0 && <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed rounded-2xl dark:border-slate-700 font-medium">Нет форматов для платформы</div>}
                               </div>
                            </div>
                          )}
                       </div>
                     )
                   })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in pb-10">
                <section className={`border rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><Settings size={20} className="text-slate-500"/> Системные настройки</h2>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2 mb-1 dark:text-white"><MonitorSmartphone size={18} className="text-blue-500"/> Тема интерфейса</div>
                        <div className="text-base md:text-xs text-slate-500">Светлый или темный режим</div>
                      </div>
                      <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-xl w-fit">
                        <button onClick={()=>setTheme('light')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-base md:text-xs font-semibold transition-all active:scale-95 ${theme==='light'?'bg-white shadow-sm text-slate-900':'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><Sun size={14}/> Светлая</button>
                        <button onClick={()=>setTheme('dark')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-base md:text-xs font-semibold transition-all active:scale-95 ${theme==='dark'?'bg-slate-700 shadow-sm text-white':'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><Moon size={14}/> Темная</button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2 mb-1 dark:text-white"><User size={18} className="text-purple-500"/> Мой профиль</div>
                        <div className="text-base md:text-xs text-slate-500">Настройка имени и смена пароля</div>
                      </div>
                      <button onClick={() => {setEditingItem(user); setActiveModal('editProfile');}} className="px-5 py-2.5 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-xl text-base md:text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm active:scale-95 text-slate-700 dark:text-slate-200">Изменить</button>
                    </div>

                    {isAdmin && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2 mb-1 dark:text-white"><ImageIcon size={18} className="text-orange-500"/> Брендинг системы</div>
                          <div className="text-base md:text-xs text-slate-500">Настройка названия и логотипа</div>
                        </div>
                        <button onClick={() => {setEditingItem(appSettings); setActiveModal('editBranding');}} className="px-5 py-2.5 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-xl text-base md:text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm active:scale-95 text-slate-700 dark:text-slate-200">Настроить</button>
                      </div>
                    )}
                  </div>
                </section>

                {isAdmin && (
                  <section className={`border rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold flex items-center gap-2"><Users size={20} className="text-blue-500"/> Пользователи системы</h2>
                      <button onClick={() => { setEditingItem(null); setActiveModal('userModal'); }} className="text-base md:text-xs bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm flex items-center gap-2 hover:opacity-90 transition-transform active:scale-95"><Plus size={16}/> Добавить</button>
                    </div>
                    <div className={`border rounded-2xl overflow-hidden divide-y ${theme==='dark'?'divide-slate-700 border-slate-700':'divide-slate-100 border-slate-100'}`}>
                      {Object.values(usersDb).map(u => (
                        <div key={u.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${theme==='dark'?'bg-slate-800/50':'bg-white'}`}>
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-bold text-base text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{u.name[0]}</div>
                             <div>
                               <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{u.name} <span className="text-base md:text-xs text-slate-400 font-medium ml-2">@{u.login}</span></div>
                               <div className="text-base md:text-xs text-slate-500 mt-1">{u.email || 'Без email'}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-xl w-fit ${u.role==='admin'?'bg-red-500/10 text-red-600 border border-red-500/20':'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{u.role}</span>
                            <button onClick={() => {setEditingItem(u); setActiveModal('userModal');}} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-700 rounded-xl transition-colors active:scale-95"><Edit2 size={16}/></button>
                            <button onClick={() => deleteUser(u.login)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-700 rounded-xl transition-colors active:scale-95"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className={`md:hidden fixed bottom-0 left-0 w-full z-40 border-t pb-safe backdrop-blur-xl transition-transform duration-300 ${printMode ? 'translate-y-full' : 'translate-y-0'} ${theme==='dark'?'bg-slate-900/90 border-slate-800':'bg-white/95 border-slate-200'}`}>
           <div className="flex justify-around items-end h-16 px-2 pb-2">
              {MOBILE_NAV_ITEMS.slice(0,2).map(item => (
                 <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors active:scale-95 ${activeTab === item.id ? (theme==='dark'?'text-red-400':'text-red-600') : 'text-slate-400'}`}>
                    <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                 </button>
              ))}
              
              <div className="relative -top-5 z-50">
                 <button type="button" aria-label="Добавить задачу" onClick={() => { setActiveTab('content-plan'); setEditingItem({ title: '', text: '', date: `${currentMonth}-01`, platformId: platforms[0]?.id || '', kpiIds: [], link: '' }); setActiveModal('addTask'); }} className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 border-[4px] border-white dark:border-slate-900">
                    <Plus size={28} strokeWidth={2.5} />
                 </button>
              </div>

              {MOBILE_NAV_ITEMS.slice(2,4).map(item => (
                 <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors active:scale-95 ${activeTab === item.id ? (theme==='dark'?'text-red-400':'text-red-600') : 'text-slate-400'}`}>
                    <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                 </button>
              ))}
           </div>
        </nav>
      </div>

      {/* Модальное окно предпросмотра PDF */}
      {activeModal === 'pdfPreview' && (
        <Modal title="Предпросмотр документа" onClose={() => {setActiveModal(null); setPdfPreviewUrl(null);}} maxWidth="max-w-4xl">
          {pdfPreviewUrl ? (
            <iframe src={pdfPreviewUrl} className="w-full h-[65vh] rounded-xl border border-slate-200 dark:border-slate-700" title="PDF Preview" />
          ) : (
            <div className="flex flex-col justify-center items-center h-[65vh] gap-4 text-slate-500">
               <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="font-medium text-sm">Формируем документ...</p>
            </div>
          )}
          <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
             <button onClick={() => {setActiveModal(null); setPdfPreviewUrl(null);}} className="px-5 py-2.5 rounded-xl border font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors text-sm active:scale-95">Закрыть</button>
             {pdfPreviewUrl && navigator.share && <button onClick={async () => {
               try {
                 const res = await fetch(pdfPreviewUrl);
                 const blob = await res.blob();
                 const file = new File([blob], pdfFileName, { type: 'application/pdf' });
                 if (navigator.canShare && navigator.canShare({ files: [file] })) {
                   await navigator.share({ files: [file], title: pdfFileName, text: 'PDF отчет Pokiza SMM' });
                 } else {
                   await navigator.share({ title: pdfFileName, url: pdfPreviewUrl });
                 }
               } catch (error) {
                 showToast('Не удалось поделиться PDF', 'error');
               }
             }} className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold rounded-xl text-center shadow-sm active:scale-95 transition-transform text-sm">Поделиться</button>}
             {pdfPreviewUrl && <a href={pdfPreviewUrl} download={pdfFileName} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-center shadow-sm active:scale-95 transition-transform text-sm">Скачать PDF</a>}
          </div>
        </Modal>
      )}

      {activeModal === 'editProfile' && editingItem && (
        <Modal title="Мой профиль" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Отображаемое имя</label>
              <input type="text" id="profileName" defaultValue={editingItem?.name || ''} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Новый пароль</label>
              <input type="text" id="profilePass" defaultValue={editingItem?.pass || ''} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <button onClick={async () => {
                const newName = document.getElementById('profileName').value.trim();
                const newPass = document.getElementById('profilePass').value.trim();
                if(!newName || !newPass) return showToast('Заполните все поля', 'error');

                try {
                  const updatedUser = { ...user, name: newName, pass: newPass };
                  await apiRequest('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(updatedUser)
                  });
                  onUpdateUser(updatedUser);
                  await loadData(currentMonth, true);
                  if (reloadUsersAndSettings) await reloadUsersAndSettings();
                  showToast('Данные обновлены');
                  setActiveModal(null);
                } catch (error) {
                  showToast(error.message || 'Не удалось сохранить профиль', 'error');
                }
              }} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold py-3.5 rounded-xl mt-2 text-sm active:scale-95 transition-transform">Сохранить изменения</button>
          </div>
        </Modal>
      )}

      {activeModal === 'addTask' && (
        <TaskFormModal
          task={editingItem}
          kpis={kpis}
          platforms={platforms}
          theme={theme}
          onSave={saveTask}
          onClose={() => { setActiveModal(null); setEditingItem(null); }}
        />
      )}

      {/* Модальное окно просмотра задачи */}
      {activeModal === 'viewTask' && editingItem && (
        <Modal title="Просмотр задачи" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Тема публикации</label>
              <div className="text-base font-semibold text-slate-900 dark:text-white leading-snug">{editingItem.title}</div>
            </div>
            
            {editingItem.text && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Текст / Сценарий</label>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">{renderTextWithLinks(editingItem.text)}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата</label>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{editingItem.date.split('-').reverse().join('.')}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Статус</label>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                   {editingItem.status === 'completed' ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Готово</span> : <span className="text-amber-600 flex items-center gap-1"><Clock size={14}/> В плане</span>}
                </div>
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Форматы и Платформа</label>
               <div className="flex flex-wrap gap-2">
                  <span className={`text-[11px] font-semibold uppercase flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600`}>
                     {getPlatformIcon(platforms.find(p => p.id === editingItem.platformId), 14)} 
                     {platforms.find(p => p.id === editingItem.platformId)?.name}
                  </span>
                  {editingItem.kpiIds?.map((kId, i) => {
                    const k = kpis.find(x => x.id === kId);
                    if (!k) return null;
                    const colorClass = getFormatColor(k);
                    return (
                      <span key={i} className={`text-[11px] font-medium px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 bg-white dark:bg-slate-800 ${colorClass.border} ${colorClass.text}`}>
                        <div className={`w-2 h-2 rounded-full ${colorClass.bg}`}></div>{k.title}
                      </span>
                    )
                  })}
               </div>
            </div>

            {editingItem.link && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Опубликованная ссылка</label>
                <a href={editingItem.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1.5 break-all bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20">
                   <Paperclip size={14} className="shrink-0"/> {editingItem.link}
                </a>
              </div>
            )}

            <div className="flex gap-3 pt-2">
               <button onClick={() => setActiveModal('addTask')} className="flex-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold py-3.5 rounded-xl text-sm transition-transform active:scale-95 shadow-sm flex justify-center items-center gap-2 border dark:border-white">
                 <Edit2 size={16}/> Редактировать
               </button>
               <button onClick={() => { setActiveModal(null); setEditingItem(null); }} className="px-6 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold py-3.5 rounded-xl text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-600">
                 Закрыть
               </button>
            </div>
          </div>
        </Modal>
      )}

      {selectedKpiForDetails && (() => {
        const platform = platforms.find(p => p.id === selectedKpiForDetails.platformId);
        const relatedTasks = monthTasks.filter(t => t.kpiIds?.includes(selectedKpiForDetails.id));
        const emptySlotsCount = Math.max(0, selectedKpiForDetails.target - relatedTasks.length);
        const colorClass = getFormatColor(selectedKpiForDetails);
        
        return (
          <Modal title={selectedKpiForDetails.title} onClose={() => setSelectedKpiForDetails(null)} maxWidth="max-w-2xl">
            <div className="space-y-6">
              <div className={`flex justify-between items-center p-6 rounded-3xl ${theme==='dark'?'bg-slate-700/50 border border-slate-600':'bg-slate-50 border border-slate-100'}`}>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-500">{getPlatformIcon(platform, 14)} {platform?.name}</div>
                  <div className="text-3xl font-bold tracking-tight flex items-baseline gap-2 dark:text-white">
                    {relatedTasks.length} <span className="text-slate-400 text-lg font-medium">/ {selectedKpiForDetails.target}</span>
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center opacity-20 ${colorClass.bg}`}><Target size={28} className="text-white"/></div>
              </div>
              
              <h4 className="font-semibold text-sm flex justify-between items-center text-slate-800 dark:text-slate-200">
                Список задач:
              </h4>
              <div className={`border rounded-2xl overflow-hidden divide-y ${theme==='dark'?'divide-slate-700 border-slate-700':'divide-slate-100 border-slate-100'}`}>
                {relatedTasks.map(task => (
                  <TaskRow key={task.id} task={task} theme={theme} platforms={platforms} kpis={kpis} todayStr={todayStr} onComplete={completeTask} onDelete={() => deleteTask(task.id)} onEdit={() => { setEditingItem(task); setActiveModal('addTask'); }} onView={() => { setEditingItem(task); setActiveModal('viewTask'); }} compact />
                ))}
                
                {Array.from({length: emptySlotsCount}).map((_, idx) => (
                  <div key={`empty-${idx}`} className={`p-5 flex items-center justify-between border-l-[3px] border-l-transparent hover:border-l-red-500 transition-all cursor-pointer group active:scale-[0.99] ${theme==='dark'?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-slate-50'}`}
                       onClick={() => { setEditingItem({ title: '', kpiIds: [selectedKpiForDetails.id], platformId: selectedKpiForDetails.platformId, date: `${currentMonth}-01` }); setActiveModal('addTask'); }}>
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-500 flex items-center justify-center shrink-0 group-hover:border-red-500 group-hover:text-red-500 transition-colors"><Plus size={16}/></div>
                      <span className="text-sm font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Свободный слот (добавить задачу)</span>
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
           <div className={`border rounded-2xl overflow-hidden divide-y ${theme==='dark'?'divide-slate-700 border-slate-700':'divide-slate-100 border-slate-100'}`}>
             {editingItem._tasks.length > 0 ? (
               editingItem._tasks.map(task => (
                  <TaskRow key={task.id} task={task} theme={theme} platforms={platforms} kpis={kpis} todayStr={todayStr} onComplete={completeTask} onDelete={() => deleteTask(task.id)} onEdit={() => { setEditingItem(task); setActiveModal('addTask'); }} onView={() => { setEditingItem(task); setActiveModal('viewTask'); }} compact />
               ))
             ) : (
               <div className="p-10 text-center text-slate-400 font-medium text-sm">На этот день задач нет.</div>
             )}
           </div>
           <button onClick={() => { setActiveModal('addTask'); setEditingItem({ title: '', date: editingItem._date, kpiIds: [], platformId: platforms[0]?.id }); }} className="w-full mt-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95">
              <Plus size={18}/> Запланировать задачу
           </button>
        </Modal>
      )}

      {/* Mobile Menu Modal (открывается при клике на профиль с телефона) */}
      {activeModal === 'mobileMenu' && (
        <Modal title="Меню" onClose={() => setActiveModal(null)} maxWidth="max-w-xs">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3 p-4 mb-2 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border dark:border-slate-600">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">{user.name[0]}</div>
                <div>
                   <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                   <div className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">{user.role === 'admin' ? 'Администратор' : 'SMM специалист'}</div>
                </div>
             </div>
             
             <button onClick={() => {setEditingItem(user); setActiveModal('editProfile');}} className="flex items-center gap-3 w-full p-4 text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95">
                <User size={20} className="text-blue-500"/> Мой профиль
             </button>
             {isAdmin && (
               <button onClick={() => {setActiveTab('platforms'); setActiveModal(null);}} className="flex items-center gap-3 w-full p-4 text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95">
                  <Layers size={20} className="text-teal-500"/> Платформы и форматы
               </button>
             )}
             <button onClick={() => {setActiveTab('settings'); setActiveModal(null);}} className="flex items-center gap-3 w-full p-4 text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95">
                <Settings size={20} className="text-slate-500"/> Системные настройки
             </button>
             <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
             <button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-left font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors active:scale-95">
                <LogOut size={20}/> Выйти из системы
             </button>
           </div>
        </Modal>
      )}

      {isAdmin && activeModal === 'editBranding' && (
        <Modal title="Брендинг системы" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2">Название проекта (SaaS)</label>
              <input type="text" id="brandName" defaultValue={editingItem?.appName || ''} placeholder="Например: ПОКИЗА" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">URL Логотипа (опционально)</label>
              <input type="text" id="brandLogo" defaultValue={editingItem?.logoUrl || ''} placeholder="https://example.com/logo.png" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Оставьте пустым для стандартного логотипа</p>
            </div>
            <button onClick={async () => {
                const appName = document.getElementById('brandName').value.trim() || 'ПОКИЗА';
                const logoUrl = document.getElementById('brandLogo').value.trim();
                try {
                  await apiRequest('/api/settings', {
                    method: 'POST',
                    body: JSON.stringify({ appName, logoUrl })
                  });
                  setAppSettings({ appName, logoUrl });
                  if (reloadUsersAndSettings) await reloadUsersAndSettings();
                  showToast('Настройки бренда сохранены');
                  setActiveModal(null);
                } catch (error) {
                  showToast(error.message || 'Не удалось сохранить настройки бренда', 'error');
                }
              }} className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-xl hover:bg-red-700 mt-4 shadow-sm text-sm active:scale-95 transition-transform">Применить</button>
          </div>
        </Modal>
      )}

      {isAdmin && activeModal === 'editPlatform' && (
        <Modal title={editingItem?.id ? 'Редактировать платформу' : 'Новая платформа'} onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2">Название платформы</label>
              <input type="text" id="platName" defaultValue={editingItem?.name || ''} placeholder="Например: ВКонтакте" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Аккаунт / Ссылка</label>
              <input type="text" id="platAccount" defaultValue={editingItem?.account || ''} placeholder="@username" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
               <label className="block text-xs font-semibold mb-2">Иконка</label>
               <div className="grid grid-cols-6 gap-2">
                 {PLATFORM_ICONS.map(pi => (
                   <label key={pi.id} className={`flex justify-center items-center p-3 border rounded-xl cursor-pointer transition-colors active:scale-95 ${editingItem?.iconName === pi.id || (!editingItem?.iconName && pi.id === 'globe') ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-500/10 dark:border-red-500' : (theme==='dark'?'border-slate-700 hover:bg-slate-700':'border-slate-200 hover:bg-slate-50')}`}>
                     <input type="radio" name="iconName" value={pi.id} className="hidden" defaultChecked={editingItem?.iconName === pi.id} onChange={(e) => setEditingItem({...editingItem, iconName: e.target.value})} />
                     <pi.icon size={20} strokeWidth={1.5} />
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
              }} className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-xl hover:bg-red-700 mt-4 shadow-sm text-sm active:scale-95 transition-transform">Сохранить платформу</button>
          </div>
        </Modal>
      )}

      {isAdmin && activeModal === 'editKpi' && (
        <Modal title={editingItem?.id ? 'Редактировать Формат' : 'Новый Формат Контента'} onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-5">
            <div>
               <label className="block text-xs font-semibold mb-2">Платформа</label>
               <select id="kpiPlatform" defaultValue={editingItem?.platformId || platforms[0]?.id} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                 {platforms.map(p => <option key={p.id} value={p.id}>{p.name} ({p.account})</option>)}
               </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Название формата</label>
              <input type="text" id="kpiTitle" defaultValue={editingItem?.title || ''} placeholder="Например: Съемка Reels" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">План на месяц (шт)</label>
              <input type="text" inputMode="decimal" pattern="[0-9]*" id="kpiTarget" defaultValue={editingItem?.target || 1} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-3 flex items-center gap-2">Цвет <span className="text-[10px] font-medium text-slate-400">(Для календаря)</span></label>
              <div className="flex flex-wrap gap-3">
                 {FORMAT_COLORS.map(c => (
                   <label key={c.id} className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all active:scale-95 ${editingItem?.colorId === c.id || (!editingItem?.colorId && c.id === 'blue') ? 'border-slate-800 dark:border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'} ${c.bg}`}>
                     <input type="radio" name="colorId" value={c.id} className="hidden" defaultChecked={editingItem?.colorId === c.id} onChange={(e) => setEditingItem({...editingItem, colorId: e.target.value})} />
                     {(editingItem?.colorId === c.id || (!editingItem?.colorId && c.id === 'blue')) && <CheckCircle2 size={16} strokeWidth={2.5} className="text-white"/>}
                   </label>
                 ))}
              </div>
            </div>
            <button onClick={() => {
                const title = document.getElementById('kpiTitle').value;
                const target = Number(document.getElementById('kpiTarget').value.replace(/[^0-9]/g, ''));
                const platformId = document.getElementById('kpiPlatform').value;
                const colorId = editingItem.colorId || 'blue';
                if(!title) return showToast('Введите название', 'error');
                if(!target || target < 1) return showToast('План должен быть больше 0', 'error');
                saveKpi({ ...(editingItem || {}), title, target, platformId, colorId });
              }} className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-xl hover:bg-red-700 mt-4 shadow-sm text-sm active:scale-95 transition-transform">Сохранить формат</button>
          </div>
        </Modal>
      )}

      {isAdmin && activeModal === 'userModal' && (
        <Modal title={editingItem?.login ? 'Редактировать пользователя' : 'Новый пользователь'} onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2">ФИО</label>
              <input type="text" id="addUserName" defaultValue={editingItem?.name || ''} placeholder="Иван Иванов" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Логин</label>
              <input type="text" id="addUserLogin" defaultValue={editingItem?.login || ''} placeholder="new_smm" disabled={editingItem?.login === 'admin'} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'} disabled:opacity-50`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Пароль</label>
              <input type="text" id="addUserPass" defaultValue={editingItem?.pass || ''} placeholder="Пароль" className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
               <label className="block text-xs font-semibold mb-2">Роль</label>
               <select id="addUserRole" defaultValue={editingItem?.role || 'smm'} disabled={editingItem?.login === 'admin'} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'} disabled:opacity-50`}>
                 <option value="smm">SMM Специалист</option>
                 <option value="admin">Администратор</option>
               </select>
            </div>
            <button onClick={async () => {
                const name = document.getElementById('addUserName').value.trim();
                const login = document.getElementById('addUserLogin').value.trim().toLowerCase();
                const pass = document.getElementById('addUserPass').value.trim();
                const role = document.getElementById('addUserRole').value;
                if(!name || !login || !pass) return showToast('Заполните все поля', 'error');

                if (!editingItem?.login && usersDb[login]) return showToast('Этот логин уже занят', 'error');
                if (editingItem?.login && editingItem.login !== login && usersDb[login]) return showToast('Этот логин уже занят', 'error');

                try {
                  if (editingItem?.login && editingItem.login !== login) {
                    await apiRequest(`/api/users/${encodeURIComponent(editingItem.login)}`, { method: 'DELETE' });
                  }

                  await apiRequest('/api/users', {
                    method: 'POST',
                    body: JSON.stringify({
                      ...editingItem,
                      id: editingItem?.id || Date.now(),
                      name,
                      login,
                      pass,
                      role,
                      email: editingItem?.email || `${login}@pokiza.com`
                    })
                  });

                  await loadData(currentMonth, true);
                  if (reloadUsersAndSettings) await reloadUsersAndSettings();
                  showToast(editingItem?.login ? 'Пользователь обновлен' : 'Пользователь добавлен');
                  setActiveModal(null);
                } catch (error) {
                  showToast(error.message || 'Не удалось сохранить пользователя', 'error');
                }
              }} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold py-3.5 rounded-xl mt-4 shadow-sm text-sm active:scale-95 transition-transform">
              {editingItem?.login ? 'Сохранить изменения' : 'Создать пользователя'}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'editProfile' && editingItem && (
        <Modal title="Мой профиль" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Отображаемое имя</label>
              <input type="text" id="profileName" defaultValue={editingItem?.name || ''} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Новый пароль</label>
              <input type="text" id="profilePass" defaultValue={editingItem?.pass || ''} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-200'}`} />
            </div>
            <button onClick={async () => {
                const newName = document.getElementById('profileName').value.trim();
                const newPass = document.getElementById('profilePass').value.trim();
                if(!newName || !newPass) return showToast('Заполните все поля', 'error');

                try {
                  const updatedUser = { ...user, name: newName, pass: newPass };
                  await apiRequest('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(updatedUser)
                  });
                  onUpdateUser(updatedUser);
                  await loadData(currentMonth, true);
                  if (reloadUsersAndSettings) await reloadUsersAndSettings();
                  showToast('Данные обновлены');
                  setActiveModal(null);
                } catch (error) {
                  showToast(error.message || 'Не удалось сохранить профиль', 'error');
                }
              }} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold py-3.5 rounded-xl mt-2 text-sm active:scale-95 transition-transform">Сохранить изменения</button>
          </div>
        </Modal>
      )}

      {/* Модальное окно просмотра задачи (Read-Only) */}
      {activeModal === 'viewTask' && editingItem && (
        <Modal title="Просмотр задачи" onClose={() => {setActiveModal(null); setEditingItem(null);}}>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Тема публикации</label>
              <div className="text-base font-semibold text-slate-900 dark:text-white leading-snug">{editingItem.title}</div>
            </div>
            
            {editingItem.text && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Текст / Сценарий</label>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">{renderTextWithLinks(editingItem.text)}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Дата</label>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{editingItem.date.split('-').reverse().join('.')}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Статус</label>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                   {editingItem.status === 'completed' ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Готово</span> : <span className="text-amber-600 flex items-center gap-1"><Clock size={14}/> В плане</span>}
                </div>
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Форматы и Платформа</label>
               <div className="flex flex-wrap gap-2">
                  {/* Платформа */}
                  <span className={`text-[11px] font-semibold uppercase flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600`}>
                     {getPlatformIcon(platforms.find(p => p.id === editingItem.platformId), 14)} 
                     {platforms.find(p => p.id === editingItem.platformId)?.name}
                  </span>
                  {/* KPI */}
                  {editingItem.kpiIds?.map((kId, i) => {
                    const k = kpis.find(x => x.id === kId);
                    if (!k) return null;
                    const colorClass = getFormatColor(k);
                    return (
                      <span key={i} className={`text-[11px] font-medium px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 bg-white dark:bg-slate-800 ${colorClass.border} ${colorClass.text}`}>
                        <div className={`w-2 h-2 rounded-full ${colorClass.bg}`}></div>{k.title}
                      </span>
                    )
                  })}
               </div>
            </div>

            {editingItem.link && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Опубликованная ссылка</label>
                <a href={editingItem.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1.5 break-all bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20">
                   <Paperclip size={14} className="shrink-0"/> {editingItem.link}
                </a>
              </div>
            )}

            <div className="flex gap-3 pt-2">
               <button onClick={() => setActiveModal('addTask')} className="flex-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold py-3.5 rounded-xl text-sm transition-transform active:scale-95 shadow-sm flex justify-center items-center gap-2 border border-transparent dark:border-white">
                 <Edit2 size={16}/> Редактировать
               </button>
               <button onClick={() => { setActiveModal(null); setEditingItem(null); }} className="px-6 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold py-3.5 rounded-xl text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-600">
                 Закрыть
               </button>
            </div>
          </div>
        </Modal>
      )}

    </div>

    {/* Блок для генерации PDF: элемент должен быть видимым для html2canvas, поэтому прячем его за экран, а не через opacity/overflow */}
    {printMode && (
      <div style={{ position: 'fixed', left: '-10000px', top: 0, width: printMode === 'plan' ? '1100px' : '790px', background: '#ffffff', color: '#0f172a', pointerEvents: 'none', zIndex: -1 }}>
        <div id="pdf-content-wrapper" className="bg-white font-sans text-slate-900 p-10 m-0" style={{ width: printMode === 'plan' ? '1100px' : '790px', minHeight: '100px' }}>
          {printMode === 'analytics' && <AnalyticsPrintView data={pdfAnalyticsData} currentMonth={getMonthLabel(currentMonth)} kpiProgress={kpiProgress} allData={analytics} months={timelineMonths} appSettings={appSettings} />}
          {printMode === 'plan' && <ContentPlanPrintView currentMonthLabel={getMonthLabel(currentMonth)} monthTasks={sortedMonthTasks} platforms={platforms} kpis={kpis} appSettings={appSettings} />}
        </div>
      </div>
    )}
    </>
  );
}

const TaskRow = React.memo(function TaskRow({ task, theme, platforms, kpis, onComplete, onDelete, onEdit, onView, compact = false, todayStr }) {
  const [linkInput, setLinkInput] = useState(task.link || '');
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && task.date < todayStr;
  
  const platform = platforms.find(p => p.id === task.platformId);
  const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];

  return (
    <div className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${theme==='dark'?'hover:bg-slate-800/50':'hover:bg-slate-50'} ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer group" onClick={onView}>
        {isCompleted ? <CheckCircle2 className="text-green-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} strokeWidth={2} /> : <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>}
        <div className="min-w-0 space-y-1.5 w-full">
          <h4 className={`font-semibold text-base md:text-sm truncate group-hover:text-blue-500 transition-colors ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${theme==='dark'?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600'}`}>{task.date.split('-').reverse().join('.')}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1.5 ${theme==='dark'?'bg-slate-700 text-red-400':'bg-slate-100 text-red-600'}`}>{getPlatformIcon(platform, 12)} {platform?.name}</span>
            {taskKpis.map((k, i) => {
               const colorClass = getFormatColor(k);
               return <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-md border truncate max-w-[140px] flex items-center gap-1.5 ${theme==='dark' ? `bg-slate-800 ${colorClass.border} ${colorClass.text}` : `bg-white ${colorClass.border} ${colorClass.text}`}`} title="Связанный формат"><div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>{k.title}</span>
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 mt-1 md:mt-0">
        {!isCompleted ? (
          <div className="flex flex-col sm:flex-row w-full gap-2.5">
            <input type="text" placeholder="Ссылка..." value={linkInput} onChange={e => setLinkInput(e.target.value)} className={`w-full sm:w-48 md:w-56 px-3 py-2.5 sm:py-2 border text-base md:text-sm font-medium rounded-xl outline-none focus:border-red-600 transition-colors ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => onComplete(task.id, linkInput)} className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-semibold rounded-xl hover:opacity-80 shrink-0 shadow-sm transition-all active:scale-95 flex justify-center items-center">Сдать</button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className={`p-2.5 sm:p-2 rounded-xl transition-colors shrink-0 active:scale-95 flex items-center justify-center ${theme==='dark'?'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><Edit2 size={18} className="sm:w-4 sm:h-4"/></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={`p-2.5 sm:p-2 rounded-xl transition-colors shrink-0 active:scale-95 flex items-center justify-center ${theme==='dark'?'bg-red-500/10 text-red-400 hover:bg-red-500/20':'bg-red-50 text-red-600 hover:bg-red-100'}`}><Trash2 size={18} className="sm:w-4 sm:h-4"/></button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end w-full gap-3 sm:gap-4">
            {task.link ? (
              <a href={task.link} target="_blank" rel="noreferrer" className={`w-full sm:w-auto text-sm font-semibold hover:underline truncate max-w-[200px] flex items-center gap-1.5 px-4 py-2.5 sm:py-1.5 rounded-xl border ${theme==='dark'?'text-blue-400 bg-blue-500/10 border-blue-500/20':'text-blue-600 bg-blue-50 border-blue-100'}`}><Paperclip size={16} className="shrink-0 sm:w-4 sm:h-4"/> <span className="truncate">{task.link}</span></a>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">Сдано без ссылки</span>
            )}
            <div className="flex gap-2 w-full sm:w-auto justify-end">
               <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className={`p-2.5 sm:p-2 rounded-xl transition-colors shrink-0 active:scale-95 flex items-center justify-center ${theme==='dark'?'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}><Edit2 size={18} className="sm:w-4 sm:h-4"/></button>
               <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={`p-2.5 sm:p-2 rounded-xl transition-colors shrink-0 active:scale-95 flex items-center justify-center ${theme==='dark'?'bg-red-500/10 text-red-400 hover:bg-red-500/20':'bg-red-50 text-red-600 hover:bg-red-100'}`}><Trash2 size={18} className="sm:w-4 sm:h-4"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

function InlineTaskEditor({ currentMonth, platforms, kpis, theme, onSave }) {
  const [data, setData] = useState({ date: `${currentMonth}-01`, title: '', text: '', platformId: platforms[0]?.id || '', kpiIds: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setData(prev => ({ ...prev, date: `${currentMonth}-01`, platformId: prev.platformId || platforms[0]?.id || '' }));
  }, [currentMonth, platforms]);

  const handleSave = async () => {
    if(isSubmitting || !(data.title || '').trim()) return;
    setIsSubmitting(true);
    try {
      const success = await onSave({ ...data, title: data.title.trim(), text: (data.text || '').trim() });
      if (success) setData(prev => ({ ...prev, title: '', text: '', kpiIds: [] }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableKpis = kpis.filter(k => k.platformId === data.platformId);

  return (
    <tr className={`border-b border-slate-100 dark:border-slate-700 ${theme==='dark'?'bg-slate-800/50':'bg-slate-50/50'}`}>
      <td className="p-3 align-top">
        <input type="date" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className={`w-full px-3 py-2 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600':'border-slate-200'}`}/>
      </td>
      <td className="p-3 space-y-2.5 align-top">
        <select value={data.platformId} onChange={e=>setData({...data, platformId: e.target.value, kpiIds: []})} className={`w-full px-3 py-2 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600 text-slate-200':'border-slate-200 text-slate-800'}`}>
          {platforms.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-800">{p.name}</option>)}
        </select>
        {availableKpis.length > 0 && (
          <select value={data.kpiIds[0] || ''} onChange={e=>setData({...data, kpiIds: e.target.value ? [e.target.value] : []})} className={`w-full px-3 py-2 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600 text-slate-300':'border-slate-200 text-slate-600'}`}>
            <option value="">-- Формат контента --</option>
            {availableKpis.map(k => <option key={k.id} value={k.id} className="dark:bg-slate-800">{k.title}</option>)}
          </select>
        )}
      </td>
      <td className="p-3 align-top">
        <input type="text" placeholder="Тема / Идея публикации..." value={data.title} onChange={e=>setData({...data, title: e.target.value})} onKeyDown={e=>{if(e.key==='Enter')handleSave()}} className={`w-full px-4 py-2 text-base md:text-sm font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent mb-2.5 ${theme==='dark'?'border-slate-600 placeholder-slate-400':'border-slate-200'}`}/>
        <textarea rows="1" placeholder="Текст или сценарий (необязательно)..." value={data.text} onChange={e=>setData({...data, text: e.target.value})} onKeyDown={e=>{if(e.key==='Enter' && e.ctrlKey)handleSave()}} className={`w-full px-4 py-2 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent resize-none ${theme==='dark'?'border-slate-600 placeholder-slate-500':'border-slate-200'}`}/>
      </td>
      <td className="p-3 text-right align-top">
         <button onClick={handleSave} disabled={!(data.title || '').trim() || isSubmitting} className="w-full py-2.5 bg-red-600 text-white text-base md:text-xs font-semibold rounded-xl disabled:opacity-50 flex justify-center items-center gap-1.5 transition-transform active:scale-95 shadow-sm shadow-red-600/20"><Plus size={16}/> {isSubmitting ? 'Сохранение...' : 'В план'}</button>
      </td>
    </tr>
  )
}

function InlineTaskCardEditor({ currentMonth, platforms, kpis, theme, onSave }) {
  const [data, setData] = useState({ date: `${currentMonth}-01`, title: '', text: '', platformId: platforms[0]?.id || '', kpiIds: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setData(prev => ({ ...prev, date: `${currentMonth}-01`, platformId: prev.platformId || platforms[0]?.id || '' }));
  }, [currentMonth, platforms]);

  const handleSave = async () => {
    if (isSubmitting || !(data.title || '').trim()) return;
    setIsSubmitting(true);
    try {
      const success = await onSave({ ...data, title: data.title.trim(), text: (data.text || '').trim() });
      if (success) setData(prev => ({ ...prev, title: '', text: '', kpiIds: [] }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableKpis = kpis.filter(k => k.platformId === data.platformId);

  return (
    <div className={`p-4 rounded-3xl border shadow-sm ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
      <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Быстро добавить в план</div>
      <div className="grid grid-cols-1 gap-3">
        <input type="date" value={data.date} onChange={e=>setData({...data, date: e.target.value})} className={`w-full px-3 py-2.5 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600':'border-slate-200'}`}/>
        <select value={data.platformId} onChange={e=>setData({...data, platformId: e.target.value, kpiIds: []})} className={`w-full px-3 py-2.5 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600 text-slate-200':'border-slate-200 text-slate-800'}`}>
          {platforms.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-800">{p.name}</option>)}
        </select>
        {availableKpis.length > 0 && (
          <select value={data.kpiIds[0] || ''} onChange={e=>setData({...data, kpiIds: e.target.value ? [e.target.value] : []})} className={`w-full px-3 py-2.5 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600 text-slate-300':'border-slate-200 text-slate-600'}`}>
            <option value="">-- Формат контента --</option>
            {availableKpis.map(k => <option key={k.id} value={k.id} className="dark:bg-slate-800">{k.title}</option>)}
          </select>
        )}
        <input type="text" placeholder="Тема / Идея публикации..." value={data.title} onChange={e=>setData({...data, title: e.target.value})} onKeyDown={e=>{if(e.key==='Enter')handleSave()}} className={`w-full px-4 py-2.5 text-base md:text-sm font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent ${theme==='dark'?'border-slate-600 placeholder-slate-400':'border-slate-200'}`}/>
        <textarea rows="2" placeholder="Текст или сценарий (необязательно)..." value={data.text} onChange={e=>setData({...data, text: e.target.value})} className={`w-full px-4 py-2.5 text-base md:text-xs font-medium border rounded-xl outline-none focus:border-red-600 bg-transparent resize-none ${theme==='dark'?'border-slate-600 placeholder-slate-500':'border-slate-200'}`}/>
        <button onClick={handleSave} disabled={!(data.title || '').trim() || isSubmitting} className="w-full py-3 bg-red-600 text-white text-base md:text-xs font-semibold rounded-xl disabled:opacity-50 flex justify-center items-center gap-1.5 transition-transform active:scale-95 shadow-sm shadow-red-600/20"><Plus size={16}/> {isSubmitting ? 'Сохранение...' : 'В план'}</button>
      </div>
    </div>
  )
}

function TaskFormModal({ task, kpis, platforms, theme, onSave, onClose }) {
  const [formData, setFormData] = useState(() => ({
    id: task?.id,
    title: task?.title || '',
    text: task?.text || '',
    date: task?.date || getLocalISODate(),
    platformId: task?.platformId || platforms[0]?.id || '',
    kpiIds: task?.kpiIds || [],
    link: task?.link || '',
    order: task?.order || 0
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (isSubmitting || !(formData.title || '').trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ ...formData, title: (formData.title || '').trim(), text: (formData.text || '').trim(), link: (formData.link || '').trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={formData.id ? 'Редактировать задачу' : 'Новая задача'} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">Название / Тема</label>
          <input type="text" placeholder="Например: Съемка Reels с обзором" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800/50 border-slate-600':'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">Текст / Сценарий</label>
          <textarea rows="2" placeholder="Опишите задачу..." value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 resize-none font-medium ${theme==='dark'?'bg-slate-800/50 border-slate-600':'bg-slate-50 border-slate-200'}`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">Дата</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800/50 border-slate-600':'bg-slate-50 border-slate-200'}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">Платформа</label>
            <select value={formData.platformId} onChange={handlePlatformChange} className={`w-full px-4 py-2.5 text-base md:text-sm border rounded-xl outline-none focus:border-red-600 font-medium ${theme==='dark'?'bg-slate-800/50 border-slate-600':'bg-slate-50 border-slate-200'}`}>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold mb-2 flex flex-col text-slate-700 dark:text-slate-300">
            Форматы контента
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">Выберите один или несколько форматов</span>
          </label>
          <div className={`border rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 ${theme==='dark'?'bg-slate-800/30 border-slate-700':'bg-slate-50/50 border-slate-100'}`}>
            {availableKpis.length === 0 ? <p className="text-xs text-slate-400 font-medium text-center py-4 sm:col-span-2">Нет форматов</p> : null}
            {availableKpis.map(k => {
               const colorClass = getFormatColor(k);
               return (
                <label key={k.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-colors active:scale-[0.99] ${formData.kpiIds?.includes(k.id) ? (theme==='dark'?'bg-slate-700 border-slate-600 shadow-sm border':'bg-white shadow-sm border border-slate-100') : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent'}`} onClick={() => toggleKpi(k.id)}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${formData.kpiIds?.includes(k.id) ? 'bg-red-600 border-red-600' : (theme==='dark'?'border-slate-500 group-hover:border-slate-400':'border-slate-300 group-hover:border-slate-400')}`}>
                    {formData.kpiIds?.includes(k.id) && <CheckCircle2 size={12} strokeWidth={2.5} className="text-white"/>}
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${colorClass.bg}`}></div>
                  <span className="text-base md:text-sm font-medium select-none">{k.title}</span>
                </label>
              )
            })}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!(formData.title || '').trim() || isSubmitting} className="w-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold py-3.5 rounded-xl disabled:opacity-50 mt-4 transition-transform active:scale-95 shadow-sm text-sm">
          {isSubmitting ? 'Сохранение...' : 'Сохранить задачу'}
        </button>
      </div>
    </Modal>
  );
}

function CalendarView({ currentMonth, tasks, theme, kpis, onDayClick, onDropTask }) {
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
    <section className={`border rounded-3xl p-6 sm:p-8 shadow-sm ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarIcon size={20} className="text-blue-500"/> Календарь публикаций</h2>
        
        {legendItems.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border dark:border-slate-700">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-2">Форматы:</span>
            {legendItems.map(k => {
               const colorClass = getFormatColor(k);
               return (
                 <div key={k.id} className={`text-[10px] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${theme==='dark' ? `bg-slate-800 ${colorClass.border} ${colorClass.text}` : `bg-white shadow-sm ${colorClass.border} ${colorClass.text}`}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${colorClass.bg}`}></div>
                   {k.title}
                 </div>
               )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{weekDays.map(d => <div key={d}>{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {Array.from({length: startOffset}).map((_, i) => <div key={`empty-${i}`} className={`aspect-square rounded-2xl ${theme==='dark'?'bg-slate-900/30':'bg-slate-50/30'}`}></div>)}
        {days.map(({ dayNum, dateStr, dayTasks }) => {
          const hasTasks = dayTasks.length > 0;
          
          return (
            <div 
              key={dayNum} 
              onClick={() => onDayClick(dateStr, dayTasks)} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onDropTask(null, dateStr); }}
              className={`aspect-square rounded-2xl border relative p-2 sm:p-3 cursor-pointer transition-all flex flex-col justify-between hover:shadow-md active:scale-95 ${hasTasks ? (theme==='dark'?'bg-slate-700 border-slate-600 hover:border-slate-500':'bg-white border-slate-200 hover:border-slate-300 shadow-sm') : (theme==='dark'?'bg-slate-800/50 border-dashed border-slate-700 hover:border-slate-600':'bg-slate-50/50 border-dashed border-slate-200 hover:border-slate-300')}`}
            >
              <span className={`text-sm sm:text-base font-semibold ${hasTasks ? (theme==='dark'?'text-white':'text-slate-800') : 'text-slate-400'}`}>{dayNum}</span>
              {hasTasks && (
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1 mb-1.5 sm:mb-2">
                    {dayTasks.map(t =>
                      t.kpiIds?.map((kId, idx) => {
                         const colorClass = getFormatColor(kpis.find(k=>k.id===kId)).bg;
                         return <div key={`${t.id}-${kId}-${idx}`} className={`h-1.5 sm:h-2 w-full max-w-[10px] sm:max-w-[14px] rounded-full ${colorClass} shadow-sm`} title={t.title}></div>
                      })
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider pt-1 sm:pt-1.5 border-t ${theme==='dark'?'border-slate-600 text-slate-300':'border-slate-100 text-slate-500'} block truncate`}>{dayTasks.length} задач</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  );
}

function AnalyticsInputForm({ onSave, onTempSave, currentData, theme }) {
  const [data, setData] = useState(currentData);

  useEffect(() => {
    setData(currentData);
  }, [currentData]);

  const handleLocalChange = (field, val) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const handleBlur = () => {
    if (onTempSave) onTempSave(data);
  };

  const er = useMemo(() => {
    const r = Number(data.reach) || 0;
    if (r === 0) return 0;
    return ((((Number(data.likes) || 0) + (Number(data.comments) || 0)) / r) * 100).toFixed(2);
  }, [data]);

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {id:'followers', icon:Users, label:'Подписчики'}, {id:'reach', icon:Eye, label:'Охват'},
          {id:'likes', icon:Heart, label:'Лайки'}, {id:'comments', icon:MessageCircle, label:'Комментарии'}
        ].map(f => (
          <div key={f.id}>
            <label className="block text-xs font-semibold mb-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><f.icon size={16}/> {f.label}</label>
            <input 
              type="text" 
              inputMode="decimal" 
              pattern="[0-9]*" 
              value={data[f.id] || ''} 
              onChange={e => handleLocalChange(f.id, e.target.value.replace(/[^0-9]/g, ''))} 
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:border-red-600 font-medium text-base md:text-sm ${theme==='dark'?'bg-slate-900 border-slate-700 text-white':'bg-slate-50 border-slate-200'}`} 
            />
          </div>
        ))}
      </div>
      <div className={`p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between border shadow-sm gap-4 ${theme==='dark'?'bg-red-500/10 border-red-500/20':'bg-red-50 border-red-100'}`}>
        <span className={`font-semibold text-sm ${theme==='dark'?'text-red-400':'text-red-800'}`}>Авто-расчет ER (Вовлеченность):</span>
        <span className="text-3xl font-bold tracking-tight text-red-600">{er}%</span>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">Выводы и инсайты</label>
        <textarea rows="4" placeholder="Краткое резюме проделанной работы..." value={data.text || ''} onChange={e => handleLocalChange('text', e.target.value)} onBlur={handleBlur} className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-red-600 resize-none font-medium text-base md:text-sm ${theme==='dark'?'bg-slate-900 border-slate-700 text-white':'bg-slate-50 border-slate-200'}`} />
      </div>
      <button onClick={() => { if(!data.reach) return alert('Введите охват'); onSave({...data, er}); }} className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm shadow-red-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 w-full sm:w-auto text-sm"><Lock size={16}/> Отправить отчет</button>
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
      <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">{icon}</div>
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{title}</div>
        <div className="text-3xl font-bold tracking-tight mb-3 text-slate-800 dark:text-white">{Number(val).toLocaleString('ru')}</div>
        {prevVal != null ? (
          <div className={`text-[11px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg w-fit ${isPos ? 'bg-green-500/10 text-green-600' : (isNeg ? 'bg-red-500/10 text-red-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300')}`}>
            {isPos ? '▲' : (isNeg ? '▼' : '▬')} {Math.abs(diff).toLocaleString('ru')}
          </div>
        ) : (
           <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-lg w-fit">Первый месяц</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {renderStat('Подписчики', data.followers, prevData?.followers, <Users size={120} className="text-blue-500"/>)}
        {renderStat('Охват', data.reach, prevData?.reach, <Eye size={120} className="text-purple-500"/>)}
        {renderStat('Взаимодействия', Number(data.likes) + Number(data.comments), prevData ? Number(prevData.likes) + Number(prevData.comments) : null, <Heart size={120} className="text-pink-500"/>)}
        {renderStat('ER (%)', data.er, prevData?.er, <TrendingUp size={120} className="text-red-500"/>)}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className={`p-6 rounded-3xl border shadow-sm overflow-hidden ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Динамика за 12 месяцев</h3>
            <button onClick={onPrint} className="text-blue-500 flex items-center gap-1.5 hover:underline font-medium active:scale-95"><Download size={14}/> Скачать PDF</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme==='dark'?'#334155':'#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: theme==='dark'?'#94a3b8':'#888', fontSize: 10, fontWeight: 500}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: theme==='dark'?'#94a3b8':'#888', fontSize: 10, fontWeight: 500}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: theme==='dark'?'#94a3b8':'#888', fontSize: 10, fontWeight: 500}} />
                <RechartsTooltip cursor={{fill: theme==='dark'?'#1e293b':'#f5f5f5'}} contentStyle={{backgroundColor: theme==='dark'?'#1e293b':'#fff', borderColor: theme==='dark'?'#334155':'#e2e8f0', color: theme==='dark'?'#f8fafc':'#0f172a', borderRadius: '16px', border: theme==='dark'?'1px solid #334155':'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '500'}} />
                <Bar yAxisId="left" dataKey="reach" fill="#E53935" radius={[4, 4, 0, 0]} name="Охват" />
                <Bar yAxisId="right" dataKey="followers" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Подписчики" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border shadow-sm ${theme==='dark'?'bg-slate-800 border-slate-700':'bg-slate-50 border-slate-100'}`}>
        <h3 className="text-xs font-semibold mb-4 uppercase tracking-wider flex items-center gap-2"><MessageCircle size={16} className="text-red-500"/> Резюме SMM специалиста</h3>
        <p className={`leading-relaxed italic border-l-[3px] border-red-500 pl-5 text-sm font-medium whitespace-pre-wrap ${theme==='dark'?'text-slate-300':'text-slate-700'}`}>{renderTextWithLinks(data.text) || 'Комментарии не добавлены.'}</p>
      </div>
    </div>
  );
}

function AnalyticsPrintView({ data, currentMonth, kpiProgress, allData, months, appSettings }) {
  const comparisonData = (months || []).map(m => {
    const d = allData?.[m.value];
    return {
      name: m.label.split(' ')[0],
      followers: d?.isSubmitted ? Number(d.followers) || 0 : 0,
      reach: d?.isSubmitted ? Number(d.reach) || 0 : 0,
      hasData: Boolean(d?.isSubmitted),
    };
  });
  const maxReach = Math.max(1, ...comparisonData.map(d => d.reach));
  const maxFollowers = Math.max(1, ...comparisonData.map(d => d.followers));

  return (
    <div className="w-[710px] mx-auto font-sans bg-white text-slate-900">
      <div className="border-b-[3px] border-red-600 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-3">
             <AppLogo settings={appSettings} size={24} /> 
             {appSettings?.appName || 'ПОКИЗА'}
          </h1>
          <p className="text-sm text-slate-600 font-medium">Аналитический отчет • {currentMonth}</p>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Дата создания</div>
           <div className="text-xs font-medium">{new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-red-600"/> Ключевые показатели</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50"><div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1.5">Подписчики</div><div className="text-2xl font-bold text-slate-900">{data.followers || 0}</div></div>
          <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50"><div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1.5">Охват</div><div className="text-2xl font-bold text-slate-900">{data.reach || 0}</div></div>
          <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50"><div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1.5">Взаимодействия</div><div className="text-2xl font-bold text-slate-900">{Number(data.likes || 0) + Number(data.comments || 0)}</div></div>
          <div className="p-4 border border-red-100 rounded-2xl bg-red-50"><div className="text-[10px] text-red-600 uppercase font-semibold tracking-wider mb-1.5">ER (Вовлеченность)</div><div className="text-2xl font-bold text-red-600">{data.er || 0}%</div></div>
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-purple-600"/> Динамика за 12 месяцев</h2>
        <div className="border border-slate-200 rounded-2xl p-5 bg-white">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 9, fontWeight: 600}} dy={5} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 9, fontWeight: 500}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 9, fontWeight: 500}} />
                <Bar yAxisId="left" dataKey="reach" fill="#E53935" radius={[4, 4, 0, 0]} name="Охват" isAnimationActive={false} />
                <Bar yAxisId="right" dataKey="followers" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Подписчики" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckSquare size={18} className="text-blue-600"/> Выполнение планов (KPI)</h2>
        <div className="grid grid-cols-2 gap-3">
          {kpiProgress.map(kpi => (
            <div key={kpi.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{kpi.platformName}</span>
                <span className="font-semibold text-xs text-slate-800 truncate max-w-[200px]">{kpi.title}</span>
              </div>
              <div className="text-right whitespace-nowrap">
                  <span className="text-lg font-bold text-slate-900">{kpi.current}</span>
                  <span className="text-slate-500 font-medium text-xs"> / {kpi.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {data.text && (
        <div className="mt-6 break-inside-avoid">
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={18} className="text-green-600"/> Резюме специалиста</h2>
          <div className="text-slate-700 text-sm font-medium leading-relaxed bg-slate-50 p-5 border border-slate-200 rounded-2xl italic whitespace-pre-wrap">"{renderTextWithLinks(data.text)}"</div>
        </div>
      )}
    </div>
  );
}

function ContentPlanPrintView({ currentMonthLabel, monthTasks, platforms, kpis, appSettings }) {
  return (
    <div className="w-full mx-auto font-sans bg-white text-slate-900">
      <div className="border-b-[3px] border-red-600 pb-5 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-3">
             <AppLogo settings={appSettings} size={28} />
             {appSettings?.appName || 'ПОКИЗА'}
          </h1>
          <p className="text-base text-slate-600 font-medium">Контент-план • {currentMonthLabel}</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Дата создания</div>
           <div className="text-sm font-medium">{new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-slate-200 text-sm">
         <thead>
             <tr className="bg-slate-50">
                 <th className="border border-slate-200 p-3 font-semibold text-slate-600 w-28 uppercase tracking-wider text-xs">Дата</th>
                 <th className="border border-slate-200 p-3 font-semibold text-slate-600 w-56 uppercase tracking-wider text-xs">Платформа / Форматы</th>
                 <th className="border border-slate-200 p-3 font-semibold text-slate-600 uppercase tracking-wider text-xs">Тема / Описание</th>
                 <th className="border border-slate-200 p-3 font-semibold text-slate-600 w-28 text-center uppercase tracking-wider text-xs">Статус</th>
             </tr>
         </thead>
         <tbody>
            {monthTasks.length === 0 ? <tr><td colSpan="4" className="text-center p-6 text-slate-500 font-medium">Нет задач в этом месяце</td></tr> : null}
            {monthTasks.map(task => {
                const platform = platforms.find(p => p.id === task.platformId);
                const taskKpis = task.kpiIds?.map(id => kpis.find(k => k.id === id)).filter(Boolean) || [];
                return (
                  <tr key={task.id} className="break-inside-avoid">
                    <td className="border border-slate-200 p-3 align-top font-medium text-slate-800">{task.date.split('-').reverse().join('.')}</td>
                    <td className="border border-slate-200 p-3 align-top">
                      <div className="font-semibold text-[11px] uppercase text-red-600 mb-1.5">{platform?.name}</div>
                      <div className="text-xs font-medium text-slate-700">{taskKpis.map(k=>k.title).join(', ')}</div>
                    </td>
                    <td className="border border-slate-200 p-3 align-top">
                      <div className="font-semibold text-slate-900 mb-1.5">{task.title}</div>
                      <div className="text-xs text-slate-600 font-medium whitespace-pre-wrap break-words">{renderTextWithLinks(task.text)}</div>
                    </td>
                    <td className="border border-slate-200 p-3 align-top text-center font-semibold text-xs">
                      {task.status === 'completed' ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Готово</span> : <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded">В плане</span>}
                    </td>
                  </tr>
                )
            })}
         </tbody>
      </table>
    </div>
  );
}