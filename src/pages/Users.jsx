import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';

const PAGE_SIZE = 10;

const ROLE_COLORS = {
  admin:   'text-red-600 bg-red-50 border-red-300',
  doctor:  'text-blue-600 bg-blue-50 border-blue-300',
  patient: 'text-green-600 bg-green-50 border-green-300',
};

function RoleBadge({ role }) {
  const cls = ROLE_COLORS[role] || 'text-gray-500 bg-gray-50 border-gray-300';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${cls}`}>
      {role}
    </span>
  );
}

export default function Users() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [page, setPage]         = useState(1);
  const { token } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/users/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch =
      (i.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.email    || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.phone_number || '').includes(search);
    const matchRole = !roleFilter || i.role === roleFilter;
    return matchSearch && matchRole;
  });
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmtDate = (dt) => dt
    ? new Date(dt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

  return (
    <Layout>
      <div className="p-8">
        <PageHeader
          breadcrumbs={[{ label: t('menu.administration') }, { label: t('menu.users') }]}
          title={t('users.title')}
        />

        <div className="flex gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('users.search')}
          />
          <select
            value={roleFilter}
            onChange={e => { setRole(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">{t('users.all_roles')}</option>
            <option value="admin">{t('users.role_admin')}</option>
            <option value="doctor">{t('users.role_doctor')}</option>
            <option value="patient">{t('users.role_patient')}</option>
          </select>
        </div>

        <Table
          columns={[
            t('users.id'), t('users.username'), t('users.email'),
            t('users.role'), t('users.phone'), t('users.created_at'), t('users.actions'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('users.no_data')} />
            : paginated.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{item.id}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{item.username || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{item.email || '—'}</td>
                <td className="px-5 py-4"><RoleBadge role={item.role} /></td>
                <td className="px-5 py-4 text-sm text-gray-500">{item.phone_number || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-400">{fmtDate(item.created_at)}</td>
                <td className="px-5 py-4">
                  <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
                    <Eye size={13} />
                  </button>
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
