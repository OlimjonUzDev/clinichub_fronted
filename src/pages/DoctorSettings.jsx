import { useEffect, useState } from 'react';
import { Pencil, CheckCircle2, Circle } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';
import DoctorSettingsEditModal from '../components/DoctorSettingsEditModal';

const PAGE_SIZE = 6;

export default function DoctorSettings() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const { token } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    fetchAll('/doctors/doctor/', token)
      .then(data => { setDoctors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    (d.name_uz || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.name_ru || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.financial') }, { label: t('menu.doctors_settings') }]}
          title={t('doctor_settings.title')}
        />

        <div className="mb-4">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder={t('doctor_settings.search')} />
        </div>

        <Table
          columns={[
            t('doctor_settings.id'), t('doctor_settings.name'), t('doctor_settings.bank_name'),
            t('doctor_settings.iban'), t('doctor_settings.revenue'), t('doctor_settings.auto_payout'),
            t('doctor_settings.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('doctor_settings.no_data')} />
            : paginated.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{doc.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{doc.name_uz || '—'}</div>
                  <div className="text-xs text-gray-400">{doc.name_ru || ''}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.bank_name || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.iban || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {doc.revenue_percentage != null ? `${Math.round(doc.revenue_percentage * 100)}%` : '—'}
                </td>
                <td className="px-5 py-4">
                  {doc.auto_payout
                    ? <CheckCircle2 size={16} className="text-green-500" />
                    : <Circle size={16} className="text-gray-300" />}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setEditItem(doc)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                  >
                    <Pencil size={13} />
                  </button>
                </td>
              </tr>
            ))
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {editItem && (
          <DoctorSettingsEditModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSaved={(updated) => {
              setDoctors(prev => prev.map(d => d.id === updated.id ? updated : d));
              setEditItem(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
