import { CheckCircle2, Circle, Rocket, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { useLang } from '../context/LangContext';

export default function GettingStarted() {
  const { t } = useLang();

  const steps = [
    { key: 'step1', done: true },
    { key: 'step2', done: true },
    { key: 'step3', done: false },
    { key: 'step4', done: true },
    { key: 'step5', done: true },
    { key: 'step6', done: true },
    { key: 'step7', done: true },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <Rocket size={28} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('gs.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('gs.subtitle')}</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center mb-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 mr-4">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap mr-3">{doneCount} / {steps.length}</span>
            <span className="text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-full">
              {pct}% {t('gs.complete')}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border
                ${s.done ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                {s.done ? <CheckCircle2 size={13} className="text-green-500" /> : <Circle size={13} className="text-gray-400" />}
                {t(`gs.${s.key}`)}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step.done
                  ? <CheckCircle2 size={18} className="text-green-500" />
                  : <Circle size={18} className="text-gray-400" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">{t(`gs.${step.key}`)}</span>
                  {step.done && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {t('gs.done')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {step.done ? t('gs.done_msg') : t('gs.step1_desc')}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
