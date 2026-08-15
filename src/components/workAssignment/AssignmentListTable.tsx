import React from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import {
  AssignmentStatusBadge,
  AssignmentPriorityBadge,
  AssignmentDueBadge,
} from './WorkAssignmentBadge';
import {
  FolderKanban,
  CheckSquare,
  GitPullRequest,
  Clock,
  MoreHorizontal,
  Eye,
  Play,
  Send,
  CheckCircle2,
  UserCheck,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import { useWorkAssignmentMonitoringStore } from '../../store/useWorkAssignmentMonitoringStore';

interface TableProps {
  assignments: WorkAssignment[];
  onSelectAssignment: (assignment: WorkAssignment) => void;
  onQuickAction: (action: string, assignment: WorkAssignment) => void;
}

export const AssignmentListTable: React.FC<TableProps> = ({
  assignments,
  onSelectAssignment,
  onQuickAction,
}) => {
  const { user } = useAuthStore();
  const currentUserId = (user?.id || (user as any)?._id)?.toString();

  const {
    selectedAssignmentIds,
    toggleSelectAssignment,
    selectAllAssignments,
    clearSelection,
  } = useWorkAssignmentStore();

  const {
    fetchDeveloperDrilldown,
    fetchProjectDrilldown,
  } = useWorkAssignmentMonitoringStore();

  if (assignments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No work assignments found matching your criteria.
        </p>
      </div>
    );
  }

  const allSelected =
    assignments.length > 0 &&
    assignments.every((a) => selectedAssignmentIds.includes(a.id || (a as any)._id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllAssignments(assignments.map((a) => a.id || (a as any)._id));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  title="Select all on this page"
                />
              </th>
              <th className="px-4 py-3.5">ID & Title</th>
              <th className="px-4 py-3.5">Project / Task</th>
              <th className="px-4 py-3.5">Assignee</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">QA Criteria</th>
              <th className="px-4 py-3.5">Due Date</th>
              <th className="px-4 py-3.5">Progress</th>
              <th className="px-4 py-3.5">Time Logged</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {assignments.map((a) => {
              const aId = a.id || (a as any)._id;
              const isSelected = selectedAssignmentIds.includes(aId);

              const assigneeName =
                a.assignedTo?.name ||
                `${a.assignedTo?.firstName || ''} ${a.assignedTo?.lastName || ''}`.trim() ||
                a.assignedTo?.email ||
                'Unassigned';

              const isAssignee =
                a.assignedTo?._id?.toString() === currentUserId ||
                a.assignedTo?.id?.toString() === currentUserId;
              const isAssigner =
                a.assignedBy?._id?.toString() === currentUserId ||
                a.assignedBy?.id?.toString() === currentUserId;

              const estHours =
                (a.estimatedHours || 0) +
                (a.estimatedMinutes ? a.estimatedMinutes / 60 : 0);
              const loggedHours = (a.totalLoggedSeconds || 0) / 3600;

              const criteriaCount = a.acceptanceCriteria?.length || 0;
              const completedCriteriaCount = (a.acceptanceCriteria || []).filter(
                (c) => c.status === 'Completed'
              ).length;
              const imagesCount = a.referenceImages?.length || 0;

              return (
                <tr
                  key={aId || a.assignmentId}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td
                    className="w-10 px-4 py-3.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectAssignment(aId);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectAssignment(aId)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* ID & Title */}
                  <td
                    className="px-4 py-3.5 max-w-[260px]"
                    onClick={() => onSelectAssignment(a)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/60 shrink-0">
                        {a.assignmentId}
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {a.title}
                        </span>
                        {imagesCount > 0 && (
                          <span
                            className="text-slate-400 dark:text-slate-500 shrink-0"
                            title={`${imagesCount} Reference mockups`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Project / Task / GitHub */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <div
                        onClick={(e) => {
                          if (a.project?._id || a.project?.id) {
                            e.stopPropagation();
                            fetchProjectDrilldown(
                              (a.project._id || a.project.id).toString()
                            );
                          }
                        }}
                        className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium hover:text-indigo-600 cursor-pointer"
                      >
                        <FolderKanban className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{a.project?.name || '—'}</span>
                      </div>
                      {a.task?.title && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <CheckSquare className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{a.task.title}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3.5">
                    <div
                      onClick={(e) => {
                        const devId = a.assignedTo?._id || a.assignedTo?.id;
                        if (devId) {
                          e.stopPropagation();
                          fetchDeveloperDrilldown(devId.toString());
                        }
                      }}
                      className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
                    >
                      {a.assignedTo?.avatar ? (
                        <img
                          src={a.assignedTo.avatar}
                          alt={assigneeName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                          {assigneeName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[110px]">
                        {assigneeName}
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td
                    className="px-4 py-3.5"
                    onClick={() => onSelectAssignment(a)}
                  >
                    <AssignmentPriorityBadge priority={a.priority} size="sm" />
                  </td>

                  {/* Status */}
                  <td
                    className="px-4 py-3.5"
                    onClick={() => onSelectAssignment(a)}
                  >
                    <AssignmentStatusBadge status={a.status} size="sm" />
                  </td>

                  {/* QA Criteria */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap"
                    onClick={() => onSelectAssignment(a)}
                  >
                    {criteriaCount > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          completedCriteriaCount === criteriaCount
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>
                          {completedCriteriaCount}/{criteriaCount}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Due Date & Overdue */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap"
                    onClick={() => onSelectAssignment(a)}
                  >
                    <AssignmentDueBadge
                      isOverdue={a.isOverdue}
                      isDueSoon={a.isDueSoon}
                      dueDate={a.dueDate}
                    />
                  </td>

                  {/* Progress */}
                  <td
                    className="px-4 py-3.5 w-32"
                    onClick={() => onSelectAssignment(a)}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        <span>{a.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${a.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Time Logged */}
                  <td
                    className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400"
                    onClick={() => onSelectAssignment(a)}
                  >
                    {loggedHours > 0 ? (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {loggedHours.toFixed(1)}h
                      </span>
                    ) : (
                      '—'
                    )}
                    {estHours > 0 && (
                      <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                        {' '}
                        / {estHours.toFixed(1)}h
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAssignment(a);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

