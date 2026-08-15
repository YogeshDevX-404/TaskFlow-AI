import React from 'react';
import {
  GitFork,
  ExternalLink,
  RefreshCw,
  Lock,
  Globe,
  Archive,
  AlertOctagon,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
} from 'lucide-react';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';

interface RepositoryHeaderProps {
  connection: IGitHubRepoConnection;
  isSyncing: boolean;
  onSync: () => void;
  onBack?: () => void;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({
  connection,
  isSyncing,
  onSync,
  onBack,
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const renderStatusBadge = () => {
    switch (connection.status) {
      case 'Syncing':
        return (
          <span id="repo-sync-status-syncing" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            Syncing...
          </span>
        );
      case 'Synced':
      case 'Connected':
        return (
          <span id="repo-sync-status-synced" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Synced
          </span>
        );
      case 'Sync Failed':
        return (
          <span id="repo-sync-status-failed" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Sync Failed
          </span>
        );
      case 'Archived':
        return (
          <span id="repo-sync-status-archived" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            Archived
          </span>
        );
      case 'Never Synced':
        return (
          <span id="repo-sync-status-never" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Never Synced
          </span>
        );
      default:
        return (
          <span id="repo-sync-status-default" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {connection.status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Name, Owner, Badges */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {onBack && (
              <button
                id="btn-repo-header-back"
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
              >
                ← Back
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                <Code2 className="w-5 h-5 text-indigo-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">{connection.githubOwner} /</span>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {connection.repositoryName}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xl">
                  {connection.description || 'No description provided for this repository.'}
                </p>
              </div>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            {renderStatusBadge()}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {connection.visibility === 'private' ? (
                <>
                  <Lock className="w-3 h-3 text-slate-400" /> Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-slate-400" /> Public
                </>
              )}
            </span>

            {connection.isFork && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <GitFork className="w-3 h-3 text-indigo-400" /> Fork
              </span>
            )}

            {connection.isArchived && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Archive className="w-3 h-3 text-amber-400" /> Read-only Archived
              </span>
            )}

            {connection.isDisabled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                <AlertOctagon className="w-3 h-3 text-rose-400" /> Disabled
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {connection.cloneUrl && (
            <button
              id="btn-copy-clone-url"
              onClick={() => handleCopy(connection.cloneUrl!, 'clone')}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5"
              title="Copy Clone HTTPS URL"
            >
              {copiedUrl === 'clone' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  HTTPS Clone
                </>
              )}
            </button>
          )}

          <a
            id="link-open-github-repo"
            href={connection.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5"
          >
            Open GitHub
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            id="btn-sync-now"
            onClick={onSync}
            disabled={isSyncing || connection.status === 'Syncing'}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || connection.status === 'Syncing' ? 'animate-spin' : ''}`} />
            {isSyncing || connection.status === 'Syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
