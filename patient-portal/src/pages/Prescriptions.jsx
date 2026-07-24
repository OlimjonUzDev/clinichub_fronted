import { useEffect, useState } from 'react';
import { ClipboardList, Stethoscope, Pill, Calendar } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName } from '../lib/useLookup';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const doctors = useLookup('/doctors/doctor/', token);

  useEffect(() => {
    fetchAll('/prescriptions/prescription/', token)
      .then((data) => { setPrescriptions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const sorted = prescriptions.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('prescriptions.title')}</h1>

      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-400">{t('prescriptions.no_data')}</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((p) => {
            const doctorName = resolveName(p.doctor, doctors, lang);
            const diagnosis = lang === 'ru' ? (p.diagnosis_ru || p.diagnosis_uz) : p.diagnosis_uz;
            const notes = lang === 'ru' ? (p.notes_ru || p.notes_uz) : p.notes_uz;
            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <Stethoscope size={14} className="text-indigo-500" />
                    {doctorName || `#${p.doctor}`}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} /> {fmtDate(p.created_at)}
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-sm text-gray-700 mb-3">
                  <ClipboardList size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">{t('prescriptions.diagnosis')}</div>
                    <p className="whitespace-pre-line">{diagnosis || '—'}</p>
                  </div>
                </div>

                {notes && (
                  <p className="text-sm text-gray-500 mb-3 whitespace-pre-line">{notes}</p>
                )}

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
                        const frequency = lang === 'ru' ? (item.frequency_ru || item.frequency_uz) : item.frequency_uz;
                        const itemNotes = lang === 'ru' ? (item.notes_ru || item.notes_uz) : item.notes_uz;
                        return (
                          <div key={item.id} className="bg-gray-50 rounded-lg px-3.5 py-2.5">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className="text-sm font-medium text-gray-800">{medName}</span>
                              <span className="text-xs text-gray-500">{item.dosage}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {frequency} · {item.duration_days} {t('prescriptions.days')}
                            </div>
                            {itemNotes && <div className="text-xs text-gray-400 mt-1">{itemNotes}</div>}
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
    </Layout>
  );
}
