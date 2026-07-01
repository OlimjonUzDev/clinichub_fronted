import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

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

export default function ClinicEditModal({ item, onClose, onSaved }) {
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [clinicTypes, setClinicTypes] = useState([]);
  const [form, setForm] = useState({
    medical_center: item.medical_center?.id ?? '',
    clinic_type: item.clinic_type?.id ?? '',
    phone_number: item.phone_number || '',
    status: item.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    api.get('/clinics/medicalcenter/', { headers }).then(r => setMedicalCenters(r.data)).catch(() => {});
    api.get('/clinics/clinictype/', { headers }).then(r => setClinicTypes(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const nameOf = (c) => lang === 'ru' ? (c.name_ru || c.name_uz) : c.name_uz;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/clinics/clinics/${item.id}/`, form, { headers });
      onSaved(res.data);
    } catch {
      alert(t('clinics.edit_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('clinics.edit_title')}
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
        <Field label={t('clinic_create.medical_center')} required>
          <select name="medical_center" value={form.medical_center} onChange={handleChange} className={selectCls}>
            <option value="">{t('clinic_create.select')}</option>
            {medicalCenters.map(mc => <option key={mc.id} value={mc.id}>{nameOf(mc)}</option>)}
          </select>
        </Field>
        <Field label={t('clinic_create.clinic_type')} required>
          <select name="clinic_type" value={form.clinic_type} onChange={handleChange} className={selectCls}>
            <option value="">{t('clinic_create.select')}</option>
            {clinicTypes.map(ct => <option key={ct.id} value={ct.id}>{nameOf(ct)}</option>)}
          </select>
        </Field>
        <Field label={t('clinic_create.phone')} required>
          <input name="phone_number" value={form.phone_number} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('clinic_create.status')}>
          <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}
