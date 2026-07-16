import { useEffect, useState } from 'react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

const WEEKDAYS = [
  { value: 0, uz: 'Dushanba', ru: 'Понедельник' },
  { value: 1, uz: 'Seshanba', ru: 'Вторник' },
  { value: 2, uz: 'Chorshanba', ru: 'Среда' },
  { value: 3, uz: 'Payshanba', ru: 'Четверг' },
  { value: 4, uz: 'Juma', ru: 'Пятница' },
  { value: 5, uz: 'Shanba', ru: 'Суббота' },
  { value: 6, uz: 'Yakshanba', ru: 'Воскресенье' },
];

const timeCls = "border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition disabled:bg-gray-50 disabled:text-gray-300";

export default function DoctorScheduleModal({ doctorId, onClose }) {
  const [days, setDays] = useState(
    WEEKDAYS.map(w => ({ ...w, id: null, enabled: false, start_time: '09:00', end_time: '18:00' }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll('/doctors/doctorschedule/', token)
      .then(data => {
        const mine = data.filter(s => s.doctor === doctorId);
        setDays(prev => prev.map(d => {
          const found = mine.find(s => s.weekday === d.value);
          return found
            ? { ...d, id: found.id, enabled: true, start_time: found.start_time.slice(0, 5), end_time: found.end_time.slice(0, 5) }
            : d;
        }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [doctorId]);

  const toggleDay = (value) =>
    setDays(prev => prev.map(d => d.value === value ? { ...d, enabled: !d.enabled } : d));

  const updateTime = (value, field, time) =>
    setDays(prev => prev.map(d => d.value === value ? { ...d, [field]: time } : d));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(days.map(d => {
        if (d.enabled) {
          const payload = { doctor: doctorId, weekday: d.value, start_time: d.start_time, end_time: d.end_time };
          return d.id
            ? api.put(`/doctors/doctorschedule/${d.id}/`, payload, { headers })
            : api.post('/doctors/doctorschedule/', payload, { headers });
        }
        if (d.id) return api.delete(`/doctors/doctorschedule/${d.id}/`, { headers });
        return Promise.resolve();
      }));
      onClose();
    } catch {
      alert(t('doctor_schedule.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('doctor_schedule.title')}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {saving ? t('doctor_edit.saving') : t('common.save')}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="text-sm text-gray-400 py-4">{t('common.loading')}</div>
      ) : (
        <div className="space-y-3">
          {days.map(d => (
            <div key={d.value} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-32 shrink-0 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={() => toggleDay(d.value)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                />
                {lang === 'ru' ? d.ru : d.uz}
              </label>
              <input
                type="time"
                value={d.start_time}
                disabled={!d.enabled}
                onChange={e => updateTime(d.value, 'start_time', e.target.value)}
                className={timeCls}
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="time"
                value={d.end_time}
                disabled={!d.enabled}
                onChange={e => updateTime(d.value, 'end_time', e.target.value)}
                className={timeCls}
              />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
