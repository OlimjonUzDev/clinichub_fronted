import { useState } from 'react';
import Sidebar from './Sidebar';
import { useLang } from '../context/LangContext';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { lang, setLang } = useLang();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-end shrink-0">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            <button
              onClick={() => setLang('uz')}
              className={`px-3 py-1.5 transition-colors ${lang === 'uz' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              O'zbek
            </button>
            <button
              onClick={() => setLang('ru')}
              className={`px-3 py-1.5 transition-colors ${lang === 'ru' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Русский
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
