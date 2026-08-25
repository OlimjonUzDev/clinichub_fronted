import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function Modal({ onClose, title, children, footer }) {
  const { t } = useLang();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="modal-title" className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
