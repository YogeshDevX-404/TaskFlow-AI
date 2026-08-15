import React from 'react';
import { motion } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  Layers,
  Flag,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { format, addDays, subDays, addMonths, subMonths, differenceInDays } from 'date-fns';
import { useTimelineStore, TimelineGroupBy } from '../../store/useTimelineStore';
import { CalendarEvent, TimelineZoomLevel } from '../../types/calendar';

interface TimelineViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenCreateModal: () => void;
}

const ZOOM_OPTIONS: { label: string; value: TimelineZoomLevel }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
];

const GROUP_OPTIONS: { label: string; value: TimelineGroupBy }[] = [
  { label: 'Project', value: 'project' },
  { label: 'Sprint', value: 'sprint' },
  { label: 'Status', value: 'status' },
  { label: 'Event Type', value: 'eventType' },
];

export const TimelineView: React.FC<TimelineViewProps> = ({
  onSelectEvent,
  onOpenCreateModal,
}) => {
  const {
    events,
    zoomLevel,
    setZoomLevel,
    groupBy,
    setGroupBy,
    startDate,
    endDate,
    setDateRange,
  } = useTimelineStore();

  const handlePrevRange = () => {
    setDateRange(subMonths(startDate, 1), subMonths(endDate, 1));
  };

  const handleNextRange = () => {
    setDateRange(addMonths(startDate, 1), addMonths(endDate, 1));
  };

  // Group events by selected category
  const groupedEvents = React.useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};

    events.forEach((evt) => {
      let key = 'Unassigned';
      if (groupBy === 'project') {
        key = typeof evt.project === 'object' && evt.project ? evt.project.name : evt.project || 'General Roadmap';
      } else if (groupBy === 'sprint') {
        key = typeof evt.sprint === 'object' && evt.sprint ? evt.sprint.name : evt.sprint || 'Backlog / Release';
      } else if (groupBy === 'status') {
        key = evt.status || 'Planned';
      } else if (groupBy === 'eventType') {
        key = evt.eventType || 'Other';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(evt);
    });

    return groups;
  }, [events, groupBy]);

  const totalDays = Math.max(differenceInDays(endDate, startDate), 30);

  const calculatePosition = (evtStart: string, evtEnd: string) => {
    const s = new Date(evtStart);
    const e = new Date(evtEnd);

    const startOffset = Math.max(0, differenceInDays(s, startDate));
    const duration = Math.max(1, differenceInDays(e, s) + 1);

    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${Math.min(Math.max(leftPercent, 0), 98)}%`,
      width: `${Math.max(widthPercent, 1.5)}%`,
    };
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
            <button
              onClick={handlePrevRange}
              className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextRange}
              className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {format(startDate, 'MMM yyyy')} - {format(endDate, 'MMM yyyy')}
          </span>
        </div>

        {/* Group By & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Layers className="w-4 h-4" />
            <span>Group:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as TimelineGroupBy)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            >
              {GROUP_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {ZOOM_OPTIONS.map((z) => (
              <button
                key={z.value}
                onClick={() => setZoomLevel(z.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  zoomLevel === z.value
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Timeline Roadmap Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Axis */}
          <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 py-2.5 px-4">
            <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {groupBy.toUpperCase()} CATEGORY
            </div>
            <div className="col-span-9 relative flex justify-between text-xs font-semibold text-slate-500 px-2">
              <span>{format(startDate, 'MMM d, yyyy')}</span>
              <span>
                {format(addDays(startDate, Math.floor(totalDays / 2)), 'MMM d, yyyy')}
              </span>
              <span>{format(endDate, 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Grouped Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {(Object.entries(groupedEvents) as [string, CalendarEvent[]][]).map(([groupName, groupEvts]) => (
              <div key={groupName} className="grid grid-cols-12 items-center py-4 px-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <div className="col-span-3 font-semibold text-sm text-slate-900 dark:text-slate-100 pr-4 truncate">
                  {groupName}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({groupEvts.length})
                  </span>
                </div>

                <div className="col-span-9 relative h-10 bg-slate-100/60 dark:bg-slate-800/40 rounded-lg p-1 flex items-center">
                  {groupEvts.map((evt) => {
                    const pos = calculatePosition(evt.startDate, evt.endDate);
                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        style={{ left: pos.left, width: pos.width }}
                        className="absolute h-7 rounded-md shadow-xs px-2.5 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] hover:z-10 group overflow-hidden border border-black/10"
                        title={`${evt.title} (${evt.startDate} to ${evt.endDate})`}
                      >
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{ backgroundColor: evt.color || '#6366f1' }}
                        />
                        <div
                          className="absolute left-0 top-0 bottom-0 opacity-40"
                          style={{
                            width: `${evt.progress || 0}%`,
                            backgroundColor: evt.color || '#6366f1',
                          }}
                        />

                        <span className="relative z-10 truncate text-slate-900 dark:text-slate-100 font-bold">
                          {evt.isMilestone ? '🚩 ' : ''}
                          {evt.title}
                        </span>

                        <span className="relative z-10 text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                          {evt.progress}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
