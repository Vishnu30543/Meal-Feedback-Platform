import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Trophy, Star, Utensils } from 'lucide-react';

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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400 w-16">Rank</th>
                <th className="py-4 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Dish</th>
                <th className="py-4 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Rating</th>
                <th className="py-4 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Ratings Count</th>
                <th className="py-4 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Favorites</th>
                <th className="py-4 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Served</th>
              </tr>
            </thead>
            <tbody>
              {topDishes?.map((dish: any, index: number) => {
                const isTop3 = index < 3;
                
                return (
                  <tr 
                    key={dish.dishId} 
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors last:border-b-0"
                  >
                    <td className="py-3 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTop3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {dish.imageUrl ? (
                          <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                            <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                            <Utensils className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          </div>
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{dish.dishName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-amber-500 font-bold">
                        {dish.averageRating?.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {dish.ratingCount}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {dish.favouriteCount}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {dish.servedCount}
                    </td>
                  </tr>
                );
              })}

              {(!topDishes || topDishes.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No data available</h3>
                    <p className="text-slate-500 text-sm mt-1">Not enough ratings to determine top dishes yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
