import React, { useState } from 'react';
import { useTimeEntries, useStopTimer, usePauseTimer, useResumeTimer } from '../../hooks/useTimeEntries';
import { useTimerStore } from '../../store/useTimerStore';
import { formatSecondsToDigital, formatSecondsToHuman } from './formatTime';
import { WorkLogModal } from './WorkLogModal';
import { Clock, Play, Pause, Square, Plus, ArrowUpRight } from 'lucide-react';

interface TimeTrackingWidgetProps {
  onNavigateToTimesheet?: () => void;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
  onNavigateToTimesheet,
}) => {
  const { activeTimer, secondsElapsed } = useTimerStore();
  const pauseMutation = usePauseTimer();
  const resumeMutation = useResumeTimer();
  const stopMutation = useStopTimer();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch today's summary entries
  const todayStr = new Date().toISOString().split('T')[0];
  const { data } = useTimeEntries({
    startDate: todayStr,
  });

  const todaySummary = data?.summary || { totalDuration: 0, billableDuration: 0 };
  const isRunning = activeTimer?.status === 'running';

  const handlePauseResume = () => {
    if (!activeTimer) return;
    if (isRunning) {
      pauseMutation.mutate(activeTimer.id);
    } else {
      resumeMutation.mutate(activeTimer.id);
    }
  };

  const handleStop = () => {
    if (!activeTimer) return;
    stopMutation.mutate({ id: activeTimer.id });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Time Tracking</h3>
        </div>

        {onNavigateToTimesheet && (
          <button
            onClick={onNavigateToTimesheet}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Timesheet <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Running Timer Banner (If Active) */}
      {activeTimer ? (
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3 shadow-md">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase text-indigo-400 block">
              {isRunning ? 'Timer Running' : 'Timer Paused'}
            </span>
            <div className="text-xs font-bold truncate mt-0.5">
              {typeof activeTimer.task === 'object'
                ? activeTimer.task?.title
                : activeTimer.description || 'Active Timer'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-indigo-300">
              {formatSecondsToDigital(secondsElapsed)}
            </span>

            <button
              onClick={handlePauseResume}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white cursor-pointer"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleStop}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Today Stats & Quick Log */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Today's Logged</span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
            {formatSecondsToHuman(todaySummary.totalDuration)}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900/60 p-3 rounded-xl flex flex-col items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Work Time</span>
        </button>
      </div>

      <WorkLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
