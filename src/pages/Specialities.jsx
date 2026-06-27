import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';

const PAGE_SIZE = 10;

export default function Specialities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { token } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    api.get('/catalog/speciality/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('common.delete') + '?')) return;
    try {
      await api.delete(`/catalog/speciality/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
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
          <SearchBar value={search} onChange={setSearch} placeholder={t('specialities.search')} />
        </div>

        <Table columns={[t('specialities.id'), t('specialities.name'), t('specialities.actions')]} loading={loading}>
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('specialities.no_data')} />
            : paginated.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm text-gray-500 w-20">{item.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{item.name}</div>
                  {item.name_ar && <div className="text-xs text-gray-400">{item.name_ar}</div>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
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
      </div>
    </Layout>
  );
}
