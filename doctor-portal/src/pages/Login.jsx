import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Field from '../components/Field';
import { bannerCls } from '../lib/formStyles';

const inputCls = "w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

const LogoIcon = () => (
  <svg width="64" height="70" viewBox="0 0 64 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L6 18V44C6 56.7 17.5 67 32 69C46.5 67 58 56.7 58 44V18L32 4Z" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2"/>
    <rect x="22" y="22" width="20" height="20" rx="4" fill="#0D9488" opacity="0.15"/>
    <path d="M32 24V38M25 31H39" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M22 46C22 46 25 52 32 52C39 52 42 46 42 46" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="42" cy="49" r="4" fill="#0D9488"/>
  </svg>
);

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const blocked = searchParams.get('blocked') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/token/', { username, password });
      login(response.data.access);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end p-4">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
          <button
            onClick={() => setLang('uz')}
            aria-pressed={lang === 'uz'}
            className={`px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset ${lang === 'uz' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            O'zbek
          </button>
          <button
            onClick={() => setLang('ru')}
            aria-pressed={lang === 'ru'}
            className={`px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset ${lang === 'ru' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Русский
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md border border-gray-200 rounded-2xl p-10 shadow-sm bg-white">
          <div className="flex flex-col items-center mb-8">
            <LogoIcon />
            <div className="mt-3 text-center">
              <div className="text-xl font-bold text-indigo-600">HomeCare+</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Doctor Portal</div>
            </div>
          </div>

          {blocked && !error && (
            <div role="status" className="mb-4 border border-amber-100 bg-amber-50 text-amber-700 rounded-lg py-2.5 px-4 text-sm text-center">
              {t('auth.doctor_only')}
            </div>
          )}

          {error && (
            <div role="alert" className={`mb-4 text-center ${bannerCls.error}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t('auth.username')} required icon={User}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.username')}
                className={inputCls}
              />
            </Field>

            <Field label={t('auth.password')} required icon={Lock}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1"
            >
              {loading ? t('auth.signing_in') : t('auth.signin')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
