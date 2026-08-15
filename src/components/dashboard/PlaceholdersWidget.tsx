import React from 'react';
import { TimelinePhase, UpcomingDeadline, PinnedItem } from '../../types/dashboard';
import {
  Calendar,
  Clock,
  Pin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FolderGit2,
  FileText,
  Figma,
  Globe,
  Kanban,
  Flag,
} from 'lucide-react';

interface PlaceholdersWidgetProps {
  timeline: TimelinePhase[];
  upcomingDeadlines: UpcomingDeadline[];
  pinnedItems: PinnedItem[];
}

export const PlaceholdersWidget: React.FC<PlaceholdersWidgetProps> = ({
  timeline,
  upcomingDeadlines,
  pinnedItems,
}) => {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'repository':
        return <FolderGit2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />;
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'design':
        return <Figma className="w-4 h-4 text-purple-500" />;
      case 'board':
        return <Kanban className="w-4 h-4 text-amber-500" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Project Timeline Placeholder */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Timeline</h3>
              <p className="text-[11px] text-slate-500">Release phases & roadmap milestones</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
            Phase 3 of 4
          </span>
        </div>

        <div className="space-y-3">
          {timeline.map((phase) => (
            <div
              key={phase.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {phase.status === 'completed' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  {phase.status === 'in_progress' && (
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" />
                  )}
                  {phase.status === 'upcoming' && (
                    <Flag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  {phase.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {phase.startDate} - {phase.endDate}
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    phase.status === 'completed'
                      ? 'bg-emerald-500'
                      : phase.status === 'in_progress'
                      ? 'bg-indigo-600'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${phase.progressPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Upcoming Deadlines Placeholder */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Upcoming Deadlines</h3>
              <p className="text-[11px] text-slate-500">Milestone deliverables & targets</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
            4 Deadlines
          </span>
        </div>

        <div className="space-y-3">
          {upcomingDeadlines.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span>•</span>
                  <span>{item.assigneeName}</span>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    item.priority === 'high'
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-200'
                      : item.priority === 'medium'
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-200'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 border-blue-200'
                  }`}
                >
                  Due {item.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Pinned Items Placeholder */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Pin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Pinned Resources</h3>
              <p className="text-[11px] text-slate-500">Quick access bookmarks & repositories</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
            {pinnedItems.length} Pinned
          </span>
        </div>

        <div className="space-y-3">
          {pinnedItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
                  {getItemIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{item.url}</p>
                </div>
              </div>

              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
