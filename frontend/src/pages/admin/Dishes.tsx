import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dishes() {
  const [page] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/dishes/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    }
  });

  const handleArchive = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to archive "${name}"?`)) {
      archiveMutation.mutate(id);
    }
  };

  const getValidImageUrl = (dish: any) => {
    const url = dish.primaryImageUrl || dish.imageUrl;
    return url && !url.startsWith('file:///') ? url : null;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['dishes', page, search, category],
    queryFn: () => {
      let url = `/dishes?page=${page}&size=10`;
      if (search) url += `&search=${search}`;
      if (category) url += `&category=${category}`;
      return api.get(url).then(res => res.data);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dish Master</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage ashram recipes, nutrition, and dishes</p>
        </div>
        <Link to="/admin/dishes/new" className="btn-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add New Dish
        </Link>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search dishes..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="input-field max-w-[200px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="CURRY">Curry</option>
            <option value="RICE">Rice</option>
            <option value="ROTI">Roti</option>
            <option value="SALAD">Salad</option>
            <option value="SOUP">Soup</option>
            <option value="JUICE">Juice</option>
            <option value="SWEET">Sweet</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] relative shadow-inner rounded-b-xl">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Dish Details</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    Loading dishes...
                  </td>
                </tr>
              ) : data?.content?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    No dishes found.
                  </td>
                </tr>
              ) : (
                data?.content?.map((dish: any) => (
                  <tr key={dish.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden mr-3 shrink-0">
                          {getValidImageUrl(dish) ? (
                            <img src={getValidImageUrl(dish)} alt={dish.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-50">{dish.displayName || dish.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{dish.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                        {dish.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dish.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {dish.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                      {dish.averageRating ? `${dish.averageRating.toFixed(1)} ⭐` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/analytics/dishes/${dish.id}`}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                          title="View Analytics"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Link>
                        <Link 
                          to={`/admin/dishes/${dish.id}`}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleArchive(dish.id, dish.displayName || dish.name)}
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
      </div>
    </div>
  );
}
