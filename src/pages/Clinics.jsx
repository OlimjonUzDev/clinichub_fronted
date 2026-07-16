import { useEffect, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import ClinicEditModal from '../components/ClinicEditModal';
import DetailModal from '../components/DetailModal';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';

const PAGE_SIZE = 6;

export default function Clinics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const medicalCenters = useLookup('/clinics/medicalcenter/', token);
  const clinicTypes = useLookup('/clinics/clinictype/', token);
  const typeName = (i) => resolveName(i.clinic_type, clinicTypes, lang);
  const centerName = (i) => resolveName(i.medical_center, medicalCenters, lang);

  const handleDelete = async (id) => {
    if (!confirm(t('clinics.delete_confirm'))) return;
    try {
      await api.delete(`/clinics/clinics/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert(t('clinics.delete_error')); }
  };

  useEffect(() => {
    fetchAll('/clinics/clinics/', token)
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch =
      (typeName(i) || '').toLowerCase().includes(search.toLowerCase()) ||
      (centerName(i) || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.phone_number || '').includes(search);
    const matchStatus = !statusFilter || (i.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.clinics_centers') }, { label: t('menu.clinics') }]}
          title={t('clinics.title')}
          createPath="/clinics/create"
          createLabel={t('common.create')}
        />

        <div className="flex gap-3 mb-4">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder={t('clinics.search')} />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('clinics.status_all')}</option>
            <option value="active">{t('clinics.active')}</option>
            <option value="inactive">{t('clinics.inactive')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('clinics.id'), t('clinics.clinic_type'), t('clinics.medical_center'),
            t('clinics.contact'), t('clinics.status'), t('clinics.doctors'),
            t('clinics.actions')
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('clinics.no_data')} />
            : paginated.map(item => {
              const ct = resolveRef(item.clinic_type, clinicTypes);
              const mc = resolveRef(item.medical_center, medicalCenters);
              return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm text-gray-500 w-16">{item.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{ct?.name_uz || '—'}</div>
                  {ct?.name_ru && <div className="text-xs text-gray-400">{ct.name_ru}</div>}
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm text-gray-700">{mc?.name_uz || '—'}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{item.phone_number || '—'}</td>
                <td className="px-5 py-4"><StatusBadge status={item.status || 'active'} /></td>
                <td className="px-5 py-4 text-sm text-gray-500">{item.doctors_count ?? '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewItem(item)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => setEditItem(item)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition">
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

        {viewItem && (
          <DetailModal
            title={t('clinics.view_title')}
            onClose={() => setViewItem(null)}
            rows={[
              { label: t('clinics.id'), value: viewItem.id },
              { label: t('clinics.clinic_type'), value: typeName(viewItem) },
              { label: t('clinics.medical_center'), value: centerName(viewItem) },
              { label: t('clinics.contact'), value: viewItem.phone_number },
              { label: t('clinics.status'), value: viewItem.status },
              { label: t('clinics.doctors'), value: viewItem.doctors_count },
            ]}
          />
        )}

        {editItem && (
          <ClinicEditModal
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
