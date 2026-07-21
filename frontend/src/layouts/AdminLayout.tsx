import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  LayoutDashboard, LogOut, FileText, Bell, Users, Settings,
  Utensils, Menu, X, BarChart2, ChevronDown, ChevronRight,
  TrendingUp, GitCompare, MessageSquare
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(
    location.pathname.startsWith('/admin/analytics')
  );

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Menus', path: '/admin/menus', icon: FileText },
    { name: 'Dishes', path: '/admin/dishes', icon: Utensils },
    { name: 'Sadhakas', path: '/admin/residents', icon: Users },
    { name: 'Content', path: '/admin/announcements', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const analyticsItems = [
    { name: 'Dashboard', path: '/admin/analytics', icon: BarChart2, exact: true },
    { name: 'Dish Analytics', path: '/admin/analytics/dishes', icon: TrendingUp },
    { name: 'Dish Comparison', path: '/admin/analytics/comparison', icon: GitCompare },
    { name: 'Comment Search', path: '/admin/analytics/search', icon: MessageSquare },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const currentPageName = () => {
    const allItems = [...navItems, ...analyticsItems];
    const match = allItems.find(i => isActive(i.path, i.exact));
    return match?.name || 'Dashboard';
  };

  const NavLink = ({ item }: { item: { name: string; path: string; icon: any; exact?: boolean } }) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.exact);
    return (
      <Link
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
          active
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${active ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'}`} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors duration-300 flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="font-bold text-lg text-primary-700 dark:text-primary-500">Ashram Admin</h1>
          <button
            className="md:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main nav */}
          {navItems.map(item => <NavLink key={item.path} item={item} />)}

          {/* Analytics group */}
          <div className="pt-2">
            <button
              onClick={() => setIsAnalyticsOpen(o => !o)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                location.pathname.startsWith('/admin/analytics')
                  ? 'text-primary-700 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center">
                <BarChart2 className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500" />
                Analytics
              </span>
              {isAnalyticsOpen
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />}
            </button>

            {isAnalyticsOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                {analyticsItems.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-8 justify-between shadow-sm z-10 transition-colors duration-300">
          <div className="flex items-center">
            <button
              className="md:hidden mr-3 p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {currentPageName()}
            </h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
