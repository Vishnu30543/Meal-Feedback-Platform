import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Utensils, Star, MessageSquare, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import ReactECharts from 'echarts-for-react';

const TrendChart = ({ data, onDateSelect }: { data: any[]; onDateSelect: (date: string) => void }) => {
  if (!data || data.length === 0) return null;

  const option = {
    grid: { top: 15, right: 15, bottom: 25, left: 25 },
    xAxis: {
      type: 'category',
      data: data.map(d => format(new Date(d.date), 'MMM d')),
      show: true,
      axisLine: { lineStyle: { color: '#94a3b8' } },
      axisLabel: { fontSize: 9, color: '#64748b' },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 1,
      max: 5,
      interval: 1,
      show: true,
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
      axisLabel: { fontSize: 9, color: '#64748b' }
    },
    series: [
      {
        data: data.map(d => d.averageRating),
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#f59e0b',
        },
        lineStyle: {
          color: '#f59e0b', // amber-500
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.4)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0)' }
            ]
          }
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const item = params[0];
        return `<div style="font-size:10px;font-weight:bold;">${item.name}: ${Number(item.value).toFixed(1)} ★</div><div style="font-size:9px;color:#cbd5e1;">Click to view comments</div>`;
      },
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'transparent',
      textStyle: { color: '#fff' },
      padding: [4, 8],
    }
  };

  const onEvents = {
    click: (e: any) => {
      if (e.dataIndex !== undefined && data[e.dataIndex]) {
        onDateSelect(data[e.dataIndex].date);
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        <TrendingUp className="w-3.5 h-3.5 mr-1 text-primary-500" /> Average Rating Trend
      </div>
      <ReactECharts 
        option={option} 
        onEvents={onEvents} 
        style={{ height: '120px', width: '100%', cursor: 'pointer' }} 
      />
    </div>
  );
};

const DishFeedbackCard = ({ dish }: { dish: any }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch historical comments if a past date is selected
  const { data: historicalComments, isLoading } = useQuery({
    queryKey: ['historicalComments', dish.dishId, selectedDate],
    queryFn: () => api.get(`/analytics/dish/${dish.dishId}/comments?date=${selectedDate}`).then(res => res.data.data ?? res.data),
    enabled: !!selectedDate,
  });

  const commentsToShow = selectedDate ? historicalComments : dish.comments;
  const isViewingHistory = !!selectedDate;
  const formattedDate = selectedDate ? format(new Date(selectedDate), 'MMM d, yyyy') : 'Today';

  return (
    <div className="card p-6 flex flex-col h-[520px]">
      {/* Dish Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dish.dishName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{dish.ratingCount} ratings today</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center text-amber-500 font-bold text-2xl">
            {dish.averageRating} <Star className="w-6 h-6 ml-1 fill-current" />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <TrendChart data={dish.trend} onDateSelect={(date) => setSelectedDate(date)} />

      <div className="border-t border-slate-100 dark:border-slate-800 mb-4" />

      {/* Comments Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Comments: <span className="text-primary-600 dark:text-primary-400">{formattedDate}</span>
        </h4>
        {isViewingHistory && (
          <button 
            onClick={() => setSelectedDate(null)}
            className="text-xs font-semibold flex items-center text-slate-500 hover:text-primary-600 transition-colors bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"
          >
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Today
          </button>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20 p-2 rounded-xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : !commentsToShow || commentsToShow.length === 0 ? (
          <div className="text-center py-8 text-slate-400 flex flex-col items-center">
            <MessageSquare className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-sm">No comments found.</p>
          </div>
        ) : (
          commentsToShow.map((comment: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-3.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs uppercase">
                    {comment.residentName?.substring(0, 2) || 'AN'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {comment.residentName || 'Anonymous'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {comment.residentCode || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {comment.rating} <Star className="w-2.5 h-2.5 ml-0.5 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "{comment.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function TodayDishFeedback() {
  const { data: todayFeedback, isLoading, error } = useQuery({
    queryKey: ['todayDishFeedback'],
    queryFn: () => api.get('/analytics/feedback-status/today-dishes').then(res => res.data.data ?? res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !todayFeedback) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center">
        <AlertCircle className="w-6 h-6 mr-3" />
        Failed to load today's dish feedback.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary-500" />
            Today's Dish Feedback
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Ratings and comments for {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
      </div>

      {!todayFeedback.length ? (
        <div className="card p-10 text-center">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No dishes served today</h3>
          <p className="text-slate-500 mt-2">Or the menu has not been published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {todayFeedback.map((dish: any) => (
            <DishFeedbackCard key={dish.dishId} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
}
