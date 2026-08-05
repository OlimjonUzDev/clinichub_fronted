import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// SMS OTP'ga o'tilgach ro'yxatdan o'tish alohida forma bo'lishdan to'xtadi —
// /otp/verify/ telefon raqami bo'yicha User topa olmasa, o'zi yangi patient
// yaratadi (users/views.py, VerifyOTPView). Shu sabab /register endi shunchaki
// /login'ga yo'naltiradi — eski havolalar/xatcho'plar buzilmasin deb marshrut
// saqlab qolindi.
export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
