import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { FileText, Image, Link2, ExternalLink, Info, Calendar } from 'lucide-react';
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
  if (!docs || docs.length === 0) return false;
  const lastSeen = localStorage.getItem(DOCS_LAST_SEEN_KEY);
  if (!lastSeen) return true;
  const lastSeenDate = new Date(lastSeen);
  return docs.some(doc => new Date(doc.createdAt) > lastSeenDate);
}

function DocTypeIcon({ type }: { type: DocType }) {
  if (type === 'IMAGE') return <Image className="w-5 h-5" />;
  if (type === 'PDF') return <FileText className="w-5 h-5" />;
  return <Link2 className="w-5 h-5" />;
}

const TYPE_BADGE: Record<DocType, string> = {
  IMAGE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PDF: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LINK: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const TYPE_LABEL: Record<DocType, string> = {
  IMAGE: 'Image',
  PDF: 'PDF',
  LINK: 'Link',
};

const TYPE_ICON_BG: Record<DocType, string> = {
  IMAGE: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
  PDF: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
  LINK: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400',
};

function ImageDocCard({ doc }: { doc: ImportantDoc }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={doc.url}
          alt={doc.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${TYPE_BADGE[doc.docType]}`}>
            <Image className="w-3 h-3" /> Image
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{doc.title}</h3>
        {doc.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{doc.description}</p>
        )}
        {doc.category && (
          <span className="inline-block mt-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{doc.category}</span>
        )}
      </div>
    </a>
  );
}

function GenericDocCard({ doc }: { doc: ImportantDoc }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 items-start"
    >
      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${TYPE_ICON_BG[doc.docType]} shadow-sm`}>
        <DocTypeIcon type={doc.docType} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{doc.title}</h3>
          <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 group-hover:text-primary-500 transition-colors mt-0.5" />
        </div>
        {doc.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{doc.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${TYPE_BADGE[doc.docType]}`}>
            <DocTypeIcon type={doc.docType} />
            {TYPE_LABEL[doc.docType]}
          </span>
          {doc.category && (
            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{doc.category}</span>
          )}
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

  // Mark docs as seen when user visits this page
  useEffect(() => {
    localStorage.setItem(DOCS_LAST_SEEN_KEY, new Date().toISOString());
  }, []);

  // Group docs by category
  const categories = Array.from(new Set(docs.map(d => d.category || 'General'))).sort();

  const docsByCategory: Record<string, ImportantDoc[]> = {};
  docs.forEach(doc => {
    const cat = doc.category || 'General';
    if (!docsByCategory[cat]) docsByCategory[cat] = [];
    docsByCategory[cat].push(doc);
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
      {docs.length === 0 ? (
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
          const categoryDocs = docsByCategory[category];
          const imageDocs = categoryDocs.filter(d => d.docType === 'IMAGE');
          const otherDocs = categoryDocs.filter(d => d.docType !== 'IMAGE');

          return (
            <section key={category} className="space-y-4">
              {/* Category header */}
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">{category}</h2>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{categoryDocs.length} item{categoryDocs.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Image docs in grid */}
              {imageDocs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {imageDocs.map(doc => <ImageDocCard key={doc.id} doc={doc} />)}
                </div>
              )}

              {/* PDF / Link docs as list */}
              {otherDocs.length > 0 && (
                <div className="space-y-3">
                  {otherDocs.map(doc => <GenericDocCard key={doc.id} doc={doc} />)}
                </div>
              )}
            </section>
          );
        })
      )}

      {/* Footer note */}
      {docs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 py-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last updated: {docs.length > 0 && docs[0].createdAt ? format(new Date(docs[0].createdAt), 'MMMM d, yyyy') : '—'}</span>
        </div>
      )}
    </div>
  );
}
