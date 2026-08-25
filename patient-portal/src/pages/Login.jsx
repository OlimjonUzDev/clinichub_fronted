import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Field from '../components/Field';
import { bannerCls } from '../lib/formStyles';

const inputCls = "w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

const LogoIcon = () => (
  <svg width="64" height="70" viewBox="0 0 64 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L6 18V44C6 56.7 17.5 67 32 69C46.5 67 58 56.7 58 44V18L32 4Z" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2"/>
    <rect x="22" y="22" width="20" height="20" rx="4" fill="#4F46E5" opacity="0.15"/>
    <path d="M32 24V38M25 31H39" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M22 46C22 46 25 52 32 52C39 52 42 46 42 46" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="42" cy="49" r="4" fill="#4F46E5"/>
  </svg>
);

// VAQTINCHALIK: backend'da SMS_OTP_ENABLED=False bo'lgani uchun (/otp/request/,
// /otp/verify/ 503 qaytaradi — config/settings.py, users/views.py) login/parol
// bilan kirishga o'tkazildi. Standart SimpleJWT endpoint'i ishlatiladi:
// POST /auth/token/ {username, password} -> {access, refresh}.
// SMS OTP qayta yoqilganda bu fayl e3d5c0f commitidagi holatga qaytarilsin.
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      const res = await api.post('/auth/token/', { username, password });
      login(res.data.access, res.data.refresh);
      // New patients have no Patient profile yet (GET /patients/patient/me/
      // returns 400 in that case, per TASKS.md) — send them to complete it
      // instead of dropping them on Home where booking/reviews would fail.
      try {
        await api.get('/patients/patient/me/', {
          headers: { Authorization: `Bearer ${res.data.access}` },
        });
        navigate('/');
      } catch (profileErr) {
        navigate(profileErr?.response?.status === 400 ? '/profile' : '/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.login_error'));
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
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md border border-gray-200 rounded-2xl p-10 shadow-sm bg-white">
          <div className="flex flex-col items-center mb-8">
            <LogoIcon />
            <div className="mt-3 text-center">
              <div className="text-xl font-bold text-indigo-600">HomeCare+</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Care at Home</div>
            </div>
          </div>

          {blocked && !error && (
            <div className="mb-4 border border-amber-100 bg-amber-50 text-amber-700 rounded-lg py-2.5 px-4 text-sm text-center">
              {t('auth.patient_only')}
            </div>
          )}

          {error && (
            <div className={`mb-4 text-center ${bannerCls.error}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t('auth.username')} required icon={User}>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label={t('auth.password')} required icon={Lock}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? t('auth.logging_in') : t('auth.login_button')}
            </button>

            <div className="text-center text-sm text-gray-500">
              {t('auth.no_account')}{' '}
              <Link to="/register" className="text-indigo-500 hover:text-indigo-700 hover:underline">
                {t('auth.signup')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
