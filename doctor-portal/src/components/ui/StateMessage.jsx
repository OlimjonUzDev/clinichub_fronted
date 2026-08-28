import { Loader2, Inbox, AlertTriangle, AlertCircle } from 'lucide-react';

// Butun portal bo'ylab bir xil ko'rinishdagi "yuklanmoqda" / "ma'lumot yo'q" /
// "xatolik" / "ogohlantirish" holatlari — sahifalar orasida izchillik uchun.

export function LoadingState({ text, compact = false, className = '' }) {
  const padCls = compact ? 'py-4' : 'py-10';
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${padCls} text-gray-400 ${className}`}>
      <Loader2 size={22} className="animate-spin text-indigo-500" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, text, bordered = true, compact = false, className = '' }) {
  const borderCls = bordered ? 'bg-white border border-dashed border-gray-200 rounded-xl' : '';
  const padCls = compact ? 'py-4' : 'py-10';
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${padCls} px-4 text-center ${borderCls} ${className}`}>
      <Icon size={26} className="text-gray-300" />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}

export function ErrorState({ text, compact = false, className = '' }) {
  const padCls = compact ? 'py-2 px-3' : 'py-3 px-4';
  return (
    <div
      role="alert"
      className={`flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl ${padCls} ${className}`}
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span>{text}</span>
    </div>
  );
}

export function WarningState({ text, compact = false, className = '' }) {
  const padCls = compact ? 'py-2 px-3' : 'py-3 px-4';
  return (
    <div
      role="status"
      className={`flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl ${padCls} ${className}`}
    >
      <AlertCircle size={16} className="shrink-0" />
      <span>{text}</span>
    </div>
  );
}
