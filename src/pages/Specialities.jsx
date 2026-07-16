import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';
import SpecialityEditModal from '../components/SpecialityEditModal';

const PAGE_SIZE = 6;

export default function Specialities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const { token } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    fetchAll('/catalog/specialities/', token)
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    (i.name_uz || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.name_ru || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('common.delete') + '?')) return;
    try {
      await api.delete(`/catalog/specialities/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert(t('doctors.delete_error')); }
  };

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.doctors_staff') }, { label: t('menu.specialities') }]}
          title={t('specialities.title')}
          createPath="/specialities/create"
          createLabel={t('common.create')}
        />

        <div className="mb-4">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder={t('specialities.search')} />
        </div>

        <Table columns={[t('specialities.id'), t('specialities.name'), t('specialities.actions')]} loading={loading}>
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('specialities.no_data')} />
            : paginated.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm text-gray-500 w-20">{item.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{item.name_uz}</div>
                  {item.name_ru && <div className="text-xs text-gray-400">{item.name_ru}</div>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditItem(item)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition">
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
          <SpecialityEditModal
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
