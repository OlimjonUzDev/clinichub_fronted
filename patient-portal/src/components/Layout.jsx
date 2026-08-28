import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useLang } from '../context/LangContext';

export default function Layout({ children }) {
  // Tor (mobil) ekranlarda navigatsiya matni joy yeb, kontentni siqib
  // qo'ymasligi uchun panel avtomatik yig'ilgan holatda ochiladi — foydalanuvchi
  // Sidebar pastidagi tugma bilan istagan payt kengaytirishi mumkin.
  const [collapsed, setCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const { lang, setLang } = useLang();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-end shrink-0">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            <button
              onClick={() => setLang('uz')}
              aria-pressed={lang === 'uz'}
              className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 ${lang === 'uz' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              O'zbek
            </button>
            <button
              onClick={() => setLang('ru')}
              aria-pressed={lang === 'ru'}
              className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 ${lang === 'ru' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Русский
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
