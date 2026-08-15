import React, { useState } from 'react';
import { Eye, EyeOff, Users, Check } from 'lucide-react';
import { TaskUserRef } from '../../../types/task';

export interface TaskDetailWatchersProps {
  taskId: string;
  isWatching?: boolean;
  watchersList?: string[] | TaskUserRef[] | any[];
  watcherDetails?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
  onToggleWatch: (id: string) => Promise<void>;
}

export const TaskDetailWatchers: React.FC<TaskDetailWatchersProps> = ({
  taskId,
  isWatching = false,
  watchersList = [],
  watcherDetails = [],
  onToggleWatch,
}) => {
  const [showList, setShowList] = useState(false);
  const count = watcherDetails.length || (Array.isArray(watchersList) ? watchersList.length : 0);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Watchers ({count})
          </h3>
        </div>

        {/* Watch / Unwatch Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleWatch(taskId)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
            isWatching
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isWatching ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Unwatch</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Watch Task</span>
            </>
          )}
        </button>
      </div>

      {/* Watcher Avatars Preview List */}
      <div className="relative">
        <div
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
        >
          <div className="flex -space-x-2 overflow-hidden">
            {watcherDetails.length > 0
              ? watcherDetails.slice(0, 5).map((w, idx) => (
                  <img
                    key={w.id || idx}
                    src={
                      w.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        w.name || 'User'
                      )}`
                    }
                    alt={w.name || 'Watcher'}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                  />
                ))
              : count > 0
              ? Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center"
                  >
                    W
                  </div>
                ))
              : null}
          </div>

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {count === 0
              ? 'No watchers yet'
              : `${count} team member${count === 1 ? '' : 's'} watching updates`}
          </span>
        </div>

        {/* Watchers Details Popover */}
        {showList && count > 0 && (
          <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 px-3 z-50 space-y-2 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span>Watching Users</span>
              <span className="text-[10px] text-slate-400 font-mono">{count} Total</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {watcherDetails.length > 0
                ? watcherDetails.map((w) => (
                    <div key={w.id} className="flex items-center gap-2.5">
                      <img
                        src={
                          w.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            w.name || 'User'
                          )}`
                        }
                        alt={w.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {w.name}
                        </div>
                        {w.email && (
                          <div className="text-[10px] text-slate-400">{w.email}</div>
                        )}
                      </div>
                    </div>
                  ))
                : (
                  <div className="text-xs text-slate-500 py-1">
                    {count} team members watching this task.
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
