import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ColumnFilter({ options, value, onChange, allLabel = 'All' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <span className="relative inline-block ml-1 align-middle" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${value ? 'text-indigo-500' : 'text-gray-400'} hover:text-indigo-500 transition`}
      >
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-10 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px] max-h-56 overflow-y-auto normal-case font-normal text-left">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${!value ? 'font-semibold text-indigo-600' : 'text-gray-600'}`}
          >
            {allLabel}
          </button>
          {options.map(opt => (
            <button
              type="button"
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${value === opt.value ? 'font-semibold text-indigo-600' : 'text-gray-600'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
