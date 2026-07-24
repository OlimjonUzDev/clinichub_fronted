import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Clock, X, CalendarClock } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName } from '../lib/useLookup';

const fieldCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const doctors = useLookup('/doctors/doctor/', token);

  const load = () => {
    fetchAll('/appointments/appointment/', token)
      .then((data) => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, [token]);

  const handleCancel = async (id) => {
    if (!confirm(t('appointments.cancel_confirm'))) return;
    setCancellingId(id);
    try {
      const res = await api.patch(`/appointments/appointment/${id}/`, { status: 'cancelled' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch {
      alert(t('appointments.cancel_error'));
    } finally {
      setCancellingId(null);
    }
  };

  const openReschedule = (a) => {
    const start = new Date(a.start_time);
    setReschedulingId(a.id);
    setRescheduleDate(start.toISOString().slice(0, 10));
    setRescheduleTime(start.toTimeString().slice(0, 5));
    setRescheduleError('');
  };

  const handleReschedule = async (a) => {
    if (!rescheduleDate || !rescheduleTime) return;
    const duration = new Date(a.end_time) - new Date(a.start_time);
    const newStart = new Date(`${rescheduleDate}T${rescheduleTime}`);
    const newEnd = new Date(newStart.getTime() + duration);

    setRescheduleSaving(true);
    setRescheduleError('');
    try {
      const res = await api.patch(`/appointments/appointment/${a.id}/`, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments((prev) => prev.map((item) => (item.id === a.id ? res.data : item)));
      setReschedulingId(null);
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setRescheduleError(firstError || t('appointments.reschedule_error'));
    } finally {
      setRescheduleSaving(false);
    }
  };

  const sorted = appointments.slice().sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('appointments.title')}</h1>

      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-400">{t('appointments.no_data')}</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((a) => {
            const doctorName = resolveName(a.doctor, doctors, lang);
            const start = new Date(a.start_time);
            const canCancel = a.status === 'pending' || a.status === 'confirmed';
            return (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Stethoscope size={14} className="text-indigo-500" />
                      <Link to={`/doctor/${typeof a.doctor === 'object' ? a.doctor.id : a.doctor}`} className="hover:underline">
                        {doctorName || `#${a.doctor}`}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Clock size={12} /> {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{t(`consultation.${a.consultation_type}`)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-500'}`}>
                      {t(`status.${a.status}`)}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => (reschedulingId === a.id ? setReschedulingId(null) : openReschedule(a))}
                        title={t('appointments.reschedule')}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition"
                      >
                        <CalendarClock size={13} />
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        disabled={cancellingId === a.id}
                        title={t('appointments.cancel')}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {reschedulingId === a.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-end gap-2 flex-wrap">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('doctor.date')}</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className={fieldCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('doctor.start_time')}</label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className={fieldCls}
                      />
                    </div>
                    <button
                      onClick={() => handleReschedule(a)}
                      disabled={rescheduleSaving}
                      className="bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                      {rescheduleSaving ? t('appointments.rescheduling') : t('appointments.reschedule_confirm')}
                    </button>
                    {rescheduleError && <p className="text-red-500 text-xs w-full">{rescheduleError}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
