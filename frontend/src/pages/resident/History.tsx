import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';

export default function History() {
  const [filter, setFilter] = useState('30'); // days

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My History</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Past meals and feedback given</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="input-field py-1.5 pl-3 pr-8 text-sm w-auto font-medium"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="card p-8 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">History Module</h3>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">
          In a full implementation, this view will show a paginated list of all past menus the resident has consumed and rated, along with their feedback.
        </p>
      </div>
    </div>
  );
}
