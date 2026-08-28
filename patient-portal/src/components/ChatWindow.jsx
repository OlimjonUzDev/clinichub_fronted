import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { fetchMessages, sendMessage } from '../lib/chatApi';
import { LoadingState, EmptyState, ErrorState } from './StateBlock';
import Toast from './Toast';

const POLL_INTERVAL_MS = 4000;

// Real-vaqt websocket o'rniga oddiy REST polling (TASKS.md 12-BOSQICH,
// 2026-08-26 qarori) — ochiq turganda tarixni har POLL_INTERVAL_MS'da qayta so'raydi.
export default function ChatWindow({ appointmentId }) {
  const { token, userId } = useAuth();
  const { t } = useLang();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pollWarning, setPollWarning] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = (isFirst) => {
      fetchMessages(appointmentId, token)
        .then((data) => {
          if (cancelled) return;
          setMessages(data);
          setLoadError(false);
          setPollWarning(false);
        })
        .catch(() => {
          if (cancelled) return;
          // Birinchi yuklanish muvaffaqiyatsiz bo'lsa — hali xabar yo'q, ErrorState ko'rsatiladi.
          // Keyingi (poll) xatolarida esa allaqachon ko'ringan xabarlar ekrandan yo'qolmasin —
          // shunchaki kichik ogohlantiruvchi belgi chiqadi (pastdagi render qismiga qarang).
          if (isFirst) setLoadError(true); else setPollWarning(true);
        })
        .finally(() => { if (!cancelled && isFirst) setLoading(false); });
    };

    load(true);
    const timer = setInterval(() => load(false), POLL_INTERVAL_MS);

    return () => { cancelled = true; clearInterval(timer); };
  }, [appointmentId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const created = await sendMessage(appointmentId, trimmed, token);
      setMessages((prev) => [...prev, created]);
      setText('');
    } catch {
      setToast(t('chat.send_error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col min-h-[400px] max-h-[70vh]">
      {pollWarning && (
        <div className="px-4 pt-2 text-xs text-amber-600 shrink-0">{t('chat.poll_warning')}</div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <LoadingState text={t('common.loading')} className="h-full" />
        ) : loadError ? (
          <ErrorState text={t('chat.load_error')} className="h-full" />
        ) : messages.length === 0 ? (
          <EmptyState icon={MessageCircle} title={t('chat.no_messages')} bare className="h-full" />
        ) : (
          messages.map((m) => {
            const own = m.sender === userId;
            const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${own ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div className={`text-[10px] mt-1 ${own ? 'text-indigo-100' : 'text-gray-400'}`}>{time}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chat.placeholder')}
          aria-label={t('chat.placeholder')}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label={t('chat.send')}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 transition disabled:opacity-50 shrink-0"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>

      <Toast message={toast} onClose={() => setToast('')} closeLabel={t('common.close')} />
    </div>
  );
}
