import React, { useState } from 'react';
import {
  GitBranch,
  Search,
  Filter,
  Shield,
  Star,
  Clock,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GitCommit,
  RefreshCw,
} from 'lucide-react';
import { useGitHubBranches } from '../../hooks/useGitHubBranchCommit';
import { IFetchBranchesParams, IGitHubBranchData } from '../../services/api/githubIntegrationService';

interface BranchBrowserProps {
  connectionId: string;
  defaultBranch?: string;
  onSelectBranchForCommits?: (branchName: string) => void;
}

export const BranchBrowser: React.FC<BranchBrowserProps> = ({
  connectionId,
  defaultBranch = 'main',
  onSelectBranchForCommits,
}) => {
  const [params, setParams] = useState<IFetchBranchesParams>({
    search: '',
    filter: 'all',
    sort: 'name',
    page: 1,
    limit: 10,
  });

  const [copiedName, setCopiedName] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useGitHubBranches(connectionId, params);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedName(text);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branches by name..."
            value={params.search || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={params.filter || 'all'}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  filter: e.target.value as any,
                  page: 1,
                }))
              }
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Branches
              </option>
              <option value="default" className="bg-slate-900 text-slate-200">
                Default Branch Only
              </option>
              <option value="protected" className="bg-slate-900 text-slate-200">
                Protected Branches
              </option>
              <option value="unprotected" className="bg-slate-900 text-slate-200">
                Unprotected Branches
              </option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
            <span className="text-slate-500">Sort:</span>
            <select
              value={params.sort || 'name'}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  sort: e.target.value as any,
                  page: 1,
                }))
              }
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="name" className="bg-slate-900 text-slate-200">
                Branch Name
              </option>
              <option value="updated" className="bg-slate-900 text-slate-200">
                Recently Updated
              </option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            title="Refresh Branches"
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
          <p className="text-xs text-slate-400 font-medium">Fetching repository branches...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-slate-900/80 border border-rose-500/20 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-rose-400">Failed to load branches</p>
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
      {!isLoading && !isError && data?.branches.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <GitBranch className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No branches found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or filters</p>
        </div>
      )}

      {/* Branch List Table / Cards */}
      {!isLoading && !isError && data && data.branches.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {data.branches.map((branch: IGitHubBranchData) => {
            const isDef = branch.isDefault || branch.name === defaultBranch;
            return (
              <div
                key={branch.name}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Branch Info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-slate-300">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                    </span>
                    <span className="font-mono text-sm font-bold text-white truncate">
                      {branch.name}
                    </span>

                    {/* Badges */}
                    {isDef && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Star className="w-2.5 h-2.5 fill-emerald-400" />
                        Default
                      </span>
                    )}

                    {branch.protected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Shield className="w-2.5 h-2.5" />
                        Protected
                      </span>
                    )}
                  </div>

                  {/* Commit info preview */}
                  {branch.commit && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <GitCommit className="w-3 h-3 text-slate-500" />
                        {branch.commit.shortSha || branch.commit.sha.substring(0, 7)}
                      </span>
                      {branch.commit.message && (
                        <span className="text-slate-300 truncate max-w-md">
                          "{branch.commit.message.split('\n')[0]}"
                        </span>
                      )}
                      {branch.commit.authorName && (
                        <span className="text-slate-500">by {branch.commit.authorName}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => handleCopy(branch.name)}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy Branch Name"
                  >
                    {copiedName === branch.name ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onSelectBranchForCommits && (
                    <button
                      onClick={() => onSelectBranchForCommits(branch.name)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <GitCommit className="w-3 h-3" />
                      <span>View Commits</span>
                    </button>
                  )}

                  {branch.html_url && (
                    <a
                      href={branch.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors"
                      title="Open in GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {!isLoading && !isError && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span>
            Showing page {data.page} of {data.totalPages} ({data.total} branches)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => handlePageChange(data.page - 1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={data.page >= data.totalPages}
              onClick={() => handlePageChange(data.page + 1)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
