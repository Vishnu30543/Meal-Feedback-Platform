import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, History, Filter, Search, Calendar, X, Loader2 } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </span>
  );
}

const CATEGORIES = ['CURRY', 'SOUP', 'RICE', 'ROTI', 'SALAD', 'DESSERT', 'BEVERAGE', 'OTHER'];

export default function RatingHistory() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [dishName, setDishName] = useState('');
  const [minRating, setMinRating] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Build query params
  const params = new URLSearchParams();
  if (dishName) params.set('dishName', dishName);
  if (minRating) params.set('minRating', minRating);
  if (category) params.set('category', category);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const { data: history, isLoading, isFetching } = useQuery({
    queryKey: ['ratingHistory', dishName, minRating, category, startDate, endDate],
    queryFn: () => api.get(`/ratings/history?${params.toString()}`).then(r => r.data.data ?? r.data),
  });

  const setQuickFilter = (filter: 'last7' | 'last30' | 'thisMonth' | 'highest' | 'lowest') => {
    const today = new Date();
    setMinRating('');
    setCategory('');
    setDishName('');
    switch (filter) {
      case 'last7':
        setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'last30':
        setStartDate(format(subDays(today, 30), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'thisMonth':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'highest':
        setMinRating('4');
        setStartDate('');
        setEndDate('');
        break;
      case 'lowest':
        setMinRating('1');
        setEndDate('');
        setStartDate('');
        break;
    }
  };

  const clearFilters = () => {
    setDishName('');
    setMinRating('');
    setCategory('');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = dishName || minRating || category || startDate || endDate;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/resident')}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-primary-500" />
            Rating History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your complete feedback history</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Last 7 Days', key: 'last7' as const },
          { label: 'Last 30 Days', key: 'last30' as const },
          { label: 'This Month', key: 'thisMonth' as const },
          { label: '⭐ Highest Rated', key: 'highest' as const },
        ].map(qf => (
          <button key={qf.key} onClick={() => setQuickFilter(qf.key)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {qf.label}
          </button>
        ))}
        <button onClick={() => setShowFilters(f => !f)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors border ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-400'}`}>
          <Filter className="w-3.5 h-3.5" />
          Advanced Filters
        </button>
        {hasFilters && (
          <button onClick={clearFilters}
            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text flex items-center gap-1"><Search className="w-3.5 h-3.5" /> Dish Name</label>
            <input type="text" value={dishName} onChange={e => setDishName(e.target.value)}
              placeholder="e.g. Bottle Gourd" className="input-field" />
          </div>
          <div>
            <label className="label-text">Min Rating</label>
            <select value={minRating} onChange={e => setMinRating(e.target.value)} className="input-field">
              <option value="">Any Rating</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''} & above</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Dish Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {(isLoading || isFetching) && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isFetching && (!history || history.length === 0) && (
        <div className="card p-12 text-center">
          <History className="w-14 h-14 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No ratings found</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {hasFilters ? 'Try adjusting your filters.' : 'You haven\'t submitted any ratings yet.'}
          </p>
        </div>
      )}

      {/* History Entries */}
      {!isLoading && !isFetching && history?.map((entry: any) => (
        <div key={entry.menuId} className="card overflow-hidden">
          {/* Date Header */}
          <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              {format(new Date(entry.menuDate), 'dd MMMM yyyy')}
            </h3>
            {entry.editable && (
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                Editable
              </span>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Overall Rating — shown first */}
            {entry.overallRating && (
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Overall Lunch</p>
                <StarDisplay rating={entry.overallRating.rating} />
                {entry.overallRating.comment && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{entry.overallRating.comment}</p>
                )}
              </div>
            )}

            {/* Individual Dish Ratings */}
            {entry.dishRatings?.map((dish: any, i: number) => (
              <div key={dish.dishId}
                className={`${i < entry.dishRatings.length - 1 ? 'pb-5 border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{dish.dishName}</p>
                  {dish.dishCategory && (
                    <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full font-medium">
                      {dish.dishCategory}
                    </span>
                  )}
                </div>
                <StarDisplay rating={dish.rating} />
                {dish.comment && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{dish.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
