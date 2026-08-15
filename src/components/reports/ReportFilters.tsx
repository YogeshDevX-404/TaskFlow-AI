import React from 'react';
import { ReportFilterParams } from '../../types/reports';
import { Filter, Calendar, Search, RefreshCw, X } from 'lucide-react';

interface ReportFiltersProps {
  filters: ReportFilterParams;
  onChange: (updated: ReportFilterParams) => void;
  onReset: () => void;
  projects?: Array<{ id: string; name: string }>;
  sprints?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  onReset,
  projects = [],
  sprints = [],
  users = [],
}) => {
  const handleDatePreset = (preset: ReportFilterParams['datePreset']) => {
    onChange({ ...filters, datePreset: preset });
  };

  const hasActiveFilters = Boolean(
    filters.projectId ||
      filters.sprintId ||
      filters.assigneeId ||
      filters.status ||
      filters.priority ||
      filters.search ||
      (filters.datePreset && filters.datePreset !== 'last30')
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Analytics Filters & Scope
          </h3>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'last7', label: '7 Days' },
            { id: 'last30', label: '30 Days' },
            { id: 'last90', label: '90 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'thisQuarter', label: 'Quarter' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleDatePreset(item.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium transition text-[11px] cursor-pointer ${
                filters.datePreset === item.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Project Select */}
        <select
          value={filters.projectId || ''}
          onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Sprint Select */}
        <select
          value={filters.sprintId || ''}
          onChange={(e) => onChange({ ...filters, sprintId: e.target.value || undefined })}
          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Sprints</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Assignee / User Select */}
        <select
          value={filters.assigneeId || ''}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value || undefined })}
          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Backlog">Backlog</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Testing">Testing</option>
          <option value="Done">Done</option>
          <option value="Blocked">Blocked</option>
        </select>

        {/* Reset Button */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer w-full justify-center"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
