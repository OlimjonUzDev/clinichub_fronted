import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Calendar, Ban, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';
import DoctorScheduleModal from '../components/DoctorScheduleModal';
import { useLookup, resolveName, resolveRef } from '../lib/useLookup';

const PAGE_SIZE = 10;

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [scheduleDoctorId, setScheduleDoctorId] = useState(null);
  const { token } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const specialities = useLookup('/catalog/specialities/', token);
  const rankTypes = useLookup('/catalog/ranktyp/', token);
  const clinics = useLookup('/clinics/clinics/', token);
  const clinicTypes = useLookup('/clinics/clinictype/', token);
  const clinicLabel = (doc) => {
    const clinic = resolveRef(doc.clinic, clinics);
    const ct = clinic ? resolveRef(clinic.clinic_type, clinicTypes) : null;
    return (ct && resolveName(ct, clinicTypes, lang)) || clinic?.phone_number || '—';
  };

  useEffect(() => {
    api.get('/doctors/doctor/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setDoctors(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    (d.name_uz || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.name_ru || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t('doctors.delete_confirm'))) return;
    try {
      await api.delete(`/doctors/doctor/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch { alert(t('doctors.delete_error')); }
  };

  const handleToggleActive = async (doc) => {
    const confirmMsg = doc.is_active ? t('doctors.deactivate_confirm') : t('doctors.activate_confirm');
    if (!confirm(confirmMsg)) return;
    try {
      const res = await api.patch(`/doctors/doctor/${doc.id}/`, { is_active: !doc.is_active }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(prev => prev.map(d => d.id === doc.id ? res.data : d));
    } catch { alert(t('doctors.status_error')); }
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
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder={t('doctors.search')} />
        </div>

        <Table
          columns={[
            t('doctors.id'), t('doctors.name'), t('doctors.speciality'),
            t('doctors.gender'), t('doctors.clinic_type'), t('doctors.rank'),
            t('doctors.experience'), t('doctors.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('doctors.no_data')} />
            : paginated.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{doc.id}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-gray-800">{doc.name_uz || '—'}</div>
                  <div className="text-xs text-gray-400">{doc.name_ru || ''}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{resolveName(doc.speciality, specialities, lang) || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.gender || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{clinicLabel(doc)}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{resolveName(doc.rank_type, rankTypes, lang) || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{doc.experience_years ?? '—'}</td>
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
                    <button
                      onClick={() => setScheduleDoctorId(doc.id)}
                      title={t('doctor_schedule.title')}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition"
                    >
                      <Calendar size={13} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(doc)}
                      title={doc.is_active ? t('doctors.deactivate') : t('doctors.activate')}
                      className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 transition ${doc.is_active ? 'hover:border-red-400 hover:text-red-500' : 'hover:border-green-400 hover:text-green-600'}`}
                    >
                      {doc.is_active ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

        {scheduleDoctorId && (
          <DoctorScheduleModal
            doctorId={scheduleDoctorId}
            onClose={() => setScheduleDoctorId(null)}
          />
        )}
      </div>
    </Layout>
  );
}
