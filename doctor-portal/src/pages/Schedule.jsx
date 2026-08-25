import { useEffect, useState } from 'react';
import { Clock, Pencil, Trash2, Plus, Check, X, Loader2 } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { weekdayLabel } from '../lib/weekdays';
import { idOf } from '../lib/useLookup';
import { LoadingState, WarningState, ErrorState } from '../components/ui/StateMessage';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { fieldCls } from '../lib/formStyles';

const iconBtnCls = "w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWeekday, setEditingWeekday] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rowError, setRowError] = useState({});
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
    if (endTime <= startTime) {
      setError(t('schedule.time_order_error'));
      return;
    }
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

  const requestDelete = (existing) => {
    setRowError((prev) => ({ ...prev, [existing.weekday]: '' }));
    setDeleteTarget(existing);
  };

  const confirmDelete = async () => {
    const existing = deleteTarget;
    if (!existing) return;
    setDeleteTarget(null);
    try {
      await api.delete(`/doctors/doctorschedule/${existing.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setSchedule((prev) => prev.filter((s) => s.id !== existing.id));
    } catch {
      setRowError((prev) => ({ ...prev, [existing.weekday]: t('schedule.delete_error') }));
    }
  };

  if (doctorLoading || loading) {
    return <Layout><LoadingState text={t('common.loading')} /></Layout>;
  }

  if (!doctor) {
    return <Layout><WarningState text={t('auth.no_doctor_profile')} /></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('schedule.title')}</h1>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
          const existing = byWeekday[weekday];
          const editing = editingWeekday === weekday;
          return (
            <div key={weekday} className="p-4">
              <div className={editing ? 'space-y-3' : 'flex items-center justify-between gap-3 flex-wrap'}>
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full shrink-0 ${existing ? 'bg-teal-500' : 'bg-gray-300'}`}
                  />
                  <span className="text-sm font-medium text-gray-800">{weekdayLabel(weekday, lang)}</span>
                </div>

                {!editing && (
                  <>
                    {existing ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-1">
                        <Clock size={13} className="text-teal-500" />
                        {existing.start_time.slice(0, 5)} – {existing.end_time.slice(0, 5)}
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-gray-400">{t('schedule.day_off')}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditor(weekday, existing)}
                        title={existing ? t('schedule.edit') : t('schedule.add')}
                        aria-label={`${existing ? t('schedule.edit') : t('schedule.add')} — ${weekdayLabel(weekday, lang)}`}
                        className={`${iconBtnCls} hover:border-teal-400 hover:text-teal-600 focus-visible:ring-teal-400`}
                      >
                        {existing ? <Pencil size={13} /> : <Plus size={13} />}
                      </button>
                      {existing && (
                        <button
                          onClick={() => requestDelete(existing)}
                          title={t('schedule.delete')}
                          aria-label={`${t('schedule.delete')} — ${weekdayLabel(weekday, lang)}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {editing && (
                  <div className="flex items-end gap-2 flex-wrap">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('schedule.start_time')}</label>
                      <input type="time" value={startTime} max={endTime} onChange={(e) => setStartTime(e.target.value)} className={fieldCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('schedule.end_time')}</label>
                      <input type="time" value={endTime} min={startTime} onChange={(e) => setEndTime(e.target.value)} className={fieldCls} />
                    </div>
                    <button
                      onClick={() => handleSave(weekday)}
                      disabled={saving}
                      title={saving ? t('schedule.saving') : t('schedule.save')}
                      aria-label={saving ? t('schedule.saving') : t('schedule.save')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                    >
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    </button>
                    <button
                      onClick={() => setEditingWeekday(null)}
                      title={t('common.cancel')}
                      aria-label={t('common.cancel')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-1"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
              {editing && error && <ErrorState text={error} compact className="mt-2" />}
              {!editing && rowError[weekday] && <ErrorState text={rowError[weekday]} compact className="mt-2" />}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('schedule.delete_title')}
        message={t('schedule.delete_confirm')}
        confirmLabel={t('schedule.delete')}
        cancelLabel={t('common.cancel')}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
