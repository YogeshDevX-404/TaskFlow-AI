import React from 'react';
import {
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskFilters,
  TaskSortOption,
} from '../../types/task';
import {
  Filter,
  RotateCcw,
  Archive,
  ArrowUpDown,
  Tag,
  UserCheck,
  Briefcase,
} from 'lucide-react';

export interface TaskFiltersBarProps {
  filters: TaskFilters;
  sort: TaskSortOption;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  onSortChange: (sort: TaskSortOption) => void;
  onReset: () => void;
  availableProjects?: { id: string; name: string; projectKey?: string }[];
  availableMembers?: { id: string; name: string; email?: string }[];
  availableLabels?: string[];
}

const ALL_STATUSES: TaskStatus[] = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'Testing',
  'Done',
  'Blocked',
  'Cancelled',
];

const ALL_PRIORITIES: TaskPriority[] = [
  'Lowest',
  'Low',
  'Medium',
  'High',
  'Highest',
  'Urgent',
];

const ALL_TYPES: TaskType[] = [
  'Task',
  'Bug',
  'Story',
  'Epic',
  'Feature',
  'Improvement',
  'Research',
  'Spike',
];

export const TaskFiltersBar: React.FC<TaskFiltersBarProps> = ({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  onReset,
  availableProjects = [],
  availableMembers = [],
  availableLabels = ['backend', 'frontend', 'security', 'api', 'ui-ux', 'devops', 'bugfix', 'a11y'],
}) => {
  const activeFiltersCount =
    (filters.status && filters.status !== 'all' ? 1 : 0) +
    (filters.priority && filters.priority !== 'all' ? 1 : 0) +
    (filters.type && filters.type !== 'all' ? 1 : 0) +
    (filters.projectId ? 1 : 0) +
    (filters.assigneeId ? 1 : 0) +
    (filters.isArchived ? 1 : 0) +
    (filters.labels && filters.labels.length > 0 ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500 font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={filters.status || 'all'}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as TaskStatus | 'all' })
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Priority Filter Dropdown */}
          <select
            value={filters.priority || 'all'}
            onChange={(e) =>
              onFilterChange({ priority: e.target.value as TaskPriority | 'all' })
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            {ALL_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Type Filter Dropdown */}
          <select
            value={filters.type || 'all'}
            onChange={(e) =>
              onFilterChange({ type: e.target.value as TaskType | 'all' })
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Project Filter if available */}
          {availableProjects.length > 0 && (
            <select
              value={filters.projectId || ''}
              onChange={(e) => onFilterChange({ projectId: e.target.value || undefined })}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="">All Projects</option>
              {availableProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.projectKey ? `[${proj.projectKey}] ` : ''}
                  {proj.name}
                </option>
              ))}
            </select>
          )}

          {/* Assignee Filter if available */}
          {availableMembers.length > 0 && (
            <select
              value={filters.assigneeId || ''}
              onChange={(e) => onFilterChange({ assigneeId: e.target.value || undefined })}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="">All Assignees</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          {/* Archived Toggle Button */}
          <button
            type="button"
            onClick={() => onFilterChange({ isArchived: !filters.isArchived })}
            className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
              filters.isArchived
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{filters.isArchived ? 'Archived Only' : 'Active Tasks'}</span>
          </button>
        </div>

        {/* Right Sorting & Reset Group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as TaskSortOption)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="updated">Recently Updated</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer font-medium"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
