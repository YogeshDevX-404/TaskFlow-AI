import React, { useState } from 'react';
import { GitCommit, ExternalLink, RefreshCw, User, Calendar, FileText, ChevronRight } from 'lucide-react';
import { useTaskCommits } from '../../hooks/useGitHubBranchCommit';
import { IGitHubCommitData } from '../../services/api/githubIntegrationService';
import { CommitDetailModal } from './CommitDetailModal';

interface TaskCommitsSectionProps {
  taskId: string;
  connectionId?: string;
}

export const TaskCommitsSection: React.FC<TaskCommitsSectionProps> = ({ taskId, connectionId }) => {
  const { data: commits, isLoading, isError, refetch } = useTaskCommits(taskId);
  const [selectedCommit, setSelectedCommit] = useState<{ sha: string; connId: string } | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
        <span className="text-xs text-slate-400">Searching for related GitHub commits...</span>
      </div>
    );
  }

  if (isError || !commits) {
    return null;
  }

  if (commits.length === 0) {
    return null; // Silent if no commits refer to this task
  }

  return (
    <div className="space-y-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-indigo-400" />
          Linked GitHub Commits ({commits.length})
        </h4>
        <button
          onClick={() => refetch()}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          title="Refresh commits"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {commits.map((commit: IGitHubCommitData) => {
          const firstLine = commit.message.split('\n')[0];
          const dateStr = new Date(commit.committedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={commit.sha}
              onClick={() => {
                if (connectionId) {
                  setSelectedCommit({ sha: commit.sha, connId: connectionId });
                }
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {commit.shortSha || commit.sha.substring(0, 7)}
                  </span>
                  <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate max-w-md">
                    {firstLine}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{commit.author.name}</span>
                  <span>•</span>
                  <span>{dateStr}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Open on GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {connectionId && <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCommit && (
        <CommitDetailModal
          connectionId={selectedCommit.connId}
          sha={selectedCommit.sha}
          onClose={() => setSelectedCommit(null)}
        />
      )}
    </div>
  );
};
