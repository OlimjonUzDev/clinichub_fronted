import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Clock, Check, X, CheckCheck, Video, MessageCircle, Loader2, CalendarX } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, idOf } from '../lib/useLookup';
import { jitsiUrlFor } from '../lib/videoCall';
import { LoadingState, EmptyState, WarningState, ErrorState } from '../components/ui/StateMessage';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { statusBadgeCls } from '../lib/statusBadge';

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const actionIconBtnCls = "w-7 h-7 flex items-center justify-center rounded border transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  // `acting` — { id, status } shaklida: qaysi tashrifning qaysi amali hozir
  // bajarilayotganini aniq bilish uchun (bir nechta tugma bo'lgani sabab shart).
  const [acting, setActing] = useState(null);
  const [rowErrors, setRowErrors] = useState({});
  // { id, status: 'cancelled' | 'completed' } — ikkalasi ham geri qaytarib
  // bo'lmaydigan amal, shuning uchun ikkalasi ham tasdiqlashni talab qiladi.
  const [confirmTarget, setConfirmTarget] = useState(null);
  const { token, doctor } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  const load = () => {
    fetchAll('/appointments/appointment/', token)
      .then((data) => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, [token]);

  // Backend endi status'ni to'g'ridan-to'g'ri PATCH qilishga ruxsat bermaydi (xavfsizlik
  // uchun read-only qilingan) — o'rniga rolga qarab tekshiriladigan alohida action
  // endpoint'lar bor: /confirm/, /complete/, /cancel/. Shularga mos POST yuboramiz.
  const ACTION_ENDPOINTS = { confirmed: 'confirm', completed: 'complete', cancelled: 'cancel' };

  const updateStatus = async (id, status) => {
    setRowErrors((prev) => ({ ...prev, [id]: '' }));
    setActing({ id, status });
    try {
      const action = ACTION_ENDPOINTS[status];
      const res = await api.post(`/appointments/appointment/${id}/${action}/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setRowErrors((prev) => ({ ...prev, [id]: firstError || t('appointments.action_error') }));
    } finally {
      setActing(null);
    }
  };

  const requestAction = (id, status) => setConfirmTarget({ id, status });
  const confirmAction = () => {
    const target = confirmTarget;
    setConfirmTarget(null);
    updateStatus(target.id, target.status);
  };

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .slice()
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('appointments.title')}</h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 ${
              filter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {f === 'all' ? t('appointments.filter_all') : t(`status.${f}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : !doctor ? (
        <WarningState text={t('auth.no_doctor_profile')} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarX} text={t('appointments.no_data')} />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const patientName = resolveName(a.patient, patients, lang);
            const start = new Date(a.start_time);
            const rowActing = acting?.id === a.id;
            const isActing = (status) => rowActing && acting.status === status;
            return (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <User size={14} className="text-indigo-500" />
                      {patientName || `#${idOf(a.patient)}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Clock size={12} /> {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{t(`consultation.${a.consultation_type}`)}
                    </div>
                    {a.notes && <div className="text-xs text-gray-500 mt-1">{a.notes}</div>}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={statusBadgeCls(a.status)}>
                      {t(`status.${a.status}`)}
                    </span>
                    {rowActing && (
                      <span className="flex items-center gap-1 text-xs text-indigo-600" role="status">
                        <Loader2 size={12} className="animate-spin" /> {t('appointments.acting')}
                      </span>
                    )}
                    {a.status === 'confirmed' && (
                      <a
                        href={jitsiUrlFor(a)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('appointments.join_call')}
                        aria-label={t('appointments.join_call')}
                        className={`${actionIconBtnCls} border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 focus-visible:ring-green-400`}
                      >
                        <Video size={13} />
                      </a>
                    )}
                    {a.status === 'confirmed' && (
                      <Link
                        to={`/chat/${a.id}`}
                        title={t('appointments.open_chat')}
                        aria-label={t('appointments.open_chat')}
                        className={`${actionIconBtnCls} border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 focus-visible:ring-indigo-300`}
                      >
                        <MessageCircle size={13} />
                      </Link>
                    )}
                    {a.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(a.id, 'confirmed')}
                        disabled={rowActing}
                        title={t('appointments.confirm')}
                        aria-label={t('appointments.confirm')}
                        className={`${actionIconBtnCls} border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 focus-visible:ring-blue-400`}
                      >
                        {isActing('confirmed') ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                    )}
                    {a.status === 'confirmed' && (
                      <button
                        onClick={() => requestAction(a.id, 'completed')}
                        disabled={rowActing}
                        title={t('appointments.complete')}
                        aria-label={t('appointments.complete')}
                        className={`${actionIconBtnCls} border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 focus-visible:ring-green-400`}
                      >
                        {isActing('completed') ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                      </button>
                    )}
                    {(a.status === 'pending' || a.status === 'confirmed') && (
                      <button
                        onClick={() => requestAction(a.id, 'cancelled')}
                        disabled={rowActing}
                        title={t('appointments.cancel')}
                        aria-label={t('appointments.cancel')}
                        className={`${actionIconBtnCls} border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-300 focus-visible:ring-red-400`}
                      >
                        {isActing('cancelled') ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                      </button>
                    )}
                  </div>
                </div>
                {rowErrors[a.id] && <ErrorState text={rowErrors[a.id]} compact className="mt-3" />}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmTarget != null}
        title={confirmTarget?.status === 'cancelled' ? t('appointments.cancel_title') : t('appointments.complete_title')}
        message={confirmTarget?.status === 'cancelled' ? t('appointments.cancel_confirm') : t('appointments.complete_confirm')}
        confirmLabel={confirmTarget?.status === 'cancelled' ? t('appointments.cancel') : t('appointments.complete')}
        cancelLabel={t('common.cancel')}
        danger={confirmTarget?.status === 'cancelled'}
        onConfirm={confirmAction}
        onCancel={() => setConfirmTarget(null)}
      />
    </Layout>
  );
}
