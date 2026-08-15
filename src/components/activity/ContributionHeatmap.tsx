import React, { useMemo, useState } from 'react';
import { ContributionHeatmapDay } from '../../types/activityAnalytics';
import { GitCommit, GitPullRequest, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContributionHeatmapProps {
  days: ContributionHeatmapDay[];
  title?: string;
  subtitle?: string;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  days,
  title = 'Annual Contribution Graph',
  subtitle = 'Contributions across Commits, Pull Requests, Code Reviews, and Tasks',
}) => {
  const [hoveredDay, setHoveredDay] = useState<ContributionHeatmapDay | null>(null);

  // Group days into 52/53 weeks of 7 days
  const { weeks, monthLabels, totalContributions } = useMemo(() => {
    let total = 0;
    const sortedDays = [...days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate total
    sortedDays.forEach((d) => {
      total += d.count;
    });

    const weeksList: (ContributionHeatmapDay | null)[][] = [];
    let currentWeek: (ContributionHeatmapDay | null)[] = [];

    if (sortedDays.length > 0) {
      const firstDate = new Date(sortedDays[0].date);
      const firstDayOfWeek = firstDate.getDay(); // 0 = Sun, 1 = Mon ...

      // Fill leading nulls for first week
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }

      sortedDays.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeksList.push(currentWeek);
          currentWeek = [];
        }
      });

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeksList.push(currentWeek);
      }
    }

    // Generate month label positions
    const months: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksList.forEach((week, wIdx) => {
      const firstNonNull = week.find((d) => d !== null);
      if (firstNonNull) {
        const d = new Date(firstNonNull.date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          months.push({
            name: d.toLocaleString('default', { month: 'short' }),
            weekIndex: wIdx,
          });
          lastMonth = m;
        }
      }
    });

    return { weeks: weeksList, monthLabels: months, totalContributions: total };
  }, [days]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800/40 text-emerald-800';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600 text-emerald-900';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400 text-white';
      case 4:
        return 'bg-emerald-700 dark:bg-emerald-400 border-emerald-800 dark:border-emerald-300 text-white';
      case 0:
      default:
        return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40';
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            {title}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {totalContributions.toLocaleString()} contributions
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          <span>Less</span>
          <div className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700" />
          <div className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800" />
          <div className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600" />
          <div className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400" />
          <div className="w-3 h-3 rounded-xs bg-emerald-700 dark:bg-emerald-400 border border-emerald-800 dark:border-emerald-300" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid container */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          {/* Months header */}
          <div className="flex text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5 ml-8 h-4 relative">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                style={{ position: 'absolute', left: `${m.weekIndex * 15.5}px` }}
                className="whitespace-nowrap"
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[9px] font-medium text-slate-400 dark:text-slate-500 pr-1 select-none h-[112px]">
              <span className="h-3 leading-3">Sun</span>
              <span className="h-3 leading-3">Tue</span>
              <span className="h-3 leading-3">Thu</span>
              <span className="h-3 leading-3">Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${wIdx}-${dIdx}`}
                          className="w-3 h-3 rounded-xs bg-transparent"
                        />
                      );
                    }

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-xs border cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 hover:ring-2 hover:ring-indigo-500/50 ${getCellColor(
                          day.level
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Card for Selected / Hovered Day */}
      <div className="min-h-[44px] mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {hoveredDay ? (
          <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">
              {new Date(hoveredDay.date).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
              {hoveredDay.commits > 0 && (
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3 text-indigo-500" />
                  {hoveredDay.commits} commits
                </span>
              )}
              {hoveredDay.pullRequests > 0 && (
                <span className="flex items-center gap-1">
                  <GitPullRequest className="w-3 h-3 text-violet-500" />
                  {hoveredDay.pullRequests} PRs
                </span>
              )}
              {hoveredDay.reviews > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-amber-500" />
                  {hoveredDay.reviews} reviews
                </span>
              )}
              {hoveredDay.tasks > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {hoveredDay.tasks} tasks
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic">
            Hover over any square above to inspect daily activity breakdown
          </span>
        )}
      </div>
    </div>
  );
};
