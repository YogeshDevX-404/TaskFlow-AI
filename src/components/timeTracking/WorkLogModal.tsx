import React, { useState, useEffect } from 'react';
import { useCreateWorkLog, useUpdateTimeEntry } from '../../hooks/useTimeEntries';
import { TimeEntry, WorkLogFormData } from '../../types/timeEntry';
import { X, Clock, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTaskId?: string;
  initialProjectId?: string;
  initialWorkspaceId?: string;
  initialOrgId?: string;
  editEntry?: TimeEntry | null;
}

export const WorkLogModal: React.FC<WorkLogModalProps> = ({
  isOpen,
  onClose,
  initialTaskId,
  initialProjectId,
  initialWorkspaceId,
  initialOrgId,
  editEntry,
}) => {
  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateTimeEntry();

  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [durationHours, setDurationHours] = useState<string>('1');
  const [durationMinutes, setDurationMinutes] = useState<string>('0');
  const [mode, setMode] = useState<'timeRange' | 'duration'>('duration');
  const [description, setDescription] = useState<string>('');
  const [isBillable, setIsBillable] = useState<boolean>(true);
  const [billableRate, setBillableRate] = useState<string>('50');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editEntry) {
      setDescription(editEntry.description || '');
      setIsBillable(editEntry.isBillable ?? true);
      setBillableRate(String(editEntry.billableRate || 50));
      if (editEntry.startTime) {
        const d = new Date(editEntry.startTime);
        setDate(d.toISOString().split('T')[0]);
        setStartTime(d.toTimeString().slice(0, 5));
      }
      if (editEntry.endTime) {
        const e = new Date(editEntry.endTime);
        setEndTime(e.toTimeString().slice(0, 5));
        setMode('timeRange');
      } else if (editEntry.duration) {
        const hrs = Math.floor(editEntry.duration / 3600);
        const mins = Math.floor((editEntry.duration % 3600) / 60);
        setDurationHours(String(hrs));
        setDurationMinutes(String(mins));
        setMode('duration');
      }
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setIsBillable(true);
      setErrorMsg(null);
    }
  }, [editEntry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let startIso: string | undefined;
    let endIso: string | undefined;
    let totalSecs = 0;

    if (mode === 'timeRange') {
      if (!startTime || !endTime) {
        setErrorMsg('Please specify both start and end time');
        return;
      }
      startIso = `${date}T${startTime}:00`;
      endIso = `${date}T${endTime}:00`;

      const startDt = new Date(startIso);
      const endDt = new Date(endIso);

      if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
        setErrorMsg('Invalid date or time format');
        return;
      }

      if (endDt <= startDt) {
        setErrorMsg('End time must be after start time');
        return;
      }

      if (startDt.getTime() > Date.now() + 60000) {
        setErrorMsg('Cannot log work entries in the future');
        return;
      }

      totalSecs = Math.floor((endDt.getTime() - startDt.getTime()) / 1000);
    } else {
      const hrs = Number(durationHours) || 0;
      const mins = Number(durationMinutes) || 0;
      totalSecs = hrs * 3600 + mins * 60;

      if (totalSecs <= 0) {
        setErrorMsg('Duration must be greater than 0 minutes');
        return;
      }

      startIso = `${date}T${startTime || '09:00'}:00`;
      const startDt = new Date(startIso);
      if (startDt.getTime() > Date.now() + 60000) {
        setErrorMsg('Cannot log work entries in the future');
        return;
      }
      endIso = new Date(startDt.getTime() + totalSecs * 1000).toISOString();
    }

    const payload: WorkLogFormData = {
      taskId: initialTaskId || (typeof editEntry?.task === 'object' ? editEntry?.task?.id : (editEntry?.task as string)),
      projectId: initialProjectId || (typeof editEntry?.project === 'object' ? editEntry?.project?.id : (editEntry?.project as string)),
      workspaceId: initialWorkspaceId,
      organizationId: initialOrgId,
      description,
      date,
      startTime: startIso,
      endTime: endIso,
      duration: totalSecs,
      isBillable,
      billableRate: Number(billableRate) || 0,
    };

    try {
      if (editEntry) {
        await updateMutation.mutateAsync({ id: editEntry.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save work log entry');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              {editEntry ? 'Edit Work Log' : 'Log Time Spent'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Description
            </label>
            <input
              type="text"
              required
              placeholder="What did you work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date Logged
            </label>
            <div className="relative">
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Time Entry Mode Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('duration')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'duration'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Set Duration
            </button>
            <button
              type="button"
              onClick={() => setMode('timeRange')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'timeRange'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Start & End Time
            </button>
          </div>

          {/* Duration mode inputs */}
          {mode === 'duration' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Billable & Rate */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              Is Billable Time
            </label>

            {isBillable && (
              <div className="flex items-center gap-1.5 w-36">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  placeholder="Rate/hr"
                  value={billableRate}
                  onChange={(e) => setBillableRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editEntry
                ? 'Update Log'
                : 'Save Work Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
