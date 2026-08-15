import { useBoardStore } from '../store/useBoardStore';
import { TaskStatus } from '../types/task';

export function useTaskReorder() {
  const {
    moveTaskStatusOptimistic,
    reorderColumnTasksOptimistic,
    syncTaskStatusUpdate,
    syncColumnReorder,
  } = useBoardStore();

  const handleTaskMove = async (
    taskId: string,
    sourceStatus: TaskStatus,
    targetStatus: TaskStatus,
    targetIndex: number
  ) => {
    moveTaskStatusOptimistic(taskId, sourceStatus, targetStatus, targetIndex);
    await syncTaskStatusUpdate(taskId, targetStatus, targetIndex);
  };

  const handleColumnReorder = async (statusKey: TaskStatus, newTaskIds: string[]) => {
    reorderColumnTasksOptimistic(statusKey, newTaskIds);
    await syncColumnReorder(statusKey, newTaskIds);
  };

  return {
    handleTaskMove,
    handleColumnReorder,
  };
}
