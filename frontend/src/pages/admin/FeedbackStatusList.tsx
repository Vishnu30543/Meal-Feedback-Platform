import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { CheckCircle, Star, ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeedbackStatusList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data: feedbackStatus, isLoading, error } = useQuery({
    queryKey: ['todayFeedbackStatus'],
    queryFn: () => api.get('/analytics/feedback-status/today').then(res => res.data.data ?? res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !feedbackStatus) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center">
        <AlertCircle className="w-6 h-6 mr-3" />
        Failed to load feedback status.
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(feedbackStatus.length / itemsPerPage);
  const paginatedData = feedbackStatus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary-500" />
            Today's Feedback Status
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed list of all residents and their feedback submission status</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {!feedbackStatus.length ? (
          <p className="text-center text-slate-400 py-10">No active residents or menu not yet published.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    {['Resident ID', 'Name', 'Dish Ratings', 'Overall Rating', 'Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{row.residentCode}</td>
                      <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-200">{row.residentName}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                        <span className={`font-semibold ${row.dishRatingsSubmitted === row.totalDishes ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {row.dishRatingsSubmitted}
                        </span>
                        <span className="text-slate-400"> / {row.totalDishes}</span>
                      </td>
                      <td className="px-6 py-3">
                        {row.overallRating != null ? (
                          <span className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: row.overallRating }).map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.status === 'Submitted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          row.status === 'Partial'   ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                       'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, feedbackStatus.length)} of {feedbackStatus.length} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
