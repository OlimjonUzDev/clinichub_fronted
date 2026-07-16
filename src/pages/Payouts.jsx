import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import DetailModal from '../components/DetailModal';
import { useLookup, resolveName } from '../lib/useLookup';

const PAGE_SIZE = 6;

export default function Payouts() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [viewItem, setViewItem]   = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();
  const doctors = useLookup('/doctors/doctor/', token);
  const doctorName = (i) => resolveName(i.doctor, doctors, lang) || '—';

  useEffect(() => {
    fetchAll('/billing/doctorpayout/', token)
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = doctorName(i).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.financial') }, { label: t('menu.doctor_payouts') }]}
          title={t('payouts.title')}
        />

        <div className="flex gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('payouts.search')}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('payouts.all_statuses')}</option>
            <option value="pending">{t('payouts.pending')}</option>
            <option value="paid">{t('payouts.paid')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('payouts.id'), t('payouts.doctor'), t('payouts.period'),
            t('payouts.amount'), t('payouts.status'), t('payouts.paid_at'), t('payouts.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('payouts.no_data')} />
            : paginated.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-800">{doctorName(item)}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {fmtDate(item.period_from)} — {fmtDate(item.period_to)}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                    {Number(item.amount).toLocaleString()} UZS
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {item.paid_at ? fmtDate(item.paid_at) : '—'}
                  </td>
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
            title={t('payouts.view_title')}
            onClose={() => setViewItem(null)}
            rows={[
              { label: t('payouts.id'), value: viewItem.id },
              { label: t('payouts.doctor'), value: doctorName(viewItem) },
              { label: t('payouts.period'), value: `${fmtDate(viewItem.period_from)} — ${fmtDate(viewItem.period_to)}` },
              { label: t('payouts.amount'), value: `${Number(viewItem.amount).toLocaleString()} UZS` },
              { label: t('payouts.status'), value: viewItem.status },
              { label: t('payouts.paid_at'), value: viewItem.paid_at ? fmtDate(viewItem.paid_at) : null },
            ]}
          />
        )}
      </div>
    </Layout>
  );
}
