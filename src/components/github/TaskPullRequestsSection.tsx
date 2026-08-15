import React, { useState } from 'react';
import {
  useTaskPullRequests,
  useUnlinkTaskPullRequest,
  useSyncPullRequest,
} from '../../hooks/useGitHubPullRequests';
import {
  IGitHubRepoConnection,
  IGitHubPullRequestData,
} from '../../services/api/githubIntegrationService';
import { PullRequestDetailModal } from './PullRequestDetailModal';
import { CreatePullRequestModal } from './CreatePullRequestModal';
import { LinkPullRequestModal } from './LinkPullRequestModal';
import {
  GitPullRequest,
  GitMerge,
  XCircle,
  Clock,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Unlink,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

interface TaskPullRequestsSectionProps {
  taskId: string;
  taskTitle?: string;
  taskKey?: string;
  connections: IGitHubRepoConnection[];
}

export const TaskPullRequestsSection: React.FC<TaskPullRequestsSectionProps> = ({
  taskId,
  taskTitle = '',
  taskKey = '',
  connections,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [activeDetailPr, setActiveDetailPr] = useState<IGitHubPullRequestData | null>(null);

  const { data: prs = [], isLoading, refetch } = useTaskPullRequests(taskId);
  const unlinkMutation = useUnlinkTaskPullRequest();
  const syncMutation = useSyncPullRequest();

  const handleUnlink = (pr: IGitHubPullRequestData) => {
    if (confirm(`Are you sure you want to unlink PR #${pr.githubPullRequestNumber}?`)) {
      unlinkMutation.mutate({ taskId, prId: pr.id });
    }
  };

  const handleSyncPR = (pr: IGitHubPullRequestData) => {
    if (pr.repositoryConnection) {
      syncMutation.mutate({
        connectionId: pr.repositoryConnection,
        prNumber: pr.githubPullRequestNumber,
      });
    }
  };

  const renderStateBadge = (pr: IGitHubPullRequestData) => {
    if (pr.merged) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <GitMerge className="w-3 h-3" /> Merged
        </span>
      );
    }
    if (pr.draft) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          <Clock className="w-3 h-3" /> Draft
        </span>
      );
    }
    if (pr.state === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3 h-3" /> Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <GitPullRequest className="w-3 h-3" /> Open
      </span>
    );
  };

  const renderReviewBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" /> Changes
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              GitHub Pull Requests
              {prs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {prs.length}
                </span>
              )}
            </h4>
          </div>
        </div>

        {/* Action Buttons */}
        {connections.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Link PR
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Create PR
            </button>
          </div>
        )}
      </div>

      {/* PR Cards List */}
      {isLoading ? (
        <div className="py-4 text-xs text-slate-400">Loading linked pull requests...</div>
      ) : prs.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No GitHub Pull Requests linked to this task yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {prs.map((pr) => (
            <div
              key={pr.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {renderStateBadge(pr)}
                  {renderReviewBadge(pr.reviewStatus)}
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    #{pr.githubPullRequestNumber}
                  </span>
                </div>

                <div
                  onClick={() => setActiveDetailPr(pr)}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                >
                  {pr.title}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <GitBranch className="w-3 h-3 text-indigo-500" />
                  <span>{pr.sourceBranch}</span>
                  <span>→</span>
                  <span>{pr.targetBranch}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setActiveDetailPr(pr)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  View
                </button>

                <button
                  onClick={() => handleSyncPR(pr)}
                  disabled={syncMutation.isPending}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Re-sync PR state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {pr.githubUrl && (
                  <a
                    href={pr.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => handleUnlink(pr)}
                  disabled={unlinkMutation.isPending}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Unlink PR from task"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreatePullRequestModal
          taskId={taskId}
          taskTitle={taskTitle}
          taskKey={taskKey}
          connections={connections}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => refetch()}
        />
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <LinkPullRequestModal
          taskId={taskId}
          connections={connections}
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          onLinked={() => refetch()}
        />
      )}

      {/* Detail Modal */}
      {activeDetailPr && activeDetailPr.repositoryConnection && (
        <PullRequestDetailModal
          connectionId={activeDetailPr.repositoryConnection}
          prNumber={activeDetailPr.githubPullRequestNumber}
          isOpen={!!activeDetailPr}
          onClose={() => setActiveDetailPr(null)}
          taskId={taskId}
        />
      )}
    </div>
  );
};
