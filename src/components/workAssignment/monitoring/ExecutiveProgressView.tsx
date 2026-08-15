import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { IAssignmentDashboardSummary } from '../../../types/workAssignment';
import {
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface ExecutiveProgressViewProps {
  summary: IAssignmentDashboardSummary | null;
  onNavigateTab: (tab: 'overview' | 'developers' | 'review-queue' | 'attention-needed' | 'projects') => void;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981', // emerald-500
  'In Progress': '#0ea5e9', // sky-500
  Acknowledged: '#6366f1', // indigo-500
  Assigned: '#8b5cf6', // violet-500
  Submitted: '#a855f7', // purple-500
  'Changes Requested': '#f59e0b', // amber-500
  Blocked: '#f43f5e', // rose-500
  Cancelled: '#64748b', // slate-500
  Archived: '#94a3b8', // slate-400
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: '#ef4444',
  High: '#f97316',
  Medium: '#3b82f6',
  Low: '#64748b',
};

export const ExecutiveProgressView: React.FC<ExecutiveProgressViewProps> = ({
  summary,
  onNavigateTab,
}) => {
  if (!summary) return null;

  // Prepare Donut Chart Data
  const statusData = Object.entries(summary.statusCounts || {})
    .filter(([_, count]) => (count as number) > 0)
    .map(([status, count]) => ({
      name: status,
      value: count as number,
      color: STATUS_COLORS[status] || '#cbd5e1',
    }));

  // Prepare Priority Bar Data
  const priorityData = Object.entries(summary.priorityCounts || {}).map(([priority, count]) => ({
    priority,
    count: count as number,
    fill: PRIORITY_COLORS[priority] || '#94a3b8',
  }));

  // Custom Pie Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = summary.totalAssignments > 0
        ? Math.round((data.value / summary.totalAssignments) * 100)
        : 0;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span>{data.name}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {data.value} assignment{data.value !== 1 ? 's' : ''} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Status Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of {summary.totalAssignments} total assignments
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {summary.completionRate}% Complete
              </span>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No assignments created yet</div>
            )}
          </div>

          {/* Status Legend Pills */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            {statusData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority & Workload Demand Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Priority & Urgency Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workload priority tier concentration
              </p>
            </div>
            {summary.priorityCounts?.Urgent > 0 && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {summary.priorityCounts.Urgent} Urgent
              </span>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xl text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.priority} Priority:</span>{' '}
                          <span className="font-bold">{item.count} items</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-2 text-center text-xs">
            {priorityData.map((p) => (
              <div key={p.priority} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-500 block">{p.priority}</span>
                <span className="font-bold text-slate-900 dark:text-white">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Velocity & Time Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Team Progress Progress Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
              Team Progress Velocity
            </span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{summary.avgProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.avgProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Based on explicit developer-reported milestones across active assignments.
          </p>
        </div>

        {/* Deliverable Review Backlog */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
              Submission Review Queue
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
              summary.reviewQueueCount > 0
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}>
              {summary.reviewQueueCount} Pending
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 my-2">
            {summary.reviewQueueCount > 0
              ? `${summary.reviewQueueCount} work deliverables are awaiting manager sign-off or change feedback.`
              : 'All submitted deliverables have been reviewed.'}
          </p>

          <button
            onClick={() => onNavigateTab('review-queue')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer self-start"
          >
            <span>Open Review Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Attention Needed Triage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Blockers & Deadlines
            </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {summary.blockedCount + summary.overdueCount} Critical
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 my-2">
            {summary.blockedCount} blocked item{summary.blockedCount !== 1 ? 's' : ''} and {summary.overdueCount} overdue deadline{summary.overdueCount !== 1 ? 's' : ''} requiring managerial assistance.
          </p>

          <button
            onClick={() => onNavigateTab('attention-needed')}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 cursor-pointer self-start"
          >
            <span>Triage Blockers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
