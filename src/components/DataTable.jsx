import { Search, Inbox, Loader2 } from 'lucide-react';
import { useLang } from '../context/LangContext';

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
      />
    </div>
  );
}

// Small, icon-only action button used inside table rows (view/edit/delete/etc.)
// Centralised here so every page gets the same visual style, a real
// accessible name (aria-label), and a visible focus state for keyboard users.
const ICON_BUTTON_VARIANTS = {
  default: 'hover:border-indigo-400 hover:text-indigo-600 focus-visible:border-indigo-400 focus-visible:text-indigo-600 focus-visible:ring-indigo-200',
  edit: 'hover:border-blue-400 hover:text-blue-600 focus-visible:border-blue-400 focus-visible:text-blue-600 focus-visible:ring-blue-200',
  danger: 'hover:border-red-400 hover:text-red-500 focus-visible:border-red-400 focus-visible:text-red-500 focus-visible:ring-red-200',
  success: 'hover:border-green-400 hover:text-green-600 focus-visible:border-green-400 focus-visible:text-green-600 focus-visible:ring-green-200',
};

export function IconButton({ icon: Icon, onClick, label, variant = 'default', disabled = false, size = 13 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed ${ICON_BUTTON_VARIANTS[variant] || ICON_BUTTON_VARIANTS.default}`}
    >
      <Icon size={size} />
    </button>
  );
}

// Consistent inline loading indicator (spinner + text) used wherever data is
// being fetched, instead of ad-hoc plain-text "Loading..." strings.
export function LoadingState({ label, className = 'py-12' }) {
  const { t } = useLang();
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-gray-400 ${className}`}>
      <Loader2 size={22} className="animate-spin text-indigo-400" />
      <span className="text-sm">{label || t('common.loading')}</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    active:    'text-green-600 border-green-500 bg-green-50',
    inactive:  'text-gray-500 border-gray-400 bg-gray-50',
    pending:   'text-yellow-600 border-yellow-500 bg-yellow-50',
    confirmed: 'text-blue-600 border-blue-400 bg-blue-50',
    completed: 'text-green-600 border-green-500 bg-green-50',
    cancelled: 'text-red-500 border-red-400 bg-red-50',
    paid:      'text-green-600 border-green-500 bg-green-50',
    refunded:  'text-purple-600 border-purple-400 bg-purple-50',
    draft:     'text-gray-500 border-gray-400 bg-gray-50',
  };
  const key = (status || '').toLowerCase();
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${colors[key] || colors.inactive}`}>
      {status}
    </span>
  );
}

export function Pagination({ page, total, pageSize = 10, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center justify-end gap-1 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        &lt;
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={`Page ${p}`}
          className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300
            ${p === page
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  );
}

export function EmptyState({ message = 'No data', icon: Icon = Inbox, action }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Icon size={22} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <p className="text-sm">{message}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

export function Table({ columns, children, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col, i) => {
                const isObj = col && typeof col === 'object';
                const label = isObj ? col.label : col;
                const align = isObj && col.align === 'right' ? 'text-right' : 'text-left';
                const pad = isObj && col.className ? col.className : 'px-5';
                return (
                  <th
                    key={i}
                    className={`${pad} py-3 ${align} text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap`}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={100}>
                  <LoadingState />
                </td>
              </tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
