import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Star, Utensils, Bookmark, Info, Clock, Check, Bell, Megaphone, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import DishDetailsModal from '../../components/DishDetailsModal';

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

  // Fetch Active Announcements
  const { data: announcements } = useQuery({
    queryKey: ['activeAnnouncements'],
    queryFn: () => api.get('/announcements/active').then(res => res.data)
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

  const savedDishIds = new Set<number>(savedRecipes?.map((item: any) => item.dish.id) || []);

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
      <div className="group bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-primary-500/20 dark:group-hover:bg-primary-500/30 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50/80 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-bold mb-4 border border-primary-100/50 dark:border-primary-500/20 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Namaskaram, {user?.name?.split(' ')[0] || 'Sadhaka'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
            Your feedback helps us provide the most healthy and satvik food for everyone in the ashram.
          </p>
        </div>
        
        <div className="hidden sm:flex relative z-10 w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-white to-primary-50 dark:from-slate-800 dark:to-slate-900 items-center justify-center border border-slate-100 dark:border-slate-700 shadow-xl rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-transform transform-gpu duration-500">
            <span className="text-4xl drop-shadow-md">🙏</span>
            <div className="absolute inset-0 rounded-2xl border border-white/50 dark:border-white/5 pointer-events-none"></div>
        </div>
      </div>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((announcement: any) => (
            <div key={announcement.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 sm:p-5 flex gap-4 items-start shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{announcement.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{announcement.description}</p>
                {announcement.imageUrl && !announcement.imageUrl.startsWith('file:///') && (
                  <div className="mt-4 rounded-xl overflow-hidden max-w-md border border-slate-200 dark:border-slate-700 shadow-sm">
                    <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-auto object-cover max-h-48" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Card: Today's Rating */}
      <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5 dark:from-primary-500/10 dark:to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {progress?.totalDishes > 0 && !progress?.editable 
                  ? 'Camp Session Completed' 
                  : 'Daily Meal Feedback'}
              </h3>
              {progress?.totalDishes > 0 && progress?.editable && (progress.ratedDishes < progress.totalDishes || !progress.overallRated) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 shadow-sm animate-pulse">
                  <Bell className="w-3.5 h-3.5" /> Pending
                </span>
              )}
            </div>
            {progress?.totalDishes > 0 ? (
              <div>
                {!progress?.editable ? (
                  <p className="text-slate-500 dark:text-slate-400 text-base mb-4">
                    Thank you for sharing your feedback during your stay.
                  </p>
                ) : (
                  <>
                    <p className="text-slate-600 dark:text-slate-300 text-base mb-4">
                      Reviewed <span className="font-bold text-slate-800 dark:text-slate-100">{progress?.ratedDishes}</span> of <span className="font-bold text-slate-800 dark:text-slate-100">{progress?.totalDishes}</span> items
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 mb-2 overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700/50">
                      <div
                        className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.4)] dark:shadow-[0_0_12px_rgba(34,197,94,0.3)] relative overflow-hidden"
                        style={{ width: `${(progress.ratedDishes / progress.totalDishes) * 100}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-base">Menu not available yet</p>
            )}
          </div>

          <Link
            to="/resident/menu/today"
            className={`w-full sm:w-auto shrink-0 flex items-center justify-center px-8 py-4 rounded-2xl font-bold transition-all transform-gpu duration-300 active:scale-95 ${
              progress?.totalDishes > 0
                ? !progress?.editable
                  ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  : progress?.ratedDishes === progress?.totalDishes
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 border border-green-400/50'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 border border-primary-400/50'
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
            onClick={(e) => {
              if (!progress?.totalDishes || !progress?.editable) e.preventDefault();
            }}
          >
            {progress?.totalDishes > 0
              ? !progress?.editable
                ? 'Camp Ended'
                : progress?.ratedDishes === progress?.totalDishes ? 'Review Ratings' : 'Rate Now'
              : 'Waiting...'
            }
            <ChevronRight className="w-5 h-5 ml-1.5" />
          </Link>
        </div>
      </div>



      {/* Today's Menu Display */}
      {loadingMenu ? (
        <div className="space-y-4 mt-8">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-md animate-pulse mb-2 ml-1"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2].map(i => (
              <div key={i} className="rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50">
                <div className="h-48 bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
                  <div className="h-3 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : menu?.dishes && menu.dishes.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Explore Today's Menu
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {menu.dishes.map((md: any, idx: number) => (
              <div key={idx} className="group flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 transition-colors">
                  {md.dish.primaryImageUrl || md.dish.imageUrl ? (
                    <img src={md.dish.primaryImageUrl || md.dish.imageUrl} alt={md.dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform transform-gpu duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Utensils className="w-12 h-12 mb-3 opacity-40" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50">No Image</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 shadow-sm border border-white/20 dark:border-slate-700/50">
                    {md.dish.category}
                  </div>
                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveMutation.mutate(md.dish.id);
                    }}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all transform-gpu border border-white/20 dark:border-slate-700/50"
                    title={savedDishIds.has(md.dish.id) ? "Remove from saved" : "Save for later"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${savedDishIds.has(md.dish.id) ? 'fill-primary-500 text-primary-500' : 'text-slate-600 dark:text-slate-300'}`}
                    />
                  </button>
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col bg-transparent">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{md.dish.displayName || md.dish.name}</h4>
                    <button
                      onClick={() => {
                        setSelectedDish(md.dish);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-900/30 p-1.5 rounded-lg transition-colors border border-transparent dark:border-slate-700 hover:border-primary-100 dark:hover:border-primary-500/30"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-auto leading-relaxed">{md.dish.description}</p>
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

      <DishDetailsModal
        dishId={selectedDish?.id || null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedDish(null), 300);
        }}
        savedDishIds={savedDishIds}
      />
    </div>
  );
}
