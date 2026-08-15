import React from 'react';
import { useTimerStore } from '../../store/useTimerStore';
import { useStopTimer, useStartTimer } from '../../hooks/useTimeEntries';
import { formatSecondsToDigital } from './formatTime';
import { Clock, Play, Square, X, AlertTriangle } from 'lucide-react';

export const ActiveTimerConflictModal: React.FC = () => {
  const {
    conflictTimer,
    isConflictModalOpen,
    pendingStartData,
    closeConflictModal,
    secondsElapsed,
  } = useTimerStore();

  const stopTimerMutation = useStopTimer();
  const startTimerMutation = useStartTimer();

  if (!isConflictModalOpen || !conflictTimer) return null;

  const activeTask = typeof conflictTimer.task === 'object' ? conflictTimer.task : null;
  const activeProject = typeof conflictTimer.project === 'object' ? conflictTimer.project : null;

  const handleStopAndStartNew = async () => {
    try {
      // 1. Stop current running timer
      await stopTimerMutation.mutateAsync({ id: conflictTimer.id });
      // 2. Start new timer if pending data exists
      if (pendingStartData) {
        await startTimerMutation.mutateAsync(pendingStartData);
      }
      closeConflictModal();
    } catch (err) {
      console.error('Error stopping and starting new timer:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Timer Running</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You already have a timer running for another task. You can only track time for one task at a time.
            </p>
          </div>
          <button
            onClick={closeConflictModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently running timer details */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Currently Running Timer
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {activeTask ? (
                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono mr-1.5">
                    [{activeTask.taskKey}]
                  </span>
                  {activeTask.title}
                </div>
              ) : (
                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {conflictTimer.description || 'General Work Log'}
                </div>
              )}
              {activeProject && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Project: {activeProject.name}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-mono font-bold shrink-0">
              <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              {formatSecondsToDigital(secondsElapsed || conflictTimer.duration || 0)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col gap-2.5">
          <button
            onClick={handleStopAndStartNew}
            disabled={stopTimerMutation.isPending || startTimerMutation.isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Square className="w-4 h-4" />
            Stop Active & Start New Timer
          </button>

          <button
            onClick={closeConflictModal}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Continue Current Running Timer
          </button>
        </div>
      </div>
    </div>
  );
};
