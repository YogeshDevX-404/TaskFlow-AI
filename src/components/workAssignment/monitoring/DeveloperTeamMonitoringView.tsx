import React, { useState } from 'react';
import { IDeveloperMonitoringStats, WorkAssignment } from '../../../types/workAssignment';
import {
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Flame,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Send,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

interface DeveloperTeamMonitoringViewProps {
  developerStats: IDeveloperMonitoringStats[];
  onSelectAssignment?: (assignmentId: string) => void;
  onReassign?: (assignmentId: string) => void;
}

export const DeveloperTeamMonitoringView: React.FC<DeveloperTeamMonitoringViewProps> = ({
  developerStats,
  onSelectAssignment,
  onReassign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Optimal' | 'Busy' | 'Overloaded'>('all');
  const [selectedDev, setSelectedDev] = useState<IDeveloperMonitoringStats | null>(null);

  const filteredDevelopers = developerStats.filter((dev) => {
    const matchesSearch =
      dev.developer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.developer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dev.workloadStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getWorkloadBadge = (status: 'Optimal' | 'Busy' | 'Overloaded') => {
    switch (status) {
      case 'Optimal':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Optimal Capacity
          </span>
        );
      case 'Busy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Near Capacity
          </span>
        );
      case 'Overloaded':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Overloaded / At Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Workload Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search developer by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'Optimal', 'Busy', 'Overloaded'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'all' ? 'All Team Members' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Developer Grid */}
      {filteredDevelopers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No developers found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or team filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevelopers.map((dev) => (
            <div
              key={dev.developer.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Header: User Info & Workload Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {dev.developer.avatar ? (
                      <img
                        src={dev.developer.avatar}
                        alt={dev.developer.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                        {dev.developer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {dev.developer.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {dev.developer.email}
                      </p>
                    </div>
                  </div>

                  {getWorkloadBadge(dev.workloadStatus)}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Average Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{dev.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dev.avgProgress >= 80
                          ? 'bg-emerald-500'
                          : dev.avgProgress >= 40
                          ? 'bg-sky-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${dev.avgProgress}%` }}
                    />
                  </div>
                </div>

                {/* Metric Badges Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-medium block">Active</span>
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{dev.activeAssignments}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-medium block">Done</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {dev.completedAssignments}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-medium block">Overdue</span>
                    <span className={`text-sm font-bold ${dev.overdueAssignments > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {dev.overdueAssignments}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 font-medium block">Blocked</span>
                    <span className={`text-sm font-bold ${dev.blockedAssignments > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {dev.blockedAssignments}
                    </span>
                  </div>
                </div>

                {/* Logged Hours vs Estimated */}
                <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-4 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time Logged:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{dev.totalLoggedHours}h</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Est: <span className="font-semibold text-slate-700 dark:text-slate-200">{dev.totalEstimatedHours}h</span>
                  </div>
                </div>

                {/* Recent Assigned Tasks Chips */}
                {dev.recentAssignments && dev.recentAssignments.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Active Assignments
                    </span>
                    {dev.recentAssignments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => onSelectAssignment?.(a.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">{a.assignmentId}</span>
                          <span className="text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {a.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                          {a.progress}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Developer Detail Button */}
              <button
                onClick={() => setSelectedDev(dev)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
              >
                <span>Drilldown Developer Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Developer Detail Drilldown Modal */}
      {selectedDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selectedDev.developer.avatar ? (
                  <img
                    src={selectedDev.developer.avatar}
                    alt={selectedDev.developer.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-base">
                    {selectedDev.developer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedDev.developer.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedDev.developer.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDev(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{selectedDev.totalAssignments}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800">
                <span className="text-[10px] text-sky-600 block">Active</span>
                <span className="text-base font-bold text-sky-700 dark:text-sky-300">{selectedDev.activeAssignments}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 block">Completed</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">{selectedDev.completedAssignments}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800">
                <span className="text-[10px] text-amber-600 block">Blocked</span>
                <span className="text-base font-bold text-amber-700 dark:text-amber-300">{selectedDev.blockedAssignments}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800">
                <span className="text-[10px] text-rose-600 block">Overdue</span>
                <span className="text-base font-bold text-rose-700 dark:text-rose-300">{selectedDev.overdueAssignments}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800">
                <span className="text-[10px] text-purple-600 block">Review</span>
                <span className="text-base font-bold text-purple-700 dark:text-purple-300">{selectedDev.submittedAssignments}</span>
              </div>
            </div>

            {/* Assignments List */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Assignments on Developer's Board
              </h4>
              <div className="space-y-2">
                {selectedDev.recentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-500">{a.assignmentId}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{a.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>Status: <strong className="text-slate-700 dark:text-slate-300">{a.status}</strong></span>
                        <span>Priority: <strong className="text-slate-700 dark:text-slate-300">{a.priority}</strong></span>
                        <span>Progress: <strong className="text-indigo-600 dark:text-indigo-400">{a.progress}%</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDev(null);
                        onSelectAssignment?.(a.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs cursor-pointer shrink-0"
                    >
                      Open Detail
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDev(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
