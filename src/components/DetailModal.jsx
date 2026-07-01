import { useLang } from '../context/LangContext';
import Modal from './Modal';

export default function DetailModal({ title, rows, onClose }) {
  const { t } = useLang();
  return (
    <Modal
      onClose={onClose}
      title={title}
      footer={
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          {t('common.close')}
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {rows.filter(Boolean).map(r => (
          <div key={r.label} className={r.full ? 'sm:col-span-2' : ''}>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{r.label}</div>
            <div className="text-sm text-gray-800">
              {r.value === 0 || r.value ? r.value : '—'}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
