import React, { useState } from 'react';
import { Task } from '../../types/task';
import {
  useStartTimer,
  usePauseTimer,
  useResumeTimer,
  useStopTimer,
  useTimeEntries,
  useDeleteTimeEntry,
} from '../../hooks/useTimeEntries';
import { useTimerStore } from '../../store/useTimerStore';
import { formatHoursToHuman, formatSecondsToHuman, formatSecondsToDigital } from './formatTime';
import { WorkLogModal } from './WorkLogModal';
import { TimeEntry } from '../../types/timeEntry';
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface TaskTimeTrackerProps {
  task: Task;
  onUpdateTaskEstimate?: (estimatedHours: number) => void;
}

export const TaskTimeTracker: React.FC<TaskTimeTrackerProps> = ({
  task,
  onUpdateTaskEstimate,
}) => {
  const { activeTimer, secondsElapsed } = useTimerStore();
  const startTimerMutation = useStartTimer();
  const pauseTimerMutation = usePauseTimer();
  const resumeTimerMutation = useResumeTimer();
  const stopTimerMutation = useStopTimer();
  const deleteEntryMutation = useDeleteTimeEntry();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const [estimateInput, setEstimateInput] = useState<string>(
    String(task.estimatedHours || 0)
  );

  // Fetch work logs for this task
  const { data: timeEntriesData, isLoading: isLoadingEntries } = useTimeEntries({
    taskId: task.id,
    limit: 50,
  });

  const entries = timeEntriesData?.entries || [];

  const isTimerRunningForThisTask =
    activeTimer?.status === 'running' &&
    (typeof activeTimer.task === 'object'
      ? activeTimer.task?.id === task.id
      : activeTimer.task === task.id);

  const isTimerPausedForThisTask =
    activeTimer?.status === 'paused' &&
    (typeof activeTimer.task === 'object'
      ? activeTimer.task?.id === task.id
      : activeTimer.task === task.id);

  const spentHours = task.spentHours || 0;
  const estimatedHours = task.estimatedHours || 0;
  const remainingHours = Math.max(0, estimatedHours - spentHours);
  const progressPercent =
    estimatedHours > 0
      ? Math.min(100, Math.round((spentHours / estimatedHours) * 100))
      : 0;

  const handleStartTimer = () => {
    startTimerMutation.mutate({
      taskId: task.id,
      projectId: typeof task.project === 'object' ? task.project.id : task.project,
      description: `Working on ${task.taskKey}: ${task.title}`,
    });
  };

  const handlePauseResume = () => {
    if (!activeTimer) return;
    if (activeTimer.status === 'running') {
      pauseTimerMutation.mutate(activeTimer.id);
    } else {
      resumeTimerMutation.mutate(activeTimer.id);
    }
  };

  const handleStopTimer = () => {
    if (!activeTimer) return;
    stopTimerMutation.mutate({ id: activeTimer.id });
  };

  const handleSaveEstimate = () => {
    const val = parseFloat(estimateInput);
    if (!isNaN(val) && val >= 0 && onUpdateTaskEstimate) {
      onUpdateTaskEstimate(val);
    }
    setIsEditingEstimate(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Time Tracking
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track hours logged & estimates for this task
            </p>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-2">
          {isTimerRunningForThisTask || isTimerPausedForThisTask ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{formatSecondsToDigital(secondsElapsed)}</span>
              </div>

              <button
                onClick={handlePauseResume}
                className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                title={isTimerRunningForThisTask ? 'Pause Timer' : 'Resume Timer'}
              >
                {isTimerRunningForThisTask ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              <button
                onClick={handleStopTimer}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                title="Stop & Save Time"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </>
          ) : (
            <button
              onClick={handleStartTimer}
              disabled={startTimerMutation.isPending}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Timer</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingEntry(null);
              setIsLogModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Time Spent
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
            {formatHoursToHuman(spentHours)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 relative">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Estimated
          </span>
          {isEditingEstimate ? (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimateInput}
                onChange={(e) => setEstimateInput(e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-indigo-500 rounded text-center text-xs text-slate-900 dark:text-white"
              />
              <button
                onClick={handleSaveEstimate}
                className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingEstimate(true)}
              className="group cursor-pointer flex items-center justify-center gap-1 mt-0.5"
              title="Click to edit estimate"
            >
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {estimatedHours > 0 ? formatHoursToHuman(estimatedHours) : 'Not set'}
              </span>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Remaining
          </span>
          <span
            className={`text-base font-bold mt-0.5 block ${
              spentHours > estimatedHours && estimatedHours > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatHoursToHuman(remainingHours)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {estimatedHours > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Progress ({progressPercent}%)</span>
            {spentHours > estimatedHours && (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Over Estimate
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                spentHours > estimatedHours
                  ? 'bg-rose-500'
                  : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Work Logs List */}
      <div>
        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
          Work Log History
        </h5>

        {isLoadingEntries ? (
          <div className="text-xs text-slate-400 py-3 text-center">Loading work logs...</div>
        ) : entries.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No work logged yet for this task.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const u = typeof entry.user === 'object' ? entry.user : null;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                      <span>{entry.description || 'Logged Work'}</span>
                      {entry.isBillable && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded">
                          Billable
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{u?.name || 'User'}</span>
                      <span>•</span>
                      <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-lg">
                      {formatSecondsToHuman(entry.duration)}
                    </span>

                    <button
                      onClick={() => {
                        setEditingEntry(entry);
                        setIsLogModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Delete this work log?')) {
                          deleteEntryMutation.mutate(entry.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Work Log Modal */}
      <WorkLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingEntry(null);
        }}
        initialTaskId={task.id}
        initialProjectId={typeof task.project === 'object' ? task.project.id : task.project}
        editEntry={editingEntry}
      />
    </div>
  );
};
