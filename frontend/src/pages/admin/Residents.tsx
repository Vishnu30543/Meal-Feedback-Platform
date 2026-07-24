import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Search, Filter, Plus, Edit2, Trash2, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/Modal';
import SadhakaForm from '../../components/forms/SadhakaForm';
import BulkAddModal from '../../components/forms/BulkAddModal';

export default function Residents() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeCampOnly, setActiveCampOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/residents/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      setSelectedIds([]);
    }
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: (ids: number[]) => api.patch(`/residents/bulk-archive`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      setSelectedIds([]);
    }
  });

  const handleEdit = (resident: any) => {
    setSelectedResident(resident);
    setIsAddModalOpen(true);
  };

  const handleArchive = (id: number, code: string) => {
    if (window.confirm(`Are you sure you want to archive resident ${code}?`)) {
      archiveMutation.mutate(id);
    }
  };

  const handleBulkArchive = () => {
    if (window.confirm(`Are you sure you want to archive ${selectedIds.length} residents?`)) {
      bulkArchiveMutation.mutate(selectedIds);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['residents', page, search, activeCampOnly],
    queryFn: () => api.get(`/residents?page=${page}&size=10&search=${search}&activeCampOnly=${activeCampOnly}`).then(res => res.data)
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && data?.content) {
      setSelectedIds(data.content.map((r: any) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sadhakas</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage ashram Sadhakas and their camps</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn-secondary flex items-center shrink-0"
            onClick={() => setIsBulkModalOpen(true)}
          >
            <UploadCloud className="w-4 h-4 mr-2" /> Bulk Add
          </button>
          <button 
            className="btn-primary flex items-center shrink-0"
            onClick={() => {
              setSelectedResident(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Sadhaka
          </button>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name, ID or phone..."
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setActiveCampOnly(!activeCampOnly)}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${activeCampOnly ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <Filter className="w-4 h-4 mr-2" /> {activeCampOnly ? 'Active Camps Only' : 'All Residents'}
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-800/50 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {selectedIds.length} selected
              </span>
              <button 
                onClick={handleBulkArchive}
                disabled={bulkArchiveMutation.isPending}
                className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> 
                {bulkArchiveMutation.isPending ? 'Archiving...' : 'Bulk Archive'}
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:checked:bg-primary-500"
                    checked={data?.content?.length > 0 && selectedIds.length === data?.content?.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-semibold">Sadhaka ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">DOJ</th>
                <th className="px-6 py-4 font-semibold">Active Camp</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 mt-1">
                    Loading Sadhakas...
                  </td>
                </tr>
              ) : data?.content?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 mt-1">
                    No Sadhakas found.
                  </td>
                </tr>
              ) : (
                data?.content?.map((resident: any) => (
                  <tr key={resident.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedIds.includes(resident.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:checked:bg-primary-500"
                        checked={selectedIds.includes(resident.id)}
                        onChange={() => handleSelectOne(resident.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">{resident.residentCode}</td>
                    <td className="px-6 py-4">{resident.name}</td>
                    <td className="px-6 py-4">{resident.phone}</td>
                    <td className="px-6 py-4">{resident.doj ? format(new Date(resident.doj), 'MMM d, yyyy') : '-'}</td>
                    <td className="px-6 py-4">
                      {resident.activeCamp ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Active until {format(new Date(resident.activeCamp.endDate), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          No Active Camp
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(resident)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleArchive(resident.id, resident.residentCode)}
                          disabled={archiveMutation.isPending}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
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

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Showing {page * 10 + 1} to {Math.min((page + 1) * 10, data.totalElements)} of {data.totalElements} entries
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:bg-slate-900/50 disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:bg-slate-900/50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={selectedResident ? "Edit Sadhaka" : "Add New Sadhaka"}
      >
        <SadhakaForm 
          initialData={selectedResident}
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Add Sadhakas"
      >
        <BulkAddModal 
          onSuccess={() => setIsBulkModalOpen(false)}
          onCancel={() => setIsBulkModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
