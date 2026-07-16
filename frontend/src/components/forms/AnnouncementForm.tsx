import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { format } from 'date-fns';

interface AnnouncementFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AnnouncementForm({ initialData, onSuccess, onCancel }: AnnouncementFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || format(new Date(), 'yyyy-MM-dd'),
    endDate: initialData?.endDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: initialData?.priority || 1,
    visible: initialData?.visible ?? true,
    imageUrl: initialData?.imageUrl || ''
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (initialData) {
        return api.put(`/announcements/${initialData.id}`, data);
      }
      return api.post('/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-text">Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          required
          className="input-field"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Announcement title"
        />
      </div>
      
      <div>
        <label className="label-text">Description</label>
        <textarea
          className="input-field min-h-[100px]"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Start Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            className="input-field"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label-text">End Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            className="input-field"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="visible"
          checked={formData.visible}
          onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
          className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
        />
        <label htmlFor="visible" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Make immediately visible
        </label>
      </div>

      {mutation.isError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
          Failed to create announcement. {mutation.error?.message}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : (initialData ? 'Update Announcement' : 'Publish Announcement')}
        </button>
      </div>
    </form>
  );
}
