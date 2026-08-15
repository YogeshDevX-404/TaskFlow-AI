import React from 'react';
import { DashboardQuickStats } from '../../types/dashboard';
import {
  Users,
  CheckCircle2,
  Clock,
  Bug,
  TrendingUp,
  ListTodo,
} from 'lucide-react';

interface QuickStatsCardsProps {
  stats?: DashboardQuickStats;
}

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({ stats }) => {
  const defaultStats: DashboardQuickStats = {
    totalMembers: 6,
    totalTasks: 148,
    completedTasks: 96,
    pendingTasks: 42,
    openBugs: 10,
    progressPercentage: 65,
  };

  const s = stats || defaultStats;

  const cardItems = [
    {
      title: 'Total Members',
      value: s.totalMembers,
      subtext: 'Active project team',
      icon: Users,
      color: 'indigo',
      badge: '+2 this month',
      badgePositive: true,
    },
    {
      title: 'Total Tasks',
      value: s.totalTasks,
      subtext: 'Across all active sprints',
      icon: ListTodo,
      color: 'blue',
      badge: 'Sprint 15',
      badgePositive: true,
    },
    {
      title: 'Completed Tasks',
      value: s.completedTasks,
      subtext: 'Resolved & deployed',
      icon: CheckCircle2,
      color: 'emerald',
      badge: '65% done',
      badgePositive: true,
    },
    {
      title: 'Pending Tasks',
      value: s.pendingTasks,
      subtext: 'In progress / review',
      icon: Clock,
      color: 'amber',
      badge: '42 items',
      badgePositive: false,
    },
    {
      title: 'Open Bugs',
      value: s.openBugs,
      subtext: 'Critical & high priority',
      icon: Bug,
      color: 'rose',
      badge: '-3 resolved',
      badgePositive: true,
    },
    {
      title: 'Progress Percentage',
      value: `${s.progressPercentage}%`,
      subtext: 'Overall roadmap completion',
      icon: TrendingUp,
      color: 'purple',
      badge: 'On schedule',
      badgePositive: true,
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800/40',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/50',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800/40',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/50',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-200 dark:border-rose-800/40',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/50',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800/40',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/50',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800/40',
        };
      default:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/50',
          text: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-200 dark:border-indigo-800/40',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cardItems.map((item) => {
        const Icon = item.icon;
        const colorStyle = getColorClasses(item.color);

        return (
          <div
            key={item.title}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {item.title}
              </span>
              <div
                className={`p-2 rounded-xl ${colorStyle.bg} ${colorStyle.text} shrink-0 transition-transform group-hover:scale-110`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {item.value}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{item.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
