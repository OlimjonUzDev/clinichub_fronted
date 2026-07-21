import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Calendar, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const LogoIcon = () => (
  <svg width="44" height="48" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L3 12V30C3 39.4 11.5 46 22 48C32.5 46 41 39.4 41 30V12L22 2Z" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5"/>
    <rect x="14" y="14" width="16" height="16" rx="3" fill="#4F46E5" opacity="0.15"/>
    <path d="M22 16V26M17 21H27" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 32C14 32 16.5 36 22 36C27.5 36 30 32 30 32" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="30" cy="34" r="3" fill="#4F46E5"/>
  </svg>
);

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useLang();

  const MENU = [
    { label: t('nav.home'), path: '/', icon: Search },
    { label: t('nav.appointments'), path: '/appointments', icon: Calendar },
    { label: t('nav.profile'), path: '/profile', icon: User },
  ];

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="flex flex-col bg-white border-r border-gray-100 transition-all duration-300 min-h-screen shrink-0"
      style={{ width: collapsed ? 64 : 214 }}
    >
      <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-100">
        <div className="shrink-0 flex items-center justify-center" style={{ width: 44 }}>
          <LogoIcon />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-indigo-600 leading-tight">HomeCare+</div>
            <div className="text-xs text-gray-400 tracking-widest uppercase">Care at Home</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-2">
        {MENU.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ''}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                ${active ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
            >
              <Icon size={17} className={active ? 'text-indigo-500' : 'text-gray-400'} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-2">
        <button
          onClick={handleLogout}
          title={collapsed ? t('nav.logout') : ''}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={17} />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>

      <div className="p-2 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </div>
  );
}
