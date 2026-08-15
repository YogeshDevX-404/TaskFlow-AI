import React, { useState } from 'react';
import {
  Users,
  AlertCircle,
  Flag,
  Archive,
  X,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useWorkAssignmentStore } from '../../../store/useWorkAssignmentStore';
import { useMemberStore } from '../../../store/useMemberStore';
import { useOrganizationStore } from '../../../store/useOrganizationStore';
import { AssignmentPriority, AssignmentStatus } from '../../../types/workAssignment';

export const BulkActionToolbar: React.FC = () => {
  const {
    selectedAssignmentIds,
    clearSelection,
    bulkReassign,
    bulkUpdatePriority,
    bulkUpdateStatus,
    bulkArchive,
    actionLoading,
  } = useWorkAssignmentStore();

  const { activeOrganization } = useOrganizationStore();
  const { members, fetchMembers } = useMemberStore();

  // Load members if needed
  React.useEffect(() => {
    if (activeOrganization?.id) {
      fetchMembers(activeOrganization.id);
    }
  }, [activeOrganization?.id, fetchMembers]);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  if (selectedAssignmentIds.length === 0) return null;

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeveloperId) return;
    const success = await bulkReassign(selectedDeveloperId, reassignReason);
    if (success) {
      setIsReassignModalOpen(false);
      setSelectedDeveloperId('');
      setReassignReason('');
    }
  };

  const handlePrioritySelect = async (priority: AssignmentPriority) => {
    setIsPriorityMenuOpen(false);
    await bulkUpdatePriority(priority);
  };

  const handleStatusSelect = async (status: AssignmentStatus) => {
    setIsStatusMenuOpen(false);
    await bulkUpdateStatus(status, 'Bulk status change by manager');
  };

  const handleArchiveConfirm = async () => {
    setIsArchiveConfirmOpen(false);
    await bulkArchive();
  };

  return (
    <>
      {/* Floating Bottom Toolbar */}
      <div
        id="bulk-action-toolbar"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {selectedAssignmentIds.length}
          </span>
          <span className="text-sm font-medium text-slate-200">Selected</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Reassign Button */}
          <button
            id="bulk-reassign-btn"
            onClick={() => setIsReassignModalOpen(true)}
            disabled={actionLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Reassign
          </button>

          {/* Change Priority Dropdown */}
          <div className="relative">
            <button
              id="bulk-priority-btn"
              onClick={() => {
                setIsPriorityMenuOpen(!isPriorityMenuOpen);
                setIsStatusMenuOpen(false);
              }}
              disabled={actionLoading}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              Priority
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPriorityMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                {(['Urgent', 'High', 'Medium', 'Low'] as AssignmentPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePrioritySelect(p)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p === 'Urgent'
                          ? 'bg-rose-500'
                          : p === 'High'
                          ? 'bg-amber-500'
                          : p === 'Medium'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change Status Dropdown */}
          <div className="relative">
            <button
              id="bulk-status-btn"
              onClick={() => {
                setIsStatusMenuOpen(!isStatusMenuOpen);
                setIsPriorityMenuOpen(false);
              }}
              disabled={actionLoading}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Status
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 max-h-56 overflow-y-auto">
                {(
                  [
                    'In Progress',
                    'Blocked',
                    'Submitted',
                    'Completed',
                    'Cancelled',
                    'Archived',
                  ] as AssignmentStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusSelect(s)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Archive Button */}
          <button
            id="bulk-archive-btn"
            onClick={() => setIsArchiveConfirmOpen(true)}
            disabled={actionLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg flex items-center gap-1.5 transition-colors border border-rose-900/50 disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5 text-rose-400" />
            Archive
          </button>
        </div>

        {/* Clear Selection Button */}
        <button
          id="bulk-clear-selection-btn"
          onClick={clearSelection}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Bulk Reassign ({selectedAssignmentIds.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign all selected tasks to a new developer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select New Developer
                </label>
                <select
                  value={selectedDeveloperId}
                  onChange={(e) => setSelectedDeveloperId(e.target.value)}
                  required
                  className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a team member...</option>
                  {members.map((m: any) => {
                    const user = m.user;
                    if (!user) return null;
                    const name =
                      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                      user.name ||
                      user.email;
                    return (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {name} ({m.role || 'Member'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reassignment Reason / Note
                </label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="Explain why these assignments are being transferred..."
                  rows={3}
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDeveloperId || actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-500/20"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {isArchiveConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Archive Assignments
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to archive {selectedAssignmentIds.length} assignments?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
              Archived assignments will be hidden from the active board but can still be found in
              reports and historical audit logs.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Archive Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
