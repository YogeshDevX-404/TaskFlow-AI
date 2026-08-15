import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Edit2,
  Trash2,
  Archive,
  Inbox,
  Circle,
  Clock,
  Eye,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Layers,
} from 'lucide-react';
import { Task, TaskStatus } from '../../../types/task';
import { BoardColumn, BoardSettings } from '../../../types/board';
import { KanbanCard, SortableKanbanCard } from './KanbanCard';
import { useBoardStore } from '../../../store/useBoardStore';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  settings: BoardSettings;
  selectedTaskIds: Set<string>;
  onSelectTask: (taskId: string) => void;
  onOpenQuickEdit: (task: Task) => void;
  onOpenCreateTask: (statusKey: TaskStatus) => void;
  onEditColumn: (column: BoardColumn) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Inbox,
  Circle,
  Clock,
  Eye,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Layers,
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  settings,
  selectedTaskIds,
  onSelectTask,
  onOpenQuickEdit,
  onOpenCreateTask,
  onEditColumn,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { toggleCollapseColumn, deleteColumn, selectAllInColumn } = useBoardStore();

  const { setNodeRef, isOver } = useDroppable({
    id: column.statusKey,
  });

  const IconComponent = ICON_MAP[column.icon] || Circle;
  const isWipExceeded = column.wipLimit > 0 && tasks.length > column.wipLimit;
  const taskIds = tasks.map((t) => t.id);

  if (column.isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        className="w-12 flex-shrink-0 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center py-3 space-y-4 transition-all"
      >
        <button
          type="button"
          onClick={() => toggleCollapseColumn(column.id)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          title="Expand column"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color || '#3B82F6' }}
        />

        <div className="writing-mode-vertical text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wider uppercase flex items-center gap-2">
          <span>{column.name}</span>
          <span className="text-slate-400 font-mono">({tasks.length})</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 flex flex-col max-h-full bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border transition-colors ${
        isOver
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/10'
          : 'border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-t-xl sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color || '#3B82F6' }}
          />
          <IconComponent className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
            {column.name}
          </h3>
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ${
              isWipExceeded
                ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            {tasks.length}
            {column.wipLimit > 0 && ` / ${column.wipLimit}`}
          </span>

          {isWipExceeded && (
            <span
              title={`WIP Limit exceeded! Max ${column.wipLimit} tasks allowed.`}
              className="text-red-500 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenCreateTask(column.statusKey)}
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Add task to column"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleCollapseColumn(column.id)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Collapse column"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Column menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-30 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs text-slate-700 dark:text-slate-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEditColumn(column);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Column</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    selectAllInColumn(tasks);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select All Cards</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm(`Are you sure you want to delete column "${column.name}"?`)) {
                      deleteColumn(column.id);
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Column</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[150px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableKanbanCard
              key={task.id}
              task={task}
              cardSize={settings.cardSize}
              showLabels={settings.showLabels}
              showStoryPoints={settings.showStoryPoints}
              showAvatars={settings.showAvatars}
              showDueDates={settings.showDueDates}
              isSelected={selectedTaskIds.has(task.id)}
              onSelect={onSelectTask}
              onOpenQuickEdit={onOpenQuickEdit}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
            <span>No tasks in this column</span>
            <button
              type="button"
              onClick={() => onOpenCreateTask(column.statusKey)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              + Add task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
