import React, { useState } from 'react';
import {
  IGitHubRepoConnection,
  IGitHubPullRequestData,
} from '../../services/api/githubIntegrationService';
import { useGitHubPullRequests } from '../../hooks/useGitHubPullRequests';
import { PullRequestDetailModal } from './PullRequestDetailModal';
import {
  GitPullRequest,
  GitMerge,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  User,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

interface PullRequestBrowserProps {
  connections: IGitHubRepoConnection[];
  projectId: string;
}

export const PullRequestBrowser: React.FC<PullRequestBrowserProps> = ({ connections }) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>(
    connections[0]?.id || ''
  );
  const [stateFilter, setStateFilter] = useState<'open' | 'closed' | 'merged' | 'all'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [activeDetailPr, setActiveDetailPr] = useState<IGitHubPullRequestData | null>(null);

  React.useEffect(() => {
    if (
      connections.length > 0 &&
      (!selectedConnectionId || !connections.find((c) => c.id === selectedConnectionId))
    ) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  const {
    data: prsData,
    isLoading,
    refetch,
    isFetching,
  } = useGitHubPullRequests(selectedConnectionId || null, {
    state: stateFilter,
    search: searchTerm.trim() || undefined,
    page,
    limit: 10,
  });

  if (connections.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <GitPullRequest className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Connected Repositories
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          To browse GitHub Pull Requests, connect a GitHub repository in Project Settings first.
        </p>
      </div>
    );
  }

  const pullRequests = prsData?.pullRequests || [];
  const totalPages = prsData?.totalPages || 1;
  const total = prsData?.total || 0;

  const renderStateBadge = (pr: IGitHubPullRequestData) => {
    if (pr.merged) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <GitMerge className="w-3.5 h-3.5" /> Merged
        </span>
      );
    }
    if (pr.draft) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5" /> Draft
        </span>
      );
    }
    if (pr.state === 'closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5" /> Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <GitPullRequest className="w-3.5 h-3.5" /> Open
      </span>
    );
  };

  const renderReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" /> Changes Requested
          </span>
        );
      case 'Mixed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            <MessageSquare className="w-3 h-3" /> Review Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Connection selector & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Repository Connection
            </label>
            <select
              value={selectedConnectionId}
              onChange={(e) => {
                setSelectedConnectionId(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-2"
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                  {c.fullName || `${c.githubOwner}/${c.repositoryName}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* State filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 self-start">
          {(['open', 'closed', 'merged', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStateFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors ${
                stateFilter === st
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search pull requests..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Pull Request List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-slate-400 animate-pulse">
          Loading pull requests...
        </div>
      ) : pullRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <GitPullRequest className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Pull Requests Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No pull requests match the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pullRequests.map((pr) => (
            <div
              key={pr.githubPullRequestNumber}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all shadow-sm group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {renderStateBadge(pr)}
                  {renderReviewStatusBadge(pr.reviewStatus)}
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    #{pr.githubPullRequestNumber}
                  </span>
                </div>

                <h4
                  onClick={() => setActiveDetailPr(pr)}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
                >
                  {pr.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <img
                      src={pr.author.avatar_url}
                      alt={pr.author.login}
                      className="w-4 h-4 rounded-full"
                    />
                    <strong>{pr.author.login}</strong>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{pr.sourceBranch}</span>
                    <span className="text-slate-400">→</span>
                    <span>{pr.targetBranch}</span>
                  </span>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                <button
                  onClick={() => setActiveDetailPr(pr)}
                  className="px-4 py-2 text-xs font-semibold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
                >
                  View Details
                </button>
                {pr.githubUrl && (
                  <a
                    href={pr.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing page {page} of {totalPages} ({total} pull requests)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pull Request Detail Modal */}
      {activeDetailPr && (
        <PullRequestDetailModal
          connectionId={selectedConnectionId}
          prNumber={activeDetailPr.githubPullRequestNumber}
          isOpen={!!activeDetailPr}
          onClose={() => setActiveDetailPr(null)}
        />
      )}
    </div>
  );
};
