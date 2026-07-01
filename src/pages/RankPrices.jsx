import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import RankPriceEditModal from '../components/RankPriceEditModal';

const PAGE_SIZE = 10;

export default function RankPrices() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeFilter, setActive] = useState('');
  const [page, setPage]           = useState(1);
  const [editItem, setEditItem]   = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/catalog/rankprice/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const rankName = lang === 'ru'
      ? (i.rank_type?.name_ru || i.rank_type?.name_uz || '')
      : (i.rank_type?.name_uz || '');
    const matchSearch = rankName.toLowerCase().includes(search.toLowerCase());
    const matchActive = activeFilter === ''
      || (activeFilter === 'true' && i.is_active)
      || (activeFilter === 'false' && !i.is_active);
    return matchSearch && matchActive;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('rank_prices.delete_confirm'))) return;
    try {
      await api.delete(`/catalog/rankprice/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert(t('rank_prices.delete_error')); }
  };

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.pricing_ranks') }, { label: t('menu.rank_prices') }]}
          title={t('rank_prices.title')}
          createPath="/rank-prices/create"
          createLabel={t('common.create')}
        />

        <div className="flex gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('rank_prices.search')}
          />
          <select
            value={activeFilter}
            onChange={e => { setActive(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('rank_prices.all')}</option>
            <option value="true">{t('common.active')}</option>
            <option value="false">{t('common.inactive')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('rank_prices.id'), t('rank_prices.rank_type'), t('rank_prices.clinic'),
            t('rank_prices.price'), t('rank_prices.duration'), t('rank_prices.status'), t('rank_prices.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('rank_prices.no_data')} />
            : paginated.map(item => {
              const rankName = lang === 'ru'
                ? (item.rank_type?.name_ru || item.rank_type?.name_uz || '—')
                : (item.rank_type?.name_uz || '—');
              const clinicName = item.clinic?.clinic_type
                ? (lang === 'ru'
                    ? (item.clinic.clinic_type.name_ru || item.clinic.clinic_type.name_uz)
                    : item.clinic.clinic_type.name_uz)
                : (item.clinic?.phone_number || '—');

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{rankName}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{clinicName}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                    {Number(item.price).toLocaleString()} {item.currency || 'UZS'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {item.duration_min} {t('rank_prices.min')}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditItem(item)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {editItem && (
          <RankPriceEditModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSaved={(updated) => {
              setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
              setEditItem(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
