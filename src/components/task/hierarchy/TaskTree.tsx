import React, { useState } from 'react';
import { useTaskTree } from '../../../hooks/useTaskTree';
import { TaskTreeNodeRow } from './TaskTreeNode';
import { ConvertTaskModal } from './ConvertTaskModal';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../../types/task';
import { TaskTreeNode } from '../../../types/hierarchy';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import {
  FolderTree,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Layers,
} from 'lucide-react';

interface TaskTreeProps {
  targetId: string;
  onSelectTask: (task: Task) => void;
  onCreateTask?: (parentTaskId?: string) => void;
}

export const TaskTree: React.FC<TaskTreeProps> = ({
  targetId,
  onSelectTask,
  onCreateTask,
}) => {
  const {
    tree,
    expandedNodes,
    filters,
    isLoading,
    error,
    refetch,
    setFilters,
    resetFilters,
    toggleExpandNode,
    expandAll,
    collapseAll,
    createSubtask,
    deleteSubtask,
    convertTask,
  } = useTaskTree(targetId);

  const [convertingTask, setConvertingTask] = useState<Task | null>(null);

  // Helper to extract flat task list from tree for parent dropdowns
  const flattenTree = (nodes: TaskTreeNode[]): Task[] => {
    let result: Task[] = [];
    nodes.forEach((node) => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children));
      }
    });
    return result;
  };

  const allFlatTasks = flattenTree(tree);

  // Compute overall progress across all nodes
  const totalNodes = allFlatTasks.length;
  const completedNodes = allFlatTasks.filter((t) => t.status === 'Done').length;
  const overallPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const handleCreateSubtask = async (parentTaskId: string) => {
    if (onCreateTask) {
      onCreateTask(parentTaskId);
    } else {
      const title = prompt('Enter subtask title:');
      if (title && title.trim()) {
        await createSubtask(parentTaskId, { title: title.trim(), projectId: targetId });
      }
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (confirm(`Are you sure you want to delete '${task.taskKey}: ${task.title}'?`)) {
      if (task.parentTask) {
        const parentId = typeof task.parentTask === 'object' ? task.parentTask.id : task.parentTask;
        await deleteSubtask(parentId, task.id);
      } else {
        // Standalone delete
        refetch();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Enterprise Task Hierarchy
              <Badge variant="indigo" size="sm">
                {totalNodes} Total Tasks
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recursive Epic → Story → Task → Subtask hierarchy & dependency tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-8 text-xs gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Expand All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-8 text-xs gap-1"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Collapse All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 text-xs gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          {onCreateTask && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onCreateTask()}
              className="h-8 text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              New Root Task
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search tree..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ status: e.target.value as any })}
            className="h-8 px-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Backlog">Backlog</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Testing">Testing</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || 'all'}
            onChange={(e) => setFilters({ priority: e.target.value as any })}
            className="h-8 px-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => setFilters({ type: e.target.value as any })}
            className="h-8 px-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Types</option>
            <option value="Epic">Epic</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
          </select>
        </div>

        {/* Quick Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
          <Button
            variant={filters.onlyParent ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilters({ onlyParent: !filters.onlyParent, onlySubtasks: false })}
            className="h-6 text-[11px] px-2 py-0"
          >
            <Layers className="w-3 h-3 mr-1" />
            Parents Only
          </Button>

          <Button
            variant={filters.onlySubtasks ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilters({ onlySubtasks: !filters.onlySubtasks, onlyParent: false })}
            className="h-6 text-[11px] px-2 py-0"
          >
            Subtasks Only
          </Button>

          <Button
            variant={filters.blocked ? 'danger' : 'outline'}
            size="sm"
            onClick={() => setFilters({ blocked: !filters.blocked })}
            className="h-6 text-[11px] px-2 py-0"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Blocked
          </Button>

          <Button
            variant={filters.completed ? 'accent' : 'outline'}
            size="sm"
            onClick={() => setFilters({ completed: !filters.completed })}
            className="h-6 text-[11px] px-2 py-0"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Button>

          {(filters.search ||
            filters.status !== 'all' ||
            filters.priority !== 'all' ||
            filters.type !== 'all' ||
            filters.onlyParent ||
            filters.onlySubtasks ||
            filters.blocked ||
            filters.completed) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 text-[11px] px-2 py-0 text-slate-500 hover:text-slate-900"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-sm text-slate-500">Loading task hierarchy...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Main Tree List */}
      {!isLoading && !error && (
        <div className="space-y-1.5">
          {tree.length > 0 ? (
            tree.map((node) => (
              <TaskTreeNodeRow
                key={node.id}
                node={node}
                isExpanded={expandedNodes.has(node.id)}
                onToggleExpand={toggleExpandNode}
                onSelectTask={onSelectTask}
                onCreateSubtask={handleCreateSubtask}
                onConvertTask={(task) => setConvertingTask(task)}
                onDeleteTask={handleDeleteTask}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
              <FolderTree className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No tasks found in hierarchy
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  There are no tasks matching your current filters or in this project hierarchy.
                </p>
              </div>
              {onCreateTask && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onCreateTask()}
                  className="text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create First Task
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Convert Task Modal */}
      {convertingTask && (
        <ConvertTaskModal
          isOpen={!!convertingTask}
          onClose={() => setConvertingTask(null)}
          task={convertingTask}
          availableParents={allFlatTasks}
          onConvert={async (taskId, parentTaskId) => {
            await convertTask(taskId, parentTaskId);
            setConvertingTask(null);
          }}
        />
      )}
    </div>
  );
};
