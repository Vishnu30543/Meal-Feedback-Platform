import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Copy, UploadCloud, Edit2 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import Modal from '../../components/Modal';
import MenuForm from '../../components/forms/MenuForm';

export default function Menus() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Quick hack for simple week calendar
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => api.get(`/menus/date/${format(selectedDate, 'yyyy-MM-dd')}`)
      .then(res => res.data)
      .catch(() => null)
  });



  const copyMutation = useMutation({
    mutationFn: () => api.post('/menus/copy', {
      sourceDate: format(addDays(selectedDate, -1), 'yyyy-MM-dd'),
      targetDate: format(selectedDate, 'yyyy-MM-dd')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', format(selectedDate, 'yyyy-MM-dd')] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/menus/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', format(selectedDate, 'yyyy-MM-dd')] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daily Menus</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Plan and publish meals for the ashram</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar / Date Picker Side */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{format(selectedDate, 'MMMM yyyy')}</h3>
              <button 
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className="text-xs font-medium text-slate-400 dark:text-slate-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((date, i) => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                      ${isSelected ? 'bg-primary-600 text-white shadow-md' : 'hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}
                      ${isToday && !isSelected ? 'border border-primary-300 text-primary-700' : ''}
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Editor Side */}
        <div className="lg:col-span-2">
          <div className="card h-full min-h-[500px]">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Menu for {format(selectedDate, 'EEEE, MMM d, yyyy')}
                </h2>
                {menu?.published && (
                  <span className="inline-flex items-center text-xs font-semibold text-green-600 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" /> Published
                  </span>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button 
                  onClick={() => copyMutation.mutate()}
                  disabled={copyMutation.isPending}
                  className="btn-secondary flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy Previous
                </button>
                {menu && (
                  <button 
                    onClick={() => publishMutation.mutate(menu.id)}
                    disabled={publishMutation.isPending}
                    className="btn-secondary flex items-center"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" /> {menu.published ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {menu && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Menu
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 py-12">Loading menu...</div>
              ) : menu ? (
                <div className="space-y-6">
                  {/* List of items grouped by meal type */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-700 pb-2">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200">Lunch Items</h4>
                    </div>
                    {menu.dishes?.filter((d:any) => d.mealType === 'LUNCH').map((dishItem: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium text-xs mr-3">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{dishItem.dish.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{dishItem.dish.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {menu.dishes?.filter((d:any) => d.mealType === 'LUNCH').length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 text-center py-4">No dishes added for lunch yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">No menu planned</h3>
                  <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm mt-1 mb-4">There is no menu planned for this date yet.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Create Menu Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={menu ? "Edit Menu Plan" : "Create Menu Plan"}
      >
        <MenuForm
          selectedDate={selectedDate}
          initialData={menu}
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
