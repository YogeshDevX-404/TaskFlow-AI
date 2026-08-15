import React from 'react';
import {
  useWorkAssignmentStore,
  WorkAssignmentScope,
  WorkAssignmentViewMode,
} from '../../store/useWorkAssignmentStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useMemberStore } from '../../store/useMemberStore';
import {
  Search,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Kanban,
  List,
  Users,
  User,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

interface FiltersBarProps {
  onOpenCreateModal: () => void;
}

export const WorkAssignmentFiltersBar: React.FC<FiltersBarProps> = ({
  onOpenCreateModal,
}) => {
  const {
    scope,
    setScope,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filters,
    setStatusFilter,
    setPriorityFilter,
    setProjectFilter,
    setAssignedToFilter,
    setIsOverdueFilter,
    resetFilters,
  } = useWorkAssignmentStore();

  const { projects } = useProjectStore();
  const { members } = useMemberStore();

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.projectId !== 'all' ||
    filters.assignedToId !== 'all' ||
    filters.isOverdue ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Scope Switcher, View Mode Switcher, and Assign Work CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Scope Switcher (All vs My Assignments) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setScope('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              scope === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Assignments</span>
          </button>

          <button
            onClick={() => setScope('my')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              scope === 'my'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Work Queue</span>
          </button>
        </div>

        {/* Right: View Mode Switcher & + Assign Work Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Detailed Table List"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('workload-matrix')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'workload-matrix'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Developer Workload Matrix"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('monitoring')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'monitoring'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Progress & Monitoring Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[11px] pr-1 hidden md:inline">Dashboard</span>
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Work</span>
          </button>
        </div>
      </div>

      {/* Second row: Search & Detailed Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by assignment title, ID (WA-0001), or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Project Selector */}
        <select
          value={filters.projectId}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Developer Selector (only if scope is 'all') */}
        {scope === 'all' && (
          <select
            value={filters.assignedToId}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="all">All Developers</option>
            {members.map((m) => {
              const u = m.user;
              const devId = u?.id || (u as any)?._id || m.id;
              const name =
                `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
                (u as any)?.name ||
                u?.email ||
                'Developer';
              return (
                <option key={devId} value={devId}>
                  {name}
                </option>
              );
            })}
          </select>
        )}

        {/* Status Selector */}
        <select
          value={filters.status}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="In Progress">In Progress</option>
          <option value="Blocked">Blocked</option>
          <option value="Submitted">Submitted (Review)</option>
          <option value="Changes Requested">Changes Requested</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Priority Selector */}
        <select
          value={filters.priority}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="Urgent">Urgent 🔥</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Overdue Checkbox Pill */}
        <button
          onClick={() => setIsOverdueFilter(!filters.isOverdue)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
            filters.isOverdue
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 font-semibold'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${filters.isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
          <span>Overdue Only</span>
        </button>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
