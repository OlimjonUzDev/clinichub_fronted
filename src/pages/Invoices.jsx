import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import DetailModal from '../components/DetailModal';
import { useLookup, resolveName } from '../lib/useLookup';

const PAGE_SIZE = 10;

export default function Invoices() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [viewItem, setViewItem]   = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);
  const patientName = (i) => resolveName(i.patient, patients, lang) || '—';

  useEffect(() => {
    api.get('/billing/invoice/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch =
      (i.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
      patientName(i).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

  // Summary
  const total   = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const paid    = items.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0);
  const pending = items.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.financial') }, { label: t('menu.invoices') }]}
          title={t('invoices.title')}
        />

        {/* Summary */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: t('invoices.total_amount'), value: total, color: 'text-gray-800' },
              { label: t('invoices.paid_amount'),  value: paid,  color: 'text-green-600' },
              { label: t('invoices.pending_amount'), value: pending, color: 'text-yellow-600' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 px-5 py-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {Number(card.value).toLocaleString()} UZS
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('invoices.search')}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('invoices.all_statuses')}</option>
            <option value="pending">{t('invoices.pending')}</option>
            <option value="paid">{t('invoices.paid')}</option>
            <option value="refunded">{t('invoices.refunded')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('invoices.id'), t('invoices.number'), t('invoices.patient'),
            t('invoices.amount'), t('invoices.status'), t('invoices.date'), t('invoices.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('invoices.no_data')} />
            : paginated.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-700">{item.invoice_number || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-800">{patientName(item)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                    {Number(item.amount).toLocaleString()} {item.currency || 'UZS'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{fmtDate(item.created_at)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setViewItem(item)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {viewItem && (
          <DetailModal
            title={t('invoices.view_title')}
            onClose={() => setViewItem(null)}
            rows={[
              { label: t('invoices.id'), value: viewItem.id },
              { label: t('invoices.number'), value: viewItem.invoice_number },
              { label: t('invoices.patient'), value: patientName(viewItem) },
              { label: t('invoices.amount'), value: `${Number(viewItem.amount).toLocaleString()} ${viewItem.currency || 'UZS'}` },
              { label: t('invoices.status'), value: viewItem.status },
              { label: t('invoices.date'), value: fmtDate(viewItem.created_at) },
            ]}
          />
        )}
      </div>
    </Layout>
  );
}
