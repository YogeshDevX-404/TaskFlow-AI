import React, { useState } from 'react';
import { Task, TaskStatus } from '../../../types/task';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Dropdown } from '../../ui/Dropdown';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  GitCommit,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

interface SubtaskManagerProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (title: string) => Promise<void>;
  onUpdateSubtaskStatus: (subtaskId: string, status: TaskStatus) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
}

export const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  parentTask,
  subtasks,
  onCreateSubtask,
  onUpdateSubtaskStatus,
  onDeleteSubtask,
  onSelectTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = subtasks.filter((s) => s.status === 'Done').length;
  const totalCount = subtasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateSubtask(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create subtask:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Subtasks ({completedCount}/{totalCount})
          </h4>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-7 text-xs gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Subtask
        </Button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-right text-slate-400 font-mono font-medium">
            {percentage}% Completed
          </p>
        </div>
      )}

      {/* Inline Add Input */}
      {isAdding && (
        <form onSubmit={handleCreate} className="flex items-center gap-2 pt-1">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title..."
            className="h-8 text-xs"
            autoFocus
          />
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="h-8 text-xs">
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(false)}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Subtask Items */}
      <div className="space-y-1.5">
        {subtasks.length > 0 ? (
          subtasks.map((subtask) => {
            const isDone = subtask.status === 'Done';
            return (
              <div
                key={subtask.id}
                className="group flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSubtaskStatus(subtask.id, isDone ? 'In Progress' : 'Done')
                    }
                    className="p-0.5 text-slate-400 hover:text-indigo-600 transition"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <span className="font-mono text-[11px] font-semibold text-slate-500 shrink-0">
                    {subtask.taskKey}
                  </span>

                  <span
                    onClick={() => onSelectTask && onSelectTask(subtask)}
                    className={`text-xs font-medium truncate cursor-pointer hover:underline ${
                      isDone
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={isDone ? 'green' : 'indigo'} size="sm">
                    {subtask.status}
                  </Badge>

                  <Dropdown
                    align="right"
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    }
                    items={[
                      {
                        id: 'open',
                        label: 'View Details',
                        onClick: () => onSelectTask && onSelectTask(subtask),
                      },
                      {
                        id: 'toggle-done',
                        label: isDone ? 'Mark In Progress' : 'Mark Done',
                        onClick: () =>
                          onUpdateSubtaskStatus(subtask.id, isDone ? 'In Progress' : 'Done'),
                      },
                      {
                        id: 'delete',
                        label: 'Delete Subtask',
                        danger: true,
                        onClick: () => onDeleteSubtask(subtask.id),
                      },
                    ]}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <p className="text-xs font-medium text-slate-500">No subtasks defined</p>
            <p className="text-[11px] text-slate-400">
              Break down this task into smaller manageable sub-items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
