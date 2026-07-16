import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Star, Clock } from 'lucide-react';

export default function Favourites() {
  const { data: favourites, isLoading } = useQuery({
    queryKey: ['favourites'],
    queryFn: () => api.get('/favourites').then(res => res.data)
  });

  if (isLoading) return <div className="text-center py-10">Loading Favourites...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Favourites</h1>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Dishes you rated highly (4+ stars)</p>
      </div>

      {favourites?.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Favourites Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Rate dishes 4 or 5 stars to see them here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favourites?.map((fav: any) => (
            <div key={fav.id} className="card p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                {fav.dish.imageUrl && <img src={fav.dish.imageUrl} alt={fav.dish.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{fav.dish.displayName || fav.dish.name}</h4>
                  <div className="flex items-center text-amber-500 text-sm font-bold">
                    {fav.averageRating?.toFixed(1)} <Star className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  </div>
                </div>
                <p className="text-xs text-primary-600 font-medium mt-1 uppercase tracking-wide">{fav.dish.category}</p>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  <Clock className="w-3 h-3 mr-1" /> {fav.dish.preparationTime} mins
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
