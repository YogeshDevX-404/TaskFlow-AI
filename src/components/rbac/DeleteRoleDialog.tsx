import React, { useState } from 'react';
import { Role } from '../../types/rbac';
import { useRoleStore } from '../../store/useRoleStore';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export interface DeleteRoleDialogProps {
  isOpen: boolean;
  role: Role | null;
  onClose: () => void;
}

export const DeleteRoleDialog: React.FC<DeleteRoleDialogProps> = ({
  isOpen,
  role,
  onClose,
}) => {
  const { activeOrganization } = useOrganizationStore();
  const { deleteRole, isSubmitting, error, clearError } = useRoleStore();
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen || !role) return null;

  const handleDelete = async () => {
    if (!activeOrganization) return;
    try {
      clearError();
      setLocalError(null);
      await deleteRole(role.id, activeOrganization.id);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to delete role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
            Delete Custom Role
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Are you sure you want to permanently delete the custom role{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              "{role.name}"
            </strong>
            ? Members currently assigned to this role must be reassigned first.
          </p>
        </div>

        {(localError || error) && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
            {localError || error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
