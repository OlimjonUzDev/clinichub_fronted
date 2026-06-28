import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";
const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition appearance-none";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default function DoctorCreate() {
  const [specialities, setSpecialities] = useState([]);
  const [rankTypes, setRankTypes] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user: '',
    speciality: '',
    rank_type: '',
    clinic: '',
    name_uz: '',
    name_ru: '',
    bio_uz: '',
    bio_ru: '',
    telegram_username: '',
    experience_years: 0,
    avatar: '',
    gender: 'erkak',
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    api.get('/catalog/specialities/', { headers: h }).then(r => setSpecialities(r.data)).catch(() => {});
    api.get('/catalog/ranktyp/', { headers: h }).then(r => setRankTypes(r.data)).catch(() => {});
    api.get('/clinics/clinics/', { headers: h }).then(r => setClinics(r.data)).catch(() => {});
    api.get('/users/', { headers: h }).then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Changed:', name, value);
    setForm(prev => ({ ...prev, [name]: name === 'experience_years' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', form);
    setLoading(true);
    try {
      await api.post('/doctors/doctor/', form, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/doctors');
    } catch {
      alert(t('doctor_create.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.doctors_staff'), path: '/doctors' },
            { label: t('menu.doctors'), path: '/doctors' },
            { label: t('common.create') },
          ]}
          title={t('doctor_create.title')}
        />

        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <Field label={t('doctor_create.user')} required>
              <select name="user" value={form.user} onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username || u.email}</option>
                ))}
              </select>
            </Field>

            <Field label={t('doctor_create.name_uz')} required>
              <input name="name_uz" value={form.name_uz} onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.name_ru')} required>
              <input name="name_ru" value={form.name_ru} onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.gender')} required>
              <select name="gender" value={form.gender} onChange={handleChange} className={selectCls}>
                <option value="erkak">{t('doctor_create.male')}</option>
                <option value="ayol">{t('doctor_create.female')}</option>
              </select>
            </Field>

            <Field label={t('doctor_create.clinic')} required>
              <select name="clinic" value={form.clinic} onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.clinic_type?.name_uz || c.phone_number}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.speciality')} required>
              <select name="speciality" value={form.speciality} onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {specialities.map(s => <option key={s.id} value={s.id}>{s.name_uz}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.rank')} required>
              <select name="rank_type" value={form.rank_type} onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {rankTypes.map(r => <option key={r.id} value={r.id}>{r.name_uz}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.experience_years')}>
              <input
                type="number"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                min={0}
                className={inputCls}
              />
            </Field>

            <Field label={t('doctor_create.telegram')}>
              <input
                name="telegram_username"
                value={form.telegram_username}
                onChange={handleChange}
                placeholder="@username"
                className={inputCls}
              />
            </Field>

            <Field label={t('doctor_create.bio_uz')}>
              <textarea name="bio_uz" value={form.bio_uz} onChange={handleChange} rows={4} className={`${inputCls} resize-none`} />
            </Field>

            <Field label={t('doctor_create.bio_ru')}>
              <textarea name="bio_ru" value={form.bio_ru} onChange={handleChange} rows={4} className={`${inputCls} resize-none`} />
            </Field>

            <Field label={t('doctor_create.avatar')}>
              <input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {loading ? t('doctor_create.saving') : t('doctor_create.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
