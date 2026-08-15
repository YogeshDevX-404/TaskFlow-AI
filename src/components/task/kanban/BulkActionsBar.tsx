import React from 'react';
import {
  CheckSquare,
  X,
  ArrowRightCircle,
  UserCheck,
  AlertTriangle,
  Archive,
  Trash2,
} from 'lucide-react';
import { useBoardStore } from '../../../store/useBoardStore';
import { TaskStatus, TaskPriority } from '../../../types/task';

interface BulkActionsBarProps {
  availableMembers?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ availableMembers = [] }) => {
  const { selectedTaskIds, clearSelection, bulkUpdateSelected } = useBoardStore();
  const count = selectedTaskIds.size;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white dark:bg-slate-800 dark:border dark:border-slate-700 px-4 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center gap-3 text-xs max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 font-semibold">
        <CheckSquare className="w-4 h-4 text-indigo-400" />
        <span>{count} selected</span>
      </div>

      <div className="h-4 w-[1px] bg-slate-700" />

      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Status Bulk Select */}
        <div className="flex items-center gap-1">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                bulkUpdateSelected({ status: e.target.value as TaskStatus });
                e.target.value = '';
              }
            }}
            className="bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              Move Status...
            </option>
            <option value="Backlog">Backlog</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Testing">Testing</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority Bulk Select */}
        <div className="flex items-center gap-1">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                bulkUpdateSelected({ priority: e.target.value as TaskPriority });
                e.target.value = '';
              }
            }}
            className="bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              Set Priority...
            </option>
            <option value="Urgent">Urgent</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>
        </div>

        {/* Assignee Bulk Select */}
        <div className="flex items-center gap-1">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                bulkUpdateSelected({ assigneeId: e.target.value === 'unassigned' ? null : e.target.value });
                e.target.value = '';
              }
            }}
            className="bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              Assign User...
            </option>
            <option value="unassigned">Unassigned</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Archive Action */}
        <button
          type="button"
          onClick={() => bulkUpdateSelected({ isArchived: true })}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1"
          title="Archive Selected"
        >
          <Archive className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Archive</span>
        </button>

        {/* Delete Action */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete ${count} tasks?`)) {
              bulkUpdateSelected({ delete: true });
            }
          }}
          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer flex items-center gap-1"
          title="Delete Selected"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      <button
        type="button"
        onClick={clearSelection}
        className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
