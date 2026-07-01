import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import DetailModal from '../components/DetailModal';

const PAGE_SIZE = 10;

export default function MedicalCenters() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();
  const navigate    = useNavigate();

  useEffect(() => {
    api.get('/clinics/medicalcenter/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const name = lang === 'ru' ? (i.name_ru || i.name_uz) : i.name_uz;
    return (
      (name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.contact || '').includes(search) ||
      (i.address || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[
            { label: t('menu.clinics_centers') },
            { label: t('menu.medical_centers') },
          ]}
          title={t('mc.title')}
        />

        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('mc.search')}
          />
        </div>

        <Table
          columns={[
            t('mc.id'), t('mc.name'), t('mc.address'),
            t('mc.contact'), t('mc.status'), t('mc.actions'),
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
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-xs">
                    <span className="line-clamp-1">{item.address || '—'}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{item.contact || '—'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status || 'active'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        title={t('common.view')}
                        onClick={() => setViewItem(item)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title={t('common.edit')}
                        onClick={() => navigate(`/medical-centers/create?edit=${item.id}`)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {viewItem && (
          <DetailModal
            title={t('mc.view_title')}
            onClose={() => setViewItem(null)}
            rows={[
              { label: t('mc.id'), value: viewItem.id },
              { label: t('mc.name'), value: viewItem.name_uz },
              { label: t('mc.name') + ' (RU)', value: viewItem.name_ru },
              { label: t('mc.address'), value: viewItem.address, full: true },
              { label: t('mc.contact'), value: viewItem.contact },
              { label: t('mc.email'), value: viewItem.email },
              { label: t('mc.status'), value: viewItem.status },
            ]}
          />
        )}
      </div>
    </Layout>
  );
}
