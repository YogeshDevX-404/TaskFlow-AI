import React, { useState } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  RotateCcw,
  LayoutGrid,
  Rows,
  Layers,
  User,
  AlertCircle,
  Calendar,
  X,
  Settings,
} from 'lucide-react';
import { useBoardStore } from '../../../store/useBoardStore';
import { BoardFilterOptions } from '../../../types/board';

interface BoardToolbarProps {
  availableMembers?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
  onOpenCreateColumn: () => void;
  onOpenSettings: () => void;
}

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  availableMembers = [],
  onOpenCreateColumn,
  onOpenSettings,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const {
    searchQuery,
    filters,
    settings,
    setSearchQuery,
    setFilters,
    resetFilters,
    updateSettings,
  } = useBoardStore();

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filters.assigneeId !== 'all' ||
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.type !== 'all' ||
    filters.dueDate !== 'all';

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 px-4 py-2.5 space-y-2.5">
      {/* Primary Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Filter Trigger */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, description..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Group By, Card Size, Settings & Create Column */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Group By selector */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Group By:</span>
            <select
              value={settings.groupBy || 'status'}
              onChange={(e) => updateSettings({ groupBy: e.target.value as any })}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="status">Status (Columns)</option>
              <option value="assignee">Assignee</option>
              <option value="priority">Priority</option>
              <option value="labels">Labels</option>
              <option value="project">Project</option>
            </select>
          </div>

          {/* Card Size selector */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => updateSettings({ cardSize: 'compact' })}
              className={`p-1 rounded text-xs transition cursor-pointer ${
                settings.cardSize === 'compact'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              title="Compact Cards"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ cardSize: 'default' })}
              className={`p-1 rounded text-xs transition cursor-pointer ${
                settings.cardSize === 'default'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              title="Default Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ cardSize: 'expanded' })}
              className={`p-1 rounded text-xs transition cursor-pointer ${
                settings.cardSize === 'expanded'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              title="Expanded Cards"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Board Settings Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Board Display Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Add Column Button */}
          <button
            type="button"
            onClick={onOpenCreateColumn}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Column</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters Drawer */}
      {showFilters && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Assignee Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Assignee
            </label>
            <select
              value={filters.assigneeId || 'all'}
              onChange={(e) => setFilters({ assigneeId: e.target.value })}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={filters.priority || 'all'}
              onChange={(e) => setFilters({ priority: e.target.value as any })}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Type
            </label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => setFilters({ type: e.target.value as any })}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
              <option value="Feature">Feature</option>
              <option value="Improvement">Improvement</option>
              <option value="Research">Research</option>
              <option value="Spike">Spike</option>
            </select>
          </div>

          {/* Due Date Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Due Date
            </label>
            <select
              value={filters.dueDate || 'all'}
              onChange={(e) => setFilters({ dueDate: e.target.value as any })}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">Any Due Date</option>
              <option value="overdue">Overdue Tasks</option>
              <option value="today">Due Today</option>
              <option value="this_week">Due This Week</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Status Filter
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ status: e.target.value as any })}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Testing">Testing</option>
              <option value="Done">Done</option>
              <option value="Blocked">Blocked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
