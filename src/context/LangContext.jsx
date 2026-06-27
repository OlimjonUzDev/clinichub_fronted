import { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'uz');

  const switchLang = (l) => {
    localStorage.setItem('lang', l);
    setLang(l);
  };

  const t = (key) => translations[lang]?.[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang: switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
