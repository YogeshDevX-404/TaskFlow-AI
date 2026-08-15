import React, { useState } from 'react';
import {
  useTaskGitHubIssue,
  useSyncGitHubIssue,
  useUnlinkGitHubIssue,
} from '../../hooks/useGitHubIssues';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';
import { CreateGitHubIssueModal } from './CreateGitHubIssueModal';
import { LinkIssueModal } from './LinkIssueModal';
import { TaskCommitsSection } from './TaskCommitsSection';
import { TaskPullRequestsSection } from './TaskPullRequestsSection';
import {
  GitPullRequest,
  ExternalLink,
  RefreshCw,
  Unlink,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';

export interface TaskGitHubIntegrationSectionProps {
  task: {
    id: string;
    taskKey: string;
    title: string;
    description?: string;
    labels?: string[];
    projectId: string;
  };
  repoConnections: IGitHubRepoConnection[];
}

export const TaskGitHubIntegrationSection: React.FC<TaskGitHubIntegrationSectionProps> = ({
  task,
  repoConnections,
}) => {
  const { data: mappingData, isLoading, refetch } = useTaskGitHubIssue(task.id);
  const syncMutation = useSyncGitHubIssue();
  const unlinkMutation = useUnlinkGitHubIssue();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const mapping = mappingData?.mapping;
  const repository = mappingData?.repository;

  const handleSync = async () => {
    setActionError(null);
    try {
      await syncMutation.mutateAsync(task.id);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Sync failed');
    }
  };

  const handleUnlink = async () => {
    setActionError(null);
    try {
      await unlinkMutation.mutateAsync(task.id);
      setShowUnlinkConfirm(false);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Unlink failed');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading GitHub integration details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <GitPullRequest className="w-4 h-4 text-indigo-500" />
          <span>GitHub Issue Integration</span>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Linked State View */}
      {mapping ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {repository && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                    {repository.owner}/{repository.name}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    mapping.githubState === 'open'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                  }`}
                >
                  {mapping.githubState.toUpperCase()} #{mapping.githubIssueNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 text-[10px] font-semibold">
                  {mapping.relationshipType}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {mapping.githubTitle}
              </h4>
            </div>

            <a
              href={mapping.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition shrink-0"
              title="Open on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Sync status & Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Synced {mapping.lastSyncedAt ? new Date(mapping.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-3 h-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              {showUnlinkConfirm ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUnlink}
                    disabled={unlinkMutation.isPending}
                    className="px-2 py-1 rounded-xl bg-rose-600 text-white font-bold text-[10px]"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUnlinkConfirm(false)}
                    className="px-2 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUnlinkConfirm(true)}
                  className="px-2.5 py-1 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <Unlink className="w-3 h-3" />
                  <span>Unlink</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Not Linked State */
        <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This task is not linked to any GitHub issue.
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={repoConnections.length === 0}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 disabled:opacity-50 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create GitHub Issue</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              disabled={repoConnections.length === 0}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link Existing Issue</span>
            </button>
          </div>

          {repoConnections.length === 0 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Connect a GitHub repository in Project Settings to enable issue actions.
            </p>
          )}
        </div>
      )}

      {/* Task Linked Commits Section */}
      <TaskCommitsSection
        taskId={task.id}
        connectionId={repoConnections[0]?.id}
      />

      {/* Task Linked Pull Requests Section */}
      <TaskPullRequestsSection
        taskId={task.id}
        taskTitle={task.title}
        taskKey={task.key}
        connections={repoConnections}
      />

      {/* Modals */}
      <CreateGitHubIssueModal
        task={task}
        connections={repoConnections}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {repoConnections.length > 0 && (
        <LinkIssueModal
          issue={
            // Temporary dummy issue object for modal initialization before selection
            {
              id: 0,
              number: 0,
              title: 'Select an Issue',
              body: '',
              state: 'open',
              user: { id: 0, login: '', avatar_url: '', html_url: '' },
              labels: [],
              assignees: [],
              comments: 0,
              html_url: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }
          connectionId={repoConnections[0].id}
          projectId={task.projectId}
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
