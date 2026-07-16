import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/resident'} />;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors duration-300 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Manthena Satyanarayana Ashram
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Diet & Health Feedback System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-soft sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
