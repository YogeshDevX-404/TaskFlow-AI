import React, { useState } from 'react';
import { useSprintReport, useSprintVelocityReport } from '../../hooks/useReports';
import { ReportFilterParams } from '../../types/reports';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Zap, Flame, TrendingUp, CheckCircle2, Target } from 'lucide-react';

interface SprintAnalyticsSectionProps {
  sprints?: Array<{ id: string; name: string }>;
  filters: ReportFilterParams;
}

export const SprintAnalyticsSection: React.FC<SprintAnalyticsSectionProps> = ({
  sprints = [],
  filters,
}) => {
  const [selectedSprintId, setSelectedSprintId] = useState<string>(sprints[0]?.id || '');
  const [velocityLimit, setVelocityLimit] = useState<number>(5);

  const { data, isLoading } = useSprintReport(selectedSprintId || sprints[0]?.id, filters);
  const { data: velocityData, isLoading: velocityLoading } = useSprintVelocityReport(
    velocityLimit,
    filters
  );

  return (
    <div className="space-y-4">
      {/* Sprint Header & Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Agile Sprint Analytics, Burndown & Velocity Engine
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Sprint:</span>
            <select
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">Latest Active Sprint</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sprint Overview Metrics */}
        {data?.sprint && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-500" /> Goal
              </span>
              <p className="font-bold text-slate-900 dark:text-white truncate mt-1">
                {data.sprint.goal || 'Sprint Objectives'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Story Points</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">
                {data.storyPointsSummary.completed} / {data.storyPointsSummary.total} pts ({data.completionPercentage}%)
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {data.sprint.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Velocity</span>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {data.sprint.velocity} pts/sprint
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Burndown & Burnup Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Burndown Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            Sprint Burndown Chart (Remaining Story Points)
          </h4>

          {isLoading ? (
            <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.burndownChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="idealRemaining"
                    name="Ideal Burndown"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualRemaining"
                    name="Actual Remaining"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Burnup Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Sprint Burnup Chart (Total Scope vs Completed)
          </h4>

          {isLoading ? (
            <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.burnupChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scopeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="completedWorkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="totalScope"
                    name="Total Scope"
                    stroke="#3b82f6"
                    fill="url(#scopeGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="completedWork"
                    name="Completed Work"
                    stroke="#10b981"
                    fill="url(#completedWorkGrad)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Historical Velocity Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            Historical Sprint Velocity Comparison
          </h4>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Show Sprints:</span>
            {[3, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => setVelocityLimit(num)}
                className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                  velocityLimit === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {velocityLoading ? (
          <div className="h-56 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="sprintName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="plannedPoints" name="Planned Points" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completedPoints" name="Completed Points (Velocity)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
