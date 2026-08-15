import React, { useState } from 'react';
import { useWorkloadCalendar, useTeamWorkload } from '../../hooks/useWorkload';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';

interface WorkloadCalendarViewProps {
  organizationId?: string;
  workspaceId?: string;
}

export const WorkloadCalendarView: React.FC<WorkloadCalendarViewProps> = ({
  organizationId,
  workspaceId,
}) => {
  // Current view range (default: 7 days starting from today)
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const numDays = 7;

  // Generate date columns
  const dateColumns = Array.from({ length: numDays }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const endDate = dateColumns[dateColumns.length - 1];

  const startDateIso = startDate.toISOString().split('T')[0];
  const endDateIso = endDate.toISOString().split('T')[0];

  const { data: calendarData, isLoading: isCalendarLoading } = useWorkloadCalendar({
    organizationId,
    workspaceId,
    startDate: startDateIso,
    endDate: endDateIso,
  });

  const { data: teamData } = useTeamWorkload({ organizationId, workspaceId });
  const members = teamData?.members || [];
  const entries = calendarData?.calendar || [];

  // Map entries for quick lookup: mapKey = `${userId}_${dateIso}`
  const entryMap = new Map<string, any>();
  entries.forEach((e) => {
    entryMap.set(`${e.userId}_${e.date}`, e);
  });

  const navigateDays = (days: number) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + days);
    setStartDate(next);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Workload Timeline & Calendar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daily work allocation and capacity per team member
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => navigateDays(-7)}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-slate-900 dark:text-white">
            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateDays(7)}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isCalendarLoading ? (
        <div className="py-12 text-center animate-pulse text-xs text-slate-400">
          Loading calendar timeline data...
        </div>
      ) : members.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
          No active team members available for calendar view.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                  Member
                </th>
                {dateColumns.map((d) => {
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const isToday = new Date().toDateString() === d.toDateString();

                  return (
                    <th
                      key={d.toISOString()}
                      className={`py-2.5 px-3 text-center min-w-[120px] ${
                        isToday ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold' : ''
                      }`}
                    >
                      <div>{dayName}</div>
                      <div className="text-xs text-slate-900 dark:text-white font-bold">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.userId} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                  {/* Member column */}
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {m.user.avatar ? (
                          <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                        ) : (
                          m.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="truncate min-w-0">
                        <div className="truncate font-semibold">{m.user.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Cap: {m.capacity.dailyCapacityHours}h/day
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date columns */}
                  {dateColumns.map((d) => {
                    const dateIso = d.toISOString().split('T')[0];
                    const entry = entryMap.get(`${m.userId}_${dateIso}`);
                    const dailyCap = m.capacity.dailyCapacityHours || 8;
                    const estHours = entry?.estimatedHours || 0;
                    const taskCount = entry?.assignedTasksCount || 0;

                    const util = dailyCap > 0 ? Math.round((estHours / dailyCap) * 100) : 0;

                    let bgClass = 'bg-slate-50/30 dark:bg-slate-800/20 text-slate-400';
                    if (taskCount > 0) {
                      if (util > 100) {
                        bgClass = 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-900';
                      } else if (util >= 85) {
                        bgClass = 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-900';
                      } else {
                        bgClass = 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900';
                      }
                    }

                    return (
                      <td key={dateIso} className="py-2.5 px-2 text-center align-top">
                        {taskCount > 0 ? (
                          <div
                            className={`p-2 rounded-xl text-xs space-y-1 ${bgClass}`}
                            title={`${taskCount} tasks scheduled (${estHours}h estimated / ${dailyCap}h capacity)`}
                          >
                            <div className="font-bold flex items-center justify-center gap-1">
                              <span>{estHours}h</span>
                              <span className="text-[10px] opacity-75">/ {dailyCap}h</span>
                            </div>
                            <div className="text-[10px] font-medium opacity-90">
                              {taskCount} task{taskCount > 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-300 dark:text-slate-700 py-3">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
