// `Date#toISOString().slice(0, 10)` UTC vaqtdan foydalanadi — UTC+5 kabi
// musbat offsetli mintaqalarda tunda (00:00-05:00) bu mahalliy sanadan bir kun
// oldingi sanani qaytaradi, holbuki booking oqimining qolgan qismi (schedule
// weekday, slot vaqtlari, reschedule) mahalliy vaqtda ishlaydi. Shu farqni
// oldini olish uchun mahalliy sana qismlaridan "YYYY-MM-DD" yig'amiz.
export function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
