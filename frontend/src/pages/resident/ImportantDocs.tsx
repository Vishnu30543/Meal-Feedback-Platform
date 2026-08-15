import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { FileText, Image, ExternalLink, Info, Calendar, MessageCircle, PlaySquare, Send, Globe, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

type DocType = 'IMAGE' | 'PDF' | 'LINK';

interface ImportantDoc {
  id: number;
  title: string;
  description?: string;
  url: string;
  docType: DocType;
  category?: string;
  visible: boolean;
  createdAt: string;
}

const DOCS_LAST_SEEN_KEY = 'docs_last_seen';

export function getDocsHasNew(docs: ImportantDoc[]): boolean {
  if (!docs?.length) return false;
  const lastSeen = localStorage.getItem(DOCS_LAST_SEEN_KEY);
  if (!lastSeen) return true;
  const lastSeenDate = new Date(lastSeen);
  return docs.some(d => d.createdAt && new Date(d.createdAt) > lastSeenDate);
}

function formatUrl(url?: string): string {
  if (!url) return '#';
  const t = url.trim();
  return /^[a-zA-Z]+:\/\//.test(t) ? t : `https://${t}`;
}

function safeFormatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : format(d, 'MMMM d, yyyy');
  } catch {
    return '—';
  }
}

function getPlatformMeta(doc: ImportantDoc) {
  const u = (doc.url || '').toLowerCase();
  const t = (doc.title || '').toLowerCase();

  if (u.includes('whatsapp') || u.includes('wa.me') || t.includes('whatsapp')) {
    return {
      badge: 'WhatsApp',
      action: 'Join Group',
      badgeCls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      iconCls: 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-md shadow-emerald-500/20',
      btnCls: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      glow: 'from-emerald-500/5 to-transparent',
      Icon: MessageCircle,
    };
  }
  if (u.includes('youtube') || u.includes('youtu.be') || t.includes('youtube') || t.includes('video')) {
    return {
      badge: 'YouTube',
      action: 'Watch Video',
      badgeCls: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      iconCls: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20',
      btnCls: 'bg-red-600 hover:bg-red-700 text-white',
      glow: 'from-red-500/5 to-transparent',
      Icon: PlaySquare,
    };
  }
  if (u.includes('t.me') || u.includes('telegram') || t.includes('telegram')) {
    return {
      badge: 'Telegram',
      action: 'Join Channel',
      badgeCls: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
      iconCls: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20',
      btnCls: 'bg-sky-600 hover:bg-sky-700 text-white',
      glow: 'from-sky-500/5 to-transparent',
      Icon: Send,
    };
  }
  if (doc.docType === 'PDF' || u.includes('.pdf') || u.includes('drive.google') || u.includes('docs.google')) {
    return {
      badge: 'Document / PDF',
      action: 'View Document',
      badgeCls: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      iconCls: 'bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-md shadow-rose-500/20',
      btnCls: 'bg-rose-600 hover:bg-rose-700 text-white',
      glow: 'from-rose-500/5 to-transparent',
      Icon: FileText,
    };
  }

  let host = '';
  try { host = new URL(formatUrl(doc.url)).hostname.replace(/^www\./, ''); } catch {}

  return {
    badge: host || 'Link',
    action: 'Open Link',
    badgeCls: 'bg-primary-500/10 text-primary-700 dark:text-primary-400 border-primary-500/20',
    iconCls: 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/20',
    btnCls: 'bg-primary-600 hover:bg-primary-700 text-white',
    glow: 'from-primary-500/5 to-transparent',
    Icon: Globe,
  };
}

function ImageDocCard({ doc }: { doc: ImportantDoc }) {
  const url = formatUrl(doc.url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={url}
          alt={doc.title || 'Image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-sm backdrop-blur-md">
            <Image className="w-3.5 h-3.5 text-primary-600" /> Photo
          </span>
          <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:bg-white/50 transition-colors">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{doc.title}</h3>
        {doc.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{doc.description}</p>}
        {doc.category && <span className="inline-block mt-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{doc.category}</span>}
      </div>
    </a>
  );
}

function GenericDocCard({ doc }: { doc: ImportantDoc }) {
  const meta = getPlatformMeta(doc);
  const Icon = meta.Icon;
  const url = formatUrl(doc.url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${meta.glow} opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center ${meta.iconCls} transition-transform duration-300 group-hover:scale-105`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${meta.badgeCls}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {meta.badge}
              </span>
              {doc.category && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg">{doc.category}</span>}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{doc.title}</h3>
            {doc.description ? (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{doc.description}</p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate font-mono">{doc.url}</p>
            )}
          </div>
        </div>
        <div className="sm:shrink-0 flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 group-hover:shadow-md ${meta.btnCls}`}>
            <span>{meta.action}</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </a>
  );
}

export default function ResidentImportantDocs() {
  const { data: docs = [], isLoading } = useQuery<ImportantDoc[]>({
    queryKey: ['importantDocsVisible'],
    queryFn: () => api.get('/docs/visible').then((res: any) => res.data?.content || res.data || (Array.isArray(res) ? res : [])),
  });

  useEffect(() => {
    localStorage.setItem(DOCS_LAST_SEEN_KEY, new Date().toISOString());
  }, []);

  const safeDocs = Array.isArray(docs) ? docs : [];
  const categories = Array.from(new Set(safeDocs.map(d => d.category || 'General'))).sort();

  const docsByCategory: Record<string, ImportantDoc[]> = {};
  safeDocs.forEach(d => {
    const c = d.category || 'General';
    if (!docsByCategory[c]) docsByCategory[c] = [];
    docsByCategory[c].push(d);
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/50">
              <div className="h-40 bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {safeDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Info className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">No information yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Check back later for updates from the ashram</p>
          </div>
        </div>
      ) : (
        categories.map(category => {
          const categoryDocs = docsByCategory[category] || [];
          const imageDocs = categoryDocs.filter(d => d.docType === 'IMAGE');
          const otherDocs = categoryDocs.filter(d => d.docType !== 'IMAGE');

          return (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">{category}</h2>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{categoryDocs.length} item{categoryDocs.length !== 1 ? 's' : ''}</span>
              </div>
              {imageDocs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {imageDocs.map(doc => <ImageDocCard key={doc.id} doc={doc} />)}
                </div>
              )}
              {otherDocs.length > 0 && (
                <div className="space-y-3">
                  {otherDocs.map(doc => <GenericDocCard key={doc.id} doc={doc} />)}
                </div>
              )}
            </section>
          );
        })
      )}

      {safeDocs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 py-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last updated: {safeFormatDate(safeDocs[0]?.createdAt)}</span>
        </div>
      )}
    </div>
  );
}
