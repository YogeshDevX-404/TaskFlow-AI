import React from 'react';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  FileJson,
  FileText,
} from 'lucide-react';
import { ActivityFilters, ExportFormat } from '../../types/activity';

interface ActivityFilterBarProps {
  filters: ActivityFilters;
  onFilterChange: (filters: Partial<ActivityFilters>) => void;
  onResetFilters: () => void;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}

export const ActivityFilterBar: React.FC<ActivityFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExport,
  isExporting = false,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit logs by task, user, comment or action..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Quick Date Shortcuts & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range picker shortcuts */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
            <button
              onClick={() =>
                onFilterChange({
                  startDate: undefined,
                  endDate: undefined,
                })
              }
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !filters.startDate && !filters.endDate
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Time
            </button>

            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onFilterChange({ startDate: today, endDate: today });
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filters.startDate === new Date().toISOString().split('T')[0]
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => {
                const now = new Date();
                const past7 = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
                onFilterChange({ startDate: past7, endDate: new Date().toISOString().split('T')[0] });
              }}
              className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Last 7 Days
            </button>
          </div>

          {/* Export Menu Dropdown */}
          <div className="relative group">
            <button
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export Logs'}</span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hidden group-hover:block z-20 py-1 text-xs">
              <button
                onClick={() => onExport('csv')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => onExport('json')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-600" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => onExport('pdf')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Export PDF Spec</span>
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Selectors Row */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Action Type Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Action:</span>
          <select
            value={filters.actionType || 'all'}
            onChange={(e) => onFilterChange({ actionType: e.target.value })}
            className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="task_created">Task Created</option>
            <option value="status_changed">Status Changed</option>
            <option value="priority_changed">Priority Changed</option>
            <option value="assignee_changed">Assignee Reassigned</option>
            <option value="comment_added">Comment Added</option>
            <option value="attachment_uploaded">Attachment Uploaded</option>
            <option value="task_deleted">Task Deleted</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>

        {/* Entity Type Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Module:</span>
          <select
            value={filters.entityType || 'all'}
            onChange={(e) => onFilterChange({ entityType: e.target.value })}
            className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Modules</option>
            <option value="Task">Tasks</option>
            <option value="Comment">Comments</option>
            <option value="Attachment">Attachments</option>
            <option value="Project">Projects</option>
            <option value="Workspace">Workspaces</option>
            <option value="Member">Members</option>
            <option value="Auth">Security & Auth</option>
          </select>
        </div>

        {/* Sort Order Toggle */}
        <button
          onClick={() =>
            onFilterChange({
              sortBy: filters.sortBy === 'oldest' ? 'newest' : 'oldest',
            })
          }
          className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium text-slate-700 dark:text-slate-200"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort: {filters.sortBy === 'oldest' ? 'Oldest First' : 'Newest First'}</span>
        </button>
      </div>
    </div>
  );
};
