import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Calendar, Ban } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';

const PAGE_SIZE = 10;

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { token } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors/doctor/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setDoctors(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    (d.user || '').toString().toLowerCase().includes(search.toLowerCase()) ||
    (d.speciality || '').toString().toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('doctors.delete_confirm'))) return;
    try {
      await api.delete(`/doctors/doctor/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch { alert(t('doctors.delete_error')); }
  };

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.doctors_staff') }, { label: t('menu.doctors') }]}
          title={t('doctors.title')}
          createPath="/doctors/create"
          createLabel={t('common.create')}
        />

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder={t('doctors.search')} />
        </div>

        <Table
          columns={[
            t('doctors.id'), t('doctors.name'), t('doctors.email'),
            t('doctors.gender'), t('doctors.clinic_type'), t('doctors.rank'),
            t('doctors.status'), t('doctors.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('doctors.no_data')} />
            : paginated.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{doc.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{doc.user}</div>
                  <div className="text-xs text-gray-400">{doc.user}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.email || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.gender || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.clinic || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.rank_type || '—'}</td>
                <td className="px-5 py-4"><StatusBadge status={doc.status || 'active'} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => navigate(`/doctors/${doc.id}`)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => navigate(`/doctors/${doc.id}/edit`)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(doc.id)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition">
                      <Trash2 size={13} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-400 transition">
                      <Calendar size={13} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-400 transition">
                      <Ban size={13} />
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
