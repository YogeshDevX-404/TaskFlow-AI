import React from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  RefreshCw,
  ChevronRight,
  FileDiff,
} from 'lucide-react';
import { IGitHubSyncHistoryRecord } from '../../services/api/githubIntegrationService';

interface RepositorySyncHistoryProps {
  history: IGitHubSyncHistoryRecord[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const RepositorySyncHistory: React.FC<RepositorySyncHistoryProps> = ({
  history,
  isLoading,
  onRefresh,
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Sync Event Audit History</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
            {history.length} records
          </span>
        </div>

        {onRefresh && (
          <button
            id="btn-refresh-sync-history"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          Loading sync history...
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 p-6 space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No sync events recorded yet</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Click "Sync Now" to trigger metadata synchronization with GitHub.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {history.map((item) => {
            const isSuccess = item.status === 'Synced';

            return (
              <div
                key={item.id}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left side: Icon & Title & Changes */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.status}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {item.triggeredByName || 'Authorized User'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono">
                        {item.durationMs} ms
                      </span>
                    </div>

                    {/* Changes or Error Message */}
                    {item.error ? (
                      <p className="text-[11px] font-mono text-rose-300/90 bg-rose-950/50 p-2 rounded-lg border border-rose-900/40 break-all">
                        {item.error}
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        {item.changesDetected && item.changesDetected.length > 0 ? (
                          item.changesDetected.map((change, idx) => (
                            <p key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                              <FileDiff className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span>{change}</span>
                            </p>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400">Revalidated metadata (no changes)</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Timestamp */}
                <div className="text-slate-500 text-[11px] shrink-0 sm:text-right font-mono">
                  {formatTime(item.syncCompletedAt || item.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
