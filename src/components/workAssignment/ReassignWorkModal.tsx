import React, { useState, useEffect } from 'react';
import { WorkAssignment, DeveloperWorkloadStats } from '../../types/workAssignment';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import { useMemberStore } from '../../store/useMemberStore';
import {
  X,
  UserCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ReassignModalProps {
  isOpen: boolean;
  assignment: WorkAssignment | null;
  onClose: () => void;
}

export const ReassignWorkModal: React.FC<ReassignModalProps> = ({
  isOpen,
  assignment,
  onClose,
}) => {
  const { members } = useMemberStore();
  const { reassign, fetchDeveloperWorkload, actionLoading, error } = useWorkAssignmentStore();

  const [newDeveloperId, setNewDeveloperId] = useState('');
  const [reason, setReason] = useState('');
  const [devWorkload, setDevWorkload] = useState<DeveloperWorkloadStats | null>(null);

  useEffect(() => {
    if (newDeveloperId) {
      fetchDeveloperWorkload(newDeveloperId).then((data) => {
        setDevWorkload(data);
      });
    } else {
      setDevWorkload(null);
    }
  }, [newDeveloperId, fetchDeveloperWorkload]);

  if (!isOpen || !assignment) return null;

  const currentDevId = (assignment.assignedTo?._id || assignment.assignedTo?.id)?.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeveloperId) return;

    const updated = await reassign(assignment.id, newDeveloperId, reason.trim() || undefined);
    if (updated) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Reassign Work Assignment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transfer {assignment.assignmentId} to another team member
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select New Developer <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newDeveloperId}
              onChange={(e) => setNewDeveloperId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="">Choose a developer...</option>
              {members
                .filter((m) => {
                  const devId = m.user?.id || (m.user as any)?._id || m.id;
                  return devId !== currentDevId;
                })
                .map((m) => {
                  const u = m.user;
                  const devId = u?.id || (u as any)?._id || m.id;
                  const name =
                    `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
                    (u as any)?.name ||
                    u?.email ||
                    'Developer';
                  return (
                    <option key={devId} value={devId}>
                      {name} ({m.role || 'Member'})
                    </option>
                  );
                })}
            </select>
          </div>

          {devWorkload && (
            <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Workload:</strong> {devWorkload.activeAssignmentsCount} active tasks (
                  {devWorkload.totalEstimatedHours}h estimated)
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Reassignment (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Load balancing, priority shift, domain expertise..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !newDeveloperId}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Reassigning...' : 'Confirm Reassign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
