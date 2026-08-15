import React, { useState } from 'react';
import { Task } from '../../../types/task';
import { DependencyType, TaskDependency } from '../../../types/hierarchy';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Modal } from '../../ui/Modal';
import { Link2, Plus, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';

interface DependencyManagerProps {
  task: Task;
  dependencies: TaskDependency[];
  projectTasks: Task[];
  onAddDependency: (targetTaskId: string, type: DependencyType) => Promise<void>;
  onRemoveDependency: (dependencyId: string) => Promise<void>;
  onSelectTask?: (task: Task) => void;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  task,
  dependencies,
  projectTasks,
  onAddDependency,
  onRemoveDependency,
  onSelectTask,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetTaskId, setTargetTaskId] = useState('');
  const [dependencyType, setDependencyType] = useState<DependencyType>('blocks');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTargets = projectTasks.filter(
    (t) =>
      t.id !== task.id &&
      !dependencies.some((d) => d.targetTask.id === t.id)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskId) {
      setError('Please select a target task');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddDependency(targetTaskId, dependencyType);
      setIsAddModalOpen(false);
      setTargetTaskId('');
    } catch (err: any) {
      setError(err.message || 'Failed to add dependency');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDependencyLabel = (type: DependencyType) => {
    switch (type) {
      case 'blocks':
        return { text: 'Blocks', style: 'red' as const };
      case 'blocked_by':
        return { text: 'Blocked by', style: 'orange' as const };
      case 'depends_on':
        return { text: 'Depends on', style: 'orange' as const };
      case 'related_to':
        return { text: 'Relates to', style: 'indigo' as const };
      case 'duplicate_of':
        return { text: 'Duplicates', style: 'slate' as const };
      default:
        return { text: type, style: 'slate' as const };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Issue Dependencies ({dependencies.length})
          </h4>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="h-7 text-xs gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Link Issue
        </Button>
      </div>

      {/* Dependency List */}
      <div className="space-y-2">
        {dependencies.length > 0 ? (
          dependencies.map((dep) => {
            const label = getDependencyLabel(dep.type);
            return (
              <div
                key={dep.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Badge variant={label.style} size="sm">
                    {label.text}
                  </Badge>

                  <span className="font-mono text-xs font-semibold text-slate-500 shrink-0">
                    {dep.targetTask.taskKey}
                  </span>

                  <span
                    onClick={() => onSelectTask && onSelectTask(dep.targetTask)}
                    className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:underline"
                  >
                    {dep.targetTask.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" size="sm">
                    {dep.targetTask.status}
                  </Badge>

                  <button
                    type="button"
                    onClick={() => onRemoveDependency(dep.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                    title="Unlink Issue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <p className="text-xs font-medium text-slate-500">No linked dependencies</p>
            <p className="text-[11px] text-slate-400">
              Track blocking issues, relationships, or duplicates with bidirectional links.
            </p>
          </div>
        )}
      </div>

      {/* Add Dependency Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Link Issue Dependency"
        description={`Add a relationship link between '${task.taskKey}' and another task.`}
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex items-center gap-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Relationship Type
            </label>
            <select
              value={dependencyType}
              onChange={(e) => setDependencyType(e.target.value as DependencyType)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="blocks">This task BLOCKS target task</option>
              <option value="blocked_by">This task IS BLOCKED BY target task</option>
              <option value="depends_on">This task DEPENDS ON target task</option>
              <option value="related_to">This task RELATES TO target task</option>
              <option value="duplicate_of">This task DUPLICATES target task</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Task
            </label>
            <select
              value={targetTaskId}
              onChange={(e) => setTargetTaskId(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Select a target task...</option>
              {availableTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.taskKey}: {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Link Dependency
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
