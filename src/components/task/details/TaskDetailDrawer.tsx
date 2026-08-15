import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, TaskFormData } from '../../../types/task';
import { useTaskDetails } from '../../../hooks/useTaskDetails';
import { TaskDetailHeader } from './TaskDetailHeader';
import { TaskDetailDescription } from './TaskDetailDescription';
import { TaskDetailPropertiesPanel } from './TaskDetailPropertiesPanel';
import { TaskDetailLabels } from './TaskDetailLabels';
import { TaskDetailWatchers } from './TaskDetailWatchers';
import { TaskDetailHistory } from './TaskDetailHistory';
import { TaskDetailRelated } from './TaskDetailRelated';
import { TaskDetailComments } from '../comments/TaskDetailComments';
import { TaskDetailAttachments } from '../attachments/TaskDetailAttachments';
import { TaskTimeTracker } from '../../timeTracking/TaskTimeTracker';
import { TaskModal } from '../TaskModal';
import { DeleteTaskDialog } from '../DeleteTaskDialog';
import { TaskGitHubIntegrationSection } from '../../github/TaskGitHubIntegrationSection';
import { GitHubIntegrationApiService, IGitHubRepoConnection } from '../../../services/api/githubIntegrationService';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, GripVertical, AlertCircle } from 'lucide-react';

export interface TaskDetailDrawerProps {
  taskIdOrKey: string | null;
  isOpen: boolean;
  onClose: () => void;
  availableMembers?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
  availableProjects?: Array<{ id: string; name: string; projectKey?: string }>;
  onRefreshParentList?: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskIdOrKey,
  isOpen,
  onClose,
  availableMembers = [],
  availableProjects = [],
  onRefreshParentList,
}) => {
  const {
    task,
    loading,
    error,
    isEditing,
    drawerWidth,
    isFullScreen,
    openTaskDetails,
    closeTaskDetails,
    setIsEditing,
    setDrawerWidth,
    toggleFullScreen,
    updateTaskDetails,
    updateTaskStatus,
    updateTaskPriority,
    refetchDetails,
  } = useTaskDetails(taskIdOrKey || undefined);

  // Query GitHub Repo Connections for the task's project
  const taskProjectId = (task as any)?.project?.id || (task as any)?.projectId || (task as any)?.project;
  const { data: repoConnections = [] } = useQuery<IGitHubRepoConnection[]>({
    queryKey: ['github-project-repositories', taskProjectId],
    queryFn: () => GitHubIntegrationApiService.getProjectRepositories(taskProjectId),
    enabled: !!taskProjectId,
    staleTime: 30000,
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    if (isOpen && taskIdOrKey) {
      openTaskDetails(taskIdOrKey);
    }
  }, [isOpen, taskIdOrKey, openTaskDetails]);

  // Handle Resizable Drawer Dragging on Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 480 && newWidth <= 1000) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setDrawerWidth]);

  if (!isOpen) return null;

  const handleUpdateTitle = async (newTitle: string) => {
    try {
      await updateTaskDetails({ title: newTitle });
      showToast('Task title updated');
      if (onRefreshParentList) onRefreshParentList();
    } catch (err: any) {
      showToast(err.message || 'Failed to update title');
    }
  };

  const handleUpdateProperties = async (data: Partial<TaskFormData>) => {
    try {
      await updateTaskDetails(data);
      showToast('Task properties updated');
      if (onRefreshParentList) onRefreshParentList();
    } catch (err: any) {
      showToast(err.message || 'Failed to update properties');
    }
  };

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTaskStatus(status);
    showToast(`Status updated to ${status}`);
    if (onRefreshParentList) onRefreshParentList();
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    await updateTaskPriority(priority);
    showToast(`Priority updated to ${priority}`);
    if (onRefreshParentList) onRefreshParentList();
  };

  const handleToggleFavorite = async () => {
    if (!task) return;
    showToast(task.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    refetchDetails();
  };

  const handleToggleWatch = async () => {
    if (!task) return;
    showToast(task.isWatching ? 'Unwatched task' : 'Watching task updates');
    refetchDetails();
  };

  const handleCopyLink = (taskKey: string) => {
    navigator.clipboard.writeText(window.location.origin + `?task=${taskKey}`);
    showToast(`Link for ${taskKey} copied to clipboard`);
  };

  const handleClose = () => {
    closeTaskDetails();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Resizable Handle (Desktop Only) */}
      {!isFullScreen && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:flex items-center justify-center w-3 h-full cursor-col-resize hover:bg-indigo-500/20 active:bg-indigo-500/40 z-50 transition"
          title="Drag to resize drawer width"
        >
          <GripVertical className="w-4 h-4 text-slate-400 opacity-60 hover:opacity-100" />
        </div>
      )}

      {/* Drawer Container (Desktop Right Side / Mobile Full Screen) */}
      <div
        ref={drawerRef}
        style={{
          width: isFullScreen
            ? '100vw'
            : window.innerWidth >= 768
            ? `${drawerWidth}px`
            : '100vw',
        }}
        className="relative z-50 w-full h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-150 animate-in slide-in-from-right duration-250"
      >
        {loading && !task ? (
          /* Skeleton Loading State */
          <div className="p-8 space-y-6 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="md:col-span-2 space-y-4">
                <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        ) : error || !task ? (
          /* Error / Not Found State */
          <div className="p-12 text-center my-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Task Details Not Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The task details could not be retrieved. It may have been deleted or moved.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Close Drawer
            </button>
          </div>
        ) : (
          /* Main Drawer Content */
          <>
            {/* Header */}
            <TaskDetailHeader
              task={task}
              isEditingTitle={isEditingTitle}
              setIsEditingTitle={setIsEditingTitle}
              onUpdateTitle={handleUpdateTitle}
              onUpdateStatus={handleStatusChange}
              onUpdatePriority={handlePriorityChange}
              onToggleFavorite={handleToggleFavorite}
              onCopyLink={handleCopyLink}
              onClose={handleClose}
              isFullScreen={isFullScreen}
              onToggleFullScreen={toggleFullScreen}
              onEdit={() => setIsEditModalOpen(true)}
              onDuplicate={() => showToast(`Duplicated task as ${task.taskKey}-COPY`)}
              onArchive={() => showToast('Task archived')}
              onDelete={() => setIsDeleteModalOpen(true)}
            />

            {/* Scrollable Main Content Layout */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column (2 Cols) - Main Content (Description, Labels, Watchers, Related, History) */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description Section */}
                  <TaskDetailDescription
                    description={task.description || ''}
                    onSaveDescription={async (newDesc) => {
                      await updateTaskDetails({ description: newDesc });
                      showToast('Description saved');
                    }}
                  />

                  {/* Labels Section */}
                  <TaskDetailLabels
                    labels={task.labels || []}
                    onUpdateLabels={async (newLabels) => {
                      await updateTaskDetails({ labels: newLabels });
                      showToast('Labels updated');
                    }}
                  />

                  {/* Watchers Section */}
                  <TaskDetailWatchers
                    taskId={task.id}
                    isWatching={task.isWatching}
                    watchersList={task.watchers}
                    watcherDetails={task.watcherDetails}
                    onToggleWatch={handleToggleWatch}
                  />

                  {/* Related Tasks & Subtasks Section */}
                  <TaskDetailRelated
                    task={task}
                    onTaskUpdated={refetchDetails}
                    onSelectTask={(selected) => openTaskDetails(selected.id)}
                  />

                  {/* Enterprise Attachment Management Section */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <TaskDetailAttachments taskId={task.id} />
                  </div>

                  {/* Enterprise Task Collaboration & Comments Section */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <TaskDetailComments taskId={task.id} />
                  </div>

                  {/* History & Audit Section */}
                  <TaskDetailHistory task={task} />
                </div>

                {/* Right Column (1 Col) - Time Tracker & Properties Panel */}
                <div className="lg:col-span-1 lg:sticky lg:top-4 space-y-6">
                  <TaskTimeTracker
                    task={task}
                    onUpdateTaskEstimate={async (estimatedHours) => {
                      await updateTaskDetails({ estimatedHours });
                      showToast(`Task estimate updated to ${estimatedHours}h`);
                      if (onRefreshParentList) onRefreshParentList();
                    }}
                  />

                  <TaskDetailPropertiesPanel
                    task={task}
                    availableMembers={availableMembers}
                    availableProjects={availableProjects}
                    onUpdateProperties={handleUpdateProperties}
                    onUpdateStatus={handleStatusChange}
                    onUpdatePriority={handlePriorityChange}
                  />

                  {/* GitHub Issue Integration Section */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <TaskGitHubIntegrationSection
                      task={{
                        id: task.id,
                        taskKey: task.taskKey,
                        title: task.title,
                        description: task.description,
                        labels: task.labels,
                        projectId: taskProjectId,
                      }}
                      repoConnections={repoConnections}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Task Modal */}
      {task && (
        <TaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={async (formData) => {
            await updateTaskDetails(formData);
            showToast('Task details updated');
            setIsEditModalOpen(false);
            if (onRefreshParentList) onRefreshParentList();
          }}
          initialData={task}
          projects={availableProjects}
          members={availableMembers}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {task && (
        <DeleteTaskDialog
          task={task}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            setIsDeleteModalOpen(false);
            handleClose();
            if (onRefreshParentList) onRefreshParentList();
          }}
        />
      )}
    </div>
  );
};
