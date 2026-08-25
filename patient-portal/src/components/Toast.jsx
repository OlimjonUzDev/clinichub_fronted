import { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

// native alert() o'rniga qayta ishlatiluvchi, bloklamaydigan xato bildirishnomasi.
// Chaqiruvchi sahifa `message`ni local state'da saqlaydi, funksionallik o'zgarmaydi.
export default function Toast({ message, onClose, closeLabel, duration = 5000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-5 right-5 z-50 flex items-start gap-2 bg-white border border-red-100 shadow-lg rounded-xl py-3 px-4 text-sm text-red-600 max-w-xs"
    >
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onClose} aria-label={closeLabel} className="text-red-300 hover:text-red-500 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
