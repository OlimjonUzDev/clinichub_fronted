import { useNavigate } from 'react-router-dom';
import { ChevronRight, SquarePlus } from 'lucide-react';

export default function PageHeader({ breadcrumbs = [], title, createPath, createLabel = 'Create' }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={13} />}
                <span className={b.path ? 'cursor-pointer hover:text-indigo-500 transition-colors' : ''}
                  onClick={() => b.path && navigate(b.path)}>
                  {b.label}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {createPath && (
        <button
          onClick={() => navigate(createPath)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <SquarePlus size={16} />
          {createLabel}
        </button>
      )}
    </div>
  );
}
