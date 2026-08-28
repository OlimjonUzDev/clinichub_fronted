import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Stethoscope, Building2, User } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { LoadingState, EmptyState, ErrorState, RetryButton } from '../components/StateBlock';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [clinic, setClinic] = useState('');
  const { token } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const specialities = useLookup('/catalog/specialities/', token);
  const clinics = useLookup('/clinics/clinics/', token);

  useEffect(() => {
    fetchAll('/doctors/doctor/', token)
      .then((data) => { setDoctors(data.filter((d) => d.is_active !== false)); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [token, retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  const filtered = doctors.filter((d) => {
    const matchesSearch = (d.name_uz || '').toLowerCase().includes(search.toLowerCase())
      || (d.name_ru || '').toLowerCase().includes(search.toLowerCase());
    const matchesSpeciality = !speciality || String(resolveRef(d.speciality, specialities)?.id ?? d.speciality) === speciality;
    const matchesClinic = !clinic || String(resolveRef(d.clinic, clinics)?.id ?? d.clinic) === clinic;
    return matchesSearch && matchesSpeciality && matchesClinic;
  });

  const hasFilters = Boolean(search || speciality || clinic);
  const clearFilters = () => { setSearch(''); setSpeciality(''); setClinic(''); };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('home.title')}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('home.search')}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">{t('home.all_specialities')}</option>
          {Object.values(specialities).map((s) => (
            <option key={s.id} value={s.id}>{lang === 'ru' ? s.name_ru : s.name_uz}</option>
          ))}
        </select>
        <select
          value={clinic}
          onChange={(e) => setClinic(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">{t('home.all_clinics')}</option>
          {Object.values(clinics).map((c) => (
            <option key={c.id} value={c.id}>{c.name || c.phone_number || `#${c.id}`}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('common.load_error')} action={<RetryButton onClick={handleRetry} label={t('common.retry')} />} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('home.no_data')}
          description={hasFilters ? t('home.no_data_hint') : undefined}
          action={hasFilters && (
            <button onClick={clearFilters} className="text-xs font-medium text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded">
              {t('home.clear_filters')}
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                  {doc.avatar
                    ? <img src={doc.avatar} alt="" className="w-full h-full object-cover" />
                    : <User size={20} className="text-indigo-400" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{lang === 'ru' ? (doc.name_ru || doc.name_uz) : doc.name_uz}</div>
                  <div className="text-xs text-gray-400">{doc.experience_years ?? 0} {t('home.experience')}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Stethoscope size={13} /> {resolveName(doc.speciality, specialities, lang) || '—'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Building2 size={13} /> {resolveRef(doc.clinic, clinics)?.name || '—'}
              </div>

              <button
                onClick={() => navigate(`/doctor/${doc.id}`)}
                className="mt-1 w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 transition"
              >
                {t('home.view_profile')}
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
