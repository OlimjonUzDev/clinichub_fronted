import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Clock, X } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName } from '../lib/useLookup';

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
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
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
            );
          })}
        </div>
      )}
    </Layout>
  );
}
