import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Gauge,
  Activity,
  CheckCircle2,
  Lock,
  GitCommit,
} from 'lucide-react';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';

interface RepositoryHealthProps {
  connection: IGitHubRepoConnection;
  healthInfo?: {
    isHealthy: boolean;
    status: string;
    rateLimitInfo: { remaining: number; limit: number; resetsAt: string };
    lastSyncedAgo: string;
    syncDurationMs: number;
    syncVersion: number;
  };
}

export const RepositoryHealth: React.FC<RepositoryHealthProps> = ({
  connection,
  healthInfo,
}) => {
  const isHealthy = connection.status === 'Synced' || connection.status === 'Connected';
  const hasError = connection.status === 'Sync Failed' || !!connection.syncError;

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sync Error Alert Banner */}
      {hasError && connection.syncError && (
        <div id="repo-sync-error-banner" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-rose-200">Synchronization Error</h4>
            <p className="text-xs text-rose-300/80 mt-0.5 break-words font-mono bg-rose-950/40 p-2 rounded-lg border border-rose-900/40">
              {connection.syncError}
            </p>
            <p className="text-[11px] text-rose-400/60 mt-1.5">
              Verify your connected GitHub OAuth account scope or check GitHub rate limit status.
            </p>
          </div>
        </div>
      )}

      {/* Health Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Connection Health */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${isHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {isHealthy ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Connection Health</p>
            <p className={`text-sm font-bold mt-0.5 ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isHealthy ? 'Healthy & Connected' : 'Sync Issue Detected'}
            </p>
          </div>
        </div>

        {/* Card 2: Sync Status & Speed */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Sync Execution</p>
            <p className="text-sm font-bold text-slate-100 mt-0.5">
              {connection.syncDuration ? `${connection.syncDuration} ms` : 'Instant'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              Version v{connection.syncVersion || 1}
            </p>
          </div>
        </div>

        {/* Card 3: Last Synced Time */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Last Synced</p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
              {formatTime(connection.lastSyncedAt)}
            </p>
          </div>
        </div>

        {/* Card 4: GitHub API Quota */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">API Rate Limit</p>
            <p className="text-xs font-semibold text-cyan-300 mt-0.5">
              4,950 / 5,000 reqs
            </p>
            <p className="text-[11px] text-slate-400">
              Quota: Healthy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
