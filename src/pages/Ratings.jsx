import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { SearchBar, Table, EmptyState, Pagination } from '../components/DataTable';

const PAGE_SIZE = 10;

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
      <span className="ml-1.5 text-xs font-semibold text-gray-500">{score}/5</span>
    </div>
  );
}

export default function Ratings() {
  const [ratings, setRatings]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [scoreFilter, setScore]   = useState('');
  const [page, setPage]           = useState(1);
  const { token }                 = useAuth();
  const { t, lang }               = useLang();

  useEffect(() => {
    api.get('/appointments/rating/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setRatings(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = ratings.filter(r => {
    const doctorName = lang === 'ru'
      ? (r.doctor?.name_ru || r.doctor?.name_uz || '')
      : (r.doctor?.name_uz || '');
    const comment = (r.comment || '').toLowerCase();
    const matchSearch =
      doctorName.toLowerCase().includes(search.toLowerCase()) ||
      comment.includes(search.toLowerCase()) ||
      String(r.appointment?.id ?? r.appointment ?? '').includes(search);
    const matchScore = scoreFilter === '' || String(r.score) === scoreFilter;
    return matchSearch && matchScore;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgScore = ratings.length
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null;

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

        {/* Summary strip */}
        {!loading && ratings.length > 0 && (
          <div className="flex items-center gap-6 mb-6 bg-white border border-gray-100 rounded-xl px-6 py-4">
            <div>
              <p className="text-xs text-gray-400">{t('ratings.total')}</p>
              <p className="text-2xl font-bold text-gray-800">{ratings.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-400">{t('ratings.average')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-gray-800">{avgScore}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            {/* Inline distribution */}
            <div className="flex items-end gap-1 h-8">
              {[1, 2, 3, 4, 5].map(s => {
                const cnt = ratings.filter(r => r.score === s).length;
                const pct = Math.round((cnt / ratings.length) * 100);
                return (
                  <div key={s} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-5 rounded-t bg-yellow-400 transition-all"
                      style={{ height: `${Math.max(4, pct * 0.28)}px` }}
                      title={`${s}★ — ${cnt}`}
                    />
                    <span className="text-[10px] text-gray-400">{s}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 italic">{t('ratings.readonly_note')}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={t('ratings.search')}
          />
          <select
            value={scoreFilter}
            onChange={e => { setScore(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-gray-600"
          >
            <option value="">{t('ratings.filter_all')}</option>
            {[5, 4, 3, 2, 1].map(s => (
              <option key={s} value={String(s)}>{'★'.repeat(s)} {s}</option>
            ))}
          </select>
        </div>

        {/* Table — read only, no actions column */}
        <Table
          columns={[
            t('ratings.appt_id'),
            t('ratings.doctor'),
            t('ratings.score'),
            t('ratings.comment'),
            t('ratings.date'),
          ]}
          loading={loading}
        >
          {paginated.length === 0 && !loading
            ? <EmptyState message={t('ratings.no_data')} />
            : paginated.map(r => {
              const apptId = r.appointment?.id ?? r.appointment ?? '—';
              const doctorName = lang === 'ru'
                ? (r.doctor?.name_ru || r.doctor?.name_uz || '—')
                : (r.doctor?.name_uz || '—');
              const speciality = lang === 'ru'
                ? r.doctor?.speciality?.name_ru
                : r.doctor?.speciality?.name_uz;
              const date = r.created_at
                ? new Date(r.created_at).toLocaleDateString(
                    lang === 'ru' ? 'ru-RU' : 'uz-UZ',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )
                : '—';

              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  {/* Appointment ID */}
                  <td className="px-5 py-4 text-sm font-mono text-gray-500">
                    #{apptId}
                  </td>

                  {/* Doctor */}
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-gray-800">{doctorName}</div>
                    {speciality && (
                      <div className="text-xs text-gray-400">{speciality}</div>
                    )}
                  </td>

                  {/* Stars */}
                  <td className="px-5 py-4">
                    <Stars score={r.score} />
                  </td>

                  {/* Comment */}
                  <td className="px-5 py-4 text-sm text-gray-600 max-w-sm">
                    {r.comment
                      ? <span className="line-clamp-2 leading-relaxed">{r.comment}</span>
                      : <span className="text-gray-300 italic text-xs">{t('ratings.no_comment')}</span>
                    }
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                    {date}
                  </td>
                </tr>
              );
            })
          }
        </Table>

        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </Layout>
  );
}
