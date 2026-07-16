import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api, { fetchAll } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Table, EmptyState, Pagination } from '../components/DataTable';
import ColumnFilter from '../components/ColumnFilter';

const PAGE_SIZE = 6;

function Stars({ score }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export default function Ratings() {
  const [ratings, setRatings]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [encounterFilter, setEncounter] = useState('');
  const [scoreFilter, setScore]         = useState('');
  const [page, setPage]                 = useState(1);
  const { token } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    fetchAll('/appointments/rating/', token)
      .then(data => { setRatings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const encounterId = (r) => r.appointment?.id ?? r.appointment;

  const encounterOptions = [...new Set(ratings.map(r => encounterId(r)))]
    .filter(id => id !== undefined && id !== null)
    .sort((a, b) => b - a)
    .map(id => ({ value: String(id), label: String(id) }));

  const scoreOptions = [5, 4, 3, 2, 1].map(s => ({ value: String(s), label: '★'.repeat(s) + ' ' + s }));

  const filtered = ratings.filter(r => {
    const matchEncounter = !encounterFilter || String(encounterId(r)) === encounterFilter;
    const matchScore = !scoreFilter || String(r.score) === scoreFilter;
    return matchEncounter && matchScore;
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
          breadcrumbs={[
            { label: t('menu.doctors_staff') },
            { label: t('menu.ratings') },
          ]}
          title={t('ratings.title')}
        />

        <Table
          columns={[
            t('ratings.id'),
            <span key="enc">
              {t('ratings.encounter_id')}
              <ColumnFilter
                options={encounterOptions}
                value={encounterFilter}
                onChange={v => { setEncounter(v); setPage(1); }}
                allLabel={t('ratings.filter_all')}
              />
            </span>,
            <span key="score">
              {t('ratings.score')}
              <ColumnFilter
                options={scoreOptions}
                value={scoreFilter}
                onChange={v => { setScore(v); setPage(1); }}
                allLabel={t('ratings.filter_all')}
              />
            </span>,
            t('ratings.comment'),
            t('ratings.date'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('ratings.no_data')} />
            : paginated.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500">{r.id}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{encounterId(r) ?? '—'}</td>
                <td className="px-5 py-4"><Stars score={r.score} /></td>
                <td className="px-5 py-4 text-sm text-gray-600 max-w-sm">
                  {r.comment || <span className="text-gray-300 italic text-xs">{t('ratings.no_comment')}</span>}
                </td>
                <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{fmtDate(r.created_at)}</td>
              </tr>
            ))
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </Layout>
  );
}
