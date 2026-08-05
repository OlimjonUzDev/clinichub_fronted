import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, KeyRound, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { phoneError } from '../lib/validators';

const LogoIcon = () => (
  <svg width="64" height="70" viewBox="0 0 64 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L6 18V44C6 56.7 17.5 67 32 69C46.5 67 58 56.7 58 44V18L32 4Z" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2"/>
    <rect x="22" y="22" width="20" height="20" rx="4" fill="#4F46E5" opacity="0.15"/>
    <path d="M32 24V38M25 31H39" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M22 46C22 46 25 52 32 52C39 52 42 46 42 46" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="42" cy="49" r="4" fill="#4F46E5"/>
  </svg>
);

// Backend'dagi otp/request/ shu telefon raqami uchun 60 soniyalik cooldown qo'yadi
// (users/views.py, RequestOTPView) — "qayta yuborish" tugmasi shu bilan mos.
const RESEND_COOLDOWN_SECONDS = 60;

export default function Login() {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneFieldError, setPhoneFieldError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { login } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const blocked = searchParams.get('blocked') === '1';

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const requestCode = async (e) => {
    e?.preventDefault();
    if (cooldown > 0) return;
    const fieldErr = !phone.trim() ? t('validation.phone') : phoneError(phone, t);
    setPhoneFieldError(fieldErr);
    if (fieldErr) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/otp/request/', { phone_number: phone });
      setStep('code');
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.otp_error'));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/otp/verify/', { phone_number: phone, code });
      login(res.data.access, res.data.refresh);
      // Yangi patient uchun avval profil to'ldirilsin (Profile.jsx allaqachon
      // profil mavjud emasligini o'zi aniqlab, POST/PATCH'ni to'g'ri boshqaradi).
      navigate(res.data.is_new_user ? '/profile' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.otp_error'));
    } finally {
      setLoading(false);
    }
  };

  const changePhone = () => {
    setStep('phone');
    setCode('');
    setError('');
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
            <div className="mb-4 text-amber-700 text-sm text-center bg-amber-50 rounded-lg py-2 px-3">
              {t('auth.patient_only')}
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={requestCode} className="space-y-4">
              <p className="text-sm text-gray-500 text-center -mt-1 mb-2">{t('auth.otp_subtitle')}</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneFieldError(''); }}
                    placeholder="+998901234567"
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                {phoneFieldError && <p className="text-red-500 text-xs mt-1">{phoneFieldError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? t('auth.sending_code') : t('auth.send_code')}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <p className="text-sm text-gray-500 text-center -mt-1 mb-2">
                {t('auth.code_sent_to')} <span className="font-medium text-gray-700">{phone}</span>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.code_label')}
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm tracking-[0.35em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? t('auth.verifying') : t('auth.verify')}
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={changePhone}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> {t('auth.change_phone')}
                </button>
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={cooldown > 0 || loading}
                  className="text-indigo-500 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t('auth.resend_code')}{cooldown > 0 ? ` (${cooldown})` : ''}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
