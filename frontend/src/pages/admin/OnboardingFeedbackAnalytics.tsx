import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, Clock, Stethoscope, UserCheck, MessageSquare } from 'lucide-react';

interface FeedbackComment {
  residentName: string;
  residentCode: string;
  type: string;
  comment: string;
  date: string;
}

interface AnalyticsData {
  totalSubmissions: number;
  journeyDelayFacedCount: number;
  doctorWaitFacedCount: number;
  floorInchargeIssueCount: number;
  recentComments: FeedbackComment[];
}

export default function OnboardingFeedbackAnalytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['adminOnboardingAnalytics'],
    queryFn: () => api.get('/admin/onboarding-feedback/analytics').then(res => res.data ?? res)
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  if (!data) return null;

  const getPercentage = (count: number) => {
    if (data.totalSubmissions === 0) return 0;
    return Math.round((count / data.totalSubmissions) * 100);
  };

  const statCards = [
    {
      title: 'Journey Delay',
      count: data.journeyDelayFacedCount,
      percentage: getPercentage(data.journeyDelayFacedCount),
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
      title: 'Doctor Wait',
      count: data.doctorWaitFacedCount,
      percentage: getPercentage(data.doctorWaitFacedCount),
      icon: Stethoscope,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-500/10'
    },
    {
      title: 'Floor Incharge Issues',
      count: data.floorInchargeIssueCount,
      percentage: getPercentage(data.floorInchargeIssueCount),
      icon: UserCheck,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Onboarding Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Total Feedback Received: <span className="font-bold text-slate-700 dark:text-slate-200">{data.totalSubmissions}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-6 border-l-4" style={{ borderLeftColor: 'currentColor' }}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.count}</span>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Reported Issues</p>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{stat.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stat.count} out of {data.totalSubmissions} sadhakas
              </p>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Comments</h2>
        </div>
        
        {data.recentComments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No comments received yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentComments.map((comment, i) => (
              <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{comment.residentName}</span>
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">
                      {comment.residentCode}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">{comment.date}</span>
                </div>
                <div className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 mb-3">
                  {comment.type}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                  "{comment.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
