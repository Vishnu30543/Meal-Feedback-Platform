import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Trophy, Star, Utensils, Heart, Activity, Medal } from 'lucide-react';

export default function AdminTopDishes() {
  const { data: topDishes, isLoading } = useQuery({
    queryKey: ['topDishesAdmin'],
    queryFn: () => api.get('/analytics/top-dishes?metric=TOP_RATED&limit=10').then(res => res.data.data ?? res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Simpler Header Section */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2 bg-slate-800 dark:bg-slate-800 rounded-lg">
          <Trophy className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Top 10 Loved Dishes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">The highest-rated dishes across the ashram based on community feedback.</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          {topDishes?.map((dish: any, index: number) => {
            const isTop3 = index < 3;
            
            return (
              <div 
                key={dish.dishId} 
                className="card overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative group hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-5 flex flex-col gap-4">
                  {/* Top Row: Rank & Basic Info */}
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTop3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {index + 1}
                    </div>

                    {/* Image / Fallback */}
                    {dish.imageUrl ? (
                      <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                        <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                        <Utensils className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                        {dish.dishName}
                      </h3>
                      <div className="flex items-center text-amber-500 text-sm font-bold mt-0.5">
                        {dish.averageRating?.toFixed(1)} <Star className="w-3.5 h-3.5 ml-1 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 text-blue-500" /> Ratings
                      </p>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {dish.ratingCount}
                      </div>
                    </div>

                    <div className="text-center border-l border-slate-200 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" /> Faves
                      </p>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {dish.favouriteCount}
                      </div>
                    </div>

                    <div className="text-center border-l border-slate-200 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Utensils className="w-3 h-3 text-emerald-500" /> Served
                      </p>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {dish.servedCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(!topDishes || topDishes.length === 0) && (
            <div className="col-span-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-10 text-center border border-slate-100 dark:border-slate-800">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No data available</h3>
              <p className="text-slate-500 text-sm mt-1">Not enough ratings to determine top dishes yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
