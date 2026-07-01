import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import DetailModal from '../components/DetailModal';

const PAGE_SIZE = 10;

export default function Appointments() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [viewItem, setViewItem]   = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/appointments/appointment/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const patient = lang === 'ru'
      ? (i.patient?.name_ru || i.patient?.name_uz || '')
      : (i.patient?.name_uz || '');
    const doctor = lang === 'ru'
      ? (i.doctor?.name_ru || i.doctor?.name_uz || '')
      : (i.doctor?.name_uz || '');
    const matchSearch =
      patient.toLowerCase().includes(search.toLowerCase()) ||
      doctor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('appt.delete_confirm'))) return;
    try {
      await api.delete(`/appointments/appointment/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { alert(t('appt.delete_error')); }
  };

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.patients_encounters') }, { label: t('menu.appointments') }]}
          title={t('appt.title')}
        />

        <div className="flex gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('appt.search')}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('appt.all_statuses')}</option>
            <option value="pending">{t('appt.pending')}</option>
            <option value="confirmed">{t('appt.confirmed')}</option>
            <option value="completed">{t('appt.completed')}</option>
            <option value="cancelled">{t('appt.cancelled')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('appt.id'), t('appt.patient'), t('appt.doctor'),
            t('appt.start_time'), t('appt.status'), t('appt.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('appt.no_data')} />
            : paginated.map(item => {
              const patientName = lang === 'ru'
                ? (item.patient?.name_ru || item.patient?.name_uz || '—')
                : (item.patient?.name_uz || '—');
              const doctorName = lang === 'ru'
                ? (item.doctor?.name_ru || item.doctor?.name_uz || '—')
                : (item.doctor?.name_uz || '—');

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-800">{patientName}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-700">{doctorName}</div>
                    {item.doctor?.speciality?.name_uz && (
                      <div className="text-xs text-gray-400">{item.doctor.speciality.name_uz}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {fmtDate(item.start_time)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewItem(item)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                        <Eye size={13} />
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

        {viewItem && (
          <DetailModal
            title={t('appt.view_title')}
            onClose={() => setViewItem(null)}
            rows={[
              { label: t('appt.id'), value: viewItem.id },
              { label: t('appt.patient'), value: lang === 'ru' ? (viewItem.patient?.name_ru || viewItem.patient?.name_uz) : viewItem.patient?.name_uz },
              { label: t('appt.doctor'), value: lang === 'ru' ? (viewItem.doctor?.name_ru || viewItem.doctor?.name_uz) : viewItem.doctor?.name_uz },
              { label: t('appt.start_time'), value: fmtDate(viewItem.start_time) },
              { label: t('appt.end_time'), value: fmtDate(viewItem.end_time) },
              { label: t('appt.status'), value: viewItem.status },
              { label: t('appt.notes'), value: viewItem.notes, full: true },
            ]}
          />
        )}
      </div>
    </Layout>
  );
}
