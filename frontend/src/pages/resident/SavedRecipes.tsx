import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Utensils, Clock, ExternalLink, Loader2 } from 'lucide-react';
import Modal from '../../components/Modal';

export default function SavedRecipes() {
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: saved, isLoading } = useQuery({
    queryKey: ['savedRecipes'],
    queryFn: () => api.get('/cook-later').then(res => res.data)
  });

  const { data: fullDish, isLoading: isLoadingFullDish } = useQuery({
    queryKey: ['dish', selectedDish?.id],
    queryFn: () => api.get(`/dishes/${selectedDish.id}`).then(res => res.data.data),
    enabled: !!selectedDish?.id && isModalOpen
  });

  // Fall back to summary (which now has description, difficulty, healthBenefits)
  const displayDish = fullDish || selectedDish;

  if (isLoading) return <div className="text-center py-10">Loading Saved Recipes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cook Later</h1>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Recipes saved to try at home</p>
      </div>

      {saved?.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Saved Recipes</h3>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Find a dish you like? Save it to view the recipe later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saved?.map((item: any) => (
            <div key={item.id} className="card overflow-hidden">
              <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                {(item.dish.primaryImageUrl || item.dish.imageUrl) && <img src={item.dish.primaryImageUrl || item.dish.imageUrl} alt={item.dish.name} className="w-full h-full object-cover" />}
                {!item.hasRecipe && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold px-3 py-1 rounded-full">Recipe Coming Soon</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.dish.displayName || item.dish.name}</h4>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 mb-4 font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1" /> {item.dish.preparationTime} mins
                  <span className="mx-2">•</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.dish.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                    item.dish.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{item.dish.difficulty}</span>
                </div>
                
                <button 
                  disabled={!item.hasRecipe}
                  onClick={() => {
                    setSelectedDish(item.dish);
                    setIsModalOpen(true);
                  }}
                  className="w-full btn-secondary text-sm flex justify-center items-center py-2"
                >
                  View Recipe <ExternalLink className="w-3 h-3 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dish Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedDish(null), 300);
        }}
        title={displayDish ? (displayDish.displayName || displayDish.name) : "Recipe Details"}
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
                <Utensils className="w-4 h-4 mr-2 text-primary-500" />
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
                Loading recipe details...
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
          </div>
        )}
      </Modal>
    </div>
  );
}
