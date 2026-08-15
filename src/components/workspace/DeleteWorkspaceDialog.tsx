import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { Workspace } from '../../types/workspace';

interface DeleteWorkspaceDialogProps {
  isOpen: boolean;
  workspace: Workspace | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteWorkspaceDialog: React.FC<DeleteWorkspaceDialogProps> = ({
  isOpen,
  workspace,
  onClose,
  onDeleted,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const { deleteWorkspace, isActionLoading, error, clearError } = useWorkspaces();

  if (!isOpen || !workspace) return null;

  const isConfirmed = confirmName.trim().toLowerCase() === workspace.name.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    clearError();
    const success = await deleteWorkspace(workspace.id);
    if (success) {
      setConfirmName('');
      onClose();
      if (onDeleted) onDeleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Workspace
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Deleting <span className="font-bold text-slate-900 dark:text-slate-100">"{workspace.name}"</span> will remove all associated settings, permissions, and configurations.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Please type <span className="font-bold text-rose-600 dark:text-rose-400">{workspace.name}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={workspace.name}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isActionLoading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isActionLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 rounded-xl shadow-sm transition-all"
            >
              {isActionLoading && <Loader2 size={14} className="animate-spin" />}
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
