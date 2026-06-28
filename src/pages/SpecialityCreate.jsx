import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default function SpecialityCreate() {
  const [form, setForm] = useState({ name_uz: '', name_ru: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/catalog/specialities/', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/specialities');
    } catch {
      alert(t('doctor_create.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.doctors_staff'), path: '/specialities' },
            { label: t('menu.specialities'), path: '/specialities' },
            { label: t('common.create') },
          ]}
          title={t('specialities.title') + ' — ' + t('common.create')}
        />

        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <Field label={t('doctor_create.name_uz')} required>
              <input
                name="name_uz"
                value={form.name_uz}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </Field>

            <Field label={t('doctor_create.name_ru')} required>
              <input
                name="name_ru"
                value={form.name_ru}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </Field>

            <Field label={t('doctor_create.bio_uz')}>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/specialities')}
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
