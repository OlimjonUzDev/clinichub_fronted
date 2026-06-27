import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
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
  const [form, setForm] = useState({
    user: '', speciality: '', rank_type: '', clinic: '',
    telegram_username: '', bio: '', experience_years: 0,
    gender: '', status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    api.get('/catalog/speciality/', { headers: h }).then(r => setSpecialities(r.data)).catch(() => {});
    api.get('/catalog/ranktyp/', { headers: h }).then(r => setRankTypes(r.data)).catch(() => {});
    api.get('/clinics/clinics/', { headers: h }).then(r => setClinics(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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

            <Field label={t('doctor_create.name_en')} required>
              <input name="name_en" onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.name_ar')} required>
              <input name="name_ar" onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.email')} required>
              <input type="email" name="email" onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.contact')} required>
              <input name="contact_info" onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.gender')} required>
              <select name="gender" onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                <option value="Male">{t('doctor_create.male')}</option>
                <option value="Female">{t('doctor_create.female')}</option>
              </select>
            </Field>

            <Field label={t('doctor_create.clinic')} required>
              <select name="clinic" onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.rank')} required>
              <select name="rank_type" onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {rankTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.speciality')}>
              <select name="speciality" onChange={handleChange} className={selectCls}>
                <option value="">{t('doctor_create.select')}</option>
                {specialities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.subspecialties')}>
              <input name="subspecialties" onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('doctor_create.desc_en')} required>
              <textarea name="bio" onChange={handleChange} rows={4} className={`${inputCls} resize-none`} />
            </Field>

            <Field label={t('doctor_create.desc_ar')} required>
              <textarea name="bio_ar" onChange={handleChange} rows={4} className={`${inputCls} resize-none`} />
            </Field>

            <Field label={t('doctor_create.avatar')}>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center text-gray-400 cursor-pointer hover:border-indigo-300 hover:text-indigo-400 transition">
                <Upload size={28} strokeWidth={1.5} />
                <p className="mt-2 text-sm font-medium">{t('doctor_create.avatar_hint')}</p>
                <p className="text-xs mt-1 text-center">{t('doctor_create.avatar_sub')}</p>
              </div>
            </Field>

            <Field label={t('doctor_create.status')}>
              <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
                <option value="active">{t('doctor_create.active')}</option>
                <option value="inactive">{t('doctor_create.inactive')}</option>
              </select>
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
