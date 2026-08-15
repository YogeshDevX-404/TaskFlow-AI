import React, { useState } from 'react';
import { Project } from '../../types/project';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  project,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen || !project) return null;

  const isConfirmed =
    confirmInput.trim().toUpperCase() === project.projectKey.toUpperCase() ||
    confirmInput.trim().toLowerCase() === project.name.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    await onConfirm(project.id);
    setConfirmInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
          <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Project</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Irreversible Action</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Are you sure you want to delete <strong className="text-slate-900 dark:text-white font-mono">{project.projectKey} - {project.name}</strong>? All associated settings, references, and task views will be permanently removed.
        </p>

        <div className="mb-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Type <span className="font-mono font-bold text-red-600 dark:text-red-400">{project.projectKey}</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={project.projectKey}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 font-mono text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Deleting...' : 'Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
