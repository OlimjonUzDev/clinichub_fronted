import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";
const selectCls = `${inputCls} appearance-none`;

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default function PatientCreate() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user: '',
    name_uz: '',
    name_ru: '',
    gender: 'erkak',
    birth_date: '',
    phone_number: '',
    national_id: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUsers(r.data.filter(u => u.role === 'patient')))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/patients/patient/', form, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/patients');
    } catch {
      alert(t('patient_create.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.patients_encounters'), path: '/patients' },
            { label: t('menu.patients'), path: '/patients' },
            { label: t('common.create') },
          ]}
          title={t('patient_create.title')}
        />

        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <Field label={t('doctor_create.user')} required>
              <select name="user" value={form.user} onChange={handleChange} className={selectCls} required>
                <option value="">{t('doctor_create.select')}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username || u.email}</option>)}
              </select>
            </Field>

            <Field label={t('doctor_create.name_uz')} required>
              <input name="name_uz" value={form.name_uz} onChange={handleChange} className={inputCls} required />
            </Field>

            <Field label={t('doctor_create.name_ru')} required>
              <input name="name_ru" value={form.name_ru} onChange={handleChange} className={inputCls} required />
            </Field>

            <Field label={t('doctor_create.gender')} required>
              <select name="gender" value={form.gender} onChange={handleChange} className={selectCls}>
                <option value="erkak">{t('doctor_create.male')}</option>
                <option value="ayol">{t('doctor_create.female')}</option>
              </select>
            </Field>

            <Field label={t('patient_create.birth_date')} required>
              <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className={inputCls} required />
            </Field>

            <Field label={t('patients.phone')}>
              <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+998 90 123 45 67" className={inputCls} />
            </Field>

            <Field label={t('patients.national_id')}>
              <input name="national_id" value={form.national_id} onChange={handleChange} className={inputCls} />
            </Field>

            <Field label={t('patient_create.address')}>
              <input name="address" value={form.address} onChange={handleChange} className={inputCls} />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? t('doctor_create.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
