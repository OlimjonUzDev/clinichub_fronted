import { useState } from 'react';
import { User, Users, FileText, Award, Image, AtSign, Landmark, CreditCard, Stethoscope, Building2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';
import { LoadingState, WarningState } from '../components/ui/StateMessage';
import Field from '../components/Field';
import { sectionLabelCls } from '../lib/formStyles';

const inputCls = "w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";

const formFromDoctor = (doctor) => ({
  name_uz: doctor.name_uz || '', name_ru: doctor.name_ru || '',
  gender: doctor.gender || 'erkak',
  bio_uz: doctor.bio_uz || '', bio_ru: doctor.bio_ru || '',
  avatar: doctor.avatar || '',
  experience_years: doctor.experience_years ?? 0,
  telegram_username: doctor.telegram_username || '',
  bank_name: doctor.bank_name || '', iban: doctor.iban || '',
});

// Mounted only once `doctor` is loaded (see Profile below), with `key={doctor.id}`
// so a lazy useState initializer can seed the form directly from props -
// no effect needed to sync context data into local editable state.
function ProfileForm({ doctor, token, refreshDoctor, t, lang }) {
  const [form, setForm] = useState(() => formFromDoctor(doctor));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const specialities = useLookup('/catalog/specialities/', token);
  const clinics = useLookup('/clinics/clinics/', token);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch(`/doctors/doctor/${doctor.id}/`, form, { headers: { Authorization: `Bearer ${token}` } });
      refreshDoctor();
      setMessage({ type: 'success', text: t('profile.saved') });
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setMessage({ type: 'error', text: firstError || t('profile.save_error') });
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name_uz || '?').trim().slice(0, 1).toUpperCase();

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold flex items-center justify-center shrink-0 overflow-hidden">
          {form.avatar ? <img src={form.avatar} alt={form.name_uz || t('profile.avatar')} className="w-full h-full object-cover" /> : initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('profile.title')}</h1>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 flex-wrap">
            <Stethoscope size={13} /> {resolveName(doctor.speciality, specialities, lang) || '—'}
            <span>·</span>
            <Building2 size={13} /> {resolveRef(doctor.clinic, clinics)?.name || '—'}
          </p>
        </div>
      </div>

      {message.text && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 text-sm rounded-lg py-2.5 px-4 border ${message.type === 'success' ? 'text-green-700 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 max-w-xl space-y-5">
        <div>
          <div className={`${sectionLabelCls} mb-3`}>{t('profile.section_personal')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={User} label={t('profile.name_uz')} required>
              <input type="text" required value={form.name_uz} onChange={handleChange('name_uz')} className={inputCls} />
            </Field>
            <Field icon={User} label={t('profile.name_ru')} required>
              <input type="text" required value={form.name_ru} onChange={handleChange('name_ru')} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field icon={Users} label={t('profile.gender')}>
              <select value={form.gender} onChange={handleChange('gender')} className={`${inputCls} appearance-none bg-white`}>
                <option value="erkak">{t('profile.gender.erkak')}</option>
                <option value="ayol">{t('profile.gender.ayol')}</option>
              </select>
            </Field>
            <Field icon={Award} label={t('profile.experience_years')}>
              <input type="number" min="0" value={form.experience_years} onChange={handleChange('experience_years')} className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className={`${sectionLabelCls} mb-3`}>{t('profile.section_professional')}</div>
          <div className="space-y-4">
            <Field icon={FileText} label={t('profile.bio_uz')}>
              <textarea rows={3} value={form.bio_uz} onChange={handleChange('bio_uz')} className={`${inputCls} pt-2.5`} />
            </Field>
            <Field icon={FileText} label={t('profile.bio_ru')}>
              <textarea rows={3} value={form.bio_ru} onChange={handleChange('bio_ru')} className={`${inputCls} pt-2.5`} />
            </Field>
            <Field icon={Image} label={t('profile.avatar')}>
              <input type="text" value={form.avatar} onChange={handleChange('avatar')} placeholder="https://..." className={inputCls} />
            </Field>
            <Field icon={AtSign} label={t('profile.telegram')}>
              <input type="text" value={form.telegram_username} onChange={handleChange('telegram_username')} placeholder="@username" className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className={`${sectionLabelCls} mb-3`}>{t('profile.section_payout')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Landmark} label={t('profile.bank_name')}>
              <input type="text" value={form.bank_name} onChange={handleChange('bank_name')} className={inputCls} />
            </Field>
            <Field icon={CreditCard} label={t('profile.iban')}>
              <input type="text" value={form.iban} onChange={handleChange('iban')} className={inputCls} />
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

export default function Profile() {
  const { token, doctor, doctorLoading, refreshDoctor } = useAuth();
  const { t, lang } = useLang();

  if (doctorLoading) {
    return <Layout><LoadingState text={t('common.loading')} /></Layout>;
  }
  if (!doctor) {
    return <Layout><WarningState text={t('auth.no_doctor_profile')} /></Layout>;
  }

  return <ProfileForm key={doctor.id} doctor={doctor} token={token} refreshDoctor={refreshDoctor} t={t} lang={lang} />;
}
