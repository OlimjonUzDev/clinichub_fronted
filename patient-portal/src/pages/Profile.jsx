import { useEffect, useState } from 'react';
import { User, Phone, Fingerprint, MapPin, Calendar, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { phoneError } from '../lib/validators';

const EMPTY_FORM = {
  name_uz: '', name_ru: '', gender: 'erkak', birth_date: '',
  phone_number: '', national_id: '', address: '',
};

const inputCls = "w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

function Field({ icon: Icon, label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Profile() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const { token } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    api.get('/patients/patient/me/', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setForm({ ...EMPTY_FORM, ...res.data });
        setExists(true);
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'phone_number') {
      setFieldErrors((prev) => ({ ...prev, phone_number: phoneError(value, t) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneErr = phoneError(form.phone_number, t);
    setFieldErrors({ phone_number: phoneErr });
    if (phoneErr) return;

    setSaving(true);
    setMessage({ type: '', text: '' });
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = exists
        ? await api.patch('/patients/patient/me/', form, { headers })
        : await api.post('/patients/patient/me/', form, { headers });
      setForm({ ...EMPTY_FORM, ...res.data });
      setExists(true);
      setMessage({ type: 'success', text: t('profile.saved') });
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setMessage({ type: 'error', text: firstError || t('profile.save_error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><p className="text-sm text-gray-400">{t('common.loading')}</p></Layout>;
  }

  const initials = (form.name_uz || '?').trim().slice(0, 1).toUpperCase();

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('profile.title')}</h1>
          <p className="text-sm text-gray-400">{form.name_uz || '—'}</p>
        </div>
      </div>

      {!exists && (
        <div className="mb-4 text-amber-700 text-sm bg-amber-50 border border-amber-100 rounded-lg py-2.5 px-4">
          {t('profile.create_hint')}
        </div>
      )}
      {message.text && (
        <div className={`mb-4 text-sm rounded-lg py-2.5 px-4 border ${message.type === 'success' ? 'text-green-700 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-xl space-y-5">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('profile.section_personal')}</div>
          <div className="grid grid-cols-2 gap-4">
            <Field icon={User} label={t('profile.name_uz')}>
              <input type="text" required value={form.name_uz} onChange={handleChange('name_uz')} className={inputCls} />
            </Field>
            <Field icon={User} label={t('profile.name_ru')}>
              <input type="text" required value={form.name_ru} onChange={handleChange('name_ru')} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field icon={Users} label={t('profile.gender')}>
              <select value={form.gender} onChange={handleChange('gender')} className={`${inputCls} appearance-none bg-white`}>
                <option value="erkak">{t('profile.gender.erkak')}</option>
                <option value="ayol">{t('profile.gender.ayol')}</option>
              </select>
            </Field>
            <Field icon={Calendar} label={t('profile.birth_date')}>
              <input type="date" required value={form.birth_date} onChange={handleChange('birth_date')} className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('profile.section_contact')}</div>
          <div className="space-y-4">
            <Field icon={Phone} label={t('profile.phone')} error={fieldErrors.phone_number}>
              <input type="text" value={form.phone_number} onChange={handleChange('phone_number')} placeholder="+998901234567" className={inputCls} />
            </Field>
            <Field icon={Fingerprint} label={t('profile.national_id')}>
              <input type="text" value={form.national_id} onChange={handleChange('national_id')} className={inputCls} />
            </Field>
            <Field icon={MapPin} label={t('profile.address')}>
              <input type="text" value={form.address} onChange={handleChange('address')} className={inputCls} />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-indigo-600 text-white text-sm font-medium py-2.5 px-8 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
      </form>
    </Layout>
  );
}
