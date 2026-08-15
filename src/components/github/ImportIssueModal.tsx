import React, { useState } from 'react';
import { IGitHubIssue } from '../../services/api/githubIntegrationService';
import { useImportGitHubIssue } from '../../hooks/useGitHubIssues';
import { X, GitPullRequest, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface ImportIssueModalProps {
  issue: IGitHubIssue | null;
  connectionId: string;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (taskId: string, taskKey: string) => void;
}

export const ImportIssueModal: React.FC<ImportIssueModalProps> = ({
  issue,
  connectionId,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const importMutation = useImportGitHubIssue();

  const [customTitle, setCustomTitle] = useState('');
  const [openStatusMapping, setOpenStatusMapping] = useState<'Todo' | 'In Progress' | 'Backlog'>('Todo');
  const [closedStatusMapping, setClosedStatusMapping] = useState<'Done' | 'Cancelled'>('Done');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const res = await importMutation.mutateAsync({
        connectionId,
        issueNumber: issue.number,
        projectId,
        statusMapping: {
          open: openStatusMapping as any,
          closed: closedStatusMapping as any,
        },
        customTitle: customTitle.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess(res.task.id, res.task.taskKey);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to import issue');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Import Issue #{issue.number}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a TaskFlow Task mapped to this GitHub Issue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Issue Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                issue.state === 'open'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
              }`}>
                {issue.state.toUpperCase()}
              </span>
              <span>Issue #{issue.number}</span>
            </div>
            <p className="text-xs font-medium text-slate-900 dark:text-white line-clamp-2">
              {issue.title}
            </p>
          </div>

          {/* Title Override Option */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Title Override (Optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={issue.title}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Mapping Configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Status Mapping
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>GitHub Open</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
                <select
                  value={openStatusMapping}
                  onChange={(e) => setOpenStatusMapping(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  <span>GitHub Closed</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
                <select
                  value={closedStatusMapping}
                  onChange={(e) => setClosedStatusMapping(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Done">Done</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={importMutation.isPending}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import as Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
