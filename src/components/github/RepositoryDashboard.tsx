import React, { useState } from 'react';
import {
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  History,
  AlertCircle,
  Code2,
  GitPullRequest,
  GitBranch,
  GitCommit,
} from 'lucide-react';
import {
  useGitHubRepositoryDetails,
  useRepositorySyncHistory,
  useSyncRepositoryMutation,
} from '../../hooks/useGitHubRepository';
import { RepositoryHeader } from './RepositoryHeader';
import { RepositoryHealth } from './RepositoryHealth';
import { RepositoryMetadataGrid } from './RepositoryMetadataGrid';
import { RepositorySyncHistory } from './RepositorySyncHistory';
import { GitHubIssueBrowser } from './GitHubIssueBrowser';
import { BranchBrowser } from './BranchBrowser';
import { CommitBrowser } from './CommitBrowser';
import { PullRequestBrowser } from './PullRequestBrowser';

interface RepositoryDashboardProps {
  connectionId: string;
  projectId?: string;
  onBack?: () => void;
}

export const RepositoryDashboard: React.FC<RepositoryDashboardProps> = ({
  connectionId,
  projectId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'commits' | 'issues' | 'prs' | 'health' | 'history'>('overview');
  const [selectedBranchForCommits, setSelectedBranchForCommits] = useState<string | undefined>(undefined);

  const {
    data: detailsData,
    isLoading,
    isError,
    error,
    refetch: refetchDetails,
  } = useGitHubRepositoryDetails(connectionId);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useRepositorySyncHistory(connectionId);

  const syncMutation = useSyncRepositoryMutation();

  const handleSyncNow = () => {
    syncMutation.mutate({ connectionId, projectId });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-200">Loading GitHub Repository Dashboard...</p>
        <p className="text-xs text-slate-500">Fetching live metadata, status, and health indicators</p>
      </div>
    );
  }

  if (isError || !detailsData) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Failed to Load Repository Dashboard</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {error?.message || 'Connection details could not be retrieved from the server.'}
          </p>
        </div>
        <button
          onClick={() => refetchDetails()}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { connection, health } = detailsData;

  return (
    <div className="space-y-6">
      {/* Top Repository Header Card */}
      <RepositoryHeader
        connection={connection}
        isSyncing={syncMutation.isPending}
        onSync={handleSyncNow}
        onBack={onBack}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          id="tab-repo-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Overview & Metadata
        </button>

        <button
          id="tab-repo-branches"
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Branches
        </button>

        <button
          id="tab-repo-commits"
          onClick={() => setActiveTab('commits')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'commits'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          Commits History
        </button>

        <button
          id="tab-repo-issues"
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'issues'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          GitHub Issues ({connection.openIssuesCount || 0})
        </button>

        <button
          id="tab-repo-prs"
          onClick={() => setActiveTab('prs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'prs'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          Pull Requests
        </button>

        <button
          id="tab-repo-health"
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'health'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Connection & Health
        </button>

        <button
          id="tab-repo-history"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Sync History ({historyData?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <RepositoryHealth connection={connection} healthInfo={health} />
          <RepositoryMetadataGrid connection={connection} />
        </div>
      )}

      {activeTab === 'branches' && (
        <BranchBrowser
          connectionId={connectionId}
          defaultBranch={connection.defaultBranch}
          onSelectBranchForCommits={(branchName) => {
            setSelectedBranchForCommits(branchName);
            setActiveTab('commits');
          }}
        />
      )}

      {activeTab === 'commits' && (
        <CommitBrowser
          connectionId={connectionId}
          selectedBranch={selectedBranchForCommits}
        />
      )}

      {activeTab === 'issues' && (
        <GitHubIssueBrowser
          connections={[connection]}
          projectId={projectId || connection.projectId}
        />
      )}

      {activeTab === 'prs' && (
        <PullRequestBrowser
          connections={[connection]}
          projectId={projectId || connection.projectId}
        />
      )}

      {activeTab === 'health' && (
        <div className="space-y-6">
          <RepositoryHealth connection={connection} healthInfo={health} />
          
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Sync Engine & Security Safeguards
            </h3>
            <ul className="text-xs text-slate-400 space-y-2.5 list-disc list-inside">
              <li>
                <strong className="text-slate-200">Atomic Sync Locks:</strong> Prevents concurrent trigger requests within 30-second locks to safeguard GitHub API rate limits.
              </li>
              <li>
                <strong className="text-slate-200">State Normalization:</strong> Tracks repository state changes including renames, transfer of ownership, and read-only archiving.
              </li>
              <li>
                <strong className="text-slate-200">Token Security:</strong> Uses server-side AES-256-GCM encryption. Access tokens are never returned to the frontend client.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <RepositorySyncHistory
          history={historyData || []}
          isLoading={isHistoryLoading}
          onRefresh={() => refetchHistory()}
        />
      )}
    </div>
  );
};
