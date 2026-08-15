import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { FileText, Image, Link2, Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/Modal';

type DocType = 'IMAGE' | 'PDF' | 'LINK';

interface ImportantDoc {
  id: number;
  title: string;
  description?: string;
  url: string;
  docType: DocType;
  category?: string;
  visible: boolean;
  createdAt: string;
}

const DOC_TYPE_ICONS: Record<DocType, React.ReactNode> = {
  IMAGE: <Image className="w-4 h-4" />,
  PDF: <FileText className="w-4 h-4" />,
  LINK: <Link2 className="w-4 h-4" />,
};

const DOC_TYPE_LABELS: Record<DocType, string> = {
  IMAGE: 'Image',
  PDF: 'PDF',
  LINK: 'Link',
};

const DOC_TYPE_COLORS: Record<DocType, string> = {
  IMAGE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PDF: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LINK: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

function DocForm({ initialData, onSuccess, onCancel }: {
  initialData?: ImportantDoc | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    url: initialData?.url || '',
    docType: (initialData?.docType || 'IMAGE') as DocType,
    category: initialData?.category || '',
    visible: initialData?.visible ?? true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'default_preset');
      data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const resData = await response.json();
      if (resData.secure_url) {
        setFormData(prev => ({
          ...prev,
          url: resData.secure_url
        }));
      } else {
        alert('Upload failed: ' + (resData.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData): Promise<any> => {
      if (initialData) {
        return api.put(`/docs/${initialData.id}`, data);
      }
      return api.post('/docs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['importantDocs'] });
      queryClient.invalidateQueries({ queryKey: ['importantDocsVisible'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a Title.');
      return;
    }
    if (!formData.url.trim()) {
      alert('Please enter a URL or upload an image.');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-text">Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          className="input-field"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Naturopathy Treatment Costs 2024"
        />
      </div>

      <div>
        <label className="label-text">Description</label>
        <textarea
          className="input-field min-h-[80px] resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this document..."
        />
      </div>

      <div>
        <label className="label-text">Type <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {(['IMAGE', 'PDF', 'LINK'] as DocType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, docType: type })}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                formData.docType === type
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {DOC_TYPE_ICONS[type]}
              {DOC_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label-text">
          {formData.docType === 'IMAGE' ? 'Image URL' : formData.docType === 'PDF' ? 'PDF URL' : 'Link URL'}
          <span className="text-red-500"> *</span>
        </label>
        {formData.docType === 'IMAGE' ? (
          <div className="space-y-3">
            <input
              type="text"
              className="input-field"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://drive.google.com/... or Cloudinary URL"
            />
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <label className={`w-full py-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isUploading 
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}>
              {isUploading ? (
                <div className="flex items-center gap-2 text-primary-600">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold tracking-wide">Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-sm font-bold">Upload Image File</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        ) : (
          <input
            type="text"
            className="input-field"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder={
              formData.docType === 'PDF'
              ? 'https://drive.google.com/... PDF link'
              : 'https://...'
            }
          />
        )}
      </div>

      <div>
        <label className="label-text">Category (optional)</label>
        <input
          type="text"
          className="input-field"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g. Treatment Costs, Schedule, Rules"
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, visible: !formData.visible })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.visible ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            formData.visible ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {formData.visible ? 'Visible to Sadhakas' : 'Hidden from Sadhakas'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.visible ? 'Sadhakas can see this document' : 'Only admins can see this'}
          </p>
        </div>
      </div>

      {mutation.isError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
          Failed to save. Please try again.
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={mutation.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending || isUploading}>
          {mutation.isPending ? 'Saving...' : (initialData ? 'Update Info' : 'Add Info')}
        </button>
      </div>
    </form>
  );
}

export default function AdminImportantDocs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ImportantDoc | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['importantDocs'],
    queryFn: () => api.get('/docs').then((res: any) => res.data?.content || res.data || (Array.isArray(res) ? res : [])),
  });

  const docs: ImportantDoc[] = Array.isArray(data) ? data : (data?.content || []);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/docs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['importantDocs'] });
      queryClient.invalidateQueries({ queryKey: ['importantDocsVisible'] });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (doc: ImportantDoc) => api.put(`/docs/${doc.id}`, { ...doc, visible: !doc.visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['importantDocs'] });
      queryClient.invalidateQueries({ queryKey: ['importantDocsVisible'] });
    },
  });

  const handleDelete = (doc: ImportantDoc) => {
    if (window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  const handleEdit = (doc: ImportantDoc) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoc(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ashram Info</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage treatment costs, schedules, guidelines, and photos visible to Sadhakas
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Info
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-max">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">URL</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Added</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FileText className="w-12 h-12 opacity-30" />
                      <p className="font-medium">No documents yet</p>
                      <p className="text-sm">Click "Add Document" to upload the first one</p>
                    </div>
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 max-w-xs truncate">{doc.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${DOC_TYPE_COLORS[doc.docType]}`}>
                        {DOC_TYPE_ICONS[doc.docType]}
                        {DOC_TYPE_LABELS[doc.docType]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {doc.category || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline text-xs max-w-[180px] truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{doc.url}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {doc.visible ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleVisibilityMutation.mutate(doc)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title={doc.visible ? 'Hide from Sadhakas' : 'Show to Sadhakas'}
                        >
                          {doc.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDoc ? 'Edit Info' : 'Add Ashram Info'}
      >
        <DocForm
          initialData={selectedDoc}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
