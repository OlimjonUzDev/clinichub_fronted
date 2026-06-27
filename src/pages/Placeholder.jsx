import { Construction } from 'lucide-react';
import Layout from '../components/Layout';
import { useLang } from '../context/LangContext';

export default function Placeholder({ title }) {
  const { t } = useLang();
  return (
    <Layout>
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <Construction size={32} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">{title || t('common.coming_soon')}</h2>
        <p className="text-sm text-gray-400 mt-2">{t('common.under_construction')}</p>
      </div>
    </Layout>
  );
}
