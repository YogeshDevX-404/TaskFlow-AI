import { useState, useCallback, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '../types/task';

export interface UseTaskDetailsReturn {
  task: Task | null;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  isEditing: boolean;
  drawerWidth: number;
  isFullScreen: boolean;
  openTaskDetails: (idOrKey: string) => Promise<Task | null>;
  closeTaskDetails: () => void;
  setIsEditing: (editing: boolean) => void;
  setDrawerWidth: (width: number) => void;
  toggleFullScreen: () => void;
  refetchDetails: () => Promise<Task | null>;
  updateTaskDetails: (data: Partial<TaskFormData> & { description?: string }) => Promise<Task | null>;
  updateTaskStatus: (status: TaskStatus) => Promise<void>;
  updateTaskPriority: (priority: TaskPriority) => Promise<void>;
}

export function useTaskDetails(initialTaskIdOrKey?: string): UseTaskDetailsReturn {
  const {
    selectedTask,
    loading,
    error,
    fetchTaskDetails,
    setSelectedTask,
    updateTask,
    updateTaskStatus: storeUpdateStatus,
    updateTaskPriority: storeUpdatePriority,
  } = useTaskStore();

  const [isOpen, setIsOpen] = useState<boolean>(Boolean(initialTaskIdOrKey));
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [drawerWidth, setDrawerWidth] = useState<number>(680); // Default desktop width in px
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialTaskIdOrKey || null);

  const openTaskDetails = useCallback(
    async (idOrKey: string): Promise<Task | null> => {
      setActiveTaskId(idOrKey);
      setIsOpen(true);
      const fetched = await fetchTaskDetails(idOrKey);
      return fetched;
    },
    [fetchTaskDetails]
  );

  const closeTaskDetails = useCallback(() => {
    setIsOpen(false);
    setIsEditing(false);
    setSelectedTask(null);
    setActiveTaskId(null);
  }, [setSelectedTask]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  const refetchDetails = useCallback(async (): Promise<Task | null> => {
    if (activeTaskId || selectedTask?.id) {
      const idToFetch = activeTaskId || selectedTask?.id || '';
      return fetchTaskDetails(idToFetch);
    }
    return null;
  }, [activeTaskId, selectedTask, fetchTaskDetails]);

  const updateTaskDetails = useCallback(
    async (data: Partial<TaskFormData> & { description?: string }): Promise<Task | null> => {
      if (!selectedTask) return null;

      // Validation logic
      if (data.title !== undefined && (!data.title || !data.title.trim())) {
        throw new Error('Task title cannot be empty.');
      }
      if (data.startDate && data.dueDate) {
        if (new Date(data.startDate) > new Date(data.dueDate)) {
          throw new Error('Start date cannot be later than due date.');
        }
      }

      const updated = await updateTask(selectedTask.id, data as any);
      if (updated) {
        setSelectedTask(updated);
      }
      return updated;
    },
    [selectedTask, updateTask, setSelectedTask]
  );

  const handleUpdateStatus = useCallback(
    async (status: TaskStatus) => {
      if (!selectedTask) return;
      await storeUpdateStatus(selectedTask.id, status);
      setSelectedTask({
        ...selectedTask,
        status,
        updatedAt: new Date().toISOString(),
      });
    },
    [selectedTask, storeUpdateStatus, setSelectedTask]
  );

  const handleUpdatePriority = useCallback(
    async (priority: TaskPriority) => {
      if (!selectedTask) return;
      await storeUpdatePriority(selectedTask.id, priority);
      setSelectedTask({
        ...selectedTask,
        priority,
        updatedAt: new Date().toISOString(),
      });
    },
    [selectedTask, storeUpdatePriority, setSelectedTask]
  );

  useEffect(() => {
    if (initialTaskIdOrKey) {
      openTaskDetails(initialTaskIdOrKey);
    }
  }, [initialTaskIdOrKey, openTaskDetails]);

  return {
    task: selectedTask,
    loading,
    error,
    isOpen,
    isEditing,
    drawerWidth,
    isFullScreen,
    openTaskDetails,
    closeTaskDetails,
    setIsEditing,
    setDrawerWidth,
    toggleFullScreen,
    refetchDetails,
    updateTaskDetails,
    updateTaskStatus: handleUpdateStatus,
    updateTaskPriority: handleUpdatePriority,
  };
}
