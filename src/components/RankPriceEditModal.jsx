import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';
import { CONSULTATION_TYPES } from '../lib/consultationTypes';

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

export default function RankPriceEditModal({ item, onClose, onSaved }) {
  const [rankTypes, setRankTypes] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({
    rank_type: item.rank_type?.id ?? '',
    clinic: item.clinic?.id ?? '',
    consultation_type: item.consultation_type || 'in_person',
    price: item.price ?? '',
    currency: item.currency || 'UZS',
    duration_min: item.duration_min ?? 30,
    is_active: item.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    api.get('/catalog/ranktyp/', { headers }).then(r => setRankTypes(r.data)).catch(() => {});
    api.get('/clinics/clinics/', { headers }).then(r => setClinics(r.data)).catch(() => {});
  }, []);

  const nameOf = (c) => lang === 'ru' ? (c.name_ru || c.name_uz) : c.name_uz;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/catalog/rankprice/${item.id}/`, form, { headers });
      onSaved(res.data);
    } catch {
      alert(t('rank_prices.edit_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('rank_prices.edit_title')}
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
        <Field label={t('rank_prices.rank_type')} required>
          <select name="rank_type" value={form.rank_type} onChange={handleChange} className={selectCls}>
            <option value="">{t('doctor_create.select')}</option>
            {rankTypes.map(r => <option key={r.id} value={r.id}>{nameOf(r)}</option>)}
          </select>
        </Field>
        <Field label={t('rank_prices.clinic')} required>
          <select name="clinic" value={form.clinic} onChange={handleChange} className={selectCls}>
            <option value="">{t('doctor_create.select')}</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.clinic_type?.name_uz || c.phone_number}</option>)}
          </select>
        </Field>
        <Field label={t('appt.consultation_type')} required>
          <select name="consultation_type" value={form.consultation_type} onChange={handleChange} className={selectCls}>
            {CONSULTATION_TYPES.map(v => <option key={v} value={v}>{t(`consult.${v}`)}</option>)}
          </select>
        </Field>
        <Field label={t('rank_prices.price')} required>
          <input type="number" min={0} step="0.01" name="price" value={form.price} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('rank_price_create.currency')}>
          <input name="currency" value={form.currency} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('rank_prices.duration')} required>
          <input type="number" min={1} name="duration_min" value={form.duration_min} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('rank_prices.status')}>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400" />
            {t('common.active')}
          </label>
        </Field>
      </div>
    </Modal>
  );
}
