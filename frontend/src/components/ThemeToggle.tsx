import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-300 ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500 scale-100'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-90'
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-300 ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-500 scale-100'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-90'
        }`}
        title="System Preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-400 scale-100'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-90'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
