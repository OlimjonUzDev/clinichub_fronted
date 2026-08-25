import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Butun portalda "yuklanmoqda" / "ma'lumot yo'q" / "xatolik" holatlari uchun
// yagona vizual uslub — sahifalar orasidagi ko'rinishni izchillashtiradi
// (oddiy kulrang matn o'rniga ikonka + matn, kerak bo'lsa CTA bilan).

export function LoadingState({ text, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-12 text-gray-400 ${className}`}>
      <Loader2 size={20} className="animate-spin text-indigo-400" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, bare = false, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        bare ? 'py-8' : 'py-14 px-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60'
      } ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-indigo-400" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ text, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center py-10 px-6 rounded-2xl border border-red-100 bg-red-50/60 ${className}`}>
      <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <AlertCircle size={20} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-red-600">{text}</p>
      {action}
    </div>
  );
}

export function RetryButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition"
    >
      <RefreshCw size={13} /> {label}
    </button>
  );
}
