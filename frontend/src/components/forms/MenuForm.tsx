import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { format } from 'date-fns';

interface MenuFormProps {
  selectedDate: Date;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MenuForm({ selectedDate, initialData, onSuccess, onCancel }: MenuFormProps) {
  const queryClient = useQueryClient();
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>(
    initialData?.dishes ? initialData.dishes.map((d: any) => d.dish.id) : []
  );

  const { data: dishesResponse } = useQuery({
    queryKey: ['activeDishes'],
    queryFn: () => api.get('/dishes/active').then((res: any) => res.data),
  });

  const activeDishes = dishesResponse || [];

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        menuDate: format(selectedDate, 'yyyy-MM-dd'),
        dishes: selectedDishIds.map((dishId, index) => ({
          dishId: dishId,
          mealType: 'LUNCH',
          displayOrder: index + 1
        }))
      };
      
      if (initialData) {
        return api.put(`/menus/${initialData.id}`, payload);
      }
      return api.post('/menus', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', format(selectedDate, 'yyyy-MM-dd')] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDishIds.length === 0) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200">
        {initialData ? 'Editing menu for:' : 'Creating menu for:'} <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
      </div>

      <div>
        <label className="label-text mb-2 block">Select Dishes <span className="text-red-500">*</span></label>
        <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800">
          {activeDishes.length === 0 ? (
            <p className="text-sm text-slate-500 p-2">No active dishes found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeDishes.map((dish: any) => (
                <label 
                  key={dish.id} 
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                    checked={selectedDishIds.includes(dish.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDishIds([...selectedDishIds, dish.id]);
                      } else {
                        setSelectedDishIds(selectedDishIds.filter(id => id !== dish.id));
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {dish.displayName || dish.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">You must select at least one dish to create a menu.</p>
      </div>

      {mutation.isError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
          Failed to create menu. {mutation.error?.message}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={mutation.isPending || selectedDishIds.length === 0}
        >
          {mutation.isPending ? 'Saving...' : (initialData ? 'Update Menu' : 'Create Menu')}
        </button>
      </div>
    </form>
  );
}
