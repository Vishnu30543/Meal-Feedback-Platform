import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Users, 
  Utensils, 
  CheckCircle, 
  TrendingUp, 
  Star,
  Activity,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  todayMenuPublished: boolean;
  totalActiveResidents: number;
  residentsRatedToday: number;
  overallSatisfaction: number | null;
  pendingRatings: number;
  todayTopRated: { dishName: string; averageRating: number } | null;
  todayLowestRated: { dishName: string; averageRating: number } | null;
  totalDishes: number;
  totalMenus: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: () => api.get('/analytics/dashboard').then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Today's Ashram metrics at a glance</p>
        </div>
        {!stats.todayMenuPublished && (
          <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full border border-amber-200">
            Today's Menu is NOT Published
          </span>
        )}
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Sadhakas" 
          value={stats.totalActiveResidents.toString()} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Ratings Today" 
          value={`${stats.residentsRatedToday} / ${stats.totalActiveResidents}`} 
          subtitle={`${stats.pendingRatings} pending`}
          icon={CheckCircle} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Overall Satisfaction" 
          value={stats.overallSatisfaction ? `${stats.overallSatisfaction} / 5` : 'N/A'} 
          icon={Star} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Total Dishes" 
          value={stats.totalDishes.toString()} 
          icon={Utensils} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dish Performance */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-slate-400 dark:text-slate-500 mr-2" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Today's Top & Bottom Dishes</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Top Rated</p>
                <p className="font-medium text-slate-900 dark:text-slate-50">{stats.todayTopRated?.dishName || 'No data yet'}</p>
              </div>
              {stats.todayTopRated && (
                <div className="flex items-center text-green-700 font-bold text-xl">
                  {stats.todayTopRated.averageRating} <Star className="w-5 h-5 ml-1 fill-current" />
                </div>
              )}
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Lowest Rated</p>
                <p className="font-medium text-slate-900 dark:text-slate-50">{stats.todayLowestRated?.dishName || 'No data yet'}</p>
              </div>
              {stats.todayLowestRated && (
                <div className="flex items-center text-red-700 font-bold text-xl">
                  {stats.todayLowestRated.averageRating} <Star className="w-5 h-5 ml-1 fill-current" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Activity className="w-6 h-6 text-slate-400 dark:text-slate-500 mr-2" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">System Information</h3>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Total Menus Created</span>
              <span className="font-medium">{stats.totalMenus}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Server Status</span>
              <span className="text-green-600 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-2xl text-white shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
