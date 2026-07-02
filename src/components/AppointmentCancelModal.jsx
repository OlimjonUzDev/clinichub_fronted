import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

export default function AppointmentCancelModal({ item, onClose, onCancelled }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/appointments/appointment/${item.id}/`,
        { status: 'cancelled', cancel_reason: reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onCancelled(res.data);
    } catch {
      alert(t('appt.cancel_action_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('appt.cancel_title')}
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !reason.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
          >
            {saving ? t('doctor_create.saving') : t('appt.cancel_confirm_btn')}
          </button>
        </>
      }
    >
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {t('appt.cancel_reason')}
      </label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder={t('appt.cancel_reason_ph')}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent bg-white transition"
      />
    </Modal>
  );
}
