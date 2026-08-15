import React from 'react';
import { Task } from '../../../types/task';
import { TaskDetailHierarchy } from './TaskDetailHierarchy';

export interface TaskDetailRelatedProps {
  task: Task;
  onTaskUpdated?: () => void;
  onSelectTask?: (task: Task) => void;
}

export const TaskDetailRelated: React.FC<TaskDetailRelatedProps> = ({
  task,
  onTaskUpdated,
  onSelectTask,
}) => {
  return (
    <TaskDetailHierarchy
      task={task}
      onTaskUpdated={onTaskUpdated}
      onSelectTask={onSelectTask}
    />
  );
};

