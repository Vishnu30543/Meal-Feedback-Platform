import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export default function DishForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'CURRY'
  });

  const { data: existingDish, isLoading } = useQuery({
    queryKey: ['dish', id],
    queryFn: () => api.get(`/dishes/${id}`).then(res => res.data),
    enabled: !!id
  });

  useEffect(() => {
    if (existingDish) {
      setFormData({
        name: existingDish.name || '',
        displayName: existingDish.displayName || '',
        description: existingDish.description || '',
        category: existingDish.category || 'CURRY'
      });
    }
  }, [existingDish]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => id ? api.put(`/dishes/${id}`, data) : api.post('/dishes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
      navigate('/admin/dishes');
    },
  });

  if (isLoading) return <div className="p-10 text-center">Loading dish data...</div>;

  const handleSave = () => {
    if (!formData.name) {
      alert("Internal Name is required");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center">
        <button onClick={() => navigate('/admin/dishes')} className="p-2 mr-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{id ? 'Edit Dish' : 'Add New Dish'}</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{id ? 'Update recipe details' : 'Create a new recipe in the system'}</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-between items-center px-4 mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}>
              {s}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 bg-background dark:bg-slate-900 transition-colors duration-300 px-2">
              {s === 1 ? 'Basic' : s === 2 ? 'Recipe' : s === 3 ? 'Nutrition' : 'Images'}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-8 min-h-[400px] flex flex-col">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 sm:col-span-1">
                <label className="label-text">Dish Name (Internal) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. bottle-gourd-curry"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label-text">Display Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Bottle Gourd Curry"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="label-text">Category</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="CURRY">Curry</option>
                  <option value="RICE">Rice</option>
                  <option value="ROTI">Roti</option>
                  <option value="SALAD">Salad</option>
                  <option value="SOUP">Soup</option>
                  <option value="JUICE">Juice</option>
                  <option value="SWEET">Sweet</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label-text">Description</label>
                <textarea 
                  className="input-field min-h-[100px]" 
                  placeholder="Detailed description of the dish..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
        
        {step > 1 && (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500 animate-in fade-in">
            Form step {step} placeholder for {step === 2 ? 'Recipe' : step === 3 ? 'Nutrition' : 'Images'}
          </div>
        )}

        {mutation.isError && (
          <div className="text-red-500 text-sm p-4 mt-4 bg-red-50 dark:bg-red-900/20 rounded">
            Failed to save dish. {mutation.error?.message}
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-between">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              disabled={mutation.isPending}
              className="btn-secondary text-primary-600 border-primary-600 hover:bg-primary-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save & Exit'}
            </button>
            {step < 4 ? (
              <button 
                onClick={() => setStep(s => Math.min(4, s + 1))}
                className="btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Dish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
