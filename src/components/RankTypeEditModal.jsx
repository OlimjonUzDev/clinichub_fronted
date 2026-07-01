import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from './Modal';

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white transition";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default function RankTypeEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ name_uz: item.name_uz || '', name_ru: item.name_ru || '' });
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { t } = useLang();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/catalog/ranktyp/${item.id}/`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSaved(res.data);
    } catch {
      alert(t('rank_types.edit_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t('rank_types.edit_title')}
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
        <Field label={t('doctor_create.name_uz')} required>
          <input name="name_uz" value={form.name_uz} onChange={handleChange} className={inputCls} />
        </Field>
        <Field label={t('doctor_create.name_ru')} required>
          <input name="name_ru" value={form.name_ru} onChange={handleChange} className={inputCls} />
        </Field>
      </div>
    </Modal>
  );
}
