import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { ChevronLeft, Star, Send, CheckCircle, Info, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DishDetailsModal from '../../components/DishDetailsModal';

export default function TodayMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<number, { rating: number, comment: string }>>({});

  const [overallRating, setOverallRating] = useState<number>(0);
  const [overallComment, setOverallComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Get saved recipes
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

  const handleToggleSave = (e: React.MouseEvent, dishId: number) => {
    e.stopPropagation();
    toggleSaveMutation.mutate(dishId);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', todayStr],
    queryFn: () => api.get(`/menus/date/${todayStr}`).then(res => res.data)
  });

  const { data: existingRatings, isLoading: loadingRatings } = useQuery({
    queryKey: ['myRatings', menu?.id],
    queryFn: () => api.get(`/ratings/menu/${menu.id}`).then(res => res.data),
    enabled: !!menu?.id
  });

  useEffect(() => {
    if (existingRatings) {
      const initialRatings: Record<number, { rating: number, comment: string }> = {};
      existingRatings.dishRatings?.forEach((dr: any) => {
        initialRatings[dr.dishId] = { rating: dr.rating, comment: dr.comment || '' };
      });
      setRatings(initialRatings);
      
      if (existingRatings.overallRating) {
        setOverallRating(existingRatings.overallRating.rating);
        setOverallComment(existingRatings.overallRating.comment || '');
      }
    }
  }, [existingRatings]);

  const dishes = menu?.dishes?.map((md: any) => md.dish) || [];
  
  const isLastDish = activeDishIndex === dishes.length - 1;
  const isOverallStep = activeDishIndex === dishes.length;

  const handleRatingChange = (dishId: number, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [dishId]: { ...prev[dishId], rating, comment: prev[dishId]?.comment || '' }
    }));
  };

  const handleCommentChange = (dishId: number, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [dishId]: { ...prev[dishId], rating: prev[dishId]?.rating || 0, comment }
    }));
  };

  const submitRatings = async () => {
    setIsSubmitting(true);
    try {
      const dishRatings = Object.entries(ratings)
        .filter(([_, data]) => data.rating > 0)
        .map(([dishIdStr, data]) => ({
          dishId: Number(dishIdStr),
          rating: data.rating,
          comment: data.comment || 'No comment provided' // Fallback for @NotBlank
        }));

      const payload: any = {
        dishRatings: dishRatings
      };

      if (overallRating > 0) {
        payload.overallRating = {
          rating: overallRating,
          comment: overallComment || 'No comment provided'
        };
      }

      await api.post(`/ratings/menu/${menu.id}`, payload);

      queryClient.invalidateQueries({ queryKey: ['ratingProgress'] });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/resident');
      }, 2500);
    } catch {
      alert('Failed to submit ratings. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingRatings) return <div className="text-center py-10">Loading Menu...</div>;
  if (!menu || dishes.length === 0) return (
    <div className="card p-8 text-center mt-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Menu Today</h2>
      <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">The menu for today hasn't been published yet.</p>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="card p-12 text-center mt-10 flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3"
        >
          Thank You!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto"
        >
          Your feedback is incredibly valuable. It helps us serve you better every day.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Progress Bar Combined */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center">
          <button onClick={() => navigate('/resident')} className="p-2 mr-1 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">Rate Today's Lunch</h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isOverallStep ? 'Final Step' : `Item ${activeDishIndex + 1} of ${dishes.length}`}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: dishes.length + 1 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeDishIndex ? 'w-5 bg-primary-600' :
                    idx < activeDishIndex ? 'w-2 bg-primary-300' : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[250px]">
        <AnimatePresence mode="wait">
          {!isOverallStep ? (
            <motion.div
              key={activeDishIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="card overflow-hidden"
            >
              <div className="flex flex-col md:flex-row p-4 sm:p-6 gap-6 md:gap-8 items-start">
                {/* Left: Image */}
                {(dishes[activeDishIndex].primaryImageUrl || dishes[activeDishIndex].imageUrl) ? (
                  <div className="w-full md:w-2/5 lg:w-1/3 shrink-0 relative aspect-[16/9] md:aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={dishes[activeDishIndex].primaryImageUrl || dishes[activeDishIndex].imageUrl}
                      alt={dishes[activeDishIndex].name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-primary-600 shadow-sm border border-slate-100 dark:border-slate-700">
                      {dishes[activeDishIndex].category}
                    </div>
                    <button
                      onClick={(e) => handleToggleSave(e, dishes[activeDishIndex].id)}
                      className="absolute top-3 right-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700"
                      title={savedDishIds.has(dishes[activeDishIndex].id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${savedDishIds.has(dishes[activeDishIndex].id) ? 'fill-primary-500 text-primary-500' : 'text-slate-600 dark:text-slate-300'}`}
                      />
                    </button>
                  </div>
                ) : (
                  /* Fallback when no image */
                  <div className="w-full md:w-2/5 lg:w-1/3 shrink-0 aspect-[4/3] md:aspect-square rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center relative">
                    <div className="absolute top-3 left-3 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-primary-600 shadow-sm border border-slate-100 dark:border-slate-600">
                      {dishes[activeDishIndex].category}
                    </div>
                    <span className="text-4xl">🍽️</span>
                    <span className="text-slate-400 mt-2 text-sm font-medium">No image</span>
                  </div>
                )}

                {/* Right: Content & Rating */}
                <div className="flex-1 w-full flex flex-col min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {dishes[activeDishIndex].displayName || dishes[activeDishIndex].name}
                    </h2>
                    <button
                      onClick={() => setIsDetailsModalOpen(true)}
                      className="shrink-0 p-1.5 sm:p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      title="View Details"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 mt-4">
                    {/* Stars Container */}
                    <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm">
                      <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                        How did you like this dish?
                      </p>
                      <div className="flex gap-2 sm:gap-4">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(dishes[activeDishIndex].id, star)}
                            className="group relative p-1.5 sm:p-2 transition-all hover:scale-110 focus:outline-none"
                          >
                            <Star 
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                                (ratings[dishes[activeDishIndex].id]?.rating || 0) >= star
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                  : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700 group-hover:fill-amber-100 group-hover:text-amber-200'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Box */}
                    <div className="relative group">
                      <textarea
                        className="input-field min-h-[70px] resize-none border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all rounded-2xl py-3 px-4 text-sm"
                        placeholder="Any comments? (Optional)"
                        value={ratings[dishes[activeDishIndex].id]?.comment || ''}
                        onChange={(e) => handleCommentChange(dishes[activeDishIndex].id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="overall"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="card p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Overall Experience</h2>
              <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 max-w-sm mx-auto">
                How would you rate today's lunch as a whole? Your feedback helps us improve the daily menu combination.
              </p>

              <div className="flex gap-2 justify-center mb-8">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setOverallRating(star)}
                    className={`p-2 transition-transform hover:scale-110 ${overallRating >= star ? 'text-amber-400' : 'text-slate-200'
                      }`}
                  >
                    <Star className="w-12 h-12 fill-current" />
                  </button>
                ))}
              </div>

              <textarea
                className="input-field min-h-[100px] resize-none mb-6 text-left"
                placeholder="Overall comments about today's meal..."
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
              />

              <button
                onClick={submitRatings}
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-lg font-bold flex justify-center items-center"
              >
                {isSubmitting ? 'Submitting...' : (
                  <>Submit All Feedback <Send className="w-5 h-5 ml-2" /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isOverallStep && (
        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={() => setActiveDishIndex(p => Math.max(0, p - 1))}
            disabled={activeDishIndex === 0}
            className="btn-secondary flex-1 py-3"
          >
            Previous
          </button>
          <button
            onClick={() => setActiveDishIndex(p => p + 1)}
            className="btn-primary flex-1 py-3"
          >
            {isLastDish ? 'Continue to Overall' : 'Next Dish'}
          </button>
        </div>
      )}

      <DishDetailsModal
        dishId={dishes[activeDishIndex]?.id || null}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        savedDishIds={savedDishIds}
      />
    </div>
  );
}
