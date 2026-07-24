import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { ChevronLeft, Star, Utensils, BookOpen, TrendingUp, BarChart3, MessageSquare, Sparkles, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import DishDailyCommentsModal from '../../components/DishDailyCommentsModal';

const STAR_COLORS: Record<number, string> = {
  5: '#22c55e', 4: '#84cc16', 3: '#eab308', 2: '#f97316', 1: '#ef4444'
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </span>
  );
}

export default function DishAnalytics() {
  const { dishId } = useParams<{ dishId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dish-analytics', dishId],
    queryFn: () => api.get(`/analytics/dish/${dishId}`).then(r => r.data.data),
    enabled: !!dishId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) return <div className="text-slate-500">Dish not found.</div>;

  const maxDistCount = Math.max(...Object.values(analytics.ratingDistribution as Record<string, number>));

  // Graph Calculations for Daily Trend
  const dailyTrend = analytics.dailyTrend || [];
  const n = dailyTrend.length;
  const maxAvg = 5;
  const minAvg = 1;
  const graphHeight = 200;
  const graphWidth = 600;

  const getX = (index: number) => (index / Math.max(n - 1, 1)) * graphWidth;
  const getY = (val: number) => graphHeight - ((val - minAvg) / (maxAvg - minAvg)) * graphHeight;

  const pointsTrend = dailyTrend.map((d: any, i: number) => `${getX(i)},${getY(d.averageRating || 0)}`).join(' L ');
  const areaPath = n > 0 ? `M ${getX(0)},${graphHeight} L ${getX(0)},${getY(dailyTrend[0].averageRating || 0)} L ${pointsTrend} L ${getX(n - 1)},${graphHeight} Z` : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{analytics.dishName}</h1>
          {analytics.dishCategory && (
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
              {analytics.dishCategory}
            </span>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Average Rating', value: analytics.averageRating != null ? `${analytics.averageRating} ★` : '–', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Total Ratings', value: analytics.totalRatings?.toLocaleString() ?? '–', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Times Served', value: analytics.timesServed?.toLocaleString() ?? '–', icon: Utensils, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Cook Later Saves', value: analytics.cookLaterSaves?.toLocaleString() ?? '–', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(stat => (
          <div key={stat.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Highest / Lowest */}
      {(analytics.highestRating || analytics.lowestRating) && (
        <div className="card p-5 flex gap-8 flex-wrap">
          {analytics.highestRating && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Highest Rating</p>
              <StarDisplay rating={analytics.highestRating} />
            </div>
          )}
          {analytics.lowestRating && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Lowest Rating</p>
              <StarDisplay rating={analytics.lowestRating} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Monthly Trend ({new Date().getFullYear()})
          </h3>
          <div className="space-y-3">
            {analytics.monthlyTrend?.map((entry: any) => (
              <div key={entry.month} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 shrink-0">{entry.month}</span>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                  {entry.averageRating != null ? (
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-400 flex items-center pl-3 transition-all duration-700"
                      style={{ width: `${(entry.averageRating / 5) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{entry.averageRating}</span>
                    </div>
                  ) : (
                    <span className="absolute inset-0 flex items-center pl-3 text-xs text-slate-400">No data</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => {
              const count = (analytics.ratingDistribution as Record<string, number>)[star] || 0;
              const pct = maxDistCount > 0 ? (count / maxDistCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-14 shrink-0">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{star}</span>
                  </div>
                  <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center pl-3"
                      style={{ width: `${pct}%`, backgroundColor: STAR_COLORS[star] + '33', borderRight: pct > 0 ? `3px solid ${STAR_COLORS[star]}` : 'none' }}
                    />
                    <span className="absolute inset-0 flex items-center pl-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{count > 0 ? count : '–'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Trend Graph */}
      <div className="card p-6 relative">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary-500" />
          Daily Ratings Trend
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Click on any data point to view specific daily comments.
        </p>

        {n > 0 ? (
          <div className="relative w-full h-[250px] overflow-hidden pt-4">
            <svg viewBox={`0 -20 ${graphWidth} ${graphHeight + 40}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[1, 2, 3, 4, 5].map(val => (
                <g key={val}>
                  <line x1="0" y1={getY(val)} x2={graphWidth} y2={getY(val)} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="4 4" />
                  <text x="-15" y={getY(val) + 4} className="text-[10px] fill-slate-400 font-medium">{val}★</text>
                </g>
              ))}

              <path d={areaPath} fill="url(#trendGradient)" />
              <path d={`M ${pointsTrend}`} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Points */}
              {dailyTrend.map((d: any, i: number) => {
                const cx = getX(i);
                const cy = getY(d.averageRating);
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredDate(i)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => setSelectedDate(d.date)}
                    className="cursor-pointer group"
                  >
                    {/* Invisible larger hit area for easier clicking */}
                    <circle cx={cx} cy={cy} r="15" fill="transparent" />
                    
                    <circle
                      cx={cx}
                      cy={cy}
                      r={hoveredDate === i ? "6" : "4"}
                      fill={hoveredDate === i ? "#fff" : "#8b5cf6"}
                      stroke="#8b5cf6"
                      strokeWidth={hoveredDate === i ? "3" : "0"}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Tooltip (Hover) */}
            {hoveredDate !== null && (
              <div
                className="absolute bg-slate-900 text-white text-xs py-1.5 px-3 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap z-10"
                style={{
                  left: `${(getX(hoveredDate) / graphWidth) * 100}%`,
                  top: `calc(${((getY(dailyTrend[hoveredDate].averageRating)) / graphHeight) * 100}% - 12px)`
                }}
              >
                <div className="font-bold mb-0.5">{format(new Date(dailyTrend[hoveredDate].date), 'MMM d, yyyy')}</div>
                <div className="flex items-center gap-2">
                  <span>{dailyTrend[hoveredDate].averageRating} ★</span>
                  <span className="text-slate-400">({dailyTrend[hoveredDate].totalRatings} ratings)</span>
                </div>
                <div className="absolute w-2 h-2 bg-slate-900 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-slate-400">No daily trend data available</p>
          </div>
        )}
      </div>

      {/* Most Used Comments */}
      {analytics.mostUsedComments?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Most Frequently Used Comments
          </h3>
          <div className="flex flex-wrap gap-2">
            {analytics.mostUsedComments.map((phrase: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800">
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Latest Comments */}
      {analytics.latestComments?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            Latest Comments
          </h3>
          <div className="space-y-4">
            {analytics.latestComments.map((c: any, i: number) => (
              <div key={i} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                <StarDisplay rating={c.rating} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{c.comment}</p>
                  {c.submittedAt && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(c.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Comments Modal */}
      <DishDailyCommentsModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        dishId={Number(dishId)}
        dishName={analytics.dishName}
        date={selectedDate}
      />
    </div>
  );
}
