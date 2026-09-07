import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { CalendarDays, Clock, CheckCircle2, Users, User as UserIcon, Star } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, idOf } from '../lib/useLookup';
import { LoadingState, EmptyState, WarningState, ErrorState } from '../components/ui/StateMessage';
import { statusBadgeCls } from '../lib/statusBadge';

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#9ca3af'];
const RATING_COLOR = '#f59e0b';

// `toISOString()` UTC vaqtga aylantiradi — Toshkentda (UTC+5) tunda (00:00-05:00)
// bu kunni bir kun oldinga suradi. `toLocaleDateString('en-CA')` esa YYYY-MM-DD
// formatini mahalliy vaqt bo'yicha beradi, shu sabab "bugun" hisoblashda shu ishlatiladi.
const localDateStr = (date = new Date()) => date.toLocaleDateString('en-CA');

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

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token, doctor, doctorLoading } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  useEffect(() => {
    Promise.all([
      fetchAll('/appointments/appointment/', token),
      fetchAll('/appointments/rating/', token),
    ])
      .then(([appts, rts]) => {
        setAppointments(appts);
        setRatings(rts);
        setError(false);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [token]);

  const todayStr = localDateStr();
  const today = useMemo(
    () => appointments
      .filter((a) => a.start_time?.slice(0, 10) === todayStr)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time)),
    [appointments, todayStr],
  );

  const upcomingCount = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return appointments.filter((a) => {
      if (a.status !== 'completed') return false;
      const d = new Date(a.start_time);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [appointments]);

  const totalPatients = useMemo(
    () => new Set(appointments.map((a) => idOf(a.patient))).size,
    [appointments],
  );

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

  const ratingData = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((score) => ({ name: `${score} ★`, count: 0 }));
    ratings.forEach((r) => {
      const bucket = buckets.find((b) => b.name === `${r.score} ★`);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }, [ratings]);

  const avgRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
    : null;

  if (doctorLoading) {
    return <Layout><LoadingState text={t('common.loading')} /></Layout>;
  }

  if (!doctor) {
    return (
      <Layout>
        <WarningState text={t('auth.no_doctor_profile')} />
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('dashboard.title')}</h1>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('dashboard.load_error')} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label={t('dashboard.today')} value={today.length} icon={CalendarDays} color="bg-indigo-500" />
            <StatCard label={t('dashboard.upcoming')} value={upcomingCount} icon={Clock} color="bg-amber-500" />
            <StatCard label={t('dashboard.completed_month')} value={completedThisMonth} icon={CheckCircle2} color="bg-green-500" />
            <StatCard label={t('dashboard.total_patients')} value={totalPatients} icon={Users} color="bg-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.status_breakdown')}</h2>
              {appointments.length === 0 ? (
                <EmptyState icon={CalendarDays} text={t('dashboard.no_today')} bordered={false} compact />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.monthly_trend')}</h2>
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

          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.rating_breakdown')}</h2>
              {avgRating && (
                <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 rounded-lg px-2.5 py-1">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-800">{avgRating}</span>
                  <span className="text-xs text-gray-400">({ratings.length})</span>
                </div>
              )}
            </div>
            {ratings.length === 0 ? (
              <EmptyState icon={Star} text={t('dashboard.no_ratings')} bordered={false} compact />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ratingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Bar dataKey="count" fill={RATING_COLOR} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.today_list')}</h2>
            {today.length === 0 ? (
              <EmptyState icon={CalendarDays} text={t('dashboard.no_today')} bordered={false} compact />
            ) : (
              <div className="space-y-2">
                {today.map((a) => {
                  const start = new Date(a.start_time);
                  const patientName = resolveName(a.patient, patients, lang);
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <UserIcon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{patientName || `#${idOf(a.patient)}`}</div>
                        <div className="text-xs text-gray-400">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {t(`consultation.${a.consultation_type}`)}</div>
                      </div>
                      <span className={statusBadgeCls(a.status)}>{t(`status.${a.status}`)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
