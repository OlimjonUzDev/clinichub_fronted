import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const inputCls    = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";
const selectCls   = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition appearance-none";
const textareaCls = `${inputCls} resize-none`;

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default function MedicalCenterCreate() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [form, setForm] = useState({
    name_uz: '',
    name_ru: '',
    contact: '',
    email:   '',
    address: '',
    logo:    '',
    website: '',
    status:  'active',
  });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const { token } = useAuth();
  const { t }     = useLang();
  const navigate  = useNavigate();

  useEffect(() => {
    if (!editId) return;
    api.get(`/clinics/medicalcenter/${editId}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const d = res.data;
        setForm({
          name_uz: d.name_uz || '',
          name_ru: d.name_ru || '',
          contact: d.contact || '',
          email:   d.email || '',
          address: d.address || '',
          logo:    d.logo || '',
          website: d.website || '',
          status:  d.status || 'active',
        });
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [editId]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/clinics/medicalcenter/${editId}/`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/clinics/medicalcenter/', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/medical-centers');
    } catch {
      alert(t('mc_create.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.clinics_centers') },
            { label: t('menu.medical_centers'), path: '/medical-centers' },
            { label: editId ? t('common.edit') : t('common.create') },
          ]}
          title={editId ? t('mc_create.edit_title') : t('mc_create.title')}
        />

        {fetching ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-sm text-gray-400">
            {t('common.loading')}
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <Field label={t('mc_create.name_uz')} required>
              <input
                name="name_uz"
                value={form.name_uz}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </Field>

            <Field label={t('mc_create.name_ru')} required>
              <input
                name="name_ru"
                value={form.name_ru}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </Field>

            <Field label={t('mc_create.contact')}>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="+998 90 123 45 67"
                className={inputCls}
              />
            </Field>

            <Field label={t('mc_create.email')}>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="info@klinika.uz"
                className={inputCls}
              />
            </Field>

            <Field label={t('mc_create.address')}>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder={t('mc_create.address_placeholder')}
                className={textareaCls}
              />
            </Field>

            <Field label={t('mc_create.logo')}>
              <input
                name="logo"
                value={form.logo}
                onChange={handleChange}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>

            <Field label={t('mc_create.website')}>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://klinika.uz"
                className={inputCls}
              />
            </Field>

            <Field label={t('mc_create.status')}>
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/medical-centers')}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? t('mc_create.saving') : t('common.save')}
              </button>
            </div>

          </form>
        </div>
        )}
      </div>
    </Layout>
  );
}
