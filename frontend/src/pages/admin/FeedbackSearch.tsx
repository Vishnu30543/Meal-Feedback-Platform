import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { MessageSquare, Search, Star, Loader2, Clock } from 'lucide-react';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </span>
  );
}

function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded px-0.5">{part}</mark>
          : part
      )}
    </>
  );
}

export default function FeedbackSearch() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [page, setPage] = useState(0);

  const { data, isFetching } = useQuery({
    queryKey: ['comment-search', submitted, page],
    queryFn: () => api.get(`/analytics/comments/search?q=${encodeURIComponent(submitted)}&page=${page}&size=20`).then(r => r.data.data),
    enabled: submitted.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSubmitted(query.trim());
  };

  const results = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary-500" />
          Comment Search
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search all resident feedback by keyword</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='e.g. "salt", "spicy", "fresh"'
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-6" disabled={!query.trim()}>
          Search
        </button>
      </form>

      {/* Results */}
      {!submitted && (
        <div className="card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Enter a keyword above to search all comments</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Examples: "salt", "spicy", "fresh", "excellent"</p>
        </div>
      )}

      {submitted && isFetching && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {submitted && !isFetching && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Found <span className="font-bold text-slate-700 dark:text-slate-200">{totalElements.toLocaleString()}</span> comment{totalElements !== 1 ? 's' : ''} for{' '}
              <span className="font-semibold text-primary-600 dark:text-primary-400">"{submitted}"</span>
            </p>
          </div>

          {results.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-slate-500 dark:text-slate-400">No comments found matching "{submitted}"</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resident ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dish</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        {item.resident?.residentCode ?? item.residentCode ?? '–'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                        {item.dish?.displayName || item.dish?.name || '–'}
                      </td>
                      <td className="px-6 py-4">
                        <StarDisplay rating={item.rating} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs">
                        <HighlightText text={item.comment} keyword={submitted} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '–'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
