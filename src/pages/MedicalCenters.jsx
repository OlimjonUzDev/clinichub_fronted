import { useEffect, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';

const PAGE_SIZE = 10;

export default function MedicalCenters() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const { token }   = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/clinics/medicalcenter/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const name = lang === 'ru' ? (i.name_ru || i.name_uz) : i.name_uz;
    const matchSearch =
      (name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.contact || '').includes(search) ||
      (i.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('mc.delete_confirm'))) return;
    try {
      await api.delete(`/clinics/medicalcenter/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert(t('mc.delete_error')); }
  };

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.clinics_centers') },
            { label: t('menu.medical_centers') },
          ]}
          title={t('mc.title')}
          createPath="/medical-centers/create"
          createLabel={t('common.create')}
        />

        <div className="flex gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('mc.search')}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('clinics.status_all')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('mc.id'), t('mc.name'), t('mc.contact'),
            t('mc.email'), t('mc.address'), t('mc.status'), t('mc.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('mc.no_data')} />
            : paginated.map(item => {
              const name    = lang === 'ru' ? (item.name_ru || item.name_uz) : item.name_uz;
              const subname = lang === 'ru' ? item.name_uz : item.name_ru;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-800">{name || '—'}</div>
                    {subname && <div className="text-xs text-gray-400">{subname}</div>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{item.contact || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{item.email || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-xs">
                    <span className="line-clamp-1">{item.address || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status || 'active'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                        <Eye size={13} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
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
      </div>
    </Layout>
  );
}
