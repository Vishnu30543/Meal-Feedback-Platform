import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Home, History, Star, LogOut, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResidentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Today', path: '/resident', icon: Home },
    { name: 'History', path: '/resident/history', icon: History },
    { name: 'Favourites', path: '/resident/favourites', icon: Star },
    { name: 'Saved', path: '/resident/saved', icon: Utensils },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors duration-300 pb-20 sm:pb-0 sm:pt-16">
      {/* Top Header (Mobile & Desktop) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 shadow-sm z-30 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <h1 className="font-bold text-lg text-primary-700 dark:text-primary-500 truncate">Manthena Ashram</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:block text-right mr-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Sadhaka ID: {user?.residentCode}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md sm:max-w-2xl md:max-w-4xl mx-auto p-4 sm:p-6 mt-16 sm:mt-0 mb-16 sm:mb-0">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) / Top Nav (Desktop extension) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sm:top-16 sm:bottom-auto sm:border-t-0 sm:border-b sm:shadow-sm z-20 transition-colors duration-300">
        <div className="max-w-md sm:max-w-2xl md:max-w-4xl mx-auto flex justify-around sm:justify-start px-2 py-2 sm:py-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col sm:flex-row items-center justify-center sm:px-6 py-2 sm:py-4 flex-1 sm:flex-none text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Icon className={`w-6 h-6 sm:w-5 sm:h-5 sm:mr-2 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span className={`text-[10px] sm:text-sm font-medium mt-1 sm:mt-0 ${isActive ? 'text-primary-700 dark:text-primary-400' : ''}`}>
                  {item.name}
                </span>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 sm:bottom-0 sm:top-auto left-4 right-4 sm:left-0 sm:right-0 h-1 bg-primary-500 rounded-b-full sm:rounded-t-full sm:rounded-b-none"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
