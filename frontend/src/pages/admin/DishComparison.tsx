import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { GitCompare, Star, Utensils, BookOpen, Calendar, Hash, X, Search, Loader2 } from 'lucide-react';

const PALETTE = ['#16a34a', '#2563eb', '#d97706'];

interface Dish { id: number; name: string; displayName?: string; category?: string; }

function StarDisplay({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-slate-400">–</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
      <span className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-200">{rating}</span>
    </span>
  );
}

export default function DishComparison() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all active dishes for selection
  const { data: allDishes } = useQuery({
    queryKey: ['dishes-list'],
    queryFn: () => api.get('/dishes?status=ACTIVE&limit=200').then(r =>
      (r.data.data?.content || r.data.data || []) as Dish[]
    )
  });

  // Fetch comparison data when dishes are selected
  const { data: comparison, isFetching } = useQuery({
    queryKey: ['dish-comparison', selectedIds],
    queryFn: () => api.get(`/analytics/dish/compare?dishIds=${selectedIds.join(',')}`).then(r => r.data.data),
    enabled: selectedIds.length > 0
  });

  const filtered = (allDishes || []).filter(d => {
    const label = d.displayName || d.name;
    return label.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIds.includes(d.id);
  }).slice(0, 10);

  const addDish = (id: number) => {
    if (selectedIds.length >= 3) return;
    setSelectedIds(prev => [...prev, id]);
    setSearchTerm('');
  };

  const removeDish = (id: number) => setSelectedIds(prev => prev.filter(i => i !== id));

  const metrics: { key: string; label: string; icon: any; format?: (v: any) => string }[] = [
    { key: 'averageRating', label: 'Average Rating', icon: Star, format: v => v != null ? `${v} ★` : '–' },
    { key: 'numberOfRatings', label: 'Number of Ratings', icon: Hash, format: v => v?.toLocaleString() ?? '–' },
    { key: 'timesServed', label: 'Times Served', icon: Utensils, format: v => v?.toLocaleString() ?? '–' },
    { key: 'cookLaterSaves', label: 'Cook Later Saves', icon: BookOpen, format: v => v?.toLocaleString() ?? '–' },
    { key: 'lastServedDate', label: 'Last Served Date', icon: Calendar, format: v => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-primary-500" />
          Dish Comparison
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Select up to 3 dishes to compare side-by-side</p>
      </div>

      {/* Dish Selector */}
      <div className="card p-6">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Dishes</p>

        {/* Selected chips */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIds.map((id, i) => {
              const dish = (allDishes || []).find(d => d.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: PALETTE[i] }}>
                  {dish?.displayName || dish?.name || `Dish ${id}`}
                  <button onClick={() => removeDish(id)} className="opacity-80 hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Search input */}
        {selectedIds.length < 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search dish name…"
              className="input-field pl-9"
            />
            {searchTerm && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 max-h-56 overflow-y-auto">
                {filtered.map(dish => (
                  <button
                    key={dish.id}
                    onClick={() => addDish(dish.id)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span className="font-medium">{dish.displayName || dish.name}</span>
                    {dish.category && <span className="ml-2 text-xs text-slate-400">{dish.category}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedIds.length === 0 && (
        <div className="card p-12 text-center">
          <GitCompare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Search and select dishes above to start comparing</p>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="card overflow-hidden">
          {isFetching && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          )}
          {!isFetching && comparison && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48">Metric</th>
                    {comparison.map((dish: any, i: number) => (
                      <th key={dish.dishId} className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: PALETTE[i] }}>
                          {dish.dishName}
                        </span>
                        {dish.dishCategory && (
                          <p className="text-xs text-slate-400 mt-1">{dish.dishCategory}</p>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, mi) => (
                    <tr key={metric.key} className={`border-b border-slate-50 dark:border-slate-800/50 ${mi % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <metric.icon className="w-4 h-4 text-slate-400" />
                          {metric.label}
                        </span>
                      </td>
                      {comparison.map((dish: any) => (
                        <td key={dish.dishId} className="px-6 py-4 text-center">
                          {metric.key === 'averageRating'
                            ? <StarDisplay rating={dish[metric.key]} />
                            : <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {metric.format ? metric.format(dish[metric.key]) : (dish[metric.key] ?? '–')}
                              </span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
