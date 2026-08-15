import React from 'react';
import { Task } from '../../../types/task';
import { History, Loader2 } from 'lucide-react';
import { useTaskActivity } from '../../../hooks/useActivity';
import { ActivityTimelineItem } from '../../activity/ActivityTimelineItem';

export interface TaskDetailHistoryProps {
  task: Task;
}

export const TaskDetailHistory: React.FC<TaskDetailHistoryProps> = ({ task }) => {
  const { data, isLoading, error } = useTaskActivity(task.id);

  const activities = data?.activities || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Task Activity Audit Trail
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {activities.length} event{activities.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading task activity logs...
        </div>
      ) : activities.length > 0 ? (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          {activities.map((act) => (
            <ActivityTimelineItem key={act.id} activity={act} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No audit entries recorded for this task yet.
        </div>
      )}
    </div>
  );
};
