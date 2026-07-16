import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
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
      const res = await api.post('/auth/admin/login', data);
      const { token, ...userData } = res.data;
      login(token, userData);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Login</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Sign in to manage the ashram system</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label-text">Email Address</label>
          <input
            type="email"
            {...register('email')}
            className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="admin@ashram.com"
          />
          {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label-text">Password</label>
          <input
            type="password"
            {...register('password')}
            className={`input-field ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex justify-center py-3 text-base"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          Are you a Sadhaka? Login here
        </Link>
      </div>
    </div>
  );
}
