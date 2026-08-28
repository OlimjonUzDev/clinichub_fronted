import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// native window.confirm() o'rniga qayta ishlatiluvchi styled modal.
// Faqat vizual qatlam — chaqiruvchi sahifa qaror logikasini o'zi boshqaradi
// (onConfirm/onCancel orqali), bu komponent shunchaki tasdiqni so'raydi.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
            <AlertTriangle size={17} />
          </div>
          <div className="min-w-0">
            {title && <h3 id="confirm-dialog-title" className="text-sm font-semibold text-gray-800">{title}</h3>}
            <p id="confirm-dialog-message" className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
              danger ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-400' : 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-300'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
