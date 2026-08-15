import React from 'react';
import { WorkAssignment, AssignmentStatus } from '../../types/workAssignment';
import { WorkAssignmentCard } from './WorkAssignmentCard';
import {
  Clock,
  PlayCircle,
  PauseCircle,
  FileCheck2,
  RotateCcw,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface KanbanBoardProps {
  assignments: WorkAssignment[];
  onSelectAssignment: (assignment: WorkAssignment) => void;
  onQuickAction: (action: string, assignment: WorkAssignment) => void;
  onOpenCreateModal: () => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  statuses: AssignmentStatus[];
  icon: React.ComponentType<{ className?: string }>;
  headerBg: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'assigned',
    title: 'Assigned / Acknowledged',
    statuses: ['Assigned', 'Acknowledged'],
    icon: Clock,
    headerBg: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    statuses: ['In Progress'],
    icon: PlayCircle,
    headerBg: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'blocked',
    title: 'Blocked',
    statuses: ['Blocked'],
    icon: PauseCircle,
    headerBg: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
  },
  {
    id: 'submitted',
    title: 'Submitted for Review',
    statuses: ['Submitted'],
    icon: FileCheck2,
    headerBg: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  },
  {
    id: 'changes_requested',
    title: 'Changes Requested',
    statuses: ['Changes Requested'],
    icon: RotateCcw,
    headerBg: 'text-orange-600 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  },
  {
    id: 'completed',
    title: 'Completed',
    statuses: ['Completed'],
    icon: CheckCircle2,
    headerBg: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  },
];

export const AssignmentKanbanBoard: React.FC<KanbanBoardProps> = ({
  assignments,
  onSelectAssignment,
  onQuickAction,
  onOpenCreateModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const colAssignments = assignments.filter((a) =>
          col.statuses.includes(a.status)
        );

        return (
          <div
            key={col.id}
            className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3 min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${col.headerBg}`} />
                <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                  {col.title}
                </h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
              >
                {colAssignments.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {colAssignments.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-xs text-slate-400 font-medium">No assignments</p>
                  {col.id === 'assigned' && (
                    <button
                      onClick={onOpenCreateModal}
                      className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Assign Work</span>
                    </button>
                  )}
                </div>
              ) : (
                colAssignments.map((assignment) => (
                  <WorkAssignmentCard
                    key={assignment.id || assignment.assignmentId}
                    assignment={assignment}
                    onSelect={onSelectAssignment}
                    onQuickAction={onQuickAction}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
