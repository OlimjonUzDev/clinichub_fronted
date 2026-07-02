import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";

const toLocalInput = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AppointmentRescheduleModal({ item, onClose, onRescheduled }) {
  const [startTime, setStartTime] = useState(toLocalInput(item.start_time));
  const [endTime, setEndTime] = useState(toLocalInput(item.end_time));
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/appointments/appointment/${item.id}/`,
        { start_time: startTime, end_time: endTime, status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onRescheduled(res.data);
    } catch {
      alert(t('appt.reschedule_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('appt.reschedule_title')}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('appt.start_time')}</label>
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('appt.end_time')}</label>
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
        </div>
      </div>
    </Modal>
  );
}
