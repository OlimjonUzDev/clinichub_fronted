import { useState } from 'react';
import Sidebar from './Sidebar';
import { useLang } from '../context/LangContext';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { lang, setLang, t } = useLang();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-sm text-gray-500 truncate">
            {t('header.app_url')}:{' '}
            <span className="text-indigo-500 font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:underline" tabIndex={0} role="button">
              clinichub.admin.local
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
              <button
                onClick={() => setLang('uz')}
                aria-pressed={lang === 'uz'}
                className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset ${
                  lang === 'uz'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                O'zbek
              </button>
              <button
                onClick={() => setLang('ru')}
                aria-pressed={lang === 'ru'}
                className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset ${
                  lang === 'ru'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Русский
              </button>
            </div>

          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
