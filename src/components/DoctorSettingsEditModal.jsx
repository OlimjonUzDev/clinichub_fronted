import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function DoctorSettingsEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    bank_name: item.bank_name || '',
    iban: item.iban || '',
    revenue_percentage: item.revenue_percentage ?? '1.00',
    auto_payout: item.auto_payout ?? false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();
  const headers = { Authorization: `Bearer ${token}` };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api.patch(`/doctors/doctor/${item.id}/`, form, { headers });
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.revenue_percentage?.[0] || t('doctor_settings.edit_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('doctor_settings.edit_title')}
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? t('doctor_create.saving') : t('common.save')}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label={t('doctor_settings.bank_name')}>
          <input name="bank_name" value={form.bank_name} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('doctor_settings.iban')}>
          <input name="iban" value={form.iban} onChange={handleChange} maxLength={34} className={inputCls} />
        </Field>
        <Field label={t('doctor_settings.revenue')} hint={t('doctor_settings.revenue_hint')} error={error}>
          <input type="number" name="revenue_percentage" min={0} max={1} step="0.01" value={form.revenue_percentage} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('doctor_settings.auto_payout')}>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="auto_payout" checked={form.auto_payout} onChange={handleChange} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400" />
            {t('common.active')}
          </label>
        </Field>
      </div>
    </Modal>
  );
}
