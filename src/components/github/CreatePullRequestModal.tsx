import React, { useState, useEffect } from 'react';
import {
  IGitHubRepoConnection,
  GitHubIntegrationApiService,
  IGitHubBranchData,
} from '../../services/api/githubIntegrationService';
import { useCreateTaskPullRequest } from '../../hooks/useGitHubPullRequests';
import { GitPullRequest, GitBranch, AlertCircle, Loader2, X } from 'lucide-react';

interface CreatePullRequestModalProps {
  taskId: string;
  taskTitle?: string;
  taskKey?: string;
  connections: IGitHubRepoConnection[];
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreatePullRequestModal: React.FC<CreatePullRequestModalProps> = ({
  taskId,
  taskTitle = '',
  taskKey = '',
  connections,
  isOpen,
  onClose,
  onCreated,
}) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [branches, setBranches] = useState<IGitHubBranchData[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const [sourceBranch, setSourceBranch] = useState<string>('');
  const [targetBranch, setTargetBranch] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const createPRMutation = useCreateTaskPullRequest();

  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  useEffect(() => {
    if (isOpen) {
      const defaultTitle = taskTitle
        ? taskKey
          ? `feat(${taskKey.toLowerCase()}): ${taskTitle}`
          : taskTitle
        : '';
      setTitle(defaultTitle);
      setBody(
        taskTitle
          ? `Connected to TaskFlow Task **${taskKey || 'Task'}**: ${taskTitle}\n\nAutomated pull request creation from TaskFlow AI.`
          : ''
      );
      setFormError('');
    }
  }, [isOpen, taskTitle, taskKey]);

  // Fetch branches when selected connection changes
  useEffect(() => {
    if (isOpen && selectedConnectionId) {
      setIsLoadingBranches(true);
      GitHubIntegrationApiService.getBranches(selectedConnectionId, { limit: 100 })
        .then((res) => {
          setBranches(res.branches);
          if (res.branches.length > 0) {
            const defaultBr = res.branches.find((b) => b.isDefault)?.name || res.branches[0].name;
            setTargetBranch(defaultBr);
            const devBr =
              res.branches.find((b) => b.name !== defaultBr && !b.isDefault)?.name || defaultBr;
            setSourceBranch(devBr);
          }
        })
        .catch(() => {
          setFormError('Failed to fetch repository branches.');
        })
        .finally(() => {
          setIsLoadingBranches(false);
        });
    }
  }, [isOpen, selectedConnectionId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedConnectionId) {
      setFormError('Please select a repository connection.');
      return;
    }
    if (!sourceBranch) {
      setFormError('Please select a source head branch.');
      return;
    }
    if (!targetBranch) {
      setFormError('Please select a target base branch.');
      return;
    }
    if (sourceBranch === targetBranch) {
      setFormError('Source and target branches must be different.');
      return;
    }
    if (!title.trim()) {
      setFormError('Please enter a Pull Request title.');
      return;
    }

    createPRMutation.mutate(
      {
        taskId,
        payload: {
          connectionId: selectedConnectionId,
          sourceBranch,
          targetBranch,
          title: title.trim(),
          body: body.trim(),
          draft: isDraft,
        },
      },
      {
        onSuccess: () => {
          if (onCreated) onCreated();
          onClose();
        },
        onError: (err: any) => {
          setFormError(err.message || 'Failed to create pull request on GitHub.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create GitHub Pull Request
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a new pull request on GitHub linked to this task
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Connection Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Repository
            </label>
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || `${c.githubOwner}/${c.repositoryName}`}
                </option>
              ))}
            </select>
          </div>

          {/* Branches Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-indigo-500" /> Source (Head)
              </label>
              <select
                value={sourceBranch}
                onChange={(e) => setSourceBranch(e.target.value)}
                disabled={isLoadingBranches}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" /> Target (Base)
              </label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                disabled={isLoadingBranches}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} {b.isDefault ? '(default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Pull Request Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. feat(auth): add login validation"
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description / Body
            </label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the changes made..."
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Draft toggle */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Create as Draft Pull Request
            </span>
          </label>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPRMutation.isPending || isLoadingBranches}
              className="px-5 py-2.5 text-xs font-semibold rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              {createPRMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Pull Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
