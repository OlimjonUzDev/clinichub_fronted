import { useEffect, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';

const PAGE_SIZE = 10;

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { token } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    api.get('/patients/patient/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setPatients(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    (p.name_uz || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.name_ru || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone_number || '').includes(search)
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.patients_encounters') }, { label: t('menu.patients') }]}
          title={t('patients.title')}
          createPath="/patients/create"
          createLabel={t('common.create')}
        />

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder={t('patients.search')} />
        </div>

        <Table
          columns={[
            t('patients.id'), t('patients.name'), t('patients.email'),
            t('patients.phone'), t('patients.national_id'), t('patients.actions')
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('patients.no_data')} />
            : paginated.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{p.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{p.name_uz || '—'}</div>
                  <div className="text-xs text-gray-400">{p.name_ru || ''}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{p.user?.email || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{p.phone_number || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{p.address || '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                      <Eye size={13} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                      <Pencil size={13} />
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
