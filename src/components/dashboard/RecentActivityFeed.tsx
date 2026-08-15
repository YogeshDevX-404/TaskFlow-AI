import React from 'react';
import { ProjectActivityItem } from '../../types/dashboard';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  PlusCircle,
  UserCheck,
  UserMinus,
  Shield,
  Edit3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ProjectActivityItem[];
  searchQuery: string;
  typeFilter: string;
  memberFilter: string;
  dateFilter: string;
  onSearchChange: (q: string) => void;
  onTypeFilterChange: (type: string) => void;
  onMemberFilterChange: (member: string) => void;
  onDateFilterChange: (date: string) => void;
  onResetFilters: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  searchQuery,
  typeFilter,
  memberFilter,
  dateFilter,
  onSearchChange,
  onTypeFilterChange,
  onMemberFilterChange,
  onDateFilterChange,
  onResetFilters,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'project_updated':
        return <Edit3 className="w-4 h-4 text-indigo-500" />;
      case 'member_added':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'member_removed':
        return <UserMinus className="w-4 h-4 text-rose-500" />;
      case 'role_changed':
        return <Shield className="w-4 h-4 text-amber-500" />;
      case 'milestone_reached':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Project Activity Stream
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of changes, member assignments, and milestone updates
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
          {activities.length} activity items
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search activity */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search activity..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Activity Type Filter */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Activity Types</option>
            <option value="project_created">Project Created</option>
            <option value="project_updated">Project Updated</option>
            <option value="member_added">Member Added</option>
            <option value="member_removed">Member Removed</option>
            <option value="role_changed">Role Changed</option>
            <option value="milestone_reached">Milestone Reached</option>
          </select>
        </div>

        {/* Member Filter */}
        <div className="relative">
          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={memberFilter}
            onChange={(e) => onMemberFilterChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Contributors</option>
            <option value="Alex Rivera">Alex Rivera</option>
            <option value="Sarah Chen">Sarah Chen</option>
            <option value="Marcus Vance">Marcus Vance</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {/* Activity List Timeline */}
      <div className="space-y-3 pt-2">
        {activities.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <XCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No activity logs match your search or filters.
            </p>
            <button
              onClick={onResetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
                {getActivityIcon(act.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {act.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {act.actor.avatar ? (
                    <img
                      src={act.actor.avatar}
                      alt={act.actor.name}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {act.actor.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {act.actor.name}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
