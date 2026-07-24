import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Trophy, Star, Utensils } from 'lucide-react';

export default function ResidentTopDishes() {
  const { data: topDishes, isLoading } = useQuery({
    queryKey: ['topDishesResident'],
    queryFn: () => api.get('/analytics/top-dishes?metric=TOP_RATED&limit=10').then(res => res.data.data ?? res.data)
  });

  if (isLoading) return <div className="text-center py-10">Loading Top Dishes...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-float relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-white" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Top 10 Loved Dishes</h2>
          </div>
          <p className="text-amber-50 text-sm sm:text-base opacity-90 max-w-md leading-relaxed">
            Discover the highest-rated dishes by everyone in the ashram.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {!topDishes || topDishes.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500">No rating data available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topDishes.map((dish: any, index: number) => (
            <div key={dish.dishId} className="card p-4 flex gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-amber-500 text-white font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                #{index + 1}
              </div>
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                 <Utensils className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex-1 mt-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg line-clamp-1 pr-8">
                  {dish.dishName}
                </h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-amber-500 text-sm font-bold">
                    {dish.averageRating?.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {dish.ratingCount} Ratings
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
