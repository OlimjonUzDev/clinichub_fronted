import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, ArrowLeft, User as UserIcon } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { StatusBadge } from '../components/DataTable';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';

const Row = ({ label, value }) => (
  <div>
    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-sm text-gray-800">{value || '—'}</div>
  </div>
);

export default function DoctorView() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const users = useLookup('/users/', token);
  const specialities = useLookup('/catalog/specialities/', token);
  const rankTypes = useLookup('/catalog/ranktyp/', token);
  const clinics = useLookup('/clinics/clinics/', token);
  const clinicTypes = useLookup('/clinics/clinictype/', token);
  const clinicLabel = doctor && (() => {
    const clinic = resolveRef(doctor.clinic, clinics);
    const ct = clinic ? resolveRef(clinic.clinic_type, clinicTypes) : null;
    return (ct && resolveName(ct, clinicTypes, lang)) || clinic?.phone_number;
  })();

  useEffect(() => {
    api.get(`/doctors/doctor/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setDoctor(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.doctors_staff'), path: '/doctors' },
            { label: t('menu.doctors'), path: '/doctors' },
            { label: t('doctor_view.title') },
          ]}
          title={doctor ? (doctor.name_uz || doctor.name_ru) : t('doctor_view.title')}
        />

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400">
            {t('common.loading')}
          </div>
        ) : error || !doctor ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400">
            {t('doctor_view.not_found')}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                  {doctor.avatar
                    ? <img src={doctor.avatar} alt="" className="w-full h-full object-cover" />
                    : <UserIcon size={26} className="text-indigo-400" />}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{doctor.name_uz || '—'}</div>
                  <div className="text-sm text-gray-400">{doctor.name_ru}</div>
                  <div className="mt-1.5">
                    <StatusBadge status={doctor.is_active ? 'active' : 'inactive'} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/doctors')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  <ArrowLeft size={14} />
                  {t('doctor_view.back')}
                </button>
                <button
                  onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  <Pencil size={14} />
                  {t('common.edit')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
              <Row label={t('doctors.id')} value={doctor.id} />
              <Row label={t('doctor_create.user')} value={resolveRef(doctor.user, users)?.username || resolveRef(doctor.user, users)?.email} />
              <Row label={t('doctors.gender')} value={doctor.gender === 'ayol' ? t('doctor_create.female') : t('doctor_create.male')} />
              <Row label={t('doctors.speciality')} value={resolveName(doctor.speciality, specialities, lang)} />
              <Row label={t('doctors.rank')} value={resolveName(doctor.rank_type, rankTypes, lang)} />
              <Row label={t('doctor_create.clinic')} value={clinicLabel} />
              <Row label={t('doctors.experience')} value={doctor.experience_years} />
              <Row label={t('doctor_create.telegram')} value={doctor.telegram_username} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
              <Row label={t('doctor_create.bio_uz')} value={doctor.bio_uz} />
              <Row label={t('doctor_create.bio_ru')} value={doctor.bio_ru} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
