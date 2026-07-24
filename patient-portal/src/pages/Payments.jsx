import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Receipt } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';

// Requires VITE_STRIPE_PUBLISHABLE_KEY in patient-portal/.env (see .env.example).
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
  refunded: 'bg-gray-100 text-gray-500',
};

function CheckoutForm({ invoice, token, onPaid, t }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const paymentRes = await api.post('/payments/payment/', {
        invoice: invoice.id,
        patient: invoice.patient,
        provider: 'stripe',
        amount: invoice.amount,
        currency: invoice.currency,
      }, { headers });

      const intentRes = await api.post('/payments/stripe/create-intent/', {
        payment_id: paymentRes.data.id,
      }, { headers });

      const result = await stripe.confirmCardPayment(intentRes.data.client_secret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        onPaid(invoice.id);
      }
    } catch (err) {
      const data = err?.response?.data;
      const firstError = data && typeof data === 'object' ? (Object.values(data).flat()[0] || data.error) : null;
      setError(firstError || t('payments.pay_error'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      <div className="border border-gray-200 rounded-lg px-3 py-2.5">
        <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="bg-indigo-600 text-white text-sm font-medium py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {processing ? t('payments.processing') : t('payments.pay_button')}
      </button>
    </form>
  );
}

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const { token } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    fetchAll('/billing/invoice/', token)
      .then((data) => { setInvoices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const sorted = invoices.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handlePaid = (invoiceId) => {
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status: 'paid' } : i)));
    setPayingId(null);
  };

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('payments.title')}</h1>

      {!stripePromise && (
        <div className="mb-4 text-amber-700 text-xs bg-amber-50 border border-amber-100 rounded-lg py-2.5 px-4">
          {t('payments.stripe_not_configured')}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-400">{t('payments.no_data')}</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((inv) => (
            <div key={inv.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <Receipt size={14} className="text-indigo-500" /> {inv.invoice_number}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{fmtDate(inv.created_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {Number(inv.amount).toLocaleString()} {inv.currency}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                    {t(`payments.status.${inv.status}`)}
                  </span>
                  {inv.status === 'pending' && stripePromise && (
                    <button
                      onClick={() => setPayingId(payingId === inv.id ? null : inv.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition"
                    >
                      <CreditCard size={13} /> {t('payments.pay_button')}
                    </button>
                  )}
                </div>
              </div>

              {payingId === inv.id && stripePromise && (
                <Elements stripe={stripePromise}>
                  <CheckoutForm invoice={inv} token={token} onPaid={handlePaid} t={t} />
                </Elements>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
