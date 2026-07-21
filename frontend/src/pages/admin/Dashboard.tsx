import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import {
  Users, Utensils, CheckCircle, TrendingUp, Star,
  Activity, AlertCircle, Clock, BarChart2, Percent, Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const { data: statsRaw, isLoading, error } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => api.get('/analytics/dashboard').then(res => res.data.data ?? res.data)
  });

  const { data: feedbackStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['todayFeedbackStatus'],
    queryFn: () => api.get('/analytics/feedback-status/today').then(res => res.data.data ?? res.data)
  });

  const { data: dailyTrends, isLoading: loadingTrends } = useQuery({
    queryKey: ['dailyTrends'],
    queryFn: () => api.get('/analytics/daily-trends').then(res => res.data.data ?? res.data)
  });

  const stats = statsRaw;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center">
        <AlertCircle className="w-6 h-6 mr-3" />
        Failed to load dashboard statistics.
      </div>
    );
  }

  const topMetrics = [
    {
      title: 'Residents Present',
      value: stats.totalActiveResidents?.toString() ?? '–',
      icon: Users,
      color: 'bg-blue-500',
      sub: 'Active camp members'
    },
    {
      title: 'Residents Rated',
      value: stats.residentsRatedToday?.toString() ?? '–',
      icon: CheckCircle,
      color: 'bg-green-500',
      sub: `of ${stats.totalActiveResidents} total`
    },
    {
      title: 'Pending Feedback',
      value: stats.pendingFeedback?.toString() ?? '–',
      icon: Clock,
      color: 'bg-red-500',
      sub: 'Yet to submit ratings'
    },
    {
      title: 'Completion',
      value: stats.completionPercentage != null ? `${stats.completionPercentage}%` : '–',
      icon: Percent,
      color: 'bg-purple-500',
      sub: 'Feedback submission rate'
    },
    {
      title: 'Avg Overall Rating',
      value: stats.overallSatisfaction != null ? `${stats.overallSatisfaction} ★` : 'N/A',
      icon: Star,
      color: 'bg-amber-500',
      sub: "Today's lunch overall"
    },
    {
      title: 'Avg Dish Rating',
      value: stats.averageDishRating != null ? `${stats.averageDishRating} ★` : 'N/A',
      icon: BarChart2,
      color: 'bg-sky-500',
      sub: 'All dishes all time'
    },
    {
      title: "Today's Menu",
      value: stats.todayMenuPublished ? 'Published' : 'Not Published',
      icon: Utensils,
      color: stats.todayMenuPublished ? 'bg-primary-500' : 'bg-slate-400',
      sub: stats.todayMenuPublished ? 'Visible to residents' : 'Not yet visible'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Today's Ashram metrics at a glance</p>
        </div>
        {!stats.todayMenuPublished && (
          <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full border border-amber-200">
            ⚠ Menu Not Published
          </span>
        )}
      </div>

      {/* 7 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {topMetrics.map(m => (
          <div key={m.title} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{m.title}</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{m.value}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{m.sub}</p>
              </div>
              <div className={`${m.color} p-3 rounded-2xl text-white shadow-sm shrink-0`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Day-wise Trends Section — Sleek SVG Charts with Axes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Daily Participation & Completion Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Participation & Completion Trend
            </h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">Last 14 Days</span>
          </div>

          {loadingTrends ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : !dailyTrends?.length ? (
            <p className="text-center text-slate-400 py-12">No trend data available.</p>
          ) : (
            <ParticipationSvgChart data={dailyTrends} hoveredIndex={hoveredDayIndex} setHoveredIndex={setHoveredDayIndex} />
          )}
        </div>

        {/* 2. Daily Average Overall & Dish Rating Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Rating Score Trends (1–5 ★)
            </h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">Last 14 Days</span>
          </div>

          {loadingTrends ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : !dailyTrends?.length ? (
            <p className="text-center text-slate-400 py-12">No rating trend data available.</p>
          ) : (
            <RatingSvgChart data={dailyTrends} hoveredIndex={hoveredDayIndex} setHoveredIndex={setHoveredDayIndex} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Top & Bottom Dishes */}
        <div className="card p-6">
          <div className="flex items-center mb-5">
            <TrendingUp className="w-5 h-5 text-slate-400 mr-2" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Today's Top & Bottom Dishes</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Top Rated</p>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{stats.todayTopRated?.dishName || 'No data yet'}</p>
              </div>
              {stats.todayTopRated && (
                <div className="flex items-center text-green-700 dark:text-green-400 font-bold text-xl">
                  {stats.todayTopRated.averageRating} <Star className="w-5 h-5 ml-1 fill-current" />
                </div>
              )}
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Lowest Rated</p>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{stats.todayLowestRated?.dishName || 'No data yet'}</p>
              </div>
              {stats.todayLowestRated && (
                <div className="flex items-center text-red-700 dark:text-red-400 font-bold text-xl">
                  {stats.todayLowestRated.averageRating} <Star className="w-5 h-5 ml-1 fill-current" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card p-6">
          <div className="flex items-center mb-5">
            <Activity className="w-5 h-5 text-slate-400 mr-2" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">System Information</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Total Menus Created</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{stats.totalMenus}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Total Active Dishes</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{stats.totalDishes}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Server Status</span>
              <span className="text-green-600 dark:text-green-400 font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" /> Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Feedback Status Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Today's Feedback Status</h3>
        </div>

        {loadingStatus ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : !feedbackStatus?.length ? (
          <p className="text-center text-slate-400 py-10">No active residents or menu not yet published.</p>
        ) : (
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
                {feedbackStatus.map((row: any, i: number) => (
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
        )}
      </div>
    </div>
  );
}

// ==========================================
// Sleek SVG Chart Components with X & Y Axes
// ==========================================

function ParticipationSvgChart({ data, hoveredIndex, setHoveredIndex }: any) {
  const width = 500;
  const height = 220;
  const margin = { top: 20, right: 20, bottom: 45, left: 40 };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxVal = Math.max(...data.map((d: any) => Math.max(d.residentsPresent || 0, d.residentsRated || 0)), 5);
  const n = data.length;

  const getX = (index: number) => margin.left + (n > 1 ? (index / (n - 1)) * chartWidth : chartWidth / 2);
  const getY = (val: number) => margin.top + chartHeight - (val / maxVal) * chartHeight;

  // Build SVG path points
  const pointsRated = data.map((d: any, i: number) => `${getX(i)},${getY(d.residentsRated || 0)}`).join(' L ');
  const areaPath = `M ${getX(0)},${getY(0)} L ${pointsRated} L ${getX(n - 1)},${getY(0)} Z`;

  // Grid ticks for Y-axis (4 levels)
  const yTicks = [0, Math.round(maxVal / 3), Math.round((2 * maxVal) / 3), maxVal];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines & Y-Axis Labels */}
        {yTicks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={i}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-medium">{tick}</text>
            </g>
          );
        })}

        {/* Y Axis line */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartHeight} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

        {/* X Axis line */}
        <line x1={margin.left} y1={margin.top + chartHeight} x2={width - margin.right} y2={margin.top + chartHeight} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

        {/* X-Axis Date Labels (show every 2nd date if > 8 dates) */}
        {data.map((d: any, i: number) => {
          if (n > 8 && i % 2 !== 0 && i !== n - 1) return null;
          const x = getX(i);
          return (
            <text key={i} x={x} y={height - 12} textAnchor="middle" className="fill-slate-400 text-[10px] font-medium">
              {format(new Date(d.date), 'dd MMM')}
            </text>
          );
        })}

        {/* Area fill under curve */}
        <path d={areaPath} fill="url(#purpleGrad)" />

        {/* Line for Residents Rated */}
        <path d={`M ${pointsRated}`} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points & Interactive hovers */}
        {data.map((d: any, i: number) => {
          const cx = getX(i);
          const cy = getY(d.residentsRated || 0);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} className="fill-purple-600 stroke-white dark:stroke-slate-900 transition-all" strokeWidth="2" />
            </g>
          );
        })}
      </svg>

      {/* Legend & Hover Tooltip Card */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded bg-purple-500 inline-block" /> Residents Rated
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-400">
            <span className="w-3 h-0.5 bg-slate-300 dark:bg-slate-700 inline-block" /> Y: Headcount (0–{maxVal})
          </span>
        </div>

        {hoveredIndex != null && data[hoveredIndex] && (
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg animate-in fade-in">
            {format(new Date(data[hoveredIndex].date), 'dd MMM')}: <span className="text-purple-300 font-bold">{data[hoveredIndex].residentsRated}</span> / {data[hoveredIndex].residentsPresent} Rated ({data[hoveredIndex].completionPercentage}%)
          </div>
        )}
      </div>
    </div>
  );
}

function RatingSvgChart({ data, hoveredIndex, setHoveredIndex }: any) {
  const width = 500;
  const height = 220;
  const margin = { top: 20, right: 20, bottom: 45, left: 40 };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const n = data.length;
  const getX = (index: number) => margin.left + (n > 1 ? (index / (n - 1)) * chartWidth : chartWidth / 2);
  const getY = (val: number) => margin.top + chartHeight - ((val - 1) / 4) * chartHeight;

  // Build points for Overall (amber) and Dish (sky blue)
  const pointsOverall = data.map((d: any, i: number) => `${getX(i)},${getY(d.avgOverallRating != null ? d.avgOverallRating : 1)}`).join(' L ');
  const pointsDish = data.map((d: any, i: number) => `${getX(i)},${getY(d.avgDishRating != null ? d.avgDishRating : 1)}`).join(' L ');

  const areaOverall = `M ${getX(0)},${getY(1)} L ${pointsOverall} L ${getX(n - 1)},${getY(1)} Z`;

  // Grid ticks for 1 to 5 Stars
  const yTicks = [1, 2, 3, 4, 5];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines & Y-Axis Labels (1 to 5 Stars) */}
        {yTicks.map((star) => {
          const y = getY(star);
          return (
            <g key={star}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-bold">{star}★</text>
            </g>
          );
        })}

        {/* Y Axis line */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + chartHeight} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

        {/* X Axis line */}
        <line x1={margin.left} y1={margin.top + chartHeight} x2={width - margin.right} y2={margin.top + chartHeight} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

        {/* X-Axis Date Labels */}
        {data.map((d: any, i: number) => {
          if (n > 8 && i % 2 !== 0 && i !== n - 1) return null;
          const x = getX(i);
          return (
            <text key={i} x={x} y={height - 12} textAnchor="middle" className="fill-slate-400 text-[10px] font-medium">
              {format(new Date(d.date), 'dd MMM')}
            </text>
          );
        })}

        {/* Area fill for Overall */}
        <path d={areaOverall} fill="url(#amberGrad)" />

        {/* Lines */}
        <path d={`M ${pointsOverall}`} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${pointsDish}`} fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d: any, i: number) => {
          const cx = getX(i);
          const cyOverall = getY(d.avgOverallRating != null ? d.avgOverallRating : 1);
          const cyDish = getY(d.avgDishRating != null ? d.avgDishRating : 1);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {d.avgOverallRating != null && (
                <circle cx={cx} cy={cyOverall} r={isHovered ? 6 : 4} className="fill-amber-500 stroke-white dark:stroke-slate-900 transition-all" strokeWidth="2" />
              )}
              {d.avgDishRating != null && (
                <circle cx={cx} cy={cyDish} r={isHovered ? 5 : 3.5} className="fill-sky-500 stroke-white dark:stroke-slate-900 transition-all" strokeWidth="1.5" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend & Hover Tooltip Card */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Avg Overall
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <span className="w-3 h-0.5 bg-sky-500 inline-block" /> Avg Dish
          </span>
        </div>

        {hoveredIndex != null && data[hoveredIndex] && (
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg animate-in fade-in">
            {format(new Date(data[hoveredIndex].date), 'dd MMM')}: Overall <span className="text-amber-400 font-bold">{data[hoveredIndex].avgOverallRating ?? '–'}★</span> | Dish <span className="text-sky-300 font-bold">{data[hoveredIndex].avgDishRating ?? '–'}★</span>
          </div>
        )}
      </div>
    </div>
  );
}
