import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, Users, User as UserIcon } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, idOf } from '../lib/useLookup';
import { LoadingState, EmptyState, WarningState } from '../components/ui/StateMessage';
import { statusBadgeCls } from '../lib/statusBadge';

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
  const [loading, setLoading] = useState(true);
  const { token, doctor, doctorLoading } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  useEffect(() => {
    fetchAll('/appointments/appointment/', token)
      .then((data) => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const todayStr = new Date().toISOString().slice(0, 10);
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
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.title')}</h1>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label={t('dashboard.today')} value={today.length} icon={CalendarDays} color="bg-teal-500" />
            <StatCard label={t('dashboard.upcoming')} value={upcomingCount} icon={Clock} color="bg-amber-500" />
            <StatCard label={t('dashboard.completed_month')} value={completedThisMonth} icon={CheckCircle2} color="bg-green-500" />
            <StatCard label={t('dashboard.total_patients')} value={totalPatients} icon={Users} color="bg-purple-500" />
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
                      <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
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
