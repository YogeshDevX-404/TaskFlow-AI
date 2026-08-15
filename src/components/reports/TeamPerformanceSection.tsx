import React, { useState } from 'react';
import { TeamPerformanceItem } from '../../types/reports';
import { Search, UserCheck, AlertTriangle, CheckCircle2, Clock, ArrowUpDown } from 'lucide-react';

interface TeamPerformanceSectionProps {
  data?: TeamPerformanceItem[];
  isLoading: boolean;
}

export const TeamPerformanceSection: React.FC<TeamPerformanceSectionProps> = ({
  data = [],
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof TeamPerformanceItem>('assignedTasks');
  const [sortAsc, setSortAsc] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const handleSort = (field: keyof TeamPerformanceItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = data
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            Team Member Productivity & Workload Metrics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of tasks completed, pending bottlenecks, and completion efficiency.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Team Member <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('assignedTasks')}>
                <div className="flex items-center gap-1">
                  Assigned <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('completedTasks')}>
                <div className="flex items-center gap-1">
                  Completed <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('openTasks')}>
                <div className="flex items-center gap-1">
                  Open <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('overdueTasks')}>
                <div className="flex items-center gap-1">
                  Overdue <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('completionRate')}>
                <div className="flex items-center gap-1">
                  Completion Rate <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No team members matching your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {item.assignedTasks}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.completedTasks}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    {item.openTasks}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        item.overdueTasks > 0
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.overdueTasks}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 w-36">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px] w-8 text-right">
                        {item.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
