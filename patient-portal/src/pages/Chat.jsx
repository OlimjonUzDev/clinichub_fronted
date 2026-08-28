import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import ChatWindow from '../components/ChatWindow';
import { useLookup, resolveName } from '../lib/useLookup';

export default function Chat() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t, lang } = useLang();
  const [appointment, setAppointment] = useState(null);
  const doctors = useLookup('/doctors/doctor/', token);

  // Sarlavhada qaysi doktor/sana bilan suhbat ekani ko'rinsin — chat funksionalligi
  // uchun shart emas (ChatWindow o'zi ishlaydi), faqat qo'shimcha kontekst uchun.
  useEffect(() => {
    api.get(`/appointments/appointment/${appointmentId}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setAppointment(res.data))
      .catch(() => {});
  }, [appointmentId, token]);

  const doctorName = appointment ? resolveName(appointment.doctor, doctors, lang) : null;
  const dateLabel = appointment ? new Date(appointment.start_time).toLocaleDateString() : null;

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded">
        ← {t('appointments.title')}
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {doctorName ? `${doctorName}${dateLabel ? ` · ${dateLabel}` : ''}` : t('chat.title')}
      </h1>
      <ChatWindow appointmentId={appointmentId} />
    </Layout>
  );
}
