import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

export default function AppointmentDetailModal({ item, onClose, fmtDate, patientName, doctorName }) {
  const [tab, setTab] = useState('info');
  const [prescription, setPrescription] = useState(undefined);
  const { token } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    if (tab !== 'prescription' || prescription !== undefined) return;
    api.get('/prescriptions/prescription/', {
      params: { appointment_id: item.id },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setPrescription(res.data[0] || null))
      .catch(() => setPrescription(null));
  }, [tab]);

  const diagnosis = prescription
    ? (lang === 'ru' ? (prescription.diagnosis_ru || prescription.diagnosis_uz) : prescription.diagnosis_uz)
    : null;

  return (
    <Modal onClose={onClose} title={t('appt.view_title')}
      footer={
        <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
          {t('common.close')}
        </button>
      }
    >
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {['info', 'prescription'].map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {key === 'info' ? t('appt.tab_info') : t('appt.tab_prescription')}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: t('appt.id'), value: item.id },
            { label: t('appt.patient'), value: patientName },
            { label: t('appt.doctor'), value: doctorName },
            { label: t('appt.consultation_type'), value: t(`consult.${item.consultation_type}`) },
            { label: t('appt.start_time'), value: fmtDate(item.start_time) },
            { label: t('appt.end_time'), value: fmtDate(item.end_time) },
            { label: t('appt.status'), value: item.status },
            { label: t('appt.notes'), value: item.notes, full: true },
            item.status === 'cancelled' && { label: t('appt.cancel_reason'), value: item.cancel_reason, full: true },
            item.status === 'cancelled' && { label: t('appt.cancelled_by'), value: item.cancelled_by?.username },
          ].filter(Boolean).map(r => (
            <div key={r.label} className={r.full ? 'sm:col-span-2' : ''}>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{r.label}</div>
              <div className="text-sm text-gray-800 whitespace-pre-line">{r.value === 0 || r.value ? r.value : '—'}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'prescription' && (
        prescription === undefined ? (
          <div className="text-sm text-gray-400 py-8 text-center">...</div>
        ) : prescription === null ? (
          <div className="text-sm text-gray-400 py-8 text-center">{t('appt.prescription_none')}</div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('appt.diagnosis')}</div>
              <div className="text-sm text-gray-800">{diagnosis}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{t('appt.medications')}</div>
              <div className="space-y-2">
                {(prescription.items || []).map(it => (
                  <div key={it.id} className="border border-gray-100 rounded-lg px-3 py-2">
                    <div className="text-sm font-medium text-gray-800">
                      {lang === 'ru' ? (it.medication_name_ru || it.medication_name_uz) : it.medication_name_uz}
                    </div>
                    <div className="text-xs text-gray-500">
                      {it.dosage} · {lang === 'ru' ? (it.frequency_ru || it.frequency_uz) : it.frequency_uz} · {it.duration_days} {t('appt.duration_days')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </Modal>
  );
}
