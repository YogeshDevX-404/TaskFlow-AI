import React from 'react';
import { WorkPatternHour, WorkPatternWeekday } from '../../types/activityAnalytics';
import { Clock, Calendar } from 'lucide-react';

interface WorkPatternHeatmapProps {
  byHour: WorkPatternHour[];
  byWeekday: WorkPatternWeekday[];
}

export const WorkPatternHeatmap: React.FC<WorkPatternHeatmapProps> = ({ byHour, byWeekday }) => {
  const maxHourCount = Math.max(1, ...byHour.map((h) => h.count));
  const maxWeekdayCount = Math.max(1, ...byWeekday.map((w) => w.count));

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 24-Hour Activity Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-indigo-500" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Activity by Time of Day (24h)</h4>
        </div>

        <div className="h-36 flex items-end gap-1 pt-4 pb-1">
          {byHour.map((h) => {
            const heightPercent = Math.max(4, Math.round((h.count / maxHourCount) * 100));
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-md shadow-lg whitespace-nowrap">
                    {formatHour(h.hour)}: {h.count} actions
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5" />
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    h.count > 0
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Day of the Week Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-violet-500" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Activity by Day of Week</h4>
        </div>

        <div className="space-y-2.5">
          {byWeekday.map((w) => {
            const widthPercent = Math.max(3, Math.round((w.count / maxWeekdayCount) * 100));
            return (
              <div key={w.day} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-semibold text-slate-600 dark:text-slate-300 text-right">{w.day}</span>
                <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg transition-all duration-300 flex items-center justify-end pr-2"
                  >
                    {w.count > 0 && <span className="text-[10px] font-bold text-white leading-none">{w.count}</span>}
                  </div>
                </div>
                <span className="w-12 text-slate-400 text-right font-medium text-[11px]">{w.count} acts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
