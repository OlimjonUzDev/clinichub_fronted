import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const inputCls  = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";
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

export default function ClinicCreate() {
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [clinicTypes, setClinicTypes]       = useState([]);
  const [form, setForm] = useState({
    medical_center: '',
    clinic_type:    '',
    phone_number:   '',
    status:         'active',
  });
  const [loading, setLoading] = useState(false);
  const { token }   = useAuth();
  const { t, lang } = useLang();
  const navigate    = useNavigate();

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    api.get('/clinics/medicalcenter/', { headers: h }).then(r => setMedicalCenters(r.data)).catch(() => {});
    api.get('/clinics/clinictype/',    { headers: h }).then(r => setClinicTypes(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clinics/clinics/', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/clinics');
    } catch {
      alert(t('clinic_create.error'));
    } finally {
      setLoading(false);
    }
  };

  const centerName = (c) => lang === 'ru' ? (c.name_ru || c.name_uz) : c.name_uz;
  const typeName   = (c) => lang === 'ru' ? (c.name_ru || c.name_uz) : c.name_uz;

  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.clinics_centers') },
            { label: t('menu.clinics'), path: '/clinics' },
            { label: t('common.create') },
          ]}
          title={t('clinic_create.title')}
        />

        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Medical Center */}
            <Field label={t('clinic_create.medical_center')} required>
              <select
                name="medical_center"
                value={form.medical_center}
                onChange={handleChange}
                className={selectCls}
                required
              >
                <option value="">{t('clinic_create.select')}</option>
                {medicalCenters.map(mc => (
                  <option key={mc.id} value={mc.id}>{centerName(mc)}</option>
                ))}
              </select>
            </Field>

            {/* Clinic Type */}
            <Field label={t('clinic_create.clinic_type')} required>
              <select
                name="clinic_type"
                value={form.clinic_type}
                onChange={handleChange}
                className={selectCls}
                required
              >
                <option value="">{t('clinic_create.select')}</option>
                {clinicTypes.map(ct => (
                  <option key={ct.id} value={ct.id}>{typeName(ct)}</option>
                ))}
              </select>
            </Field>

            {/* Phone */}
            <Field label={t('clinic_create.phone')} required>
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+998 90 123 45 67"
                className={inputCls}
                required
              />
            </Field>

            {/* Status */}
            <Field label={t('clinic_create.status')}>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </Field>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/clinics')}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? t('clinic_create.saving') : t('common.save')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}
