import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Layers,
  ZoomIn,
  ZoomOut,
  Clock,
  Flag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Release, RoadmapViewMode, RoadmapZoomLevel } from '../../types/release';
import { format, addMonths, subMonths, parseISO, differenceInDays } from 'date-fns';

interface RoadmapTimelineViewProps {
  releases: Release[];
  viewMode: RoadmapViewMode;
  zoomLevel: RoadmapZoomLevel;
  onChangeViewMode: (mode: RoadmapViewMode) => void;
  onChangeZoomLevel: (level: RoadmapZoomLevel) => void;
  onSelectRelease: (release: Release) => void;
  onUpdateDates: (releaseId: string, startDate?: string, endDate?: string) => void;
}

export const RoadmapTimelineView: React.FC<RoadmapTimelineViewProps> = ({
  releases,
  viewMode,
  zoomLevel,
  onChangeViewMode,
  onChangeZoomLevel,
  onSelectRelease,
  onUpdateDates,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default August 2026

  const handlePrevRange = () => {
    setCurrentDate((prev) => subMonths(prev, viewMode === 'quarter' ? 3 : 1));
  };

  const handleNextRange = () => {
    setCurrentDate((prev) => addMonths(prev, viewMode === 'quarter' ? 3 : 1));
  };

  // Generate Timeline Columns based on viewMode
  const getTimelineColumns = () => {
    if (viewMode === 'quarter') {
      const q1 = new Date(currentDate.getFullYear(), 0, 1);
      const q2 = new Date(currentDate.getFullYear(), 3, 1);
      const q3 = new Date(currentDate.getFullYear(), 6, 1);
      const q4 = new Date(currentDate.getFullYear(), 9, 1);
      return [
        { label: `Q1 ${currentDate.getFullYear()}`, start: q1, end: new Date(currentDate.getFullYear(), 2, 31) },
        { label: `Q2 ${currentDate.getFullYear()}`, start: q2, end: new Date(currentDate.getFullYear(), 5, 30) },
        { label: `Q3 ${currentDate.getFullYear()}`, start: q3, end: new Date(currentDate.getFullYear(), 8, 30) },
        { label: `Q4 ${currentDate.getFullYear()}`, start: q4, end: new Date(currentDate.getFullYear(), 11, 31) },
      ];
    } else if (viewMode === 'month') {
      const months = [];
      for (let i = 0; i < 6; i++) {
        const m = addMonths(currentDate, i - 1);
        months.push({
          label: format(m, 'MMM yyyy'),
          start: new Date(m.getFullYear(), m.getMonth(), 1),
          end: new Date(m.getFullYear(), m.getMonth() + 1, 0),
        });
      }
      return months;
    } else if (viewMode === 'week') {
      const weeks = [];
      for (let i = 0; i < 8; i++) {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + i * 7);
        weeks.push({
          label: `Wk ${format(d, 'w - MMM d')}`,
          start: d,
          end: new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000),
        });
      }
      return weeks;
    } else {
      // General Timeline View
      const months = [];
      for (let i = 0; i < 12; i++) {
        const m = addMonths(new Date(currentDate.getFullYear(), 0, 1), i);
        months.push({
          label: format(m, 'MMM'),
          start: new Date(m.getFullYear(), m.getMonth(), 1),
          end: new Date(m.getFullYear(), m.getMonth() + 1, 0),
        });
      }
      return months;
    }
  };

  const columns = getTimelineColumns();
  const rangeStart = columns[0].start;
  const rangeEnd = columns[columns.length - 1].end;
  const totalDaysInRange = Math.max(1, differenceInDays(rangeEnd, rangeStart));

  // Compute position percentage for a release
  const calculateBarPosition = (release: Release) => {
    const sDate = release.startDate ? parseISO(release.startDate) : parseISO(release.createdAt);
    const eDate = release.releaseDate
      ? parseISO(release.releaseDate)
      : release.endDate
      ? parseISO(release.endDate)
      : addMonths(sDate, 1);

    const startOffsetDays = differenceInDays(sDate, rangeStart);
    const durationDays = Math.max(7, differenceInDays(eDate, sDate));

    let leftPct = (startOffsetDays / totalDaysInRange) * 100;
    let widthPct = (durationDays / totalDaysInRange) * 100;

    leftPct = Math.max(0, Math.min(95, leftPct));
    widthPct = Math.max(5, Math.min(100 - leftPct, widthPct));

    return { left: `${leftPct}%`, width: `${widthPct}%` };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5">
      {/* View Mode Controls & Zoom Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        {/* Navigation & Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onChangeViewMode('quarter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'quarter'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => onChangeViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onChangeViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onChangeViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Timeline
            </button>
          </div>

          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevRange}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
              {format(rangeStart, 'MMM yyyy')} - {format(rangeEnd, 'MMM yyyy')}
            </span>
            <button
              onClick={handleNextRange}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zoom Level Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Zoom:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => onChangeZoomLevel('compact')}
              className={`px-2.5 py-1 text-2xs font-bold rounded ${
                zoomLevel === 'compact'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => onChangeZoomLevel('normal')}
              className={`px-2.5 py-1 text-2xs font-bold rounded ${
                zoomLevel === 'normal'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => onChangeZoomLevel('detailed')}
              className={`px-2.5 py-1 text-2xs font-bold rounded ${
                zoomLevel === 'detailed'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid Header */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Columns */}
          <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 py-3 px-4 font-bold text-xs text-slate-600 dark:text-slate-300">
            <div className="col-span-4 border-r border-slate-200 dark:border-slate-700 pr-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Release & Versions ({releases.length})
            </div>
            <div className="col-span-8 grid grid-cols-4 text-center">
              {columns.map((col, idx) => (
                <div key={idx} className="border-r last:border-r-0 border-slate-200 dark:border-slate-700 px-2 truncate">
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {releases.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No releases match current roadmap filters.
              </div>
            ) : (
              releases.map((rel) => {
                const pos = calculateBarPosition(rel);
                const projectObj = typeof rel.project === 'object' ? rel.project : null;

                return (
                  <div
                    key={rel.id}
                    className="grid grid-cols-12 items-center py-3.5 px-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Left: Release Details */}
                    <div className="col-span-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-2xs font-extrabold uppercase"
                          style={{
                            backgroundColor: `${rel.color || '#6366f1'}20`,
                            color: rel.color || '#6366f1',
                          }}
                        >
                          v{rel.version}
                        </span>
                        <span
                          onClick={() => onSelectRelease(rel)}
                          className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer line-clamp-1"
                        >
                          {rel.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-slate-400 mt-1">
                        <span>{projectObj?.name || 'Project'}</span>
                        <span>•</span>
                        <span>{rel.progress}% done</span>
                        <span>•</span>
                        <span className="text-slate-500 font-medium">{rel.status}</span>
                      </div>
                    </div>

                    {/* Right: Timeline Bar */}
                    <div className="col-span-8 relative h-10 bg-slate-50/80 dark:bg-slate-800/30 rounded-xl p-1 flex items-center">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => onSelectRelease(rel)}
                        className="absolute h-8 rounded-lg shadow-xs px-3 flex items-center justify-between text-xs font-bold text-white cursor-pointer transition-all border"
                        style={{
                          left: pos.left,
                          width: pos.width,
                          backgroundColor: rel.color || '#6366f1',
                          borderColor: `${rel.color || '#6366f1'}80`,
                        }}
                      >
                        <span className="truncate pr-2">
                          v{rel.version} - {rel.name}
                        </span>
                        <span className="text-2xs opacity-90 font-mono">
                          {rel.progress}%
                        </span>
                      </motion.div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
