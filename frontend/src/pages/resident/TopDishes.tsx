import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Trophy, Star, Utensils, Bookmark } from 'lucide-react';

export default function ResidentTopDishes() {
  const queryClient = useQueryClient();

  const { data: topDishes, isLoading: loadingTopDishes } = useQuery({
    queryKey: ['topDishesResident'],
    queryFn: () => api.get('/analytics/top-dishes?metric=TOP_RATED&limit=10').then(res => res.data.data ?? res.data)
  });

  // Fetch Saved Recipes (Wishlist)
  const { data: savedRecipes, isLoading: loadingSaved } = useQuery({
    queryKey: ['savedRecipes'],
    queryFn: () => api.get('/cook-later').then(res => res.data)
  });

  const savedDishIds = new Set<number>(savedRecipes?.map((item: any) => item.dish?.id || item.dishId) || []);

  const toggleSaveMutation = useMutation({
    mutationFn: async (dishId: number) => {
      if (savedDishIds.has(dishId)) {
        await api.delete(`/cook-later/${dishId}`);
      } else {
        await api.post(`/cook-later/${dishId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
    }
  });

  if (loadingTopDishes || loadingSaved) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Simpler Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Top 10 Loved Dishes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Discover the highest-rated dishes by everyone in the ashram.</p>
        </div>
      </div>

      {!topDishes || topDishes.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500">No rating data available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topDishes.map((dish: any, index: number) => {
            const isTop3 = index < 3;
            const dishId = dish.dishId || dish.id;
            const isSaved = savedDishIds.has(dishId);
            
            return (
              <div key={dishId} className="card overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-shadow">
                <div className="p-4 flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTop3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {index + 1}
                  </div>

                  {/* Image / Fallback */}
                  {dish.imageUrl ? (
                    <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                      <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                      <Utensils className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                  
                  {/* Dish Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{dish.dishName}</h4>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if(dishId) toggleSaveMutation.mutate(dishId);
                        }}
                        className="shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-full transition-colors"
                        title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isSaved ? 'fill-primary-500 text-primary-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-amber-500 text-sm font-bold">
                        {dish.averageRating?.toFixed(1)} <Star className="w-3.5 h-3.5 ml-1 fill-current" />
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {dish.ratingCount} Ratings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
