import React, { useState } from 'react';
import { useCreateGitHubIssueFromTask } from '../../hooks/useGitHubIssues';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';
import { X, GitPullRequest, AlertCircle, Loader2, Plus, Sparkles } from 'lucide-react';

export interface CreateGitHubIssueModalProps {
  task: {
    id: string;
    taskKey: string;
    title: string;
    description?: string;
    labels?: string[];
  } | null;
  connections: IGitHubRepoConnection[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateGitHubIssueModal: React.FC<CreateGitHubIssueModalProps> = ({
  task,
  connections,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateGitHubIssueFromTask();

  const [selectedConnectionId, setSelectedConnectionId] = useState<string>(
    connections[0]?.id || ''
  );
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (task) {
      setCustomTitle(task.title);
      setCustomBody(task.description || '');
      setLabelsInput(task.labels ? task.labels.join(', ') : '');
    }
    if (connections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [task, connections]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnectionId) {
      setErrorMessage('Please select a repository connection');
      return;
    }

    setErrorMessage(null);
    try {
      const parsedLabels = labelsInput
        ? labelsInput.split(',').map((l) => l.trim()).filter(Boolean)
        : [];

      await createMutation.mutateAsync({
        taskId: task.id,
        connectionId: selectedConnectionId,
        payload: {
          customTitle: customTitle.trim() || undefined,
          customBody: customBody.trim() || undefined,
          labels: parsedLabels,
        },
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create GitHub issue');
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
                Create GitHub Issue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish TaskFlow task [{task.taskKey}] as a GitHub Issue
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
          {/* Repository Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Repository
            </label>
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.githubOwner}/{conn.repositoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Issue Body */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Description (Markdown supported)
            </label>
            <textarea
              rows={4}
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 custom-scrollbar"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Labels (comma separated)
            </label>
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="bug, enhancement, taskflow"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              type="submit"
              disabled={createMutation.isPending || !selectedConnectionId}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Issue...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
