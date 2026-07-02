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

export default function AppointmentCreateModal({ onClose, onCreated }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({
    patient: '', doctor: '', clinic: '', consultation_type: 'in_person', start_time: '', end_time: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    api.get('/patients/patient/', { headers }).then(r => setPatients(r.data)).catch(() => {});
    api.get('/doctors/doctor/', { headers }).then(r => setDoctors(r.data)).catch(() => {});
    api.get('/clinics/clinics/', { headers }).then(r => setClinics(r.data)).catch(() => {});
  }, []);

  const nameOf = (o) => (lang === 'ru' ? (o.name_ru || o.name_uz) : o.name_uz) || `#${o.id}`;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/appointments/appointment/', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onCreated(res.data);
    } catch {
      alert(t('appt.create_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('appt.create_title')}
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
        <Field label={t('appt.patient')} required>
          <select name="patient" value={form.patient} onChange={handleChange} className={selectCls} required>
            <option value="">{t('appt.select_patient')}</option>
            {patients.map(p => <option key={p.id} value={p.id}>{nameOf(p)}</option>)}
          </select>
        </Field>

        <Field label={t('appt.doctor')} required>
          <select name="doctor" value={form.doctor} onChange={handleChange} className={selectCls} required>
            <option value="">{t('appt.select_doctor')}</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{nameOf(d)}</option>)}
          </select>
        </Field>

        <Field label={t('gs.clinic')} required>
          <select name="clinic" value={form.clinic} onChange={handleChange} className={selectCls} required>
            <option value="">{t('appt.select_clinic')}</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.clinic_type?.name_uz || `#${c.id}`}</option>)}
          </select>
        </Field>

        <Field label={t('appt.consultation_type')} required>
          <select name="consultation_type" value={form.consultation_type} onChange={handleChange} className={selectCls} required>
            {CONSULTATION_TYPES.map(v => <option key={v} value={v}>{t(`consult.${v}`)}</option>)}
          </select>
        </Field>

        <Field label={t('appt.start_time')} required>
          <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} className={inputCls} required />
        </Field>

        <Field label={t('appt.end_time')} required>
          <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} className={inputCls} required />
        </Field>

        <Field label={t('appt.notes')}>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputCls} />
        </Field>
      </div>
    </Modal>
  );
}
