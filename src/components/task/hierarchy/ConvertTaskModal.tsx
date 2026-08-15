import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Task } from '../../../types/task';
import { ArrowLeftRight, GitCommit, Layers, AlertCircle } from 'lucide-react';

interface ConvertTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  availableParents: Task[];
  onConvert: (taskId: string, parentTaskId: string | null) => Promise<void>;
}

export const ConvertTaskModal: React.FC<ConvertTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  availableParents,
  onConvert,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>(
    task.parentTask
      ? typeof task.parentTask === 'object'
        ? task.parentTask.id
        : task.parentTask
      : 'none'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exclude current task and its descendants from candidate parents to prevent cycles
  const candidateParents = availableParents.filter(
    (p) => p.id !== task.id && p.taskKey !== task.taskKey
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const targetParentId = selectedParentId === 'none' ? null : selectedParentId;
      await onConvert(task.id, targetParentId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to convert task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Task Structure"
      description={`Move '${task.taskKey}: ${task.title}' under a new parent task or make it a root-level Epic/Task.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Target Parent Issue
          </label>
          <select
            value={selectedParentId}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className="w-full h-10 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="none">Root Level Issue (No Parent)</option>
            {candidateParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.taskKey}: {p.title} ({p.type || 'Task'})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Selecting a parent converts this issue into a nested child subtask.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Confirm Conversion
          </Button>
        </div>
      </form>
    </Modal>
  );
};
