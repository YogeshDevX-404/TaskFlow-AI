import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import {
  KanbanColumn,
} from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { BoardToolbar } from './BoardToolbar';
import { BulkActionsBar } from './BulkActionsBar';
import { BoardSettingsModal } from './BoardSettingsModal';
import { CreateColumnModal } from './CreateColumnModal';
import { useBoardStore } from '../../../store/useBoardStore';
import { useDragDrop, dropAnimationConfig } from '../../../hooks/useDragDrop';
import { BoardColumn } from '../../../types/board';
import { Task, TaskStatus } from '../../../types/task';
import { TaskModal } from '../TaskModal';
import { TaskDetailModal } from '../TaskDetailModal';
import { MOCK_MEMBERS } from '../../../constants/mockData';
import { useProjectStore } from '../../../store/useProjectStore';
import { LayoutGrid, AlertCircle, RefreshCw, Plus } from 'lucide-react';

interface KanbanBoardProps {
  projectId?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId: propProjectId }) => {
  const { activeProject, projects } = useProjectStore();
  const activeProjectId = propProjectId || activeProject?.id || projects[0]?.id || 'proj-1';

  const {
    columns,
    settings,
    tasks,
    groupedTasks,
    selectedTaskIds,
    isLoading,
    error,
    userRole,
    fetchBoard,
    toggleSelectTask,
  } = useBoardStore();

  const {
    sensors,
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragDrop();

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);

  // Quick Task Creation / Editing Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState<TaskStatus>('Todo');
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [quickEditingTask, setQuickEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (activeProjectId) {
      fetchBoard(activeProjectId);
    }
  }, [activeProjectId, fetchBoard]);

  const availableMembers = MOCK_MEMBERS.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    avatar: m.avatar,
  }));

  const availableProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    projectKey: p.projectKey,
  }));

  const handleOpenCreateTaskInColumn = (statusKey: TaskStatus) => {
    setCreateTaskInitialStatus(statusKey);
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditColumn = (col: BoardColumn) => {
    setEditingColumn(col);
    setIsCreateColumnOpen(true);
  };

  const handleCloseColumnModal = () => {
    setEditingColumn(null);
    setIsCreateColumnOpen(false);
  };

  // Grouping modes
  const isGroupByStatus = (settings.groupBy || 'status') === 'status';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
      {/* Board Top Toolbar */}
      <BoardToolbar
        availableMembers={availableMembers}
        onOpenCreateColumn={() => {
          setEditingColumn(null);
          setIsCreateColumnOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Error Alert */}
      {error && (
        <div className="m-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Drag-and-Drop Kanban Area */}
      <div className="flex-1 overflow-x-auto p-4 min-h-[500px]">
        {isLoading && tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 py-16">
            <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading Kanban board...</p>
          </div>
        ) : isGroupByStatus ? (
          /* Standard Status Columns Board */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-4 min-w-max h-full pb-4">
              {columns
                .filter((col) => !col.isArchived)
                .sort((a, b) => a.order - b.order)
                .map((column) => {
                  const columnTasks = groupedTasks[column.statusKey] || [];
                  return (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      settings={settings}
                      selectedTaskIds={selectedTaskIds}
                      onSelectTask={toggleSelectTask}
                      onOpenQuickEdit={(t) => setSelectedTaskForDetail(t)}
                      onOpenCreateTask={handleOpenCreateTaskInColumn}
                      onEditColumn={handleOpenEditColumn}
                    />
                  );
                })}

              {/* Add New Column Tile */}
              <button
                type="button"
                onClick={() => {
                  setEditingColumn(null);
                  setIsCreateColumnOpen(true);
                }}
                className="w-72 h-32 flex-shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer group"
              >
                <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Add New Column</span>
              </button>
            </div>

            {/* Smooth Drag Overlay Preview */}
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeTask ? (
                <KanbanCard
                  task={activeTask}
                  cardSize={settings.cardSize}
                  showLabels={settings.showLabels}
                  showStoryPoints={settings.showStoryPoints}
                  showAvatars={settings.showAvatars}
                  showDueDates={settings.showDueDates}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Grouped Swimlane View (Assignee, Priority, Labels, Project) */
          <div className="space-y-6 min-w-[800px]">
            {Object.keys(groupedTasks).map((groupGroupKey) => {
              const groupTaskList = groupedTasks[groupGroupKey] || [];
              return (
                <div
                  key={groupGroupKey}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span>{groupGroupKey}</span>
                      <span className="font-mono text-xs text-slate-400">({groupTaskList.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {groupTaskList.map((t) => (
                      <KanbanCard
                        key={t.id}
                        task={t}
                        cardSize={settings.cardSize}
                        showLabels={settings.showLabels}
                        showStoryPoints={settings.showStoryPoints}
                        showAvatars={settings.showAvatars}
                        showDueDates={settings.showDueDates}
                        isSelected={selectedTaskIds.has(t.id)}
                        onSelect={toggleSelectTask}
                        onOpenQuickEdit={(task) => setSelectedTaskForDetail(task)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Multi-Selection Bulk Actions Bar */}
      <BulkActionsBar availableMembers={availableMembers} />

      {/* Board Display Settings Modal */}
      <BoardSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Create / Edit Column Modal */}
      <CreateColumnModal
        isOpen={isCreateColumnOpen}
        editingColumn={editingColumn}
        onClose={handleCloseColumnModal}
      />

      {/* Quick Create Task Modal */}
      <TaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={async () => {
          setIsCreateTaskOpen(false);
          fetchBoard(activeProjectId);
        }}
        initialData={{ status: createTaskInitialStatus } as any}
        projects={availableProjects}
        members={availableMembers}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        availableMembers={availableMembers}
        availableProjects={availableProjects}
      />
    </div>
  );
};
