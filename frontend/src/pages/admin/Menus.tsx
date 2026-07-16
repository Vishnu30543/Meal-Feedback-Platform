import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

export default function Menus() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Quick hack for simple week calendar
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => api.get(`/menus/date/${format(selectedDate, 'yyyy-MM-dd')}`)
      .then(res => res.data)
      .catch(() => null)
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
                <button className="btn-secondary">Copy Previous</button>
                <button className="btn-primary">
                  {menu ? 'Update Menu' : 'Create Menu'}
                </button>
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
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Add Dish
                      </button>
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
                        <button className="text-slate-400 dark:text-slate-500 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <button className="btn-primary">Create Menu Plan</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
