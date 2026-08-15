import React from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import {
  AssignmentStatusBadge,
  AssignmentPriorityBadge,
  AssignmentDueBadge,
} from './WorkAssignmentBadge';
import { useAuthStore } from '../../store/useAuthStore';
import {
  FolderKanban,
  CheckSquare,
  GitPullRequest,
  Paperclip,
  MessageSquare,
  Clock,
  Play,
  CheckCircle2,
  Send,
  UserCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';

interface CardProps {
  assignment: WorkAssignment;
  onSelect: (assignment: WorkAssignment) => void;
  onQuickAction?: (action: string, assignment: WorkAssignment) => void;
}

export const WorkAssignmentCard: React.FC<CardProps> = ({
  assignment,
  onSelect,
  onQuickAction,
}) => {
  const { user } = useAuthStore();
  const currentUserId = (user?.id || (user as any)?._id)?.toString();
  const isAssignee =
    assignment.assignedTo?._id?.toString() === currentUserId ||
    assignment.assignedTo?.id?.toString() === currentUserId;
  const isAssigner =
    assignment.assignedBy?._id?.toString() === currentUserId ||
    assignment.assignedBy?.id?.toString() === currentUserId;

  const assigneeName =
    assignment.assignedTo?.name ||
    `${assignment.assignedTo?.firstName || ''} ${assignment.assignedTo?.lastName || ''}`.trim() ||
    assignment.assignedTo?.email ||
    'Unassigned';

  const estHours =
    (assignment.estimatedHours || 0) +
    (assignment.estimatedMinutes ? assignment.estimatedMinutes / 60 : 0);
  const loggedHours = (assignment.totalLoggedSeconds || 0) / 3600;

  const criteriaCount = assignment.acceptanceCriteria?.length || 0;
  const completedCriteriaCount = (assignment.acceptanceCriteria || []).filter(
    (c) => c.status === 'Completed'
  ).length;
  const imagesCount = assignment.referenceImages?.length || 0;
  const proofCount = assignment.proofOfWork?.length || 0;

  return (
    <div
      onClick={() => onSelect(assignment)}
      className="group bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden"
    >
      {/* Top Bar: Assignment ID, Priority, and Due Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900/60">
            {assignment.assignmentId}
          </span>
          <AssignmentPriorityBadge priority={assignment.priority} size="sm" />
        </div>

        <AssignmentDueBadge
          isOverdue={assignment.isOverdue}
          isDueSoon={assignment.isDueSoon}
          dueDate={assignment.dueDate}
        />
      </div>

      {/* Title & Instructions Excerpt */}
      <div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {assignment.title}
        </h4>
        {assignment.instructions && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal">
            {assignment.instructions}
          </p>
        )}
      </div>

      {/* Project & Task / Chips Row */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {assignment.project?.name && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            <FolderKanban className="w-3 h-3 text-indigo-500" />
            <span className="truncate max-w-[110px]">{assignment.project.name}</span>
          </span>
        )}

        {assignment.task?.title && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium">
            <CheckSquare className="w-3 h-3 text-sky-500" />
            <span className="truncate max-w-[100px]">{assignment.task.title}</span>
          </span>
        )}

        {imagesCount > 0 && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]"
            title={`${imagesCount} Reference Mockups attached`}
          >
            <ImageIcon className="w-3 h-3 text-indigo-500" />
            <span>{imagesCount}</span>
          </span>
        )}

        {criteriaCount > 0 && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]"
            title={`${completedCriteriaCount}/${criteriaCount} Criteria Completed`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>
              {completedCriteriaCount}/{criteriaCount}
            </span>
          </span>
        )}

        {proofCount > 0 && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium text-[10px]"
            title={`${proofCount} Proof of Work artifacts recorded`}
          >
            <Shield className="w-3 h-3 text-purple-500" />
            <span>{proofCount}</span>
          </span>
        )}

        {assignment.githubPullRequest?.prNumber && (
          <a
            href={assignment.githubPullRequest.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium hover:underline"
          >
            <GitPullRequest className="w-3 h-3 text-purple-500" />
            <span>PR #{assignment.githubPullRequest.prNumber}</span>
          </a>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {assignment.progress || 0}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              assignment.status === 'Completed'
                ? 'bg-emerald-500'
                : assignment.progress >= 75
                ? 'bg-indigo-500'
                : assignment.progress >= 40
                ? 'bg-amber-500'
                : 'bg-indigo-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, assignment.progress || 0))}%` }}
          />
        </div>
      </div>

      {/* Bottom Row: Assignee Info, Time, and Quick Action Trigger */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {/* Assignee Avatar & Name */}
        <div className="flex items-center gap-2 min-w-0">
          {assignment.assignedTo?.avatar ? (
            <img
              src={assignment.assignedTo.avatar}
              alt={assigneeName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              {assigneeName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">
            {assigneeName}
          </span>
        </div>

        {/* Time Tracked / Estimated */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>
            {loggedHours.toFixed(1)}h / {estHours.toFixed(1)}h
          </span>
        </div>
      </div>

      {/* Context-aware Quick Action Pill */}
      {isAssignee && assignment.status === 'Assigned' && onQuickAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction('acknowledge', assignment);
          }}
          className="w-full py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Acknowledge Work</span>
        </button>
      )}

      {isAssignee && assignment.status === 'Acknowledged' && onQuickAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction('start', assignment);
          }}
          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Work</span>
        </button>
      )}

      {isAssignee &&
        ['In Progress', 'Changes Requested'].includes(assignment.status) &&
        onQuickAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction('submit', assignment);
            }}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>
        )}

      {isAssigner && assignment.status === 'Submitted' && onQuickAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction('review', assignment);
          }}
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Review Submission</span>
        </button>
      )}
    </div>
  );
};
