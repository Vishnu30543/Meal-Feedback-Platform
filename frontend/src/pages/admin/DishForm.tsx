import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, Save, UploadCloud, Trash2, 
  Info, Activity, Image as ImageIcon,
  CheckCircle, ChefHat, List, FileText, PlaySquare, Type
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Info, description: 'Name & category' },
  { id: 2, title: 'Recipe', icon: ChefHat, description: 'Ingredients & steps' },
  { id: 3, title: 'Nutrition', icon: Activity, description: 'Health values' },
  { id: 4, title: 'Media', icon: ImageIcon, description: 'Photos & videos' }
];

export default function DishForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'CURRY',
    recipe: {
      ingredients: '',
      preparationSteps: '',
      preparationNotes: '',
      healthBenefits: '',
      youtubeUrl: ''
    },
    nutrition: {
      energy: '',
      carbohydrates: '',
      protein: '',
      fat: '',
      fiber: ''
    },
    imageUrls: [] as string[]
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
        category: existingDish.category || 'CURRY',
        recipe: {
          ingredients: existingDish.recipe?.ingredients || '',
          preparationSteps: existingDish.recipe?.preparationSteps || '',
          preparationNotes: existingDish.recipe?.preparationNotes || '',
          healthBenefits: existingDish.recipe?.healthBenefits || '',
          youtubeUrl: existingDish.recipe?.youtubeUrl || ''
        },
        nutrition: {
          energy: existingDish.nutrition?.energy || '',
          carbohydrates: existingDish.nutrition?.carbohydrates || '',
          protein: existingDish.nutrition?.protein || '',
          fat: existingDish.nutrition?.fat || '',
          fiber: existingDish.nutrition?.fiber || ''
        },
        imageUrls: existingDish.images?.map((img: any) => img.imageUrl) || []
      });
    }
  }, [existingDish]);

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
          imageUrls: [...prev.imageUrls, resData.secure_url]
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
    mutationFn: (data: typeof formData) => id ? api.put(`/dishes/${id}`, data) : api.post('/dishes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
      navigate('/admin/dishes');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSave = () => {
    if (!formData.name) {
      alert("Internal Name is required");
      return;
    }
    mutation.mutate(formData);
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dishes')} 
            className="p-3 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-2xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              {id ? 'Edit Dish Profile' : 'Create New Dish'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {id ? 'Update recipe and nutritional details' : 'Add a new culinary masterpiece to your menu'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/dishes')}
            className="btn-secondary rounded-xl"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={mutation.isPending}
            className="btn-primary rounded-xl flex items-center gap-2 px-6 shadow-primary-500/25 shadow-lg"
          >
            {mutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Dish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stepper Sidebar */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <nav className="space-y-2">
              {STEPS.map((s) => {
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                const Icon = s.icon;
                
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary-50 dark:bg-primary-900/20 shadow-inner' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      isActive 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : isCompleted
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                    }`}>
                      {isCompleted && !isActive ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold transition-colors ${
                        isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-9">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[600px] flex flex-col relative">
            <div className="p-8 sm:p-10 flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                          <Info className="w-6 h-6" />
                        </div>
                        Basic Information
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">Set up the core identity of this dish.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="label-text flex justify-between">
                          <span>Internal ID / Name <span className="text-red-500">*</span></span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <input 
                            type="text" 
                            className="input-field pl-12 h-14" 
                            placeholder="e.g. bottle-gourd-curry"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          />
                        </div>
                        <p className="text-xs text-slate-500">Used for system identification (lowercase, hyphens only).</p>
                      </div>

                      <div className="space-y-3">
                        <label className="label-text">Display Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Type className="w-5 h-5" />
                          </div>
                          <input 
                            type="text" 
                            className="input-field pl-12 h-14" 
                            placeholder="e.g. Bottle Gourd Curry"
                            value={formData.displayName}
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <label className="label-text">Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                          {['CURRY', 'RICE', 'ROTI', 'SALAD', 'SOUP', 'JUICE', 'SWEET'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setFormData({...formData, category: cat})}
                              className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                                formData.category === cat 
                                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-300 shadow-md transform scale-[1.02]' 
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-primary-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                              }`}
                            >
                              <span className="text-xs font-bold tracking-wider">{cat}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="label-text">Description</label>
                        <textarea 
                          className="input-field min-h-[140px] resize-none p-4" 
                          placeholder="Write a tempting description for this dish that highlights its origin and taste..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                          <ChefHat className="w-6 h-6" />
                        </div>
                        Recipe & Instructions
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">Detail the ingredients and how to prepare it.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="label-text flex items-center gap-2 font-semibold">
                          <List className="w-5 h-5 text-slate-400" /> Ingredients
                        </label>
                        <textarea 
                          className="input-field min-h-[200px] p-4 bg-slate-50/50 focus:bg-white dark:bg-slate-900/50 dark:focus:bg-slate-800 transition-colors" 
                          placeholder="• 2 cups Rice&#10;• 1 tbsp Salt..."
                          value={formData.recipe.ingredients}
                          onChange={(e) => setFormData({...formData, recipe: {...formData.recipe, ingredients: e.target.value}})}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="label-text flex items-center gap-2 font-semibold">
                          <Activity className="w-5 h-5 text-slate-400" /> Health Benefits
                        </label>
                        <textarea 
                          className="input-field min-h-[200px] p-4 bg-slate-50/50 focus:bg-white dark:bg-slate-900/50 dark:focus:bg-slate-800 transition-colors" 
                          placeholder="Highlight the nutritional perks..."
                          value={formData.recipe.healthBenefits}
                          onChange={(e) => setFormData({...formData, recipe: {...formData.recipe, healthBenefits: e.target.value}})}
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="label-text font-semibold">Preparation Steps</label>
                        <textarea 
                          className="input-field min-h-[240px] p-5 text-base leading-relaxed bg-slate-50/50 focus:bg-white dark:bg-slate-900/50 dark:focus:bg-slate-800 transition-colors" 
                          placeholder="Step 1: ...&#10;Step 2: ..."
                          value={formData.recipe.preparationSteps}
                          onChange={(e) => setFormData({...formData, recipe: {...formData.recipe, preparationSteps: e.target.value}})}
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="label-text font-semibold">Chef's Notes (Optional)</label>
                        <textarea 
                          className="input-field min-h-[120px] p-4 bg-amber-50/30 focus:bg-amber-50/60 dark:bg-amber-900/10 dark:focus:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/50 focus:border-amber-400 transition-colors" 
                          placeholder="Pro-tips for making this perfect..."
                          value={formData.recipe.preparationNotes}
                          onChange={(e) => setFormData({...formData, recipe: {...formData.recipe, preparationNotes: e.target.value}})}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                          <Activity className="w-6 h-6" />
                        </div>
                        Nutritional Profile
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">Provide macros per standard serving.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                      {[
                        { id: 'energy', label: 'Energy (kcal)', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400', ring: 'focus:border-yellow-400 focus:ring-yellow-400/20' },
                        { id: 'protein', label: 'Protein (g)', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400', ring: 'focus:border-red-400 focus:ring-red-400/20' },
                        { id: 'carbohydrates', label: 'Carbs (g)', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400', ring: 'focus:border-blue-400 focus:ring-blue-400/20' },
                        { id: 'fat', label: 'Fat (g)', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400', ring: 'focus:border-orange-400 focus:ring-orange-400/20' },
                        { id: 'fiber', label: 'Fiber (g)', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400', ring: 'focus:border-green-400 focus:ring-green-400/20' },
                      ].map((macro) => (
                        <div key={macro.id} className="space-y-3 relative group">
                          <label className="label-text font-semibold">{macro.label}</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              className={`input-field pl-16 h-14 text-lg transition-all ${macro.ring}`} 
                              placeholder="0.0"
                              value={(formData.nutrition as any)[macro.id]}
                              onChange={(e) => setFormData({...formData, nutrition: {...formData.nutrition, [macro.id]: e.target.value}})}
                            />
                            <div className={`absolute inset-y-2 left-2 w-10 flex items-center justify-center rounded-xl ${macro.color} text-sm font-bold shadow-sm`}>
                              {macro.id.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        Media & Assets
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">Add appetizing photos and a video tutorial.</p>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-3 bg-red-50/50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <label className="label-text flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
                          <PlaySquare className="w-5 h-5" /> YouTube Video URL
                        </label>
                        <input 
                          type="url" 
                          className="input-field h-14 bg-white dark:bg-slate-800 focus:ring-red-500/20 focus:border-red-500" 
                          placeholder="https://youtube.com/watch?v=..."
                          value={formData.recipe.youtubeUrl}
                          onChange={(e) => setFormData({...formData, recipe: {...formData.recipe, youtubeUrl: e.target.value}})}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="label-text font-semibold text-lg">Dish Gallery Photos</label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                          {formData.imageUrls.map((url, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={idx} 
                              className="relative aspect-square rounded-3xl overflow-hidden group shadow-md border border-slate-200 dark:border-slate-700"
                            >
                              <img src={url.startsWith('file:///') ? 'https://via.placeholder.com/150?text=Local+Image+File' : url} alt={`Dish ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                <button 
                                  onClick={() => setFormData(prev => ({...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx)}))}
                                  className="p-3 bg-red-500/90 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-transform hover:scale-110 shadow-lg"
                                  type="button"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                          
                          <label className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-sm ${
                            isUploading 
                              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}>
                            {isUploading ? (
                              <div className="flex flex-col items-center text-primary-600">
                                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <span className="text-sm font-bold tracking-wide">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 group">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors shadow-inner">
                                  <UploadCloud className="w-7 h-7" />
                                </div>
                                <span className="text-sm font-bold">Add Photo</span>
                                <span className="text-xs text-slate-400 mt-2 text-center px-4">JPEG, PNG up to 5MB</span>
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
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md p-6 sm:px-10 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center mt-auto rounded-b-3xl">
              <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={`btn-secondary rounded-xl px-6 py-2.5 ${step === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  className="btn-primary rounded-xl px-10 py-3 text-base shadow-lg shadow-primary-500/20"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={handleSave} 
                  disabled={mutation.isPending} 
                  className="btn-primary rounded-xl flex items-center gap-2 px-10 py-3 text-base shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
                >
                  <Save className="w-5 h-5" /> {mutation.isPending ? 'Saving...' : 'Finish & Save'}
                </button>
              )}
            </div>

            {/* Error Message Overlay */}
            <AnimatePresence>
              {mutation.isError && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                >
                  <Activity className="w-6 h-6" />
                  <span className="font-semibold text-lg">Error saving: {mutation.error?.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
