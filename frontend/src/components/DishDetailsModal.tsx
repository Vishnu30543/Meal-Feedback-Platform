import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Modal from './Modal';
import {
  Clock, Utensils, Star, Bookmark, ShieldAlert,
  Video, HeartPulse, Flame, Activity, Zap, Loader2, Sparkles
} from 'lucide-react';

interface DishDetailsModalProps {
  dishId: number | null;
  isOpen: boolean;
  onClose: () => void;
  savedDishIds?: Set<number>;
}

export default function DishDetailsModal({ dishId, isOpen, onClose, savedDishIds }: DishDetailsModalProps) {
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: dishData, isLoading } = useQuery({
    queryKey: ['dish-full-details', dishId],
    queryFn: () => api.get(`/dishes/${dishId}`).then(res => res.data.data ?? res.data),
    enabled: !!dishId && isOpen
  });

  const isSaved = dishId ? savedDishIds?.has(dishId) : false;

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!dishId) return;
      if (isSaved) {
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

  if (!isOpen) return null;

  const dish = dishData;
  const title = dish ? (dish.displayName || dish.name) : 'Dish & Recipe Details';

  // Extract gallery images
  const images: string[] = [];
  if (dish?.primaryImageUrl) images.push(dish.primaryImageUrl);
  if (dish?.images?.length) {
    dish.images.forEach((img: any) => {
      if (img.imageUrl && !images.includes(img.imageUrl)) {
        images.push(img.imageUrl);
      }
    });
  }

  // Extract active allergens
  const allergenList: string[] = [];
  if (dish?.allergen) {
    const a = dish.allergen;
    if (a.milk) allergenList.push('Milk / Dairy');
    if (a.gluten) allergenList.push('Gluten');
    if (a.peanut) allergenList.push('Peanuts');
    if (a.soy) allergenList.push('Soy');
    if (a.sesame) allergenList.push('Sesame');
    if (a.treeNuts) allergenList.push('Tree Nuts');
    if (a.mustard) allergenList.push('Mustard');
    if (a.celery) allergenList.push('Celery');
    if (a.sulphites) allergenList.push('Sulphites');
  }

  const youtubeLink = dish?.youtubeUrl || dish?.recipe?.youtubeUrl;
  const healthText = dish?.healthBenefits || dish?.recipe?.healthBenefits;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {isLoading || !dish ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading full dish details & recipe...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {dish.category && (
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800">
                  {dish.category}
                </span>
              )}
              {dish.difficulty && (
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  dish.difficulty === 'EASY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  dish.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {dish.difficulty}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {dish.preparationTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary-500" />
                  {dish.preparationTime} mins
                </span>
              )}
              {dish.averageRating != null && (
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {dish.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {dish.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {dish.description}
            </p>
          )}

          {/* Nutrition Summary Cards */}
          {dish.nutrition && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Nutrition Summary (per serving)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { label: 'Energy', val: dish.nutrition.energy ? `${dish.nutrition.energy} kcal` : '–', icon: Flame, color: 'text-amber-500' },
                  { label: 'Protein', val: dish.nutrition.protein ? `${dish.nutrition.protein}g` : '–', icon: Activity, color: 'text-blue-500' },
                  { label: 'Carbs', val: dish.nutrition.carbohydrates ? `${dish.nutrition.carbohydrates}g` : '–', icon: Zap, color: 'text-purple-500' },
                  { label: 'Fat', val: dish.nutrition.fat ? `${dish.nutrition.fat}g` : '–', icon: HeartPulse, color: 'text-rose-500' },
                  { label: 'Fiber', val: dish.nutrition.fiber ? `${dish.nutrition.fiber}g` : '–', icon: Sparkles, color: 'text-emerald-500' },
                ].map((n, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <n.icon className={`w-4 h-4 ${n.color} mx-auto mb-1`} />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{n.val}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Allergen Information
            </h3>
            {allergenList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allergenList.map(a => (
                  <span key={a} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold border border-red-200 dark:border-red-800">
                    ⚠ Contains {a}
                  </span>
                ))}
              </div>
            ) : (
              <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800">
                ✓ No Major Allergens Reported
              </span>
            )}
          </div>

          {/* Health Benefits */}
          {healthText && (
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-500" />
                Health Benefits & Satvik Value
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{healthText}</p>
            </div>
          )}

          {/* Recipe Details */}
          {dish.recipe && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {dish.recipe.ingredients && (
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-primary-500" />
                    Ingredients
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {dish.recipe.ingredients}
                  </div>
                </div>
              )}

              {dish.recipe.preparationSteps && (
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1.5">Preparation Steps</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {dish.recipe.preparationSteps}
                  </div>
                </div>
              )}

              {dish.recipe.preparationNotes && (
                <div className="bg-amber-50/60 dark:bg-amber-900/20 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  <span className="font-bold">Chef's Notes: </span>{dish.recipe.preparationNotes}
                </div>
              )}
            </div>
          )}

          {/* YouTube Video Button */}
          {youtubeLink && (
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Video className="w-4 h-4" />
              Watch Video Recipe on YouTube
            </a>
          )}

          {/* Cook Later Action */}
          <div className="pt-2">
            <button
              onClick={() => toggleSaveMutation.mutate()}
              disabled={toggleSaveMutation.isPending}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                isSaved
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'btn-secondary'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved in Cook Later' : 'Save for Cook Later'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
