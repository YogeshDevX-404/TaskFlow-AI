import React, { useState } from 'react';
import { TaskTreeNode } from '../../../types/hierarchy';
import { Task, TaskStatus } from '../../../types/task';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Dropdown } from '../../ui/Dropdown';
import {
  ChevronRight,
  ChevronDown,
  GitCommit,
  Plus,
  MoreHorizontal,
  Bookmark,
  BookOpen,
  CheckSquare,
  Bug,
  AlertCircle,
  Link2,
  ArrowLeftRight,
  Trash2,
} from 'lucide-react';

interface TaskTreeNodeProps {
  node: TaskTreeNode;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onCreateSubtask: (parentTaskId: string) => void;
  onConvertTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  level?: number;
}

export const TaskTreeNodeRow: React.FC<TaskTreeNodeProps> = ({
  node,
  isExpanded,
  onToggleExpand,
  onSelectTask,
  onCreateSubtask,
  onConvertTask,
  onDeleteTask,
  level = 0,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const subtaskStats = node.subtaskStats || { total: 0, completed: 0, percentage: 0 };
  const isBlocked = node.status === 'Blocked' || (node.dependencies && node.dependencies.some((d) => d.type === 'blocked_by'));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Epic':
        return <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Story':
        return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Bug':
        return <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'green' as const;
      case 'In Progress':
        return 'indigo' as const;
      case 'Blocked':
        return 'red' as const;
      default:
        return 'slate' as const;
    }
  };

  return (
    <div className="space-y-1">
      <div
        style={{ paddingLeft: `${Math.min(level * 24, 120)}px` }}
        className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all ${
          node.status === 'Done'
            ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/60 opacity-80'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
      >
        {/* Left Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
          )}

          <div className="shrink-0">{getTypeIcon(node.type)}</div>

          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            {node.taskKey}
          </span>

          <span
            onClick={() => onSelectTask(node)}
            className={`text-sm font-medium truncate cursor-pointer hover:underline ${
              node.status === 'Done'
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {node.title}
          </span>

          {isBlocked && (
            <Badge variant="red" size="sm" className="shrink-0 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Blocked
            </Badge>
          )}
        </div>

        {/* Right Stats & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {subtaskStats.total > 0 && (
            <div className="hidden sm:flex items-center gap-2 w-28 shrink-0">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all"
                  style={{ width: `${subtaskStats.percentage}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-500">
                {subtaskStats.completed}/{subtaskStats.total}
              </span>
            </div>
          )}

          <Badge variant={getStatusBadgeVariant(node.status)} size="sm">
            {node.status}
          </Badge>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onCreateSubtask(node.id)}
            className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-600"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Subtask
          </Button>

          <Dropdown
            align="right"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={[
              {
                id: 'details',
                label: 'View Details',
                onClick: () => onSelectTask(node),
              },
              {
                id: 'subtask',
                label: 'Add Subtask',
                icon: <Plus className="w-3.5 h-3.5 text-indigo-600" />,
                onClick: () => onCreateSubtask(node.id),
              },
              {
                id: 'convert',
                label: 'Convert Structure',
                icon: <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />,
                onClick: () => onConvertTask(node),
              },
              {
                id: 'delete',
                label: 'Delete Task',
                danger: true,
                icon: <Trash2 className="w-3.5 h-3.5" />,
                onClick: () => onDeleteTask(node),
              },
            ]}
          />
        </div>
      </div>

      {/* Render Subtask Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <TaskTreeNodeRow
              key={child.id}
              node={child}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              onSelectTask={onSelectTask}
              onCreateSubtask={onCreateSubtask}
              onConvertTask={onConvertTask}
              onDeleteTask={onDeleteTask}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
