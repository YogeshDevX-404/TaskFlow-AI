import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  AlertCircle,
  FileEdit,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface AssignmentTimelineViewProps {
  timeline: any[];
  onSelectAssignment?: (assignmentId: string) => void;
}

export const AssignmentTimelineView: React.FC<AssignmentTimelineViewProps> = ({
  timeline,
  onSelectAssignment,
}) => {
  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'created':
      case 'assignment_created':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'status_changed':
      case 'status_updated':
        return <Activity className="w-3.5 h-3.5 text-sky-500" />;
      case 'progress_updated':
        return <Clock className="w-3.5 h-3.5 text-indigo-500" />;
      case 'submitted':
      case 'work_submitted':
        return <Send className="w-3.5 h-3.5 text-purple-500" />;
      case 'reviewed':
      case 'submission_reviewed':
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'reassigned':
        return <UserCheck className="w-3.5 h-3.5 text-amber-500" />;
      case 'changes_requested':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FileEdit className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Live Assignment Activity Audit Stream
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time audit log of developer milestone updates, manager reviews, and status changes
          </p>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          No recent activity logged for work assignments yet.
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {timeline.map((act) => {
            const userName =
              act.user?.firstName && act.user?.lastName
                ? `${act.user.firstName} ${act.user.lastName}`
                : act.user?.name || act.user?.email || 'System / Team Member';

            return (
              <div key={act._id || act.id} className="flex items-start gap-3 relative z-10 text-xs">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  {getActionIcon(act.action || act.type)}
                </div>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      <span className="font-semibold text-slate-900 dark:text-white">{userName}</span>
                      <span className="text-slate-500">{act.description || act.action}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {act.assignment && (
                    <button
                      onClick={() => onSelectAssignment?.(act.assignment?._id || act.assignment?.id || act.entityId)}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 cursor-pointer"
                    >
                      <span>{act.assignment.assignmentId || 'WA-TASK'}</span>
                      <span className="font-sans font-normal text-slate-600 dark:text-slate-300">
                        - {act.assignment.title}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
