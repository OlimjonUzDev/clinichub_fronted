import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Users, CalendarDays, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const StatCard = ({ label, value, icon: Icon, color, onClick }) => (
  <div onClick={onClick} className={`rounded-xl p-5 text-white cursor-pointer hover:opacity-90 transition ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium opacity-80">{label}</span>
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        <Icon size={18} />
      </div>
    </div>
    <div className="text-3xl font-bold">{value ?? '...'}</div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { token, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data))
      .catch(() => { logout(); navigate('/login'); });
  }, []);

  const appointmentData = [
    { name: t('dashboard.upcoming'), value: stats?.upcoming_appointments || 0 },
    { name: t('dashboard.ongoing'), value: stats?.ongoing_appointments || 0 },
    { name: t('dashboard.completed'), value: stats?.completed_appointments || 18 },
    { name: t('dashboard.cancelled'), value: stats?.cancelled_appointments || 4 },
  ];

  const monthlyData = [
    { name: 'Yan', appointments: 12 },
    { name: 'Fev', appointments: 19 },
    { name: 'Mar', appointments: 15 },
    { name: 'Apr', appointments: 28 },
    { name: 'May', appointments: 22 },
    { name: 'Iyn', appointments: 31 },
  ];

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('dashboard.title')}</h1>

        {/* Organisation Overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {t('dashboard.org_overview')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label={t('dashboard.total_doctors')} value={stats?.total_doctors} icon={Users} color="bg-indigo-500" onClick={() => navigate('/doctors')} />
            <StatCard label={t('dashboard.total_patients')} value={stats?.total_patients} icon={Activity} color="bg-purple-500" onClick={() => navigate('/patients')} />
            <StatCard label={t('dashboard.appointments')} value={stats?.total_appointments} icon={CalendarDays} color="bg-pink-500" onClick={() => navigate('/appointments')} />
            <StatCard label={t('dashboard.total_clinics')} value={stats?.total_clinics ?? 1} icon={TrendingUp} color="bg-blue-500" onClick={() => navigate('/clinics')} />
          </div>
        </div>

        {/* Finance & Payments */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('dashboard.finance')}
            </h2>
            <button onClick={() => navigate('/invoices')} className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
              {t('dashboard.open_transactions')} <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-teal-500 text-white rounded-xl p-4">
              <div className="text-xs opacity-80 mb-1">{t('dashboard.total_revenue')}</div>
              <div className="text-xl font-bold">7,380.00 <span className="text-sm">UZS</span></div>
            </div>
            <div className="bg-gray-800 text-white rounded-xl p-4">
              <div className="text-xs opacity-80 mb-1">{t('dashboard.pending')}</div>
              <div className="text-xl font-bold">0.00 <span className="text-sm">UZS</span></div>
            </div>
            <div className="bg-green-500 text-white rounded-xl p-4">
              <div className="text-xs opacity-80 mb-1">{t('dashboard.appointments')}</div>
              <div className="text-xl font-bold">6,380.00 <span className="text-sm">UZS</span></div>
            </div>
            <div className="bg-amber-400 text-white rounded-xl p-4">
              <div className="text-xs opacity-80 mb-1">{t('dashboard.refunded')}</div>
              <div className="text-xl font-bold">1,200.00 <span className="text-sm">UZS</span></div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.appt_status')}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={appointmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {appointmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.appt_breakdown')}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments by Doctor */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.appt_by_doctor')}</h2>
            <div className="flex gap-1 text-xs text-gray-500">
              {[t('dashboard.today'), t('dashboard.this_week'), t('dashboard.this_month'), t('dashboard.year_to_date')].map((label, i) => (
                <button key={i} className={`px-2 py-1 rounded transition-colors ${i === 2 ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:bg-gray-100'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.top_doctors')}</h2>
              <button onClick={() => navigate('/doctors')} className="text-xs text-indigo-500 hover:underline">
                {t('dashboard.see_all')} &gt;
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">DR</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Dr Rashed</div>
                <div className="text-xs text-gray-400">Specialist</div>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">28</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.top_patients')}</h2>
              <button onClick={() => navigate('/patients')} className="text-xs text-indigo-500 hover:underline">
                {t('dashboard.see_all')} &gt;
              </button>
            </div>
            <div className="space-y-2">
              {['Saeed T.', 'Test User', 'Saudi Patient', 'Saeed S.', 'Saeed N.'].map((name, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {name[0]}
                  </div>
                  <div className="flex-1 text-sm text-gray-700">{name}</div>
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{5 - i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
