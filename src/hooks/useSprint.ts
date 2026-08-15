import { useEffect } from 'react';
import { useSprintStore } from '../store/useSprintStore';

export const useSprint = (sprintId?: string) => {
  const {
    currentSprint,
    isLoading,
    error,
    fetchSprintById,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    cancelSprint,
    assignTasksToSprint,
    removeTaskFromSprint,
  } = useSprintStore();

  useEffect(() => {
    if (sprintId) {
      fetchSprintById(sprintId);
    }
  }, [sprintId]);

  return {
    sprint: currentSprint,
    isLoading,
    error,
    refreshSprint: () => (sprintId ? fetchSprintById(sprintId) : Promise.resolve(null)),
    updateSprint: (data: any) => (sprintId ? updateSprint(sprintId, data) : Promise.reject('No sprint ID')),
    deleteSprint: () => (sprintId ? deleteSprint(sprintId) : Promise.reject('No sprint ID')),
    startSprint: () => (sprintId ? startSprint(sprintId) : Promise.reject('No sprint ID')),
    completeSprint: (moveUnfinishedToSprintId?: string) =>
      sprintId ? completeSprint(sprintId, moveUnfinishedToSprintId) : Promise.reject('No sprint ID'),
    cancelSprint: () => (sprintId ? cancelSprint(sprintId) : Promise.reject('No sprint ID')),
    assignTasks: (taskIds: string[]) =>
      sprintId ? assignTasksToSprint(sprintId, taskIds) : Promise.reject('No sprint ID'),
    removeTask: (taskId: string) =>
      sprintId ? removeTaskFromSprint(sprintId, taskId) : Promise.reject('No sprint ID'),
  };
};
