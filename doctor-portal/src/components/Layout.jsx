import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useLang } from '../context/LangContext';

export default function Layout({ children }) {
  // Tor ekranlarda (mobil) sidebar boshida yig'ilgan holatda ochiladi — foydalanuvchi
  // istasa `ChevronRight` tugmasi bilan baribir kengaytirishi mumkin. Oyna keyinroq
  // mobil kenglikkacha kichraytirilsa ham (resize) avtomatik yig'iladi.
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
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
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-2.5 flex items-center justify-end shrink-0">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            <button
              onClick={() => setLang('uz')}
              aria-pressed={lang === 'uz'}
              className={`px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-inset ${lang === 'uz' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              O'zbek
            </button>
            <button
              onClick={() => setLang('ru')}
              aria-pressed={lang === 'ru'}
              className={`px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-inset ${lang === 'ru' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
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
