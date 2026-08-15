import React from 'react';
import { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { TaskCompactRow } from './TaskCompactRow';

export interface TaskGridProps {
  tasks: Task[];
  viewMode: 'card' | 'compact';
  onSelectTask: (task: Task) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatch: (id: string) => void;
}

export const TaskGrid: React.FC<TaskGridProps> = ({
  tasks,
  viewMode,
  onSelectTask,
  onToggleFavorite,
  onToggleWatch,
}) => {
  if (tasks.length === 0) {
    return null;
  }

  if (viewMode === 'compact') {
    return (
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCompactRow
            key={task.id}
            task={task}
            onSelectTask={onSelectTask}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onSelectTask={onSelectTask}
          onToggleFavorite={onToggleFavorite}
          onToggleWatch={onToggleWatch}
        />
      ))}
    </div>
  );
};
