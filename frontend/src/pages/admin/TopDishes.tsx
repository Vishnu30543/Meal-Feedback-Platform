import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Trophy, Star, Utensils, Heart } from 'lucide-react';

export default function AdminTopDishes() {
  const { data: topDishes, isLoading } = useQuery({
    queryKey: ['topDishesAdmin'],
    queryFn: () => api.get('/analytics/top-dishes?metric=TOP_RATED&limit=10').then(res => res.data.data ?? res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Top 10 Loved Dishes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">The highest-rated dishes overall</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topDishes?.map((dish: any, index: number) => (
          <div key={dish.dishId} className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-800">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-amber-600 text-white font-bold px-4 py-1.5 rounded-bl-2xl z-10 shadow-sm flex items-center gap-1">
              <Trophy className="w-4 h-4" /> #{index + 1}
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pr-10 line-clamp-2">
                  {dish.dishName}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Avg Rating</p>
                <div className="flex items-center text-amber-500 font-bold text-lg">
                  {dish.averageRating?.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Ratings</p>
                <div className="text-slate-800 dark:text-slate-100 font-bold text-lg">
                  {dish.ratingCount}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Favourited</p>
                <div className="flex items-center text-red-500 font-bold text-lg">
                  {dish.favouriteCount} <Heart className="w-4 h-4 ml-1 fill-current" />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Times Served</p>
                <div className="text-slate-800 dark:text-slate-100 font-bold text-lg">
                  {dish.servedCount}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!topDishes || topDishes.length === 0) && (
          <div className="col-span-full card p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No data available</h3>
            <p className="text-slate-500 mt-2">There are not enough ratings yet to determine the top dishes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
