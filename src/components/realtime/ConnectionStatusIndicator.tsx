import React from 'react';
import { useSocketStore } from '../../store/useSocketStore';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatusIndicator: React.FC = () => {
  const status = useSocketStore((state) => state.status);

  if (status === 'connected') {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold"
        title="Real-Time Enterprise Engine Connected"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Wifi className="w-3 h-3" />
        <span className="hidden sm:inline">Live Sync</span>
      </div>
    );
  }

  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold animate-pulse"
        title="Reconnecting to Real-Time Socket Gateway..."
      >
        <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
        <span className="hidden sm:inline">Connecting...</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-500 dark:text-slate-400 text-[11px] font-semibold"
      title="Real-Time Gateway Offline"
    >
      <WifiOff className="w-3 h-3 text-slate-400" />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
};
