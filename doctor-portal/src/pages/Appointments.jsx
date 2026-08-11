import { useEffect, useState } from 'react';
import { User, Clock, Check, X, CheckCheck, Video } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, idOf } from '../lib/useLookup';
import { jitsiUrlFor } from '../lib/videoCall';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actingId, setActingId] = useState(null);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  const load = () => {
    fetchAll('/appointments/appointment/', token)
      .then((data) => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, [token]);

  const updateStatus = async (id, status) => {
    if (status === 'cancelled' && !confirm(t('appointments.cancel_confirm'))) return;
    setActingId(id);
    try {
      const res = await api.patch(`/appointments/appointment/${id}/`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      alert(firstError || t('appointments.action_error'));
    } finally {
      setActingId(null);
    }
  };

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .slice()
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('appointments.title')}</h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
            }`}
          >
            {f === 'all' ? t('appointments.filter_all') : t(`status.${f}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400">{t('appointments.no_data')}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const patientName = resolveName(a.patient, patients, lang);
            const start = new Date(a.start_time);
            const acting = actingId === a.id;
            return (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <User size={14} className="text-teal-500" />
                      {patientName || `#${idOf(a.patient)}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Clock size={12} /> {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{t(`consultation.${a.consultation_type}`)}
                    </div>
                    {a.notes && <div className="text-xs text-gray-500 mt-1">{a.notes}</div>}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-500'}`}>
                      {t(`status.${a.status}`)}
                    </span>
                    {a.status === 'confirmed' && (
                      <a
                        href={jitsiUrlFor(a)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('appointments.join_call')}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 transition"
                      >
                        <Video size={13} />
                      </a>
                    )}
                    {a.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(a.id, 'confirmed')}
                        disabled={acting}
                        title={t('appointments.confirm')}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    {a.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(a.id, 'completed')}
                        disabled={acting}
                        title={t('appointments.complete')}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 transition disabled:opacity-50"
                      >
                        <CheckCheck size={13} />
                      </button>
                    )}
                    {(a.status === 'pending' || a.status === 'confirmed') && (
                      <button
                        onClick={() => updateStatus(a.id, 'cancelled')}
                        disabled={acting}
                        title={t('appointments.cancel')}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
