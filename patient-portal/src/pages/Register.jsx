import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
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

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'phone_number') {
      setFieldErrors((prev) => ({ ...prev, phone_number: phoneError(value, t) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneErr = phoneError(form.phone_number, t);
    setFieldErrors({ phone_number: phoneErr });
    if (phoneErr) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/register/', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setError(firstError || t('auth.signup_error'));
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

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md border border-gray-200 rounded-2xl p-10 shadow-sm bg-white">
          <div className="flex flex-col items-center mb-8">
            <LogoIcon />
            <div className="mt-3 text-center">
              <div className="text-xl font-bold text-indigo-600">HomeCare+</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Care at Home</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-green-600 text-sm text-center bg-green-50 rounded-lg py-2 px-3">
              {t('auth.signup_success')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.username')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder={t('auth.username')}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder={t('auth.email')}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.phone')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.phone_number}
                  onChange={handleChange('phone_number')}
                  placeholder={t('auth.phone')}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
              {fieldErrors.phone_number && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder={t('auth.password')}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? t('auth.signing_in') : t('auth.signup')}
            </button>

            <div className="text-center text-sm text-gray-500">
              {t('auth.have_account')}{' '}
              <Link to="/login" className="text-indigo-500 hover:text-indigo-700 hover:underline">
                {t('auth.signin')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
