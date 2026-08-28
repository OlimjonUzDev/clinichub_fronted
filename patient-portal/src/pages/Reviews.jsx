import { useEffect, useState } from 'react';
import { Star, Stethoscope, Clock, MessageSquareText } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { LoadingState, EmptyState, ErrorState, RetryButton } from '../components/StateBlock';
import { useLookup, resolveName } from '../lib/useLookup';
import { sectionLabelCls } from '../lib/formStyles';

// A FK field may come back as a bare id or a nested object depending on the serializer.
const idOf = (val) => (val && typeof val === 'object' ? val.id : val);

function StarPicker({ value, onChange, t }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} ${t('reviews.star_unit')}`}
          aria-pressed={i <= value}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
        >
          <Star size={20} className={i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
        </button>
      ))}
    </div>
  );
}

function Stars({ score }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function ReviewForm({ appointment, patientId, doctorName, onSubmitted, t }) {
  const { token } = useAuth();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/appointments/rating/', {
        appointment: appointment.id,
        patient: patientId,
        doctor: idOf(appointment.doctor),
        score,
        comment,
      }, { headers: { Authorization: `Bearer ${token}` } });
      onSubmitted(res.data);
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setError(firstError || t('reviews.submit_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
        <Stethoscope size={14} className="text-indigo-500" /> {doctorName || `#${idOf(appointment.doctor)}`}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock size={12} /> {new Date(appointment.start_time).toLocaleDateString()}
      </div>

      <StarPicker value={score} onChange={setScore} t={t} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={t('reviews.comment_placeholder')}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
      />

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-indigo-600 text-white text-sm font-medium py-2 px-5 rounded-lg hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 transition-colors disabled:opacity-60"
      >
        {saving ? t('reviews.submitting') : t('reviews.submit')}
      </button>
    </form>
  );
}

export default function Reviews() {
  const [appointments, setAppointments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const doctors = useLookup('/doctors/doctor/', token);

  const load = () => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetchAll('/appointments/appointment/', token),
      fetchAll('/appointments/rating/', token),
      api.get('/patients/patient/me/', { headers }).then((r) => r.data).catch(() => null),
    ]).then(([apps, allRatings, patient]) => {
      setAppointments(apps);
      setRatings(allRatings);
      setPatientId(patient?.id ?? null);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  };

  useEffect(load, [token]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    load();
  };

  // The backend doesn't filter /appointments/rating/ to the current user, so we
  // narrow it down here to ratings tied to one of this patient's own appointments.
  const myAppointmentIds = new Set(appointments.map((a) => a.id));
  const myRatings = ratings.filter((r) => myAppointmentIds.has(idOf(r.appointment)));
  const ratedAppointmentIds = new Set(myRatings.map((r) => idOf(r.appointment)));

  const eligible = appointments
    .filter((a) => a.status === 'completed' && !ratedAppointmentIds.has(a.id))
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  const sortedRatings = myRatings.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleSubmitted = (newRating) => {
    setRatings((prev) => [...prev, newRating]);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('reviews.title')}</h1>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('common.load_error')} action={<RetryButton onClick={handleRetry} label={t('common.retry')} />} />
      ) : !patientId ? (
        <EmptyState icon={Stethoscope} title={t('reviews.profile_required')} />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className={`${sectionLabelCls} mb-3`}>{t('reviews.leave_title')}</h2>
            {eligible.length === 0 ? (
              <EmptyState icon={Star} title={t('reviews.no_eligible')} bare />
            ) : (
              <div className="space-y-3">
                {eligible.map((a) => (
                  <ReviewForm
                    key={a.id}
                    appointment={a}
                    patientId={patientId}
                    doctorName={resolveName(a.doctor, doctors, lang)}
                    onSubmitted={handleSubmitted}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className={`${sectionLabelCls} mb-3`}>{t('reviews.my_reviews')}</h2>
            {sortedRatings.length === 0 ? (
              <EmptyState icon={MessageSquareText} title={t('reviews.no_data')} bare />
            ) : (
              <div className="space-y-3">
                {sortedRatings.map((r) => {
                  const appointment = appointments.find((a) => a.id === idOf(r.appointment));
                  const doctorName = appointment ? resolveName(appointment.doctor, doctors, lang) : null;
                  return (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                          <Stethoscope size={14} className="text-indigo-500" /> {doctorName || `#${idOf(r.appointment)}`}
                        </div>
                        <Stars score={r.score} />
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}
