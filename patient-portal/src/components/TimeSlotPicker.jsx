import { useEffect, useId, useMemo, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useLang } from '../context/LangContext';
import { fieldCls } from '../lib/formStyles';
import { toLocalDateStr } from '../lib/dateUtils';

// DoctorProfile.jsx dagi band qilish formasidan chiqarilgan, qayta ishlatiluvchi
// sana+vaqt tanlash bloki (ish jadvali + band vaqtlar asosida). Faqat UI/hisoblash —
// API chaqiruv joylari (doctorschedule, busy-slots) DoctorProfile bilan bir xil.
const toBackendWeekday = (jsDay) => (jsDay + 6) % 7;

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

/**
 * @param {number} doctorId
 * @param {string} token
 * @param {number} durationMinutes - bitta uchrashuv davomiyligi
 * @param {string} date - "YYYY-MM-DD"
 * @param {(v: string) => void} onDateChange
 * @param {string} startTime - "HH:MM"
 * @param {(v: string) => void} onStartTimeChange
 * @param {{start: string, end: string}} [excludeInterval] - shu oraliqni "band" deb hisoblamaslik
 *   (masalan qayta rejalashtirilayotgan appointment'ning o'z joriy vaqti — u ham
 *   busy-slots javobida qaytadi, lekin bemorga o'zining eski vaqti "band" ko'rinmasin).
 */
export default function TimeSlotPicker({ doctorId, token, durationMinutes, date, onDateChange, startTime, onStartTimeChange, excludeInterval }) {
  const { t } = useLang();
  const dateInputId = useId();
  const startTimeLabelId = useId();
  const [schedule, setSchedule] = useState([]);
  const [busySlotsData, setBusySlotsData] = useState({ key: null, slots: [] });

  useEffect(() => {
    if (!doctorId || !token) return;
    fetchAll('/doctors/doctorschedule/', token)
      .then((data) => setSchedule(data.filter((s) => (typeof s.doctor === 'object' ? s.doctor.id : s.doctor) === doctorId)))
      .catch(() => {});
  }, [doctorId, token]);

  const daySchedule = useMemo(() => {
    if (!date) return null;
    const jsDay = new Date(`${date}T00:00:00`).getDay();
    const backendWeekday = toBackendWeekday(jsDay);
    return schedule.find((s) => s.weekday === backendWeekday) || null;
  }, [date, schedule]);

  const slotsKey = date && doctorId ? `${doctorId}:${date}` : null;

  useEffect(() => {
    if (!date || !doctorId) return;
    const key = `${doctorId}:${date}`;
    api.get('/appointments/busy-slots/', { params: { doctor: doctorId, date } })
      .then((res) => setBusySlotsData({ key, slots: res.data }))
      .catch(() => setBusySlotsData({ key, slots: [] }));
  }, [date, doctorId]);

  const slotsLoading = slotsKey !== null && busySlotsData.key !== slotsKey;
  const busySlots = useMemo(() => {
    if (busySlotsData.key !== slotsKey) return [];
    if (!excludeInterval) return busySlotsData.slots;
    const excStart = new Date(excludeInterval.start).getTime();
    const excEnd = new Date(excludeInterval.end).getTime();
    return busySlotsData.slots.filter((b) => !(new Date(b.start_time).getTime() === excStart && new Date(b.end_time).getTime() === excEnd));
  }, [busySlotsData, slotsKey, excludeInterval]);

  const daySlots = useMemo(() => {
    if (!daySchedule || !date || slotsLoading || !durationMinutes) return [];
    const candidates = buildCandidateSlots(date, daySchedule.start_time, daySchedule.end_time, durationMinutes);
    const now = new Date();
    return candidates.map((slotStart) => {
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
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
  }, [daySchedule, busySlots, durationMinutes, date, slotsLoading]);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={dateInputId} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
          <Calendar size={14} /> {t('doctor.date')}<span className="text-red-500" aria-hidden="true"> *</span>
        </label>
        <input
          id={dateInputId}
          type="date"
          required
          min={toLocalDateStr(new Date())}
          value={date}
          onChange={(e) => { onDateChange(e.target.value); onStartTimeChange(''); }}
          className={fieldCls}
        />
      </div>

      <div role="group" aria-labelledby={startTimeLabelId}>
        <label id={startTimeLabelId} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
          <Clock size={14} /> {t('doctor.start_time')}<span className="text-red-500" aria-hidden="true">*</span>
        </label>

        {!date && <p className="text-xs text-gray-400">{t('doctor.pick_date_first')}</p>}
        {date && slotsLoading && <p className="text-xs text-gray-400">{t('doctor.loading_slots')}</p>}
        {date && !slotsLoading && !daySchedule && <p className="text-xs text-amber-600">{t('doctor.day_off')}</p>}
        {date && !slotsLoading && daySchedule && daySlots.length === 0 && (
          <p className="text-xs text-amber-600">{t('doctor.no_slots')}</p>
        )}
        {date && !slotsLoading && daySchedule && daySlots.length > 0 && (
          <>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-white border border-gray-200 inline-block" /> {t('doctor.slot_available')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" /> {t('doctor.slot_selected')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 inline-block" /> {t('doctor.slot_busy')}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {daySlots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  disabled={slot.disabled}
                  aria-pressed={startTime === slot.value}
                  aria-label={`${slot.label}${slot.disabled ? ` — ${t('doctor.slot_busy')}` : ''}`}
                  onClick={() => onStartTimeChange(slot.value)}
                  className={`text-xs font-medium rounded-lg py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
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
          </>
        )}
      </div>
    </div>
  );
}
