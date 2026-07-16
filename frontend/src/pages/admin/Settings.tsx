import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Save, BrainCircuit, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: aiSettings, isLoading } = useQuery({
    queryKey: ['aiSettings'],
    queryFn: () => api.get('/ai-settings').then(res => res.data)
  });

  const { register, handleSubmit, reset } = useForm();
  
  useEffect(() => {
    if (aiSettings) reset(aiSettings);
  }, [aiSettings, reset]);

  const mutation = useMutation({
    mutationFn: (newSettings: any) => api.put('/ai-settings', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiSettings'] });
      alert('Settings saved successfully!');
    }
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Configure AI suggestions and other core behaviours</p>
      </div>

      <div className="card max-w-2xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center">
          <BrainCircuit className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Recommendations</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-slate-800 dark:text-slate-100 block">Enable AI Suggestions</label>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
                Allow AI to analyze ratings and suggest new menu combinations automatically.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input type="checkbox" className="sr-only peer" {...register('aiEnabled')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-800 after:border-slate-300 dark:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <label className="font-medium text-slate-800 dark:text-slate-100 block mb-1">Minimum Ratings Threshold</label>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-3">
              Minimum number of dish ratings required before the AI considers the data statistically significant.
            </p>
            <input 
              type="number" 
              className="input-field max-w-[200px]"
              {...register('minimumRatings', { valueAsNumber: true })}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="btn-primary flex items-center"
            >
              {mutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
