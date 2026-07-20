import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Star, Utensils, Bookmark, Info, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Fetch Today's Menu
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: menu, isLoading: loadingMenu } = useQuery({
    queryKey: ['menu', todayStr],
    queryFn: () => api.get(`/menus/date/${todayStr}`).then(res => res.data)
  });

  // Fetch Saved Recipes
  const { data: savedRecipes, isLoading: loadingSaved } = useQuery({
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

  const isLoading = loadingProgress || loadingStats || loadingTips || loadingMenu || loadingSaved;

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

      {/* Today's Menu Display */}
      {menu?.dishes && menu.dishes.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary-500" />
            Today's Menu Directory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menu.dishes.map((md: any, idx: number) => (
              <div key={idx} className="card overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="h-40 relative">
                  {md.dish.primaryImageUrl || md.dish.imageUrl ? (
                    <img src={md.dish.primaryImageUrl || md.dish.imageUrl} alt={md.dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-primary-500" />
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

    {/* Dish Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDish ? (selectedDish.displayName || selectedDish.name) : "Dish Details"}
      >
        {selectedDish && (
          <div className="space-y-4">
            {(selectedDish.primaryImageUrl || selectedDish.imageUrl) && (
              <img src={selectedDish.primaryImageUrl || selectedDish.imageUrl} alt={selectedDish.name} className="w-full h-40 object-cover rounded-lg" />
            )}
            
            <p className="text-slate-600 dark:text-slate-300 text-sm">{selectedDish.description}</p>
            
            <div className="flex gap-4 border-y border-slate-100 dark:border-slate-800 py-3">
              <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 mr-2 text-primary-500" />
                {selectedDish.preparationTime || 0} mins
              </div>
              <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 mr-2 text-primary-500" />
                {selectedDish.difficulty || 'N/A'}
              </div>
            </div>

            {selectedDish.healthBenefits && (
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Health Benefits</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedDish.healthBenefits}</p>
              </div>
            )}
            
            {selectedDish.recipe?.ingredients && (
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Ingredients</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedDish.recipe.ingredients}</p>
              </div>
            )}

            {selectedDish.recipe?.preparationSteps && (
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Preparation Steps</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedDish.recipe.preparationSteps}</p>
              </div>
            )}
            
            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveMutation.mutate(selectedDish.id);
                }}
                className="w-full btn-secondary py-2 flex items-center justify-center gap-2"
              >
                <Bookmark className={`w-4 h-4 ${savedDishIds.has(selectedDish.id) ? 'fill-current' : ''}`} />
                {savedDishIds.has(selectedDish.id) ? 'Saved for Later' : 'Save Recipe'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
