import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Star, Utensils, Bookmark, Info, Clock, Check, Loader2, Bell, History } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Progress
  const { data: progress } = useQuery({
    queryKey: ['ratingProgress'],
    queryFn: () => api.get('/ratings/progress').then(res => res.data)
  });

  // Fetch Stats — use data presence (not isLoading) to avoid blank-page on background refetch
  const { data: stats } = useQuery({
    queryKey: ['residentStats'],
    queryFn: () => api.get('/analytics/resident-stats').then(res => res.data)
  });

  // Fetch Health Tips
  const { data: tips } = useQuery({
    queryKey: ['healthTips'],
    queryFn: () => api.get('/health-tips/today').then(res => res.data)
  });

  // Fetch Today's Menu
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: menu, isLoading: loadingMenu } = useQuery({
    queryKey: ['menu', todayStr],
    queryFn: () => api.get(`/menus/date/${todayStr}`).then(res => res.data)
  });

  // Fetch Saved Recipes
  const { data: savedRecipes } = useQuery({
    queryKey: ['savedRecipes'],
    queryFn: () => api.get('/cook-later').then(res => res.data)
  });

  const savedDishIds = new Set(savedRecipes?.map((item: any) => item.dish.id) || []);

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
      queryClient.invalidateQueries({ queryKey: ['residentStats'] });
    }
  });

  const { data: fullDish, isLoading: isLoadingFullDish } = useQuery({
    queryKey: ['dish', selectedDish?.id],
    queryFn: () => api.get(`/dishes/${selectedDish.id}`).then(res => res.data.data),
    enabled: !!selectedDish?.id && isModalOpen
  });

  // Use fullDish when available, fall back to summary (which now includes description)
  const displayDish = fullDish || selectedDish;

  // Only show full-page spinner on the very first load (when we have NO data at all yet)
  const isInitialLoad = loadingMenu && !menu && !progress && !stats;

  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 rounded-3xl p-6 sm:p-8 text-white shadow-float relative overflow-hidden">
        {/* Subtle texture/pattern overlay instead of glaring blob */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Namaskaram, {user?.name?.split(' ')[0] || 'Sadhaka'}!</h2>
          <p className="text-primary-50 text-sm sm:text-base opacity-90 max-w-md leading-relaxed">
            Your feedback helps us provide the most healthy and satvik food for everyone in the ashram.
          </p>
        </div>
      </div>

      {/* Feedback Reminder Banner — only when today's menu is published and feedback is pending before midnight */}
      {progress?.totalDishes > 0 && progress?.editable && (
        (progress.ratedDishes < progress.totalDishes || !progress.overallRated) && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Today's lunch feedback is pending.</p>
              <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">Please submit before 11:59 PM.</p>
            </div>
            <Link to="/resident/menu/today" className="shrink-0 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline">Rate Now →</Link>
          </div>
        )
      )}

      {/* Action Card: Today's Rating */}
      <div className="card p-1">
        <div className="bg-white dark:bg-slate-800 rounded-[15px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Today's Lunch</h3>
            {progress?.totalDishes > 0 ? (
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                  Rated <span className="font-semibold text-slate-800 dark:text-slate-100">{progress?.ratedDishes} / {progress?.totalDishes}</span> items
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(progress.ratedDishes / progress.totalDishes) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">Menu not available yet</p>
            )}
          </div>

          <Link
            to="/resident/menu/today"
            className={`w-full sm:w-auto shrink-0 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all ${progress?.totalDishes > 0
                ? progress?.ratedDishes === progress?.totalDishes
                  ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  : 'bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            onClick={(e) => {
              if (!progress?.totalDishes) e.preventDefault();
            }}
          >
            {progress?.totalDishes > 0
              ? progress?.ratedDishes === progress?.totalDishes ? 'Review Ratings' : 'Rate Now'
              : 'Waiting...'
            }
            <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </div>

      {/* View History Quick Action */}
      <Link
        to="/resident/history"
        className="flex items-center gap-3 card p-4 hover:shadow-md transition-shadow group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
          <History className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">View Rating History</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Browse all your previous ratings & comments</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
      </Link>

      {/* Today's Menu Display */}
      {loadingMenu ? (
        <div className="card p-6">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="card overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                <div className="h-40 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : menu?.dishes && menu.dishes.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary-500" />
            Today's Menu Directory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menu.dishes.map((md: any, idx: number) => (
              <div key={idx} className="card overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="h-44 relative overflow-hidden bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100 transition-colors">
                  {md.dish.primaryImageUrl || md.dish.imageUrl ? (
                    <img src={md.dish.primaryImageUrl || md.dish.imageUrl} alt={md.dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Utensils className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary-700 shadow-sm">
                    {md.dish.category}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveMutation.mutate(md.dish.id);
                    }}
                    className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:scale-110 transition-transform"
                    title={savedDishIds.has(md.dish.id) ? "Remove from saved" : "Save for later"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${savedDishIds.has(md.dish.id) ? 'fill-primary-500 text-primary-500' : 'text-slate-600 dark:text-slate-300'}`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{md.dish.displayName || md.dish.name}</h4>
                    <button
                      onClick={() => {
                        setSelectedDish(md.dish);
                        setIsModalOpen(true);
                      }}
                      className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-1 rounded transition-colors"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 line-clamp-2">{md.dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Stats Row — all 4 metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats?.mealsRated ?? '–'}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Meals Rated</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats?.favouriteDishes ?? '–'}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Favourites</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats?.savedRecipes ?? '–'}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Saved</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {stats?.averageOverallRating != null ? `${stats.averageOverallRating} ★` : '–'}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Health Tip of the Day */}
      {tips && tips.length > 0 && (
        <div className="card border-l-4 border-l-primary-500 p-6 bg-primary-50/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              Health Tip
            </div>
          </div>
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{tips[0].title}</h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {tips[0].description}
          </p>
        </div>
      )}

      {/* Dish Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedDish(null), 300);
        }}
        title={displayDish ? (displayDish.displayName || displayDish.name) : "Dish Details"}
      >
        {!displayDish ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {(displayDish.primaryImageUrl || displayDish.imageUrl) && (
              <img src={displayDish.primaryImageUrl || displayDish.imageUrl} alt={displayDish.name} className="w-full h-40 object-cover rounded-lg" />
            )}

            <p className="text-slate-600 dark:text-slate-300 text-sm">{displayDish.description}</p>

            <div className="flex gap-4 border-y border-slate-100 dark:border-slate-800 py-3">
              <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 mr-2 text-primary-500" />
                {displayDish.preparationTime || 0} mins
              </div>
              <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 mr-2 text-primary-500" />
                {displayDish.difficulty || 'N/A'}
              </div>
            </div>

            {displayDish.healthBenefits && (
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Health Benefits</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{displayDish.healthBenefits}</p>
              </div>
            )}

            {isLoadingFullDish ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading full recipe details...
              </div>
            ) : (
              <>
                {displayDish.recipe?.ingredients && (
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Ingredients</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{displayDish.recipe.ingredients}</p>
                  </div>
                )}

                {displayDish.recipe?.preparationSteps && (
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Preparation Steps</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{displayDish.recipe.preparationSteps}</p>
                  </div>
                )}
              </>
            )}

            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveMutation.mutate(displayDish.id);
                }}
                className="w-full btn-secondary py-2 flex items-center justify-center gap-2"
              >
                <Bookmark className={`w-4 h-4 ${savedDishIds.has(displayDish.id) ? 'fill-current' : ''}`} />
                {savedDishIds.has(displayDish.id) ? 'Saved for Later' : 'Save Recipe'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
