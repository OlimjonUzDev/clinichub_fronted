import { useEffect, useState } from 'react';
import { Wallet, Calendar, Clock } from 'lucide-react';
import { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import { LoadingState, EmptyState, WarningState } from '../components/ui/StateMessage';
import { statusBadgeCls } from '../lib/statusBadge';

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, doctor } = useAuth();
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('payouts.title')}</h1>

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
        <LoadingState text={t('common.loading')} />
      ) : !doctor ? (
        <WarningState text={t('auth.no_doctor_profile')} />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Wallet} text={t('payouts.no_data')} />
      ) : (
        <div className="space-y-3">
          {sorted.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                  <Wallet size={14} className="text-indigo-500" />
                  {Number(p.amount).toLocaleString()}
                </div>
                <span className={statusBadgeCls(p.status)}>{t(`payouts.status.${p.status}`) || p.status}</span>
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
