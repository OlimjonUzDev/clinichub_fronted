import { useEffect, useState } from 'react';
import { ClipboardList, User, Pill, Calendar, Plus, X } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, idOf } from '../lib/useLookup';

const fieldCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition";

const EMPTY_ITEM = { medication_name_uz: '', medication_name_ru: '', dosage: '', frequency_uz: '', duration_days: '' };

function PrescriptionForm({ appointment, doctorId, patientName, onSaved, t }) {
  const { token } = useAuth();
  const [diagnosisUz, setDiagnosisUz] = useState('');
  const [diagnosisRu, setDiagnosisRu] = useState('');
  const [notesUz, setNotesUz] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateItem = (i, field, value) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const completeItems = items
      .filter((it) => it.medication_name_uz && it.dosage && it.frequency_uz && it.duration_days)
      .map((it) => ({ ...it, duration_days: Number(it.duration_days) }));
    if (completeItems.length === 0) {
      setError(t('prescriptions.items_required_error'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/prescriptions/prescription/', {
        appointment: appointment.id,
        doctor: doctorId,
        patient: idOf(appointment.patient),
        diagnosis_uz: diagnosisUz,
        diagnosis_ru: diagnosisRu,
        notes_uz: notesUz,
        items: completeItems,
      }, { headers: { Authorization: `Bearer ${token}` } });
      onSaved(res.data);
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setError(firstError || t('prescriptions.save_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
        <User size={14} className="text-teal-500" /> {patientName || `#${idOf(appointment.patient)}`}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Calendar size={12} /> {new Date(appointment.start_time).toLocaleDateString()}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('prescriptions.diagnosis_uz')}</label>
          <input required value={diagnosisUz} onChange={(e) => setDiagnosisUz(e.target.value)} className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('prescriptions.diagnosis_ru')}</label>
          <input value={diagnosisRu} onChange={(e) => setDiagnosisRu(e.target.value)} className={fieldCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{t('prescriptions.notes_uz')}</label>
        <textarea rows={2} value={notesUz} onChange={(e) => setNotesUz(e.target.value)} className={fieldCls} />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase">
            <Pill size={13} /> {t('prescriptions.medications')}
          </div>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
            <Plus size={13} /> {t('prescriptions.add_medication')}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                <input required placeholder={t('prescriptions.medication_name_uz')} value={item.medication_name_uz} onChange={(e) => updateItem(i, 'medication_name_uz', e.target.value)} className={fieldCls} />
                <input placeholder={t('prescriptions.medication_name_ru')} value={item.medication_name_ru} onChange={(e) => updateItem(i, 'medication_name_ru', e.target.value)} className={fieldCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input required placeholder={t('prescriptions.dosage')} value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} className={fieldCls} />
                <input required placeholder={t('prescriptions.frequency_uz')} value={item.frequency_uz} onChange={(e) => updateItem(i, 'frequency_uz', e.target.value)} className={fieldCls} />
                <input required type="number" min="1" placeholder={t('prescriptions.duration_days')} value={item.duration_days} onChange={(e) => updateItem(i, 'duration_days', e.target.value)} className={fieldCls} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-teal-600 text-white text-sm font-medium py-2 px-5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
      >
        {saving ? t('prescriptions.saving') : t('prescriptions.save')}
      </button>
    </form>
  );
}

export default function Prescriptions() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, doctor } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  const load = () => {
    Promise.all([
      fetchAll('/appointments/appointment/', token),
      fetchAll('/prescriptions/prescription/', token),
    ]).then(([apps, pres]) => {
      setAppointments(apps);
      setPrescriptions(pres);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, [token]);

  const prescribedAppointmentIds = new Set(prescriptions.map((p) => idOf(p.appointment)));
  const eligible = appointments
    .filter((a) => a.status === 'completed' && !prescribedAppointmentIds.has(a.id))
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  const sortedPrescriptions = prescriptions.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleSaved = (newPrescription) => {
    setPrescriptions((prev) => [...prev, newPrescription]);
  };

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('prescriptions.title')}</h1>

      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : !doctor ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl py-3 px-4">{t('auth.no_doctor_profile')}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('prescriptions.eligible_title')}</h2>
            {eligible.length === 0 ? (
              <p className="text-sm text-gray-400">{t('prescriptions.no_eligible')}</p>
            ) : (
              <div className="space-y-3">
                {eligible.map((a) => (
                  <PrescriptionForm
                    key={a.id}
                    appointment={a}
                    doctorId={doctor.id}
                    patientName={resolveName(a.patient, patients, lang)}
                    onSaved={handleSaved}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('prescriptions.issued_title')}</h2>
            {sortedPrescriptions.length === 0 ? (
              <p className="text-sm text-gray-400">{t('prescriptions.no_data')}</p>
            ) : (
              <div className="space-y-4">
                {sortedPrescriptions.map((p) => {
                  const patientName = resolveName(p.patient, patients, lang);
                  const diagnosis = lang === 'ru' ? (p.diagnosis_ru || p.diagnosis_uz) : p.diagnosis_uz;
                  return (
                    <div key={p.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                          <User size={14} className="text-teal-500" />
                          {patientName || `#${idOf(p.patient)}`}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={12} /> {fmtDate(p.created_at)}
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-sm text-gray-700 mb-3">
                        <ClipboardList size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase">{t('prescriptions.diagnosis_uz')}</div>
                          <p className="whitespace-pre-line">{diagnosis || '—'}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
                          <Pill size={13} /> {t('prescriptions.medications')}
                        </div>
                        {(!p.items || p.items.length === 0) ? (
                          <p className="text-sm text-gray-400">{t('prescriptions.no_medications')}</p>
                        ) : (
                          <div className="space-y-2">
                            {p.items.map((item) => {
                              const medName = lang === 'ru' ? (item.medication_name_ru || item.medication_name_uz) : item.medication_name_uz;
                              return (
                                <div key={item.id} className="bg-gray-50 rounded-lg px-3.5 py-2.5">
                                  <div className="flex items-center justify-between flex-wrap gap-1">
                                    <span className="text-sm font-medium text-gray-800">{medName}</span>
                                    <span className="text-xs text-gray-500">{item.dosage}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {item.frequency_uz} · {item.duration_days} {t('prescriptions.days')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}
