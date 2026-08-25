import api, { fetchAll } from '../api/axios';

// Backend PAGE_SIZE=6 bo'lgani uchun (ordering ascending) bitta so'rov faqat eng
// eski 6 ta xabarni qaytaradi — to'liq tarixni olish uchun barcha sahifalar
// bo'ylab yurish kerak (fetchAll shu ishni qiladi).
export function fetchMessages(appointmentId, token) {
  return fetchAll('/chat/message/', token, { appointment_id: appointmentId });
}

export function sendMessage(appointmentId, text, token) {
  return api
    .post(
      '/chat/message/',
      { appointment_id: appointmentId, text },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => res.data);
}
