import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { TaskDetailDrawer } from './details/TaskDetailDrawer';

export interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleWatch?: (id: string) => void;
  onCopyLink?: (taskKey: string) => void;
  onUpdateStatus?: (id: string, newStatus: TaskStatus) => void;
  onUpdatePriority?: (id: string, newPriority: TaskPriority) => void;
  availableMembers?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
  availableProjects?: Array<{ id: string; name: string; projectKey?: string }>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  availableMembers = [],
  availableProjects = [],
}) => {
  if (!isOpen || !task) return null;

  return (
    <TaskDetailDrawer
      taskIdOrKey={task.id || task.taskKey}
      isOpen={isOpen}
      onClose={onClose}
      availableMembers={availableMembers}
      availableProjects={availableProjects}
    />
  );
};
