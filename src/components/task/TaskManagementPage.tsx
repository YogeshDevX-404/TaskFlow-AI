import React, { useState } from 'react';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTaskActions,
} from '../../hooks/useTasks';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '../../types/task';
import { TaskSearch } from './TaskSearch';
import { TaskFiltersBar } from './TaskFiltersBar';
import { TaskListTable } from './TaskListTable';
import { TaskGrid } from './TaskGrid';
import { TaskTree } from './hierarchy/TaskTree';
import { TaskModal } from './TaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { KanbanBoard } from './kanban/KanbanBoard';
import { useProjectStore } from '../../store/useProjectStore';
import { MOCK_MEMBERS } from '../../constants/mockData';
import {
  Plus,
  LayoutList,
  LayoutGrid,
  Rows,
  CheckCircle2,
  ListTodo,
  AlertCircle,
  Copy,
  RefreshCw,
  FolderTree,
  Kanban,
} from 'lucide-react';

export const TaskManagementPage: React.FC = () => {
  const {
    tasks,
    loading,
    error,
    filters,
    searchQuery,
    sort,
    pagination,
    viewMode,
    refetch,
    setFilters,
    setSearchQuery,
    setSort,
    setViewMode,
    setPage,
    resetFilters,
  } = useTasks();

  const { createTask, loading: isCreating } = useCreateTask();
  const { updateTask, updateStatus, updatePriority, loading: isUpdating } = useUpdateTask();
  const { deleteTask, loading: isDeleting } = useDeleteTask();
  const { archiveTask, restoreTask, duplicateTask, toggleFavorite, toggleWatch } =
    useTaskActions();

  const { projects } = useProjectStore();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCreateSubmit = async (data: TaskFormData) => {
    const created = await createTask(data);
    if (created) {
      showToast(`Task ${created.taskKey} created successfully!`);
      refetch();
    }
  };

  const handleEditSubmit = async (data: TaskFormData) => {
    if (!editingTask) return;
    const updated = await updateTask(editingTask.id, data);
    if (updated) {
      showToast(`Task ${updated.taskKey} updated successfully!`);
      refetch();
      if (selectedDetailTask?.id === editingTask.id) {
        setSelectedDetailTask(updated);
      }
    }
    setEditingTask(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    const success = await deleteTask(deletingTask.id);
    if (success) {
      showToast(`Task deleted successfully.`);
      if (selectedDetailTask?.id === deletingTask.id) {
        setSelectedDetailTask(null);
      }
      refetch();
    }
    setDeletingTask(null);
  };

  const handleCopyLink = (taskKey: string) => {
    navigator.clipboard.writeText(window.location.origin + `?task=${taskKey}`);
    showToast(`Copied task link for ${taskKey} to clipboard`);
  };

  const availableProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    projectKey: p.projectKey,
  }));

  const availableMembers = MOCK_MEMBERS.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Task Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track, filter, and organize issues, user stories, and feature tasks across your workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Search & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <TaskSearch value={searchQuery} onChange={setSearchQuery} />

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold self-end sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Table View"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'card'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('compact')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'compact'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Compact Rows View"
          >
            <Rows className="w-3.5 h-3.5" />
            <span>Compact</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Kanban Board View"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'tree'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Hierarchy Tree View"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Hierarchy</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <TaskFiltersBar
        filters={filters}
        sort={sort}
        onFilterChange={setFilters}
        onSortChange={setSort}
        onReset={resetFilters}
        availableProjects={availableProjects}
        availableMembers={availableMembers}
      />

      {/* Error Banner if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Task List Content */}
      {loading && tasks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <ListTodo className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Tasks Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No tasks match your active filters or search criteria. Try clearing filters or create a new task.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
            >
              Create Task
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard projectId={filters.projectId} />
      ) : viewMode === 'tree' ? (
        <TaskTree
          targetId={filters.projectId || 'proj-1'}
          onSelectTask={setSelectedDetailTask}
          onCreateTask={() => setIsCreateModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        <TaskListTable
          tasks={tasks}
          onSelectTask={setSelectedDetailTask}
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTask}
          onArchiveTask={(id) => {
            archiveTask(id);
            showToast('Task archived');
          }}
          onRestoreTask={(id) => {
            restoreTask(id);
            showToast('Task restored');
          }}
          onDuplicateTask={async (id) => {
            const dup = await duplicateTask(id);
            if (dup) showToast(`Duplicated as ${dup.taskKey}`);
          }}
          onToggleFavorite={toggleFavorite}
          onToggleWatch={toggleWatch}
          onCopyLink={handleCopyLink}
          onUpdateStatus={updateStatus}
          onUpdatePriority={updatePriority}
        />
      ) : (
        <TaskGrid
          tasks={tasks}
          viewMode={viewMode}
          onSelectTask={setSelectedDetailTask}
          onToggleFavorite={toggleFavorite}
          onToggleWatch={toggleWatch}
        />
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <p className="text-slate-500 font-medium">
            Showing Page <strong className="text-slate-900 dark:text-white">{pagination.page}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{pagination.totalPages}</strong> ({pagination.total} total tasks)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        projects={availableProjects}
        members={availableMembers}
        isSubmitting={isCreating}
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditSubmit}
        initialData={editingTask}
        projects={availableProjects}
        members={availableMembers}
        isSubmitting={isUpdating}
      />

      {/* Task Detail Modal & Drawer */}
      <TaskDetailModal
        task={selectedDetailTask}
        isOpen={Boolean(selectedDetailTask)}
        onClose={() => setSelectedDetailTask(null)}
        availableMembers={availableMembers}
        availableProjects={availableProjects}
      />

      {/* Delete Task Confirmation Dialog */}
      <DeleteTaskDialog
        task={deletingTask}
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};
