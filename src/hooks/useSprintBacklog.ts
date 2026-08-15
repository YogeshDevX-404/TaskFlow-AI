import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSprintStore } from '../store/useSprintStore';

export const useSprintBacklog = (sprintId?: string, projectId?: string) => {
  const { tasks, updateTask } = useTaskStore();
  const { assignTasksToSprint, removeTaskFromSprint, sprints } = useSprintStore();

  const currentSprint = useMemo(() => {
    return sprints.find((s) => s.id === sprintId) || null;
  }, [sprints, sprintId]);

  const { sprintTasks, backlogTasks } = useMemo(() => {
    const sprintTaskSet = new Set(
      currentSprint?.taskIds ||
        (Array.isArray(currentSprint?.tasks)
          ? currentSprint?.tasks.map((t: any) => (typeof t === 'object' ? t.id || t._id : t))
          : [])
    );

    const sTasks: typeof tasks = [];
    const bTasks: typeof tasks = [];

    tasks.forEach((t) => {
      // Filter by project if provided
      const taskProjectId = typeof t.project === 'object' ? t.project.id : t.project || t.projectId;
      if (projectId && taskProjectId && taskProjectId !== projectId) {
        return;
      }

      const taskSprintId = typeof t.sprint === 'object' ? t.sprint?.id : t.sprint;

      if ((sprintId && taskSprintId === sprintId) || (sprintId && sprintTaskSet.has(t.id))) {
        sTasks.push(t);
      } else if (!taskSprintId) {
        bTasks.push(t);
      }
    });

    return {
      sprintTasks: sTasks,
      backlogTasks: bTasks,
    };
  }, [tasks, currentSprint, sprintId, projectId]);

  const moveToSprint = async (taskId: string, targetSprintId: string) => {
    await assignTasksToSprint(targetSprintId, [taskId]);
    await updateTask(taskId, { sprint: targetSprintId } as any);
  };

  const removeFromSprint = async (taskId: string, sourceSprintId: string) => {
    await removeTaskFromSprint(sourceSprintId, taskId);
    await updateTask(taskId, { sprint: null } as any);
  };

  return {
    currentSprint,
    sprintTasks,
    backlogTasks,
    moveToSprint,
    removeFromSprint,
  };
};
