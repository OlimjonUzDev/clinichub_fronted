import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';
import RankTypeEditModal from '../components/RankTypeEditModal';

const PAGE_SIZE = 10;

export default function RankTypes() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [editItem, setEditItem] = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/catalog/ranktyp/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    (i.name_uz || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.name_ru || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('rank_types.delete_confirm'))) return;
    try {
      await api.delete(`/catalog/ranktyp/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert(t('rank_types.delete_error')); }
  };

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.pricing_ranks') }, { label: t('menu.rank_types') }]}
          title={t('rank_types.title')}
          createPath="/rank-types/create"
          createLabel={t('common.create')}
        />

        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('rank_types.search')}
          />
        </div>

        <Table
          columns={[
            t('rank_types.id'), t('rank_types.name_uz'),
            t('rank_types.name_ru'), t('rank_types.created_at'), t('rank_types.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('rank_types.no_data')} />
            : paginated.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{item.name_uz || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{item.name_ru || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-400">{fmtDate(item.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditItem(item)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                    >
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
            ))
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {editItem && (
          <RankTypeEditModal
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
