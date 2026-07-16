import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

interface SadhakaFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SadhakaForm({ initialData, onSuccess, onCancel }: SadhakaFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    residentCode: initialData?.residentCode || '',
    name: initialData?.name || '',
    phone: initialData?.phone || '',
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (initialData) {
        // Exclude residentCode from update request since it's permanent
        return api.put(`/residents/${initialData.id}`, {
          name: data.name,
          phone: data.phone
        });
      }
      return api.post('/residents', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
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
        <label className="label-text">Resident Code / ID <span className="text-red-500">*</span></label>
        <input
          type="text"
          required
          className="input-field"
          value={formData.residentCode}
          onChange={(e) => setFormData({ ...formData, residentCode: e.target.value })}
          placeholder="e.g. SAD-1001"
          disabled={!!initialData}
        />
      </div>
      
      <div>
        <label className="label-text">Name</label>
        <input
          type="text"
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full name"
        />
      </div>
      
      <div>
        <label className="label-text">Phone Number</label>
        <input
          type="tel"
          className="input-field"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Phone number"
        />
      </div>

      {mutation.isError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
          Failed to create resident. {mutation.error?.message}
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
          {mutation.isPending ? 'Saving...' : (initialData ? 'Update Sadhaka' : 'Create Sadhaka')}
        </button>
      </div>
    </form>
  );
}
