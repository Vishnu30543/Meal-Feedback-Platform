import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Star, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResidentDashboard() {
  const { user } = useAuth();

  // Fetch Progress
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['ratingProgress'],
    queryFn: () => api.get('/ratings/progress').then(res => res.data)
  });

  // Fetch Stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['residentStats'],
    queryFn: () => api.get('/analytics/resident-stats').then(res => res.data)
  });

  // Fetch Health Tips
  const { data: tips, isLoading: loadingTips } = useQuery({
    queryKey: ['healthTips'],
    queryFn: () => api.get('/health-tips/today').then(res => res.data)
  });

  const isLoading = loadingProgress || loadingStats || loadingTips;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-6 sm:p-8 text-white shadow-float relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Namaskaram, {user?.name?.split(' ')[0] || 'Sadhaka'}!</h2>
          <p className="text-primary-100 opacity-90 max-w-md">
            Your feedback helps us provide the most healthy and satvik food for everyone in the ashram.
          </p>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-10 -top-24 w-64 h-64 bg-white dark:bg-slate-800/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Action Card: Today's Rating */}
      <div className="card p-1">
        <div className="bg-white dark:bg-slate-800 rounded-[15px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Today's Lunch</h3>
            {progress?.totalDishes > 0 ? (
              <div>
                <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm mb-3">
                  Rated <span className="font-semibold text-slate-800 dark:text-slate-100">{progress?.ratedDishes} / {progress?.totalDishes}</span> items
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(progress.ratedDishes / progress.totalDishes) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Menu not available yet</p>
            )}
          </div>

          <Link 
            to="/resident/menu/today"
            className={`w-full sm:w-auto shrink-0 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all ${
              progress?.totalDishes > 0 
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

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.favouriteDishes || 0}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide">Favourites</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.savedRecipes || 0}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide">Saved</p>
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

    </div>
  );
}
