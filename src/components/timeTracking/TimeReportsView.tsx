import React, { useState } from 'react';
import { useTimeReports } from '../../hooks/useTimeEntries';
import { TimeEntryFilterParams } from '../../types/timeEntry';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  User,
  FolderKanban,
  CheckSquare,
  Zap,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
} from 'lucide-react';

export const TimeReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<'user' | 'project' | 'task' | 'sprint'>('user');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filters: TimeEntryFilterParams = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading, isError } = useTimeReports(filters);

  const overview = data?.overview || {
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0,
    totalEntries: 0,
    totalBillableAmount: 0,
  };

  const byMember = data?.byMember || [];
  const byTask = data?.byTask || [];
  const dailyTrend = data?.dailyTrend || [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Time Tracking Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise insights into team productivity, estimated vs actual hours, and billable utilization
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
          />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Hours Logged
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {overview.totalHours} hrs
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {overview.totalEntries} total work logs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">
            Billable Utilization
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {overview.totalHours > 0
              ? Math.round((overview.billableHours / overview.totalHours) * 100)
              : 0}
            %
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {overview.billableHours} billable hrs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block">
            Non-Billable Time
          </span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1 block">
            {overview.nonBillableHours} hrs
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Internal & overhead</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider block">
            Total Billable Amount
          </span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            ${overview.totalBillableAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Generated revenue</span>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold w-fit">
        <button
          onClick={() => setReportType('user')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'user'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User Time Report</span>
        </button>

        <button
          onClick={() => setReportType('project')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'project'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Project Time Report</span>
        </button>

        <button
          onClick={() => setReportType('task')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'task'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Task Time Report</span>
        </button>

        <button
          onClick={() => setReportType('sprint')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'sprint'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-indigo-500" />
          <span>Sprint Time Report</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Generating report charts...</div>
      ) : isError ? (
        <div className="p-12 text-center text-rose-500 text-sm">Failed to load report data.</div>
      ) : (
        <div className="space-y-6">
          {/* Daily Trend Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Daily Logged Hours Trend
            </h3>
            <div className="h-64 w-full">
              {dailyTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No trend data available for selected range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalHours"
                      name="Total Hours"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="billableHours"
                      name="Billable Hours"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tab Specific Content */}
          {reportType === 'user' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Member Hours Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                  Hours Logged by Team Member
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byMember}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="totalHours" name="Total Hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="billableHours" name="Billable Hours" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Member Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm overflow-hidden">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Team Member Time Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase">
                        <th className="py-2.5 px-3">Member</th>
                        <th className="py-2.5 px-3">Total Hrs</th>
                        <th className="py-2.5 px-3">Billable Hrs</th>
                        <th className="py-2.5 px-3 text-right">Logs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {byMember.map((m) => (
                        <tr key={m.userId}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {m.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {m.totalHours}h
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                            {m.billableHours}h
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {m.entryCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(reportType === 'project' || reportType === 'task' || reportType === 'sprint') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Task Time & Estimates (Estimated vs Actual)
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTask}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="taskKey" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="estimatedHours" name="Estimated (hrs)" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="actualHours" name="Actual Spent (hrs)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase">
                      <th className="py-2.5 px-3">Task Key</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Estimated</th>
                      <th className="py-2.5 px-3">Actual Spent</th>
                      <th className="py-2.5 px-3">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {byTask.map((t) => (
                      <tr key={t.taskId}>
                        <td className="py-2.5 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          {t.taskKey}
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">
                          {t.title}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {t.estimatedHours}h
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {t.actualHours}h
                        </td>
                        <td
                          className={`py-2.5 px-3 font-mono ${
                            t.remainingHours === 0 && t.actualHours > t.estimatedHours
                              ? 'text-rose-500 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {t.remainingHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
