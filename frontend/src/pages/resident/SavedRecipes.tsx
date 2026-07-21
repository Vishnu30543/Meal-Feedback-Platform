import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Utensils, Clock, ExternalLink } from 'lucide-react';
import DishDetailsModal from '../../components/DishDetailsModal';

export default function SavedRecipes() {
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: saved, isLoading } = useQuery({
    queryKey: ['savedRecipes'],
    queryFn: () => api.get('/cook-later').then(res => res.data)
  });

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

      <DishDetailsModal
        dishId={selectedDish?.id || null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedDish(null), 300);
        }}
      />
    </div>
  );
}
