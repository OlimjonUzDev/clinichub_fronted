import { useEffect, useState } from 'react';
import { Star, User, Clock } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { useLookup, resolveName, idOf } from '../lib/useLookup';
import { LoadingState, EmptyState, WarningState, ErrorState } from '../components/ui/StateMessage';

function Stars({ score }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token, doctor } = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);

  useEffect(() => {
    // Server-side filtered to this doctor's own received ratings.
    fetchAll('/appointments/rating/', token)
      .then((data) => { setRatings(data); setError(false); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [token]);

  const sorted = ratings.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const avgScore = ratings.length ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) : 0;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">{t('reviews.title')}</h1>
        {ratings.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-1.5">
            <Star size={15} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">{avgScore.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({ratings.length})</span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingState text={t('common.loading')} />
      ) : error ? (
        <ErrorState text={t('reviews.load_error')} />
      ) : !doctor ? (
        <WarningState text={t('auth.no_doctor_profile')} />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Star} text={t('reviews.no_data')} />
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
            const patientName = resolveName(r.patient, patients, lang);
            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <User size={14} className="text-indigo-500" /> {patientName || `#${idOf(r.patient)}`}
                  </div>
                  <Stars score={r.score} />
                </div>
                {r.created_at && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                    <Clock size={12} /> {new Date(r.created_at).toLocaleDateString()}
                  </div>
                )}
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
