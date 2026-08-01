import { useEffect, useState } from 'react';
import { Clock, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { weekdayLabel } from '../lib/weekdays';
import { idOf } from '../lib/useLookup';

const fieldCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition";

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWeekday, setEditingWeekday] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { token, doctor, doctorLoading } = useAuth();
  const { t, lang } = useLang();

  const load = () => {
    fetchAll('/doctors/doctorschedule/', token)
      .then((data) => { setSchedule(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, [token]);

  const mySchedule = doctor ? schedule.filter((s) => idOf(s.doctor) === doctor.id) : [];
  const byWeekday = {};
  mySchedule.forEach((s) => { byWeekday[s.weekday] = s; });

  const openEditor = (weekday, existing) => {
    setEditingWeekday(weekday);
    setStartTime(existing ? existing.start_time.slice(0, 5) : '09:00');
    setEndTime(existing ? existing.end_time.slice(0, 5) : '18:00');
    setError('');
  };

  const handleSave = async (weekday) => {
    const existing = byWeekday[weekday];
    setSaving(true);
    setError('');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (existing) {
        const res = await api.patch(`/doctors/doctorschedule/${existing.id}/`, { start_time: startTime, end_time: endTime }, { headers });
        setSchedule((prev) => prev.map((s) => (s.id === existing.id ? res.data : s)));
      } else {
        const res = await api.post('/doctors/doctorschedule/', { doctor: doctor.id, weekday, start_time: startTime, end_time: endTime }, { headers });
        setSchedule((prev) => [...prev, res.data]);
      }
      setEditingWeekday(null);
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setError(firstError || t('schedule.save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (existing) => {
    if (!confirm(t('schedule.delete_confirm'))) return;
    try {
      await api.delete(`/doctors/doctorschedule/${existing.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setSchedule((prev) => prev.filter((s) => s.id !== existing.id));
    } catch {
      alert(t('schedule.save_error'));
    }
  };

  if (doctorLoading || loading) {
    return <Layout><p className="text-sm text-gray-400">{t('common.loading')}</p></Layout>;
  }

  if (!doctor) {
    return <Layout><p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl py-3 px-4">{t('auth.no_doctor_profile')}</p></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('schedule.title')}</h1>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
        {[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
          const existing = byWeekday[weekday];
          const editing = editingWeekday === weekday;
          return (
            <div key={weekday} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm font-medium text-gray-800 w-32">{weekdayLabel(weekday, lang)}</div>

                {!editing && (
                  <>
                    {existing ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-1">
                        <Clock size={13} className="text-teal-500" />
                        {existing.start_time.slice(0, 5)} – {existing.end_time.slice(0, 5)}
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-gray-400">{t('schedule.no_data')}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditor(weekday, existing)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition">
                        {existing ? <Pencil size={13} /> : <Plus size={13} />}
                      </button>
                      {existing && (
                        <button onClick={() => handleDelete(existing)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {editing && (
                  <div className="flex items-end gap-2 flex-wrap flex-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('schedule.start_time')}</label>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('schedule.end_time')}</label>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldCls} />
                    </div>
                    <button
                      onClick={() => handleSave(weekday)}
                      disabled={saving}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setEditingWeekday(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
              {editing && error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
