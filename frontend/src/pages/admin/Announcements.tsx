import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Megaphone, Heart, Plus, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Announcements() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'healthTips'>('announcements');

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements').then(res => res.data),
    enabled: activeTab === 'announcements'
  });

  const { data: healthTips } = useQuery({
    queryKey: ['healthTipsAll'],
    queryFn: () => api.get('/health-tips').then(res => res.data),
    enabled: activeTab === 'healthTips'
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Content Management</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage announcements and daily health tips</p>
        </div>
        <button className="btn-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" /> 
          {activeTab === 'announcements' ? 'New Announcement' : 'New Health Tip'}
        </button>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'announcements' 
                ? 'border-primary-500 text-primary-700' 
                : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:border-slate-600'
            }`}
          >
            <Megaphone className="w-4 h-4 mr-2" /> Announcements
          </button>
          <button 
            onClick={() => setActiveTab('healthTips')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'healthTips' 
                ? 'border-primary-500 text-primary-700' 
                : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:border-slate-600'
            }`}
          >
            <Heart className="w-4 h-4 mr-2" /> Health Tips
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                {activeTab === 'announcements' ? (
                  <th className="px-6 py-4 font-semibold">Date Range</th>
                ) : (
                  <th className="px-6 py-4 font-semibold">Active Date</th>
                )}
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === 'announcements' && announcements?.content?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:bg-slate-900/50/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">{item.title}</td>
                  <td className="px-6 py-4">
                    {format(new Date(item.startDate), 'MMM d, yyyy')} - {format(new Date(item.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {item.visible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Visible</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Hidden</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'healthTips' && healthTips?.content?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:bg-slate-900/50/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">{item.title}</td>
                  <td className="px-6 py-4">
                    {item.activeDate ? format(new Date(item.activeDate), 'MMM d, yyyy') : 'No Date Set'}
                  </td>
                  <td className="px-6 py-4">
                    {item.visible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Visible</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Hidden</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
