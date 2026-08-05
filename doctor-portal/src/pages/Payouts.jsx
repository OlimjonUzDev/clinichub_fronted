import { useEffect, useState } from 'react';
import { Wallet, Calendar, Clock } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';

function StatusBadge({ status, t }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    paid: 'bg-green-50 text-green-700 border-green-100',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {t(`payouts.status.${status}`) || status}
    </span>
  );
}

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    // Backend DoctorPayoutViewSet.get_queryset() server tomonida shu
    // doktorning o'ziga tegishli payout'larga cheklaydi.
    fetchAll('/billing/doctorpayout/', token)
      .then((data) => { setPayouts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const sorted = payouts.slice().sort((a, b) => new Date(b.period_to) - new Date(a.period_to));
  const totalPaid = payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('payouts.title')}</h1>

      {!loading && payouts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5 max-w-md">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{t('payouts.total_paid')}</div>
            <div className="text-lg font-bold text-green-600">{totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{t('payouts.total_pending')}</div>
            <div className="text-lg font-bold text-amber-600">{totalPending.toLocaleString()}</div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-400">{t('payouts.no_data')}</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                  <Wallet size={14} className="text-teal-500" />
                  {Number(p.amount).toLocaleString()}
                </div>
                <StatusBadge status={p.status} t={t} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Calendar size={12} /> {p.period_from} – {p.period_to}
              </div>
              {p.status === 'paid' && p.paid_at && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={12} /> {t('payouts.paid_at')}: {new Date(p.paid_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
