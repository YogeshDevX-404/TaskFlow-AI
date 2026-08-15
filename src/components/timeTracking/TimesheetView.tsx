import React, { useState } from 'react';
import {
  useTimeEntries,
  useDeleteTimeEntry,
} from '../../hooks/useTimeEntries';
import { TimeEntry, TimeEntryFilterParams } from '../../types/timeEntry';
import { formatHoursToHuman, formatSecondsToHuman, formatSecondsToDigital } from './formatTime';
import { WorkLogModal } from './WorkLogModal';
import { ExportTimeLogsModal } from './ExportTimeLogsModal';
import {
  Clock,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

export const TimesheetView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [search, setSearch] = useState('');
  const [isBillableFilter, setIsBillableFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('-startTime');
  const [page, setPage] = useState(1);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const filters: TimeEntryFilterParams = {
    search: search || undefined,
    isBillable: isBillableFilter === 'billable' ? true : isBillableFilter === 'non-billable' ? false : undefined,
    source: sourceFilter !== 'all' ? (sourceFilter as any) : undefined,
    sort: sortOrder,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useTimeEntries(filters);
  const deleteMutation = useDeleteTimeEntry();

  const entries = data?.entries || [];
  const summary = data?.summary || {
    totalDuration: 0,
    billableDuration: 0,
    nonBillableDuration: 0,
    totalBillableAmount: 0,
  };
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Timesheet & Work Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, view, and manage daily and weekly employee work logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              setEditingEntry(null);
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Work Time</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Time Logged
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {formatSecondsToHuman(summary.totalDuration)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">
            Billable Hours
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatSecondsToHuman(summary.billableDuration)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block">
            Non-Billable Time
          </span>
          <span className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1 block">
            {formatSecondsToHuman(summary.nonBillableDuration)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider block">
            Billable Value
          </span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            ${summary.totalBillableAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Mode Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold w-fit">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly View
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by description or task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-1.5 pl-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="font-semibold">Filters:</span>
          </div>

          <select
            value={isBillableFilter}
            onChange={(e) => setIsBillableFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Billable Types</option>
            <option value="billable">Billable Only</option>
            <option value="non-billable">Non-Billable Only</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="Manual">Manual Entry</option>
            <option value="Timer">Timer Logged</option>
            <option value="Imported">Imported</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer ml-auto"
          >
            <option value="-startTime">Newest First</option>
            <option value="startTime">Oldest First</option>
            <option value="-duration">Longest Duration</option>
          </select>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading timesheet entries...
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-rose-500 text-sm">
            Failed to load time entries. Please refresh.
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300">No time entries found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No work logs match your filter criteria. Try clearing filters or logging new work.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Billable</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {entries.map((entry) => {
                  const taskObj = typeof entry.task === 'object' ? entry.task : null;
                  const projectObj = typeof entry.project === 'object' ? entry.project : null;
                  const userObj = typeof entry.user === 'object' ? entry.user : null;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(entry.startTime).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {userObj?.name || 'User'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {taskObj ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                              [{taskObj.taskKey}]
                            </span>
                            <span className="truncate max-w-[180px] text-slate-900 dark:text-white">
                              {taskObj.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">General</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {projectObj?.name || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-[220px] truncate">
                        {entry.description || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {formatSecondsToHuman(entry.duration)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.isBillable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-3 h-3" />
                            Billable
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Non-billable
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingEntry(entry);
                              setIsLogModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this work log?')) {
                                deleteMutation.mutate(entry.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <WorkLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingEntry(null);
        }}
        editEntry={editingEntry}
      />

      <ExportTimeLogsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentFilters={filters}
      />
    </div>
  );
};
