import React, { useEffect, useState } from 'react';
import { Task, TaskStatus } from '../../../types/task';
import { SubtaskManager } from '../hierarchy/SubtaskManager';
import { DependencyManager } from '../hierarchy/DependencyManager';
import { useTaskTreeStore } from '../../../store/useTaskTreeStore';
import { useDependencyStore } from '../../../store/useDependencyStore';
import { hierarchyService } from '../../../services/api/hierarchyService';
import { TaskService } from '../../../services/api/taskService';
import { Tabs } from '../../ui/Tabs';
import { GitCommit, Link2 } from 'lucide-react';

interface TaskDetailHierarchyProps {
  task: Task;
  onTaskUpdated?: () => void;
  onSelectTask?: (task: Task) => void;
}

export const TaskDetailHierarchy: React.FC<TaskDetailHierarchyProps> = ({
  task,
  onTaskUpdated,
  onSelectTask,
}) => {
  const [activeTab, setActiveTab] = useState<'subtasks' | 'dependencies'>('subtasks');
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);

  const { dependencies, fetchDependencies, addDependency, removeDependency } =
    useDependencyStore();

  const projectId = typeof task.project === 'object' ? task.project.id : task.project;

  const loadSubtasksAndProject = async () => {
    setIsLoadingSubtasks(true);
    try {
      if (projectId) {
        const response = await TaskService.getTasks({ projectId });
        const allTasks = (response && response.data) || [];
        setProjectTasks(allTasks);
        const directSubtasks = allTasks.filter((t: Task) => {
          const parent = t.parentTask;
          if (!parent) return false;
          return typeof parent === 'object' ? parent.id === task.id : parent === task.id;
        });
        setSubtasks(directSubtasks);
      }
    } catch (err) {
      console.error('Failed to load subtasks:', err);
    } finally {
      setIsLoadingSubtasks(false);
    }
  };

  useEffect(() => {
    if (task.id) {
      loadSubtasksAndProject();
      fetchDependencies(task.id);
    }
  }, [task.id, projectId]);

  const handleCreateSubtask = async (title: string) => {
    await hierarchyService.createSubtask(task.id, {
      title,
      projectId,
    });
    await loadSubtasksAndProject();
    onTaskUpdated?.();
  };

  const handleUpdateSubtaskStatus = async (subtaskId: string, status: TaskStatus) => {
    await hierarchyService.updateSubtask(task.id, subtaskId, { status });
    await loadSubtasksAndProject();
    onTaskUpdated?.();
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await hierarchyService.deleteSubtask(task.id, subtaskId);
    await loadSubtasksAndProject();
    onTaskUpdated?.();
  };

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          {
            id: 'subtasks',
            label: 'Subtasks',
            icon: <GitCommit className="w-3.5 h-3.5 text-indigo-500" />,
            badge: subtasks.length,
          },
          {
            id: 'dependencies',
            label: 'Dependencies',
            icon: <Link2 className="w-3.5 h-3.5 text-indigo-500" />,
            badge: dependencies.length,
          },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'subtasks' | 'dependencies')}
      />

      {activeTab === 'subtasks' ? (
        <SubtaskManager
          parentTask={task}
          subtasks={subtasks}
          onCreateSubtask={handleCreateSubtask}
          onUpdateSubtaskStatus={handleUpdateSubtaskStatus}
          onDeleteSubtask={handleDeleteSubtask}
          onSelectTask={onSelectTask}
        />
      ) : (
        <DependencyManager
          task={task}
          dependencies={dependencies}
          projectTasks={projectTasks}
          onAddDependency={async (targetId, type) => {
            await addDependency(task.id, targetId, type);
            onTaskUpdated?.();
          }}
          onRemoveDependency={async (depId) => {
            await removeDependency(task.id, depId);
            onTaskUpdated?.();
          }}
          onSelectTask={onSelectTask}
        />
      )}
    </div>
  );
};
