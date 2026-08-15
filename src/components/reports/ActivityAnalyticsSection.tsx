import React from 'react';
import { ActivityAnalytics } from '../../types/reports';
import { Activity, ShieldAlert, Clock, User } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ActivityAnalyticsSectionProps {
  data?: ActivityAnalytics;
  isLoading: boolean;
}

const ACTION_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

export const ActivityAnalyticsSection: React.FC<ActivityAnalyticsSectionProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action Breakdown */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Audit Log Distribution
          </h4>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.actionBreakdown}
                  dataKey="count"
                  nameKey="action"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {data.actionBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-center text-slate-500 font-medium">
            Total Logged Events: <span className="font-bold text-slate-900 dark:text-white">{data.totalLogs}</span>
          </p>
        </div>

        {/* Recent Audit Timeline Feed */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            System Activity Log Stream
          </h4>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {data.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center">No system activity logged in this date range.</p>
            ) : (
              data.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {act.userAvatar ? (
                      <img src={act.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {act.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white mr-1.5">{act.userName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {act.action}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
