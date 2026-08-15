import React, { useMemo } from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import { useMemberStore } from '../../store/useMemberStore';
import { AssignmentStatusBadge } from './WorkAssignmentBadge';
import {
  User,
  AlertTriangle,
  Clock,
  Briefcase,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface MatrixProps {
  assignments: WorkAssignment[];
  onSelectAssignment: (assignment: WorkAssignment) => void;
  onAssignToDeveloper: (developerId: string) => void;
}

export const DeveloperWorkloadMatrix: React.FC<MatrixProps> = ({
  assignments,
  onSelectAssignment,
  onAssignToDeveloper,
}) => {
  const { members } = useMemberStore();

  // Aggregate stats per developer
  const developerData = useMemo(() => {
    return members.map((m) => {
      const u = m.user;
      const devId = u?.id || (u as any)?._id || m.id;
      const devName =
        `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
        (u as any)?.name ||
        u?.email ||
        'Developer';
      const devAvatar = (u as any)?.avatar || (u as any)?.avatarUrl;
      const devRole = m.role || 'Developer';

      const devAssignments = assignments.filter((a) => {
        const assignedId = (a.assignedTo?._id || a.assignedTo?.id)?.toString();
        return assignedId === devId;
      });

      const activeAssignments = devAssignments.filter((a) =>
        ['Assigned', 'Acknowledged', 'In Progress', 'Blocked', 'Changes Requested'].includes(
          a.status
        )
      );

      const overdueCount = activeAssignments.filter((a) => a.isOverdue).length;

      const totalEstHours = activeAssignments.reduce(
        (sum, a) => sum + (a.estimatedHours || 0) + (a.estimatedMinutes ? a.estimatedMinutes / 60 : 0),
        0
      );

      const totalLoggedHours = devAssignments.reduce(
        (sum, a) => sum + ((a.totalLoggedSeconds || 0) / 3600),
        0
      );

      let loadStatus: 'optimal' | 'busy' | 'overloaded' = 'optimal';
      if (activeAssignments.length > 5 || totalEstHours > 40) {
        loadStatus = 'overloaded';
      } else if (activeAssignments.length >= 3 || totalEstHours >= 25) {
        loadStatus = 'busy';
      }

      return {
        devId,
        devName,
        devAvatar,
        devRole,
        activeAssignments,
        overdueCount,
        totalEstHours,
        totalLoggedHours,
        loadStatus,
      };
    });
  }, [members, assignments]);

  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Developer Capacity & Workload Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time task distribution and prevent developer burnout before assigning new work.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Optimal (&lt;3 active)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Busy (3–5 active)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Overloaded (&gt;5 active)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {developerData.map((dev) => (
          <div
            key={dev.devId}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4"
          >
            {/* Developer Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {dev.devAvatar ? (
                  <img
                    src={dev.devAvatar}
                    alt={dev.devName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                    {dev.devName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {dev.devName}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium block capitalize truncate">
                    {dev.devRole}
                  </span>
                </div>
              </div>

              {/* Workload Status Pill */}
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border whitespace-nowrap ${
                  dev.loadStatus === 'overloaded'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                    : dev.loadStatus === 'busy'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {dev.loadStatus === 'overloaded'
                  ? 'Overloaded 🔥'
                  : dev.loadStatus === 'busy'
                  ? 'Busy'
                  : 'Available'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Active</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {dev.activeAssignments.length}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Est. Hours</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {dev.totalEstHours.toFixed(1)}h
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Overdue</span>
                <span
                  className={`font-bold ${
                    dev.overdueCount > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {dev.overdueCount}
                </span>
              </div>
            </div>

            {/* Active Assignments Mini List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Current Assignments ({dev.activeAssignments.length})
              </span>
              {dev.activeAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No active tasks assigned.</p>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {dev.activeAssignments.map((a) => (
                    <div
                      key={a.id || a.assignmentId}
                      onClick={() => onSelectAssignment(a)}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {a.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {a.assignmentId}
                        </span>
                      </div>
                      <AssignmentStatusBadge status={a.status} size="sm" showIcon={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Assign Button */}
            <button
              onClick={() => onAssignToDeveloper(dev.devId)}
              className="w-full py-1.5 border border-dashed border-indigo-300 dark:border-indigo-700/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Work to {dev.devName.split(' ')[0]}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
