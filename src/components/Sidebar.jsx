import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  Rocket, BarChart2, Stethoscope, LayoutGrid, Star,
  Home, Building2, UsersRound, Calendar, DollarSign,
  Plug, Wallet, Settings, LogOut,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  UserSquare, FileText, ShieldCheck, ArrowLeftRight, UserCog,
  Tag, Users, Puzzle, MessageSquare
} from 'lucide-react';

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
    { key: 'getting_started', label: t('menu.getting_started'), path: '/getting-started', icon: Rocket, single: true },
    { key: 'analytics', label: t('menu.analytics'), path: '/dashboard', icon: BarChart2, single: true },
    {
      key: 'doctors_staff', label: t('menu.doctors_staff'), icon: Stethoscope,
      children: [
        { label: t('menu.doctors'), path: '/doctors', icon: UserSquare },
        { label: t('menu.specialities'), path: '/specialities', icon: LayoutGrid },
        { label: t('menu.ratings'), path: '/ratings', icon: Star },
      ]
    },
    {
      key: 'clinics_centers', label: t('menu.clinics_centers'), icon: Home,
      children: [
        { label: t('menu.clinics'), path: '/clinics', icon: Home },
        { label: t('menu.medical_centers'), path: '/medical-centers', icon: Building2 },
      ]
    },
    {
      key: 'patients_encounters', label: t('menu.patients_encounters'), icon: UsersRound,
      children: [
        { label: t('menu.patients'), path: '/patients', icon: UsersRound },
        { label: t('menu.appointments'), path: '/appointments', icon: Calendar },
      ]
    },
    {
      key: 'pricing_ranks', label: t('menu.pricing_ranks'), icon: DollarSign,
      children: [
        { label: t('menu.rank_types'), path: '/rank-types', icon: Tag },
        { label: t('menu.rank_prices'), path: '/rank-prices', icon: DollarSign },
      ]
    },
    {
      key: 'integrations', label: t('menu.integrations'), icon: Plug,
      children: [
        { label: t('menu.apps'), path: '/apps', icon: Puzzle },
        { label: t('menu.messages'), path: '/messages', icon: MessageSquare },
      ]
    },
    {
      key: 'financial', label: t('menu.financial'), icon: Wallet,
      children: [
        { label: t('menu.invoices'), path: '/invoices', icon: FileText },
        { label: t('menu.insurance'), path: '/insurance', icon: ShieldCheck },
        { label: t('menu.doctor_payouts'), path: '/payouts', icon: ArrowLeftRight },
        { label: t('menu.doctors_settings'), path: '/doctor-settings', icon: UserCog },
      ]
    },
    {
      key: 'administration', label: t('menu.administration'), icon: Settings,
      children: [
        { label: t('menu.users'), path: '/users', icon: Users },
      ]
    },
  ];

  const getDefaultOpen = () => {
    const result = {};
    MENU.forEach((item, i) => {
      if (item.children?.some(c => location.pathname.startsWith(c.path))) {
        result[i] = true;
      }
    });
    return result;
  };

  const [openGroups, setOpenGroups] = useState(getDefaultOpen);

  const toggleGroup = (idx) => {
    setOpenGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="flex flex-col bg-white border-r border-gray-100 transition-all duration-300 min-h-screen shrink-0"
      style={{ width: collapsed ? 64 : 214 }}
    >
      {/* Logo */}
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

      {/* Menu */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {MENU.map((item, idx) => {
          if (item.single) {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                  ${active
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
              >
                <Icon size={17} className={active ? 'text-indigo-500' : 'text-gray-400'} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }

          const Icon = item.icon;
          const isOpen = !!openGroups[idx];
          const hasActiveChild = item.children?.some(c => isActive(c.path));

          return (
            <div key={idx}>
              <button
                onClick={() => !collapsed && toggleGroup(idx)}
                title={collapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                  ${hasActiveChild
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <Icon size={17} className={hasActiveChild ? 'text-indigo-500' : 'text-gray-400'} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.children.length > 0 && (
                      isOpen
                        ? <ChevronUp size={13} className="text-gray-400" />
                        : <ChevronDown size={13} className="text-gray-400" />
                    )}
                  </>
                )}
              </button>

              {!collapsed && isOpen && item.children.map((child, ci) => {
                const ChildIcon = child.icon;
                const childActive = isActive(child.path);
                return (
                  <button
                    key={ci}
                    onClick={() => navigate(child.path)}
                    className={`w-full flex items-center gap-3 pl-11 pr-4 py-2 text-sm transition-colors
                      ${childActive
                        ? 'text-indigo-600 bg-indigo-50 font-medium'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                  >
                    <ChildIcon size={14} className={childActive ? 'text-indigo-500' : 'text-gray-400'} />
                    <span>{child.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-2">
        <button
          onClick={handleLogout}
          title={collapsed ? t('menu.logout') : ''}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={17} />
          {!collapsed && <span>{t('menu.logout')}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
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
