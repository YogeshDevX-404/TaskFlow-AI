import React from 'react';
import { ExecutiveOverview } from '../../types/reports';
import {
  Building2,
  FolderKanban,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface ExecutiveOverviewSectionProps {
  data?: ExecutiveOverview;
  isLoading: boolean;
}

export const ExecutiveOverviewSection: React.FC<ExecutiveOverviewSectionProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: 'Total Projects',
      value: data.totalProjects,
      subtext: `${data.activeProjects} active · ${data.completedProjects} done`,
      icon: Briefcase,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Total Tasks',
      value: data.totalTasks,
      subtext: `${data.completedTasks} completed`,
      icon: PieIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate}%`,
      subtext: `${data.completedTasks} / ${data.totalTasks} tasks`,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Overdue Tasks',
      value: data.overdueTasks,
      subtext: 'Requires attention',
      icon: Clock,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Blocked Tasks',
      value: data.blockedTasks,
      subtext: 'Dependency impediments',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Active Members',
      value: data.activeMembers,
      subtext: 'Team collaborators',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Workspaces',
      value: data.totalWorkspaces,
      subtext: 'Collaborative hubs',
      icon: FolderKanban,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Organizations',
      value: data.totalOrganizations,
      subtext: 'Enterprise tenants',
      icon: Building2,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-500/10 border-slate-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Executive Level High-Level Key Performance Indicators
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${card.bg} transition hover:shadow-md flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2">
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
