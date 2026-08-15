import React, { useState } from 'react';
import { MemberWorkload, WorkloadStatus } from '../../types/workload';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Settings2,
  CheckSquare,
  AlertCircle,
  Clock,
  User,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface MemberWorkloadTableProps {
  members: MemberWorkload[];
  isLoading: boolean;
  onOpenCapacityModal: (member: MemberWorkload) => void;
  onOpenMemberDetail?: (userId: string) => void;
  selectedTaskIdsForReassign?: string[];
  onOpenBulkReassignModal?: () => void;
}

export const MemberWorkloadTable: React.FC<MemberWorkloadTableProps> = ({
  members,
  isLoading,
  onOpenCapacityModal,
  onOpenMemberDetail,
  onOpenBulkReassignModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'assignedTasksCount' | 'estimatedHours' | 'utilizationPercentage'>('utilizationPercentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredMembers = members
    .filter((m) => {
      const q = searchTerm.toLowerCase();
      const nameMatch = m.user.name.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q);
      const roleMatch = selectedRole === 'all' || m.user.role === selectedRole;
      const statusMatch = selectedStatus === 'all' || m.workloadStatus === selectedStatus;
      return nameMatch && roleMatch && statusMatch;
    })
    .sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (sortBy === 'name') {
        valA = a.user.name.toLowerCase();
        valB = b.user.name.toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusBadge = (status: WorkloadStatus) => {
    switch (status) {
      case 'Overloaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-3.5 h-3.5" />
            Overloaded
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <Clock className="w-3.5 h-3.5" />
            High
          </span>
        );
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Normal
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Available
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            No Capacity Data
          </span>
        );
    }
  };

  const toggleSort = (field: 'name' | 'assignedTasksCount' | 'estimatedHours' | 'utilizationPercentage') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Team Member Workload
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Capacity, task allocations, and utilization metrics across team members
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBulkReassignModal && (
              <button
                onClick={onOpenBulkReassignModal}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Bulk Reassign Tasks
              </button>
            )}

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Card View
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Workload Statuses</option>
              <option value="Available">Available (&lt;60%)</option>
              <option value="Normal">Normal (60-85%)</option>
              <option value="High">High (85-100%)</option>
              <option value="Overloaded">Overloaded (&gt;100%)</option>
            </select>
          </div>

          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f as any);
                setSortOrder(o as any);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="utilizationPercentage-desc">Highest Utilization</option>
              <option value="utilizationPercentage-asc">Lowest Utilization</option>
              <option value="assignedTasksCount-desc">Most Assigned Tasks</option>
              <option value="estimatedHours-desc">Most Estimated Hours</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center">
          <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No members found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('assignedTasksCount')}>
                  <div className="flex items-center gap-1">
                    Tasks
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status Breakdown</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('estimatedHours')}>
                  <div className="flex items-center gap-1">
                    Est / Logged
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('utilizationPercentage')}>
                  <div className="flex items-center gap-1">
                    Capacity & Utilization
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredMembers.map((m) => (
                <tr key={m.userId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Member info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {m.user.avatar ? (
                          <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                        ) : (
                          m.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenMemberDetail?.(m.userId)}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left cursor-pointer"
                        >
                          {m.user.name}
                        </button>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{m.user.email}</span>
                          <span className="capitalize text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {m.user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tasks count & Overdue warning */}
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    <div className="space-y-0.5">
                      <div>
                        <strong>{m.assignedTasksCount}</strong> tasks
                      </div>
                      {m.overdueTasksCount > 0 && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {m.overdueTasksCount} overdue
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status distribution pills */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Todo">
                        Todo: {m.taskDistribution.todo}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" title="In Progress">
                        Prog: {m.taskDistribution.inProgress}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" title="Done">
                        Done: {m.taskDistribution.done}
                      </span>
                      {m.taskDistribution.blocked > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" title="Blocked">
                          Blk: {m.taskDistribution.blocked}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estimated / Logged */}
                  <td className="py-3.5 px-4 font-medium">
                    <div className="text-slate-900 dark:text-white">
                      <strong>{m.estimatedHours}h</strong> est
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.loggedHours}h logged
                    </div>
                  </td>

                  {/* Capacity & Progress Bar */}
                  <td className="py-3.5 px-4 min-w-[180px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {m.utilizationPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {m.estimatedHours}h / {m.capacity.weeklyCapacityHours}h
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            m.utilizationPercentage > 100
                              ? 'bg-rose-500'
                              : m.utilizationPercentage >= 85
                              ? 'bg-amber-500'
                              : m.utilizationPercentage >= 60
                              ? 'bg-indigo-600'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, m.utilizationPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(m.workloadStatus)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenCapacityModal(m)}
                      title="Configure Member Capacity"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.userId}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {m.user.avatar ? (
                        <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                      ) : (
                        m.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {m.user.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCapacityModal(m)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(m.workloadStatus)}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {m.assignedTasksCount} assigned tasks
                  </span>
                </div>

                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Utilization</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.utilizationPercentage}% ({m.estimatedHours}h / {m.capacity.weeklyCapacityHours}h)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.utilizationPercentage > 100
                          ? 'bg-rose-500'
                          : m.utilizationPercentage >= 85
                          ? 'bg-amber-500'
                          : m.utilizationPercentage >= 60
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, m.utilizationPercentage)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div>
                    Estimated: <strong className="text-slate-900 dark:text-white">{m.estimatedHours}h</strong>
                  </div>
                  <div>
                    Logged: <strong className="text-slate-900 dark:text-white">{m.loggedHours}h</strong>
                  </div>
                  <div>
                    Overdue: <strong className="text-rose-600 dark:text-rose-400">{m.overdueTasksCount}</strong>
                  </div>
                  <div>
                    Story Points: <strong className="text-slate-900 dark:text-white">{m.storyPoints}</strong>
                  </div>
                </div>
              </div>

              {onOpenMemberDetail && (
                <button
                  onClick={() => onOpenMemberDetail(m.userId)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  View Tasks & Workload
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
