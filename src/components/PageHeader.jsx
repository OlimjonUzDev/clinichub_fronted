import { useNavigate } from 'react-router-dom';
import { ChevronRight, SquarePlus } from 'lucide-react';

export default function PageHeader({ breadcrumbs = [], title, createPath, createLabel = 'Create', onCreate }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 text-sm text-gray-400 mb-1">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={13} />}
                <span
                  className={b.path ? 'cursor-pointer hover:text-indigo-500 focus-visible:text-indigo-500 focus-visible:outline-none focus-visible:underline rounded transition-colors' : ''}
                  onClick={() => b.path && navigate(b.path)}
                  {...(b.path ? { role: 'link', tabIndex: 0, onKeyDown: (e) => e.key === 'Enter' && navigate(b.path) } : {})}
                >
                  {b.label}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800 break-words">{title}</h1>
      </div>

      {(createPath || onCreate) && (
        <button
          onClick={() => onCreate ? onCreate() : navigate(createPath)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 transition-colors shrink-0"
        >
          <SquarePlus size={16} />
          {createLabel}
        </button>
      )}
    </div>
  );
}
