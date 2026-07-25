import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/resident'} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-primary-500/10 dark:bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <img src="/favicon.svg" alt="Ashram Logo" className="w-20 h-20 drop-shadow-xl" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Manthena Ashram
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          Diet & Health Feedback System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-3xl sm:px-10 border border-white/20 dark:border-slate-800/50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
