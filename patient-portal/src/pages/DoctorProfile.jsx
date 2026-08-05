import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, Building2, User, Calendar, Clock, MessageSquare, Video } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';
import { CONSULTATION_TYPES } from '../lib/consultationTypes';

// DoctorSchedule.weekday: 0=Dushanba ... 6=Yakshanba (backend bilan mos).
// JS Date.getDay(): 0=Yakshanba ... 6=Shanba — shuning uchun aylantirish kerak.
const toBackendWeekday = (jsDay) => (jsDay + 6) % 7;

// Ish jadvali oralig'ini (masalan "09:00:00"–"18:00:00") berilgan davomiylikka
// (daqiqa) bo'lib, sanaga bog'langan Date obyektlari ro'yxatiga aylantiradi.
function buildCandidateSlots(dateStr, startHHMM, endHHMM, durationMin) {
  const [sh, sm] = startHHMM.slice(0, 5).split(':').map(Number);
  const [eh, em] = endHHMM.slice(0, 5).split(':').map(Number);
  const slots = [];
  let cursor = new Date(`${dateStr}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`);
  const end = new Date(`${dateStr}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`);
  while (cursor.getTime() + durationMin * 60000 <= end.getTime()) {
    slots.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + durationMin * 60000);
  }
  return slots;
}

const WEEKDAY_LABELS = [
  { uz: 'Dushanba', ru: 'Понедельник' },
  { uz: 'Seshanba', ru: 'Вторник' },
  { uz: 'Chorshanba', ru: 'Среда' },
  { uz: 'Payshanba', ru: 'Четверг' },
  { uz: 'Juma', ru: 'Пятница' },
  { uz: 'Shanba', ru: 'Суббота' },
  { uz: 'Yakshanba', ru: 'Воскресенье' },
];

// A FK field may come back as a bare id or a nested object depending on the serializer.
const idOf = (val) => (val && typeof val === 'object' ? val.id : val);

const fieldCls = "w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

function BookField({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {children}
      </div>
    </div>
  );
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t, lang } = useLang();

  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [rankPrices, setRankPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [consultationType, setConsultationType] = useState('in_person');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);

  // { key: "<doctorId>:<date>", slots: [...] } — key orqali "shu ma'lumot
  // aynan hozirgi tanlovga tegishlimi" solishtiriladi, alohida "loading"
  // state kerak bo'lmaydi (sana tez-tez almashtirilganda eski natija
  // chaqnab ketmasligi uchun ham foydali).
  const [busySlotsData, setBusySlotsData] = useState({ key: null, slots: [] });

  const specialities = useLookup('/catalog/specialities/', token);
  const clinics = useLookup('/clinics/clinics/', token);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get(`/doctors/doctor/${id}/`, { headers }),
      fetchAll('/doctors/doctorschedule/', token),
      fetchAll('/catalog/rankprice/', token),
    ]).then(([docRes, scheduleData, priceData]) => {
      setDoctor(docRes.data);
      setSchedule(scheduleData.filter((s) => idOf(s.doctor) === docRes.data.id));
      setRankPrices(priceData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, token]);

  const priceFor = (type) => {
    if (!doctor) return null;
    const rankTypeId = idOf(doctor.rank_type);
    const clinicId = idOf(doctor.clinic);
    return rankPrices.find((p) => (
      String(idOf(p.rank_type)) === String(rankTypeId)
      && String(idOf(p.clinic)) === String(clinicId)
      && p.consultation_type === type
      && p.is_active !== false
    )) || null;
  };

  const selectedPrice = priceFor(consultationType);
  const duration = selectedPrice?.duration_min ?? 30;

  // Tanlangan sanaga mos ish jadvali yozuvi (bo'lmasa — doktor shu kuni ishlamaydi).
  const daySchedule = useMemo(() => {
    if (!date) return null;
    const jsDay = new Date(`${date}T00:00:00`).getDay();
    const backendWeekday = toBackendWeekday(jsDay);
    return schedule.find((s) => s.weekday === backendWeekday) || null;
  }, [date, schedule]);

  // Sana o'zgarganda — shu doktorning o'sha kundagi band vaqtlarini (boshqa
  // bemorlar ma'lumotisiz) backend'dan olib kelamiz.
  const slotsKey = date && doctor ? `${doctor.id}:${date}` : null;

  useEffect(() => {
    if (!date || !doctor) return;
    const key = `${doctor.id}:${date}`;
    api.get('/appointments/busy-slots/', { params: { doctor: doctor.id, date } })
      .then((res) => setBusySlotsData({ key, slots: res.data }))
      .catch(() => setBusySlotsData({ key, slots: [] }));
  }, [date, doctor]);

  const slotsLoading = slotsKey !== null && busySlotsData.key !== slotsKey;
  const busySlots = useMemo(
    () => (busySlotsData.key === slotsKey ? busySlotsData.slots : []),
    [busySlotsData, slotsKey],
  );

  // Ish jadvali + band vaqtlar + tanlangan xizmat davomiyligi asosida
  // bo'sh/band slotlar ro'yxati hisoblanadi.
  const daySlots = useMemo(() => {
    if (!daySchedule || !date || slotsLoading) return [];
    const candidates = buildCandidateSlots(date, daySchedule.start_time, daySchedule.end_time, duration);
    const now = new Date();
    return candidates.map((slotStart) => {
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      const isBusy = busySlots.some((b) => {
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        return slotStart < bEnd && slotEnd > bStart;
      });
      const isPast = slotStart <= now;
      const hh = String(slotStart.getHours()).padStart(2, '0');
      const mm = String(slotStart.getMinutes()).padStart(2, '0');
      return { value: `${hh}:${mm}`, label: `${hh}:${mm}`, disabled: isBusy || isPast };
    });
  }, [daySchedule, busySlots, duration, date, slotsLoading]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess(false);
    if (!date || !startTime) return;

    const duration = selectedPrice?.duration_min ?? 30;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(start.getTime() + duration * 60000);

    setBooking(true);
    try {
      await api.post('/appointments/appointment/', {
        doctor: doctor.id,
        clinic: idOf(doctor.clinic),
        consultation_type: consultationType,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBookSuccess(true);
      setDate('');
      setStartTime('');
      setNotes('');
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setBookError(firstError || t('doctor.booking_error'));
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <Layout><p className="text-sm text-gray-400">{t('common.loading')}</p></Layout>;
  }
  if (!doctor) return <Layout><p className="text-sm text-gray-400">{t('home.no_data')}</p></Layout>;

  const bio = lang === 'ru' ? (doctor.bio_ru || doctor.bio_uz) : doctor.bio_uz;

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline mb-4">
        ← {t('nav.home')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                {doctor.avatar
                  ? <img src={doctor.avatar} alt="" className="w-full h-full object-cover" />
                  : <User size={26} className="text-indigo-400" />}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{lang === 'ru' ? (doctor.name_ru || doctor.name_uz) : doctor.name_uz}</div>
                <div className="text-xs text-gray-400">{doctor.experience_years ?? 0} {t('home.experience')}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><Stethoscope size={14} /> {resolveName(doctor.speciality, specialities, lang) || '—'}</div>
              <div className="flex items-center gap-1.5"><Building2 size={14} /> {resolveRef(doctor.clinic, clinics)?.name || '—'}</div>
            </div>

            {bio && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('doctor.about')}</div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{bio}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-3">
              <Calendar size={14} /> {t('doctor.schedule')}
            </div>
            {schedule.length === 0 ? (
              <p className="text-sm text-gray-400">{t('doctor.no_schedule')}</p>
            ) : (
              <div className="space-y-1.5">
                {schedule
                  .slice()
                  .sort((a, b) => a.weekday - b.weekday)
                  .map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{lang === 'ru' ? WEEKDAY_LABELS[s.weekday].ru : WEEKDAY_LABELS[s.weekday].uz}</span>
                      <span className="text-gray-800 font-medium">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
          <div className="text-sm font-semibold text-gray-800 mb-4">{t('doctor.book_title')}</div>

          {bookError && <div className="mb-3 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{bookError}</div>}
          {bookSuccess && <div className="mb-3 text-green-700 text-xs bg-green-50 border border-green-100 rounded-lg py-2.5 px-3">{t('doctor.booking_success')}</div>}

          <form onSubmit={handleBook} className="space-y-4">
            <BookField icon={Video} label={t('doctor.consultation_type')}>
              <select
                value={consultationType}
                onChange={(e) => { setConsultationType(e.target.value); setStartTime(''); }}
                className={`${fieldCls} appearance-none bg-white`}
              >
                {CONSULTATION_TYPES.map((c) => (
                  <option key={c} value={c}>{t(`consultation.${c}`)}</option>
                ))}
              </select>
            </BookField>

            <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-3.5 py-2.5">
              <span className="text-xs font-medium text-indigo-700">{t('doctor.price')}</span>
              <span className="text-sm font-semibold text-indigo-900">
                {selectedPrice ? `${Number(selectedPrice.price).toLocaleString()} ${selectedPrice.currency} · ${selectedPrice.duration_min} ${t('doctor.min')}` : t('doctor.price_unknown')}
              </span>
            </div>

            <BookField icon={Calendar} label={t('doctor.date')}>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => { setDate(e.target.value); setStartTime(''); }}
                className={fieldCls}
              />
            </BookField>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                <Clock size={14} /> {t('doctor.start_time')}
              </label>

              {!date && (
                <p className="text-xs text-gray-400">{t('doctor.pick_date_first')}</p>
              )}
              {date && slotsLoading && (
                <p className="text-xs text-gray-400">{t('doctor.loading_slots')}</p>
              )}
              {date && !slotsLoading && !daySchedule && (
                <p className="text-xs text-amber-600">{t('doctor.day_off')}</p>
              )}
              {date && !slotsLoading && daySchedule && daySlots.length === 0 && (
                <p className="text-xs text-amber-600">{t('doctor.no_slots')}</p>
              )}
              {date && !slotsLoading && daySchedule && daySlots.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      disabled={slot.disabled}
                      onClick={() => setStartTime(slot.value)}
                      className={`text-xs font-medium rounded-lg py-2 transition-colors ${
                        slot.disabled
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                          : startTime === slot.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('doctor.notes')}</label>
              <div className="relative">
                <MessageSquare size={15} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={`${fieldCls} pt-2.5`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={booking || !date || !startTime}
              className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {booking ? t('doctor.booking') : t('doctor.book_button')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
