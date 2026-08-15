import React, { useState } from 'react';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';
import { RepositoryDashboard } from './RepositoryDashboard';
import {
  FolderGit2,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Lock,
  Globe,
  Clock,
  ShieldAlert,
  LayoutDashboard,
  X,
} from 'lucide-react';

interface ConnectedRepositoryCardProps {
  connection: IGitHubRepoConnection;
  onSync: (connectionId: string) => Promise<void>;
  onDisconnect: (connectionId: string) => Promise<void>;
}

export const ConnectedRepositoryCard: React.FC<ConnectedRepositoryCardProps> = ({
  connection,
  onSync,
  onDisconnect,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  const handleSyncClick = async () => {
    try {
      setIsSyncing(true);
      await onSync(connection.id);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectConfirm = async () => {
    try {
      setIsDisconnecting(true);
      await onDisconnect(connection.id);
      setShowConfirmDisconnect(false);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const lastSyncedFormatted = new Date(connection.lastSyncedAt).toLocaleString();

  return (
    <div
      id={`connected-repo-${connection.id}`}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {connection.fullName}
              </h4>
              {connection.visibility === 'private' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-2.5 h-2.5" /> Public
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {connection.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {connection.status === 'Connected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          )}
          {connection.status === 'Syncing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Syncing
            </span>
          )}
          {connection.status === 'Sync Failed' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sync Failed
            </span>
          )}
        </div>
      </div>

      {/* Details Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Default Branch</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-indigo-500" />
            {connection.defaultBranch}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Language</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {connection.language || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Stars / Forks</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            ★ {connection.stargazersCount} / ⑂ {connection.forksCount}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Synced</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <Clock className="w-3 h-3" />
            {lastSyncedFormatted}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <a
          href={connection.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Repository on GitHub
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id={`btn-open-dashboard-${connection.id}`}
            onClick={() => setShowDashboardModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Repository Dashboard
          </button>

          <button
            type="button"
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmDisconnect(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </div>

      {/* Full Repository Dashboard Modal */}
      {showDashboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-auto max-h-[92vh] overflow-y-auto text-white">
            <button
              type="button"
              id={`btn-close-dashboard-modal-${connection.id}`}
              onClick={() => setShowDashboardModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <RepositoryDashboard
              connectionId={connection.id}
              projectId={connection.projectId}
              onBack={() => setShowDashboardModal(false)}
            />
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showConfirmDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-bold">Disconnect Repository?</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to disconnect <strong className="text-slate-900 dark:text-white">{connection.fullName}</strong> from this TaskFlow project?
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
              <strong>Note:</strong> Disconnecting only removes the project association in TaskFlow AI. No code, commits, or GitHub repository data will be deleted.
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDisconnect(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnectConfirm}
                disabled={isDisconnecting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDisconnecting ? 'Disconnecting...' : 'Yes, Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
