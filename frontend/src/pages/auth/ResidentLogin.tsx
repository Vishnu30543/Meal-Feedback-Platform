import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  residentCode: z.string().min(1, 'Sadhaka ID is required'),
  campStartDate: z.string().min(1, 'Camp start date is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function ResidentLogin() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      const res = await api.post('/auth/resident/login', data);
      const { token, ...userData } = res.data;
      login(token, userData);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your ID and camp date.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sadhaka Login</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Enter your ID and camp start date</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label-text">Sadhaka ID</label>
          <input
            type="text"
            {...register('residentCode')}
            className={`input-field ${errors.residentCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="e.g. 1001"
          />
          {errors.residentCode && <p className="mt-1.5 text-sm text-red-600">{errors.residentCode.message}</p>}
        </div>

        <div>
          <label className="label-text">Camp Start Date</label>
          <input
            type="date"
            {...register('campStartDate')}
            className={`input-field ${errors.campStartDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {errors.campStartDate && <p className="mt-1.5 text-sm text-red-600">{errors.campStartDate.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex justify-center py-3 text-base"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter App'}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/login/admin" className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 transition-colors">
          Admin Login
        </Link>
      </div>
    </div>
  );
}
