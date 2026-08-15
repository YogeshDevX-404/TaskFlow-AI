import React from 'react';
import { motion } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Flag,
  Clock,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { useGanttStore } from '../../store/useGanttStore';
import { CalendarEvent } from '../../types/calendar';

interface GanttChartProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenCreateModal: () => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  onSelectEvent,
  onOpenCreateModal,
}) => {
  const {
    events,
    zoomLevel,
    setZoomLevel,
    showCriticalPath,
    setShowCriticalPath,
    showDependencies,
    setShowDependencies,
    showBaselines,
    setShowBaselines,
    updateEventDates,
  } = useGanttStore();

  const minDate = React.useMemo(() => {
    if (events.length === 0) return new Date();
    const dates = events.map((e) => new Date(e.startDate).getTime());
    return new Date(Math.min(...dates) - 3 * 24 * 60 * 60 * 1000);
  }, [events]);

  const maxDate = React.useMemo(() => {
    if (events.length === 0) return addDays(new Date(), 30);
    const dates = events.map((e) => new Date(e.endDate).getTime());
    return new Date(Math.max(...dates) + 7 * 24 * 60 * 60 * 1000);
  }, [events]);

  const totalChartDays = Math.max(differenceInDays(maxDate, minDate), 20);

  const getBarPosition = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const offsetDays = Math.max(0, differenceInDays(start, minDate));
    const durationDays = Math.max(1, differenceInDays(end, start) + 1);

    const left = (offsetDays / totalChartDays) * 100;
    const width = (durationDays / totalChartDays) * 100;

    return {
      left: `${Math.min(Math.max(left, 0), 98)}%`,
      width: `${Math.max(width, 1.5)}%`,
    };
  };

  return (
    <div className="space-y-4">
      {/* Gantt Toolbar Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showCriticalPath}
              onChange={(e) => setShowCriticalPath(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-rose-500" />
              Critical Path
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showDependencies}
              onChange={(e) => setShowDependencies(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
            />
            <span>Show Dependencies</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showBaselines}
              onChange={(e) => setShowBaselines(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
            />
            <span>Compare Baseline</span>
          </label>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {(['day', 'week', 'month', 'quarter'] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoomLevel(z)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                zoomLevel === z
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Row */}
          <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 py-3 px-4 font-bold text-xs text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Work Item / Deliverable</div>
            <div className="col-span-8 relative flex justify-between px-2">
              <span>{format(minDate, 'MMM d, yyyy')}</span>
              <span>{format(addDays(minDate, Math.floor(totalChartDays / 2)), 'MMM d, yyyy')}</span>
              <span>{format(maxDate, 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Task Gantt Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {events.map((evt) => {
              const pos = getBarPosition(evt.startDate, evt.endDate);
              const isUrgentOrCritical = showCriticalPath && (evt.priority === 'Urgent' || evt.priority === 'High');

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="grid grid-cols-12 items-center py-3 px-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  {/* Left Metadata Column */}
                  <div className="col-span-4 pr-4 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: evt.color || '#6366f1' }}
                      />
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {evt.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {evt.eventType}
                      </span>
                      <span>•</span>
                      <span>{evt.progress}% done</span>
                    </div>
                  </div>

                  {/* Right Bar Timeline Column */}
                  <div className="col-span-8 relative h-8 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg p-1 flex items-center">
                    <div
                      className={`absolute h-6 rounded-md shadow-xs px-2 flex items-center justify-between text-xs font-bold transition-all border ${
                        isUrgentOrCritical
                          ? 'ring-2 ring-rose-500/80 bg-rose-500 text-white'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                      style={{
                        left: pos.left,
                        width: pos.width,
                        backgroundColor: isUrgentOrCritical ? '#ef4444' : `${evt.color || '#6366f1'}35`,
                        borderColor: evt.color || '#6366f1',
                      }}
                    >
                      {/* Progress Overlay */}
                      <div
                        className="absolute left-0 top-0 bottom-0 rounded-l-md opacity-40"
                        style={{
                          width: `${evt.progress || 0}%`,
                          backgroundColor: evt.color || '#6366f1',
                        }}
                      />

                      <span className="relative z-10 truncate text-[11px] font-bold">
                        {evt.title}
                      </span>

                      <span className="relative z-10 text-[10px] opacity-80 shrink-0 ml-1">
                        {evt.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
