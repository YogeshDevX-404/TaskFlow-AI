import React, { useState } from 'react';
import { useGitHubIssues } from '../../hooks/useGitHubIssues';
import {
  IGitHubRepoConnection,
  IGitHubIssue,
} from '../../services/api/githubIntegrationService';
import { GitHubIssueDetailModal } from './GitHubIssueDetailModal';
import { ImportIssueModal } from './ImportIssueModal';
import { LinkIssueModal } from './LinkIssueModal';
import {
  GitPullRequest,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MessageSquare,
  User,
  CheckCircle2,
  Plus,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export interface GitHubIssueBrowserProps {
  connections: IGitHubRepoConnection[];
  projectId: string;
}

export const GitHubIssueBrowser: React.FC<GitHubIssueBrowserProps> = ({
  connections,
  projectId,
}) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>(
    connections[0]?.id || ''
  );
  const [stateFilter, setStateFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'created' | 'updated' | 'comments'>('updated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modal states
  const [activeDetailIssue, setActiveDetailIssue] = useState<IGitHubIssue | null>(null);
  const [activeImportIssue, setActiveImportIssue] = useState<IGitHubIssue | null>(null);
  const [activeLinkIssue, setActiveLinkIssue] = useState<IGitHubIssue | null>(null);

  // Update selected connection if connections change
  React.useEffect(() => {
    if (connections.length > 0 && (!selectedConnectionId || !connections.find((c) => c.id === selectedConnectionId))) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  const activeConnection = connections.find((c) => c.id === selectedConnectionId);

  const {
    data: issuesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGitHubIssues(selectedConnectionId || null, {
    state: stateFilter,
    search: searchTerm.trim() || undefined,
    sort: sortField,
    direction: sortDirection,
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
          To browse and import GitHub Issues, first connect a GitHub repository in Project Settings.
        </p>
      </div>
    );
  }

  const issues = issuesData?.issues || [];
  const totalPages = issuesData?.totalPages || 1;
  const totalIssues = issuesData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Repository Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              GitHub Issue Browser
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse issues, import as TaskFlow tasks, or link existing tasks
            </p>
          </div>
        </div>

        {/* Repository Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedConnectionId}
            onChange={(e) => {
              setSelectedConnectionId(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {connections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.githubOwner}/{c.repositoryName} ({c.openIssuesCount} issues)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh Issues"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search issues by title, #number, author..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Filter Pills & Sorting */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* State Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setStateFilter('open');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                stateFilter === 'open'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => {
                setStateFilter('closed');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                stateFilter === 'closed'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Closed
            </button>
            <button
              type="button"
              onClick={() => {
                setStateFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                stateFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              All
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Date Created</option>
              <option value="comments">Most Comments</option>
            </select>

            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to load GitHub issues: {(error as any)?.message || 'API Error'}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p>Fetching issues from GitHub...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <GitPullRequest className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No issues found</p>
          <p className="text-[11px]">Try adjusting your search query or state filters.</p>
        </div>
      ) : (
        /* Issues List Cards */
        <div className="space-y-3">
          {issues.map((issue) => {
            const isImported = issue.mappingInfo?.isImported;
            return (
              <div
                key={issue.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          issue.state === 'open'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                        }`}
                      >
                        {issue.state.toUpperCase()} #{issue.number}
                      </span>

                      {isImported && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>TaskFlow {issue.mappingInfo?.taskKey}</span>
                        </span>
                      )}

                      <span className="text-slate-400 text-[11px]">
                        opened by @{issue.user.login} on {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveDetailIssue(issue)}
                      className="text-left text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-2"
                    >
                      {issue.title}
                    </button>
                  </div>

                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Card Footer Meta */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Labels */}
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {issue.labels.slice(0, 3).map((l) => (
                          <span
                            key={l.name}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            style={{
                              backgroundColor: l.color ? `#${l.color}20` : undefined,
                              color: l.color ? `#${l.color}` : undefined,
                            }}
                          >
                            {l.name}
                          </span>
                        ))}
                        {issue.labels.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            +{issue.labels.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comments count */}
                    <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{issue.comments}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isImported ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveLinkIssue(issue)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Link Task</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveImportIssue(issue)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-indigo-500/10"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Import</span>
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                        Imported
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500">
          <div>
            Showing Page {page} of {totalPages} ({totalIssues} total issues)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <GitHubIssueDetailModal
        issue={activeDetailIssue}
        isOpen={!!activeDetailIssue}
        onClose={() => setActiveDetailIssue(null)}
        onImportClick={(issue) => setActiveImportIssue(issue)}
        onLinkClick={(issue) => setActiveLinkIssue(issue)}
      />

      <ImportIssueModal
        issue={activeImportIssue}
        connectionId={selectedConnectionId}
        projectId={projectId}
        isOpen={!!activeImportIssue}
        onClose={() => setActiveImportIssue(null)}
        onSuccess={() => refetch()}
      />

      <LinkIssueModal
        issue={activeLinkIssue}
        connectionId={selectedConnectionId}
        projectId={projectId}
        isOpen={!!activeLinkIssue}
        onClose={() => setActiveLinkIssue(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
