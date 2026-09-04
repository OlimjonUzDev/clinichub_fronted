import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Clock, X, CalendarClock, Video, MessageCircle, CalendarX2 } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { LoadingState, EmptyState, ErrorState, RetryButton } from '../components/StateBlock';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import TimeSlotPicker from '../components/TimeSlotPicker';
import { useLookup, resolveName } from '../lib/useLookup';
import { jitsiUrlFor } from '../lib/videoCall';
import { statusBadgeCls } from '../lib/statusBadge';
import { toLocalDateStr } from '../lib/dateUtils';

const iconBtnCls = "w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [toast, setToast] = useState('');
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
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(load, [token]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    load();
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      // Backend endi status'ni to'g'ridan-to'g'ri PATCH qilishga ruxsat bermaydi —
      // bekor qilish alohida, rolga qarab tekshiriladigan /cancel/ action orqali amalga oshadi.
      const res = await api.post(`/appointments/appointment/${id}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch {
      setToast(t('appointments.cancel_error'));
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  const openReschedule = (a) => {
    const start = new Date(a.start_time);
    setReschedulingId(a.id);
    setRescheduleDate(toLocalDateStr(start));
    setRescheduleTime(start.toTimeString().slice(0, 5));
    setRescheduleError('');
  };

  const durationMinutesOf = (a) => Math.round((new Date(a.end_time) - new Date(a.start_time)) / 60000);
  const idOf = (val) => (val && typeof val === 'object' ? val.id : val);

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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('appointments.title')}</h1>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('common.load_error')} action={<RetryButton onClick={handleRetry} label={t('common.retry')} />} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title={t('appointments.no_data')}
          action={(
            <Link to="/" className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2 transition">
              {t('appointments.browse_doctors')}
            </Link>
          )}
        />
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
                    <span className={statusBadgeCls(a.status)}>
                      {t(`status.${a.status}`)}
                    </span>
                    {a.status === 'confirmed' && (
                      <a
                        href={jitsiUrlFor(a)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('appointments.join_call')}
                        aria-label={t('appointments.join_call')}
                        className={`${iconBtnCls} hover:border-green-400 hover:text-green-600`}
                      >
                        <Video size={13} />
                      </a>
                    )}
                    {a.status === 'confirmed' && (
                      <Link
                        to={`/chat/${a.id}`}
                        title={t('appointments.open_chat')}
                        aria-label={t('appointments.open_chat')}
                        className={`${iconBtnCls} hover:border-indigo-400 hover:text-indigo-600`}
                      >
                        <MessageCircle size={13} />
                      </Link>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => (reschedulingId === a.id ? setReschedulingId(null) : openReschedule(a))}
                        title={t('appointments.reschedule')}
                        aria-label={t('appointments.reschedule')}
                        className={`${iconBtnCls} hover:border-indigo-400 hover:text-indigo-600`}
                      >
                        <CalendarClock size={13} />
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setConfirmCancelId(a.id)}
                        disabled={cancellingId === a.id}
                        title={t('appointments.cancel')}
                        aria-label={t('appointments.cancel')}
                        className={`${iconBtnCls} border-red-200 text-red-500 bg-red-50 hover:border-red-400 hover:text-red-600`}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {reschedulingId === a.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <TimeSlotPicker
                      doctorId={idOf(a.doctor)}
                      token={token}
                      durationMinutes={durationMinutesOf(a)}
                      date={rescheduleDate}
                      onDateChange={setRescheduleDate}
                      startTime={rescheduleTime}
                      onStartTimeChange={setRescheduleTime}
                      excludeInterval={{ start: a.start_time, end: a.end_time }}
                    />
                    <button
                      onClick={() => handleReschedule(a)}
                      disabled={rescheduleSaving || !rescheduleDate || !rescheduleTime}
                      className="mt-3 bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 transition-colors disabled:opacity-60"
                    >
                      {rescheduleSaving ? t('appointments.rescheduling') : t('appointments.reschedule_confirm')}
                    </button>
                    {rescheduleError && <p className="text-red-600 text-xs w-full mt-2">{rescheduleError}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmCancelId !== null}
        title={t('appointments.cancel_confirm_title')}
        message={t('appointments.cancel_confirm')}
        confirmLabel={t('appointments.cancel_confirm_yes')}
        cancelLabel={t('appointments.cancel_confirm_no')}
        onConfirm={() => { const id = confirmCancelId; setConfirmCancelId(null); handleCancel(id); }}
        onCancel={() => setConfirmCancelId(null)}
      />
      <Toast message={toast} onClose={() => setToast('')} closeLabel={t('common.close')} />
    </Layout>
  );
}
