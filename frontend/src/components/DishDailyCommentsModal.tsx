import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { X, Star, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DishDailyCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishId: number;
  dishName: string;
  date: string | null;
}

export default function DishDailyCommentsModal({ isOpen, onClose, dishId, dishName, date }: DishDailyCommentsModalProps) {
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['dish-daily-comments', dishId, date],
    queryFn: () => api.get(`/analytics/dish/${dishId}/comments?date=${date}`).then(r => r.data.data),
    enabled: isOpen && !!dishId && !!date,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              Daily Feedback Details
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-slate-700 dark:text-slate-300">{dishName}</span>
              &bull;
              <Calendar className="w-4 h-4 inline-block" />
              {date && format(new Date(date), 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 hide-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4 text-red-500">
              <AlertCircle className="w-10 h-10" />
              <p className="text-sm font-medium">Failed to load comments</p>
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm">No text comments submitted on this day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c: any, i: number) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= c.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                    ))}
                    {c.submittedAt && (
                      <span className="text-xs text-slate-400 ml-auto">
                        {format(new Date(c.submittedAt), 'h:mm a')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {c.comment || <span className="italic text-slate-400">(No text comment, rating only)</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
