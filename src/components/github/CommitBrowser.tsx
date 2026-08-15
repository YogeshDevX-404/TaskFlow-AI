import React, { useState } from 'react';
import {
  GitCommit,
  Search,
  Filter,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  GitBranch,
  Calendar,
  CheckCircle2,
  FileText,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { useGitHubCommits, useGitHubBranches } from '../../hooks/useGitHubBranchCommit';
import { IFetchCommitsParams, IGitHubCommitData } from '../../services/api/githubIntegrationService';
import { CommitDetailModal } from './CommitDetailModal';

interface CommitBrowserProps {
  connectionId: string;
  selectedBranch?: string;
}

export const CommitBrowser: React.FC<CommitBrowserProps> = ({
  connectionId,
  selectedBranch,
}) => {
  const [params, setParams] = useState<IFetchCommitsParams>({
    branch: selectedBranch || '',
    search: '',
    author: '',
    sort: 'newest',
    page: 1,
    limit: 10,
  });

  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);

  const { data: branchesData } = useGitHubBranches(connectionId, { limit: 100 });
  const { data, isLoading, isError, error, refetch } = useGitHubCommits(connectionId, params);

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commits by message, author, or SHA..."
            value={params.search || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={params.branch || ''}
              onChange={(e) => setParams((prev) => ({ ...prev, branch: e.target.value, page: 1 }))}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[140px]"
            >
              <option value="" className="bg-slate-900 text-slate-200">
                All Branches
              </option>
              {branchesData?.branches.map((b) => (
                <option key={b.name} value={b.name} className="bg-slate-900 text-slate-200">
                  {b.name} {b.isDefault ? '(default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={params.sort || 'newest'}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, sort: e.target.value as any, page: 1 }))
              }
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-900 text-slate-200">
                Oldest First
              </option>
              <option value="author" className="bg-slate-900 text-slate-200">
                Author
              </option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            title="Refresh Commits"
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Fetching commit history...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-slate-900/80 border border-rose-500/20 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-rose-400">Failed to load commits</p>
          <p className="text-xs text-slate-400">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && data?.commits.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <GitCommit className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No commits found</p>
          <p className="text-xs text-slate-500">Try clearing search filters or changing the branch</p>
        </div>
      )}

      {/* Commit List */}
      {!isLoading && !isError && data && data.commits.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {data.commits.map((commit: IGitHubCommitData) => {
            const firstLine = commit.message.split('\n')[0];
            const dateFormatted = new Date(commit.committedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={commit.sha}
                onClick={() => setSelectedCommitSha(commit.sha)}
                className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Commit Main Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-400 group-hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {commit.shortSha || commit.sha.substring(0, 7)}
                    </span>

                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-xl">
                      {firstLine}
                    </h4>

                    {/* Reference Badges */}
                    {commit.relatedTask && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        <Tag className="w-2.5 h-2.5 text-purple-400" />
                        {commit.relatedTask.taskKey}
                      </span>
                    )}

                    {commit.relatedIssue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        <FileText className="w-2.5 h-2.5 text-blue-400" />#{commit.relatedIssue.issueNumber}
                      </span>
                    )}
                  </div>

                  {/* Commit Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {commit.author.avatar_url ? (
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.name}
                          className="w-4 h-4 rounded-full border border-slate-700"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span className="font-medium text-slate-300">
                        {commit.author.name || commit.author.login}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{dateFormatted}</span>
                    </div>

                    {commit.branchName && (
                      <div className="flex items-center gap-1 text-slate-500 font-mono">
                        <GitBranch className="w-3 h-3 text-slate-500" />
                        <span>{commit.branchName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* External GitHub Link */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} total commits)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => handlePageChange(data.page - 1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={data.page >= data.totalPages}
              onClick={() => handlePageChange(data.page + 1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Commit Detail Modal */}
      {selectedCommitSha && (
        <CommitDetailModal
          connectionId={connectionId}
          sha={selectedCommitSha}
          onClose={() => setSelectedCommitSha(null)}
        />
      )}
    </div>
  );
};
