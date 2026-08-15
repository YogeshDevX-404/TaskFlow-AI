import React, { useState } from 'react';
import { useTimerStore } from '../../store/useTimerStore';
import { usePauseTimer, useResumeTimer, useStopTimer, useCancelTimer } from '../../hooks/useTimeEntries';
import { formatSecondsToDigital } from './formatTime';
import { Play, Pause, Square, X, Clock, Tag } from 'lucide-react';

export const GlobalTimerBar: React.FC = () => {
  const { activeTimer, secondsElapsed } = useTimerStore();
  const pauseMutation = usePauseTimer();
  const resumeMutation = useResumeTimer();
  const stopMutation = useStopTimer();
  const cancelMutation = useCancelTimer();

  const [descriptionNote, setDescriptionNote] = useState('');

  if (!activeTimer) return null;

  const isRunning = activeTimer.status === 'running';
  const isPaused = activeTimer.status === 'paused';

  const taskObj = typeof activeTimer.task === 'object' ? activeTimer.task : null;
  const projectObj = typeof activeTimer.project === 'object' ? activeTimer.project : null;

  const handlePauseResume = () => {
    if (isRunning) {
      pauseMutation.mutate(activeTimer.id);
    } else if (isPaused) {
      resumeMutation.mutate(activeTimer.id);
    }
  };

  const handleStop = () => {
    stopMutation.mutate({
      id: activeTimer.id,
      description: descriptionNote || activeTimer.description,
    });
  };

  const handleCancel = () => {
    if (confirm('Cancel this timer? The tracked time segment will be discarded.')) {
      cancelMutation.mutate(activeTimer.id);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-lg w-full bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-3.5 transition-all animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Timer Badge & Task Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 text-white font-mono font-bold text-sm shadow-inner shrink-0">
            <Clock
              className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`}
              style={{ animationDuration: '3s' }}
            />
            <span>{formatSecondsToDigital(secondsElapsed)}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-white truncate">
              {taskObj ? (
                <>
                  <span className="text-indigo-400 font-mono">[{taskObj.taskKey}]</span>
                  <span className="truncate">{taskObj.title}</span>
                </>
              ) : (
                <span className="truncate">{activeTimer.description || 'Active Timer'}</span>
              )}
            </div>
            {projectObj && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {projectObj.name}
              </p>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePauseResume}
            disabled={pauseMutation.isPending || resumeMutation.isPending}
            title={isRunning ? 'Pause Timer' : 'Resume Timer'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <Pause className="w-4 h-4 text-amber-400 fill-current" />
            ) : (
              <Play className="w-4 h-4 text-emerald-400 fill-current" />
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={stopMutation.isPending}
            title="Stop & Save Time Entry"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            title="Discard Timer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
