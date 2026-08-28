import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { CalendarDays, Clock, CheckCircle2, FileText, Stethoscope } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { LoadingState, EmptyState, ErrorState, RetryButton } from '../components/StateBlock';
import { useLookup, resolveName } from '../lib/useLookup';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#9ca3af'];

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`rounded-xl p-5 text-white ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium opacity-80">{label}</span>
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        <Icon size={18} />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold truncate">{value}</div>
  </div>
);

export default function Analytics() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const doctors = useLookup('/doctors/doctor/', token);

  useEffect(() => {
    Promise.all([
      fetchAll('/appointments/appointment/', token),
      fetchAll('/prescriptions/prescription/', token),
    ])
      .then(([appts, pres]) => {
        setAppointments(appts);
        setPrescriptions(pres);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [token, retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    appointments.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status] += 1; });
    return counts;
  }, [appointments]);

  const statusData = [
    { name: t('status.pending'), value: statusCounts.pending },
    { name: t('status.confirmed'), value: statusCounts.confirmed },
    { name: t('status.completed'), value: statusCounts.completed },
    { name: t('status.cancelled'), value: statusCounts.cancelled },
  ];

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { month: 'short' }),
        count: 0,
      };
    });
    appointments.forEach((a) => {
      const d = new Date(a.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.count += 1;
    });
    return months;
  }, [appointments, lang]);

  const topDoctors = useMemo(() => {
    const counts = {};
    appointments.forEach((a) => {
      const id = typeof a.doctor === 'object' ? a.doctor.id : a.doctor;
      counts[id] = (counts[id] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count, name: resolveName(Number(id), doctors, lang) || `#${id}` }));
  }, [appointments, doctors, lang]);

  const upcomingCount = statusCounts.pending + statusCounts.confirmed;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('analytics.title')}</h1>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('common.load_error')} action={<RetryButton onClick={handleRetry} label={t('common.retry')} />} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label={t('analytics.total_appointments')} value={appointments.length} icon={CalendarDays} color="bg-indigo-500" />
            <StatCard label={t('analytics.upcoming')} value={upcomingCount} icon={Clock} color="bg-amber-500" />
            <StatCard label={t('analytics.completed')} value={statusCounts.completed} icon={CheckCircle2} color="bg-green-500" />
            <StatCard label={t('analytics.prescriptions')} value={prescriptions.length} icon={FileText} color="bg-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('analytics.status_breakdown')}</h2>
              {appointments.length === 0 ? (
                <EmptyState icon={CalendarDays} title={t('appointments.no_data')} bare />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('analytics.monthly_trend')}</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('analytics.top_doctors')}</h2>
            {topDoctors.length === 0 ? (
              <EmptyState icon={Stethoscope} title={t('appointments.no_data')} bare />
            ) : (
              <div className="space-y-2">
                {topDoctors.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Stethoscope size={14} />
                    </div>
                    <div className="flex-1 text-sm text-gray-700">{d.name}</div>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
