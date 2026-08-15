import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { format } from 'date-fns';

interface AnnouncementFormProps {
  type: 'announcements' | 'healthTips';
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AnnouncementForm({ type, initialData, onSuccess, onCancel }: AnnouncementFormProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || format(new Date(), 'yyyy-MM-dd'),
    endDate: initialData?.endDate || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    activeDate: initialData?.activeDate || format(new Date(), 'yyyy-MM-dd'),
    priority: initialData?.priority || 1,
    visible: initialData?.visible ?? true,
    imageUrl: initialData?.imageUrl || ''
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const endpoint = type === 'announcements' ? '/announcements' : '/health-tips';
      
      // Filter payload based on type
      const payload: any = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        visible: data.visible,
        imageUrl: data.imageUrl
      };
      
      if (type === 'announcements') {
        payload.startDate = data.startDate;
        payload.endDate = data.endDate;
      } else {
        payload.activeDate = data.activeDate;
      }

      if (initialData) {
        return api.put(`${endpoint}/${initialData.id}`, payload);
      }
      return api.post(endpoint, payload);
    },
    onSuccess: () => {
      if (type === 'announcements') {
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['healthTipsAll'] });
        queryClient.invalidateQueries({ queryKey: ['healthTips'] });
      }
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
          placeholder={type === 'announcements' ? "Announcement title" : "Health tip title"}
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

      {type === 'announcements' ? (
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
      ) : (
        <div>
          <label className="label-text">Active Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            className="input-field"
            value={formData.activeDate}
            onChange={(e) => setFormData({ ...formData, activeDate: e.target.value })}
          />
        </div>
      )}

      <div>
        <label className="label-text">Image URL (Optional)</label>
        <input
          type="url"
          className="input-field"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
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
          Failed to save {type === 'announcements' ? 'announcement' : 'health tip'}. {mutation.error?.message}
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
          {mutation.isPending ? 'Saving...' : (initialData ? 'Update' : 'Publish')}
        </button>
      </div>
    </form>
  );
}
