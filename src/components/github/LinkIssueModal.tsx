import React, { useState } from 'react';
import { IGitHubIssue } from '../../services/api/githubIntegrationService';
import { useLinkGitHubIssue } from '../../hooks/useGitHubIssues';
import { useQuery } from '@tanstack/react-query';
import { TaskService } from '../../services/api/taskService';
import { X, Link as LinkIcon, Search, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export interface LinkIssueModalProps {
  issue: IGitHubIssue | null;
  connectionId: string;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LinkIssueModal: React.FC<LinkIssueModalProps> = ({
  issue,
  connectionId,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const linkMutation = useLinkGitHubIssue();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch project tasks for selector
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['project-tasks', projectId, searchTerm],
    queryFn: () =>
      TaskService.getTasks({
        projectId,
        search: searchTerm.trim() || undefined,
        limit: 15,
      }),
    enabled: isOpen && !!projectId,
  });

  if (!isOpen || !issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setErrorMessage('Please select a task to link with this GitHub Issue');
      return;
    }

    setErrorMessage(null);
    try {
      await linkMutation.mutateAsync({
        taskId: selectedTaskId,
        connectionId,
        issueNumber: issue.number,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to link task to issue');
    }
  };

  const tasksList = Array.isArray(tasksData?.data)
    ? tasksData.data
    : (tasksData as any)?.data?.tasks || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Link Issue #{issue.number}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link an existing TaskFlow task to GitHub Issue #{issue.number}
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

        {/* Search Input */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title or key..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Task Selection List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoadingTasks ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading project tasks...</span>
              </div>
            ) : tasksList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching tasks found in this project.
              </div>
            ) : (
              tasksList.map((t: any) => {
                const isSelected = selectedTaskId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTaskId(t.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {t.taskKey}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold line-clamp-1">{t.title}</p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedTaskId || linkMutation.isPending}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
          >
            {linkMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Linking...</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                <span>Link Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
