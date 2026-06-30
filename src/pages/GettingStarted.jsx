import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Rocket, ChevronRight, ChevronLeft,
  ChevronDown, Eye, Plus, SkipForward, Info,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Layout from '../components/Layout';

const inputCls    = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition";
const selectCls   = `${inputCls} appearance-none`;
const textareaCls = `${inputCls} resize-none`;

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {label}
    </label>
    {children}
  </div>
);

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    key:      'medical_center',
    checkUrl: '/clinics/medicalcenter/',
    postUrl:  '/clinics/medicalcenter/',
    viewPath: '/medical-centers',
    defaults: { name_uz: '', name_ru: '', contact: '', email: '', address: '', logo: '', website: '', status: 'active' },
  },
  {
    key:      'clinic_type',
    checkUrl: '/clinics/clinictype/',
    postUrl:  '/clinics/clinictype/',
    viewPath: null,
    defaults: { name_uz: '', name_ru: '' },
  },
  {
    key:      'speciality',
    checkUrl: '/catalog/specialities/',
    postUrl:  '/catalog/specialities/',
    viewPath: '/specialities',
    defaults: { name_uz: '', name_ru: '' },
  },
  {
    key:      'rank_type',
    checkUrl: '/catalog/ranktyp/',
    postUrl:  '/catalog/ranktyp/',
    viewPath: '/rank-types',
    defaults: { name_uz: '', name_ru: '' },
  },
  {
    key:      'clinic',
    checkUrl: '/clinics/clinics/',
    postUrl:  '/clinics/clinics/',
    viewPath: '/clinics',
    defaults: { medical_center: '', clinic_type: '', phone_number: '', status: 'active' },
  },
  {
    key:      'doctor',
    checkUrl: '/doctors/doctor/',
    postUrl:  '/doctors/doctor/',
    viewPath: '/doctors',
    defaults: { user: '', name_uz: '', name_ru: '', gender: 'erkak', speciality: '', rank_type: '', clinic: '', experience_years: 0 },
  },
  {
    key:      'rank_price',
    checkUrl: '/catalog/rankprice/',
    postUrl:  '/catalog/rankprice/',
    viewPath: '/rank-prices',
    defaults: { rank_type: '', clinic: '', price: '', duration_min: 30, currency: 'UZS', is_active: true },
  },
];

// ─── Inline form per step ─────────────────────────────────────────────────────
function StepForm({ stepKey, form, onChange, rel, lang, t }) {
  const nameOf = (item) =>
    item ? (lang === 'ru' ? (item.name_ru || item.name_uz) : item.name_uz) : '';

  const inp = (name, extra = {}) => (
    <input
      value={form[name] ?? ''}
      onChange={e => onChange(name, e.target.value)}
      className={inputCls}
      {...extra}
    />
  );

  const sel = (name, options) => (
    <select
      value={form[name] ?? ''}
      onChange={e => onChange(name, e.target.value)}
      className={selectCls}
    >
      <option value="">{t('gs.select')}</option>
      {options.map(o => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );

  if (stepKey === 'medical_center') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.name_uz')} required>{inp('name_uz')}</Field>
      <Field label={t('gs.name_ru')} required>{inp('name_ru')}</Field>
      <Field label={t('gs.contact')}>
        {inp('contact', { placeholder: '+998 90 123 45 67' })}
      </Field>
      <Field label={t('gs.email')}>
        {inp('email', { type: 'email', placeholder: 'info@klinika.uz' })}
      </Field>
      <Field label={t('gs.address')}>
        <textarea
          value={form.address ?? ''}
          onChange={e => onChange('address', e.target.value)}
          rows={2}
          className={textareaCls}
        />
      </Field>
      <Field label={t('gs.website')}>
        {inp('website', { placeholder: 'https://klinika.uz' })}
      </Field>
      <Field label={t('gs.logo')}>
        {inp('logo', { placeholder: 'https://...' })}
      </Field>
      <Field label={t('gs.status')}>
        <select
          value={form.status ?? 'active'}
          onChange={e => onChange('status', e.target.value)}
          className={selectCls}
        >
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </select>
      </Field>
    </div>
  );

  if (stepKey === 'clinic_type') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.name_uz')} required>{inp('name_uz')}</Field>
      <Field label={t('gs.name_ru')} required>{inp('name_ru')}</Field>
    </div>
  );

  if (stepKey === 'speciality') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.name_uz')} required>{inp('name_uz')}</Field>
      <Field label={t('gs.name_ru')} required>{inp('name_ru')}</Field>
    </div>
  );

  if (stepKey === 'rank_type') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.name_uz')} required>{inp('name_uz')}</Field>
      <Field label={t('gs.name_ru')} required>{inp('name_ru')}</Field>
    </div>
  );

  if (stepKey === 'clinic') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.medical_center')} required>
        {sel('medical_center', rel.medicalCenters.map(m => ({ id: m.id, label: nameOf(m) })))}
      </Field>
      <Field label={t('gs.clinic_type')} required>
        {sel('clinic_type', rel.clinicTypes.map(c => ({ id: c.id, label: nameOf(c) })))}
      </Field>
      <Field label={t('gs.phone')} required>
        {inp('phone_number', { placeholder: '+998 90 123 45 67' })}
      </Field>
    </div>
  );

  if (stepKey === 'doctor') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.user')} required>
        {sel('user', rel.users.map(u => ({ id: u.id, label: u.username || u.email })))}
      </Field>
      <Field label={t('gs.gender')} required>
        <select
          value={form.gender ?? 'erkak'}
          onChange={e => onChange('gender', e.target.value)}
          className={selectCls}
        >
          <option value="erkak">{t('doctor_create.male')}</option>
          <option value="ayol">{t('doctor_create.female')}</option>
        </select>
      </Field>
      <Field label={t('gs.name_uz')} required>{inp('name_uz')}</Field>
      <Field label={t('gs.name_ru')} required>{inp('name_ru')}</Field>
      <Field label={t('gs.speciality')} required>
        {sel('speciality', rel.specialities.map(s => ({ id: s.id, label: nameOf(s) })))}
      </Field>
      <Field label={t('gs.rank')} required>
        {sel('rank_type', rel.rankTypes.map(r => ({ id: r.id, label: nameOf(r) })))}
      </Field>
      <Field label={t('gs.clinic')} required>
        {sel('clinic', rel.clinics.map(c => ({
          id:    c.id,
          label: nameOf(c.clinic_type) || c.phone_number || `Klinika ${c.id}`,
        })))}
      </Field>
    </div>
  );

  if (stepKey === 'rank_price') return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t('gs.rank')} required>
        {sel('rank_type', rel.rankTypes.map(r => ({ id: r.id, label: nameOf(r) })))}
      </Field>
      <Field label={t('gs.clinic')} required>
        {sel('clinic', rel.clinics.map(c => ({
          id:    c.id,
          label: nameOf(c.clinic_type) || c.phone_number || `Klinika ${c.id}`,
        })))}
      </Field>
      <Field label={t('gs.price')} required>
        {inp('price', { type: 'number', min: 0, placeholder: '0' })}
      </Field>
      <Field label={t('gs.duration')}>
        {inp('duration_min', { type: 'number', min: 5, placeholder: '30' })}
      </Field>
    </div>
  );

  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GettingStarted() {
  const { token }   = useAuth();
  const { t, lang } = useLang();
  const navigate    = useNavigate();
  const headers     = { Authorization: `Bearer ${token}` };

  const [done, setDone]             = useState(Array(STEPS.length).fill(false));
  const [activeStep, setActiveStep] = useState(0);
  const [forms, setForms]           = useState(STEPS.map(s => ({ ...s.defaults })));
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);

  const [rel, setRel] = useState({
    medicalCenters: [],
    clinicTypes:    [],
    specialities:   [],
    rankTypes:      [],
    clinics:        [],
    users:          [],
  });

  // ── Mount: load related data + check done state ──────────────────────────
  useEffect(() => {
    const h = { headers };

    api.get('/clinics/medicalcenter/', h).then(r => setRel(p => ({ ...p, medicalCenters: r.data }))).catch(() => {});
    api.get('/clinics/clinictype/',    h).then(r => setRel(p => ({ ...p, clinicTypes:    r.data }))).catch(() => {});
    api.get('/catalog/specialities/', h).then(r => setRel(p => ({ ...p, specialities:   r.data }))).catch(() => {});
    api.get('/catalog/ranktyp/',      h).then(r => setRel(p => ({ ...p, rankTypes:      r.data }))).catch(() => {});
    api.get('/clinics/clinics/',      h).then(r => setRel(p => ({ ...p, clinics:        r.data }))).catch(() => {});
    api.get('/users/',                h).then(r => setRel(p => ({ ...p, users:          r.data }))).catch(() => {});

    Promise.all(
      STEPS.map(s =>
        api.get(s.checkUrl, h)
          .then(r => Array.isArray(r.data) ? r.data.length > 0 : false)
          .catch(() => false)
      )
    ).then(results => {
      setDone(results);
      const first = results.findIndex(d => !d);
      setActiveStep(first === -1 ? STEPS.length : first);
    }).finally(() => setLoading(false));
  }, []);

  // ── Refresh one dropdown list after a save ───────────────────────────────
  const refreshRelated = (stepKey) => {
    const h = { headers };
    const map = {
      medical_center: ['/clinics/medicalcenter/', 'medicalCenters'],
      clinic_type:    ['/clinics/clinictype/',    'clinicTypes'],
      speciality:     ['/catalog/specialities/',  'specialities'],
      rank_type:      ['/catalog/ranktyp/',       'rankTypes'],
      clinic:         ['/clinics/clinics/',       'clinics'],
    };
    if (map[stepKey]) {
      const [url, key] = map[stepKey];
      api.get(url, h).then(r => setRel(p => ({ ...p, [key]: r.data }))).catch(() => {});
    }
  };

  const updateForm = (idx, field, value) =>
    setForms(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });

  const resetForm = (idx) =>
    setForms(prev => {
      const next = [...prev];
      next[idx] = { ...STEPS[idx].defaults };
      return next;
    });

  const submit = async (idx, goNext) => {
    setSaving(true);
    try {
      await api.post(STEPS[idx].postUrl, forms[idx], { headers });
      refreshRelated(STEPS[idx].key);
      setDone(prev => { const n = [...prev]; n[idx] = true; return n; });
      resetForm(idx);
      if (goNext) setActiveStep(idx + 1);
    } catch {
      alert(t('gs.error'));
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const doneCount = done.filter(Boolean).length;
  const pct       = Math.round((doneCount / STEPS.length) * 100);
  const allDone   = doneCount === STEPS.length;

  const TITLES = [
    t('gs.step1'), t('gs.step2'), t('gs.step3'), t('gs.step4'),
    t('gs.step5'), t('gs.step6'), t('gs.step7'),
  ];
  const DESCS = [
    t('gs.step1_desc'), t('gs.step2_desc'), t('gs.step3_desc'), t('gs.step4_desc'),
    t('gs.step5_desc'), t('gs.step6_desc'), t('gs.step7_desc'),
  ];
  const INFOS = [
    t('gs.info1'), t('gs.info2'), t('gs.info3'), t('gs.info4'),
    t('gs.info5'), t('gs.info6'), t('gs.info7'),
  ];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          {t('common.loading')}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">

        {/* ── Page header ── */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <Rocket size={28} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('gs.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('gs.subtitle')}</p>
        </div>

        {/* ── Progress card ── */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center mb-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 mr-4">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap mr-3">
              {doneCount} / {STEPS.length}
            </span>
            <span className="text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-full">
              {pct}% {t('gs.complete')}
            </span>
          </div>

          {/* Step chips */}
          <div className="flex flex-wrap gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(activeStep === i ? -1 : i)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition
                  ${done[i]
                    ? 'border-green-200 text-green-700 bg-green-50'
                    : activeStep === i
                      ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
                      : 'border-gray-200 text-gray-400 bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {done[i]
                  ? <CheckCircle2 size={12} className="text-green-500" />
                  : <Circle size={12} />
                }
                {TITLES[i]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Success banner ── */}
        {allDone && (
          <div className="max-w-3xl mx-auto bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
            <CheckCircle2 size={36} className="text-green-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-green-800 mb-1">{t('gs.success_title')}</h2>
            <p className="text-sm text-green-600 mb-4">{t('gs.success_msg')}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              {t('gs.go_dashboard')}
            </button>
          </div>
        )}

        {/* ── Step cards ── */}
        <div className="max-w-3xl mx-auto space-y-3">
          {STEPS.map((step, i) => {
            const isActive = activeStep === i;
            const isDone   = done[i];

            return (
              <div
                key={i}
                className={`bg-white rounded-xl border transition-shadow
                  ${isActive ? 'border-indigo-200 shadow-sm' : 'border-gray-100'}`}
              >
                {/* Card header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer select-none"
                  onClick={() => setActiveStep(isActive ? -1 : i)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                    ${isDone ? 'bg-green-100' : isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    {isDone
                      ? <CheckCircle2 size={18} className="text-green-500" />
                      : <span className={`text-sm font-bold
                          ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>{i + 1}</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700">{TITLES[i]}</span>
                      {isDone && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {t('gs.done')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{DESCS[i]}</p>
                  </div>

                  {isActive
                    ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
                    : <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  }
                </div>

                {/* Expanded body */}
                {isActive && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">

                    {/* Blue info banner */}
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4">
                      <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-blue-700">{INFOS[i]}</span>
                    </div>

                    {/* Green "already done" banner */}
                    {isDone && (
                      <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-4">
                        <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-green-700">{t('gs.done_msg')}</span>
                      </div>
                    )}

                    {/* Mini form */}
                    <StepForm
                      stepKey={step.key}
                      form={forms[i]}
                      onChange={(field, val) => updateForm(i, field, val)}
                      rel={rel}
                      lang={lang}
                      t={t}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">

                      {/* Left: Previous + View */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveStep(i - 1)}
                          disabled={i === 0}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={13} />
                          {t('gs.previous')}
                        </button>

                        {step.viewPath && (
                          <button
                            onClick={() => navigate(step.viewPath)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          >
                            <Eye size={13} />
                            {t('gs.view')}
                          </button>
                        )}

                        <button
                          onClick={() => setActiveStep(i + 1)}
                          disabled={i === STEPS.length - 1}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <SkipForward size={13} />
                          {t('gs.skip')}
                        </button>
                      </div>

                      {/* Right: Save & Add Another + Next Step */}
                      <div className="flex gap-2">
                        <button
                          disabled={saving}
                          onClick={() => submit(i, false)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition disabled:opacity-60"
                        >
                          <Plus size={13} />
                          {t('gs.save_add')}
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => submit(i, true)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                          {saving ? t('gs.saving') : t('gs.next_step')}
                          {!saving && <ChevronRight size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── All Setup Steps grid ── */}
        <div className="max-w-3xl mx-auto mt-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('gs.all_steps')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left text-xs font-medium transition
                  ${done[i]
                    ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                    : activeStep === i
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                  }`}
              >
                {done[i]
                  ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  : <Circle size={14} className="text-gray-300 shrink-0" />
                }
                <span className="truncate">{TITLES[i]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
