import { Search, Inbox } from 'lucide-react';
import { useState } from 'react';

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-72">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
      />
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
        className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40"
      >
        &lt;
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors
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
        className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  );
}

export function EmptyState({ message = 'No data' }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Inbox size={40} strokeWidth={1} />
          <p className="mt-2 text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function Table({ columns, children, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={100} className="text-center py-12 text-sm text-gray-400">
                Loading...
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}
