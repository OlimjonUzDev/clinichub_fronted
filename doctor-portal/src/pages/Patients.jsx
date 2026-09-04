import { useEffect, useMemo, useState } from 'react';
import { Search, User, Phone, Calendar } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveRef, idOf } from '../lib/useLookup';
import { LoadingState, EmptyState, WarningState, ErrorState } from '../components/ui/StateMessage';

export default function Patients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const { token, doctor } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  useEffect(() => {
    fetchAll('/appointments/appointment/', token)
      .then((data) => { setAppointments(data); setError(false); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [token]);

  const myPatients = useMemo(() => {
    const byId = new Map();
    appointments.forEach((a) => {
      const pid = idOf(a.patient);
      const entry = byId.get(pid) || { id: pid, visits: 0, lastVisit: null };
      entry.visits += 1;
      const start = new Date(a.start_time);
      if (!entry.lastVisit || start > entry.lastVisit) entry.lastVisit = start;
      byId.set(pid, entry);
    });
    return Array.from(byId.values())
      .map((entry) => ({ ...entry, patient: resolveRef(entry.id, patients) }))
      .sort((a, b) => (b.lastVisit ?? 0) - (a.lastVisit ?? 0));
  }, [appointments, patients]);

  const filtered = myPatients.filter((p) => {
    if (!search) return true;
    const name = p.patient ? `${p.patient.name_uz || ''} ${p.patient.name_ru || ''}`.toLowerCase() : '';
    return name.includes(search.toLowerCase());
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('patients.title')}</h1>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('patients.title')}
          aria-label={t('patients.title')}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('patients.load_error')} />
      ) : !doctor ? (
        <WarningState text={t('auth.no_doctor_profile')} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={User} text={t('patients.no_data')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(({ id, visits, patient }) => {
            const name = patient ? (lang === 'ru' ? (patient.name_ru || patient.name_uz) : patient.name_uz) : `#${id}`;
            return (
              <div key={id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
                    <div className="text-xs text-gray-400">{visits} {t('patients.visits')}</div>
                  </div>
                </div>
                {patient?.phone_number && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={12} /> <span className="text-gray-400">{t('patients.phone')}:</span> {patient.phone_number}
                  </div>
                )}
                {patient?.birth_date && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} /> <span className="text-gray-400">{t('patients.birth_date')}:</span> {patient.birth_date}
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
