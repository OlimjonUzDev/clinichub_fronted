import { useEffect, useState } from 'react';
import { Eye, Ban, CalendarClock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, StatusBadge, Table, EmptyState, Pagination } from '../components/DataTable';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import AppointmentCreateModal from '../components/AppointmentCreateModal';
import AppointmentCancelModal from '../components/AppointmentCancelModal';
import AppointmentRescheduleModal from '../components/AppointmentRescheduleModal';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';

const PAGE_SIZE = 10;

export default function Appointments() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [viewItem, setViewItem]       = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [cancelItem, setCancelItem]   = useState(null);
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const { token }   = useAuth();
  const { t, lang } = useLang();
  const patients = useLookup('/patients/patient/', token);
  const doctors  = useLookup('/doctors/doctor/', token);
  const users    = useLookup('/users/', token);
  const specialities = useLookup('/catalog/specialities/', token);
  const patientName = (i) => resolveName(i.patient, patients, lang) || '—';
  const doctorName  = (i) => resolveName(i.doctor, doctors, lang) || '—';
  const cancelledByName = (i) => resolveRef(i.cancelled_by, users)?.username || null;

  useEffect(() => {
    api.get('/appointments/appointment/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch =
      patientName(i).toLowerCase().includes(search.toLowerCase()) ||
      doctorName(i).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateItem = (updated) => setItems(prev => prev.map(i => i.id === updated.id ? updated : i));

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
          onCreate={() => setShowCreate(true)}
          createLabel={t('appt.add')}
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
            t('appt.id'), t('appt.patient'), t('appt.doctor'), t('appt.consultation_type'),
            t('appt.start_time'), t('appt.status'), t('appt.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('appt.no_data')} />
            : paginated.map(item => {
              const doctorObj = resolveRef(item.doctor, doctors);
              const specialityName = doctorObj && resolveName(doctorObj.speciality, specialities, lang);

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-800">{patientName(item)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-700">{doctorName(item)}</div>
                    {specialityName && (
                      <div className="text-xs text-gray-400">{specialityName}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {t(`consult.${item.consultation_type}`)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {fmtDate(item.start_time)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewItem(item)} title={t('appt.tab_info')} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                        <Eye size={13} />
                      </button>
                      {item.status !== 'cancelled' && item.status !== 'completed' && (
                        <button
                          onClick={() => setRescheduleItem(item)}
                          title={t('appt.reschedule')}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition"
                        >
                          <CalendarClock size={13} />
                        </button>
                      )}
                      {item.status !== 'cancelled' && (
                        <button
                          onClick={() => setCancelItem(item)}
                          title={t('appt.cancel_action')}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition"
                        >
                          <Ban size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {viewItem && (
          <AppointmentDetailModal
            item={viewItem}
            onClose={() => setViewItem(null)}
            fmtDate={fmtDate}
            patientName={patientName(viewItem)}
            doctorName={doctorName(viewItem)}
            cancelledByName={cancelledByName(viewItem)}
          />
        )}

        {showCreate && (
          <AppointmentCreateModal
            onClose={() => setShowCreate(false)}
            onCreated={(created) => {
              setItems(prev => [created, ...prev]);
              setShowCreate(false);
            }}
          />
        )}

        {cancelItem && (
          <AppointmentCancelModal
            item={cancelItem}
            onClose={() => setCancelItem(null)}
            onCancelled={(updated) => {
              updateItem(updated);
              setCancelItem(null);
            }}
          />
        )}

        {rescheduleItem && (
          <AppointmentRescheduleModal
            item={rescheduleItem}
            onClose={() => setRescheduleItem(null)}
            onRescheduled={(updated) => {
              updateItem(updated);
              setRescheduleItem(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
