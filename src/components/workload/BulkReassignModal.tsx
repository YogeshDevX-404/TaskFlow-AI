import React, { useState } from 'react';
import { useBulkReassignTasks, useTeamWorkload } from '../../hooks/useWorkload';
import { useTasks } from '../../hooks/useTasks';
import { X, SlidersHorizontal, User, Check, AlertCircle } from 'lucide-react';

interface BulkReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
  workspaceId?: string;
}

export const BulkReassignModal: React.FC<BulkReassignModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  workspaceId,
}) => {
  const { data: teamData } = useTeamWorkload({ organizationId, workspaceId });
  const { tasks: tasksData } = useTasks({ organizationId, workspaceId });

  const members = teamData?.members || [];
  const tasksList = tasksData || [];

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [targetAssigneeId, setTargetAssigneeId] = useState<string>('unassigned');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const bulkReassignMutation = useBulkReassignTasks();

  if (!isOpen) return null;

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const selectAllTasks = () => {
    if (selectedTaskIds.length === tasksList.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasksList.map((t: any) => t.id || t._id));
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedTaskIds.length === 0) {
      setErrorMsg('Please select at least one task to reassign');
      return;
    }

    try {
      await bulkReassignMutation.mutateAsync({
        taskIds: selectedTaskIds,
        targetAssigneeId: targetAssigneeId === 'unassigned' ? null : targetAssigneeId,
        organizationId,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to reassign tasks');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Bulk Task Reassignment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Move work between team members to optimize capacity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleReassign} className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Member Selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Assignee
            </label>
            <select
              value={targetAssigneeId}
              onChange={(e) => setTargetAssigneeId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="unassigned">-- Leave Unassigned --</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} ({m.workloadStatus} - {m.utilizationPercentage}% capacity)
                </option>
              ))}
            </select>
          </div>

          {/* Tasks Selection List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Select Tasks ({selectedTaskIds.length} of {tasksList.length} selected)
              </label>
              <button
                type="button"
                onClick={selectAllTasks}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                {selectedTaskIds.length === tasksList.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
              {tasksList.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No tasks found</div>
              ) : (
                tasksList.map((t: any) => {
                  const taskId = t.id || t._id;
                  const isChecked = selectedTaskIds.includes(taskId);
                  const assigneeName =
                    t.assignee?.name ||
                    `${t.assignee?.firstName || ''} ${t.assignee?.lastName || ''}`.trim() ||
                    'Unassigned';

                  return (
                    <label
                      key={taskId}
                      className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTaskSelection(taskId)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="truncate">
                          <span className="font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400 mr-2">
                            {t.taskKey}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {t.title}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 shrink-0 ml-2">
                        Assigned: {assigneeName}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkReassignMutation.isPending || selectedTaskIds.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {bulkReassignMutation.isPending ? 'Reassigning...' : 'Reassign Selected Tasks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
