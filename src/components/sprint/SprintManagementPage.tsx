import React, { useState, useEffect } from 'react';
import { useSprints } from '../../hooks/useSprints';
import { useCurrentSprint } from '../../hooks/useCurrentSprint';
import { useSprintStore } from '../../store/useSprintStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Sprint, SprintFormData, SprintStatus, SprintSortOption } from '../../types/sprint';
import { SprintCard } from './SprintCard';
import { SprintDashboard } from './SprintDashboard';
import { SprintPlanning } from './SprintPlanning';
import { SprintBoardView } from './SprintBoardView';
import { SprintModal } from './SprintModal';
import { CompleteSprintModal } from './CompleteSprintModal';
import {
  Layers,
  LayoutDashboard,
  Kanban,
  ListTodo,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Zap,
  Target,
  RefreshCw,
  Archive,
  FolderKanban,
} from 'lucide-react';

export const SprintManagementPage: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const {
    sprints,
    isLoading,
    error,
    filters,
    sort,
    fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint,
    archiveSprint,
    duplicateSprint,
    startSprint,
    completeSprint,
    cancelSprint,
    setFilters,
    setSort,
    resetFilters,
  } = useSprints();

  const { sprint: activeOrSelectedSprint, metrics } = useCurrentSprint();
  const { setCurrentSprint } = useSprintStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'planning' | 'board' | 'list'>('dashboard');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const projectList = projects.map((p) => ({
    id: p.id,
    name: p.name,
    projectKey: p.projectKey,
  }));

  const handleCreateSubmit = async (data: SprintFormData) => {
    if (editingSprint) {
      await updateSprint(editingSprint.id, data);
      setEditingSprint(null);
    } else {
      await createSprint(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingSprintId) {
      await deleteSprint(deletingSprintId);
      setDeletingSprintId(null);
    }
  };

  const futurePlanningSprints = sprints.filter(
    (s) => s.status === 'Planning' && s.id !== completingSprint?.id
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Sprint Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Enterprise iteration cycles, capacity planning, burndown tracking & velocity reports.
              </p>
            </div>
          </div>
        </div>

        {/* New Sprint Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingSprint(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sprint</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Sprint Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('planning')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'planning'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Sprint Planning</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Sprint Board</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>All Sprints ({sprints.length})</span>
          </button>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sprint..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ status: e.target.value as any })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Project Filter */}
          <select
            value={filters.projectId || ''}
            onChange={(e) => setFilters({ projectId: e.target.value || undefined })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold outline-none max-w-[150px] truncate"
          >
            <option value="">All Projects</option>
            {projectList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SprintSortOption)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="startDate">Sort: Start Date</option>
            <option value="endDate">Sort: End Date</option>
          </select>
        </div>
      </div>

      {/* Main View Display */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="font-semibold">Loading Sprints...</p>
        </div>
      ) : activeTab === 'dashboard' ? (
        <SprintDashboard
          sprint={activeOrSelectedSprint}
          metrics={metrics}
          sprintTasks={[]}
          onStartSprint={(s) => startSprint(s.id)}
          onCompleteSprint={(s) => setCompletingSprint(s)}
        />
      ) : activeTab === 'planning' ? (
        <SprintPlanning
          sprint={activeOrSelectedSprint}
          sprints={sprints}
          onSelectSprint={(s) => setCurrentSprint(s)}
          onStartSprint={(s) => startSprint(s.id)}
          onCreateSprint={() => {
            setEditingSprint(null);
            setIsCreateModalOpen(true);
          }}
        />
      ) : activeTab === 'board' ? (
        <SprintBoardView
          sprints={sprints}
          onStartSprint={(s) => startSprint(s.id)}
          onCompleteSprint={(s) => setCompletingSprint(s)}
          onCancelSprint={(s) => cancelSprint(s.id)}
          onEditSprint={(s) => {
            setEditingSprint(s);
            setIsCreateModalOpen(true);
          }}
          onDuplicateSprint={(s) => duplicateSprint(s.id)}
          onArchiveSprint={(s) => archiveSprint(s.id, !s.isArchived)}
          onDeleteSprint={(s) => setDeletingSprintId(s.id)}
          onSelectSprint={(s) => {
            setCurrentSprint(s);
            setActiveTab('planning');
          }}
          onCreateSprint={() => {
            setEditingSprint(null);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        /* All Sprints Grid List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <FolderKanban className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No Sprints Found</p>
              <p className="text-xs">Create your first sprint to start organizing tasks into iteration cycles.</p>
            </div>
          ) : (
            sprints.map((s) => (
              <SprintCard
                key={s.id}
                sprint={s}
                onStart={(s) => startSprint(s.id)}
                onComplete={(s) => setCompletingSprint(s)}
                onCancel={(s) => cancelSprint(s.id)}
                onEdit={(s) => {
                  setEditingSprint(s);
                  setIsCreateModalOpen(true);
                }}
                onDuplicate={(s) => duplicateSprint(s.id)}
                onArchive={(s) => archiveSprint(s.id, !s.isArchived)}
                onDelete={(s) => setDeletingSprintId(s.id)}
                onSelect={(s) => {
                  setCurrentSprint(s);
                  setActiveTab('dashboard');
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Modal Dialogs */}
      <SprintModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        editingSprint={editingSprint}
        projects={projectList}
      />

      <CompleteSprintModal
        isOpen={Boolean(completingSprint)}
        onClose={() => setCompletingSprint(null)}
        onConfirm={async (targetSprintId) => {
          if (completingSprint) {
            await completeSprint(completingSprint.id, targetSprintId);
            setCompletingSprint(null);
          }
        }}
        sprint={completingSprint}
        futureSprints={futurePlanningSprints}
        completedCount={metrics.completedTasks}
        incompleteCount={metrics.totalTasks - metrics.completedTasks}
        achievedVelocity={metrics.completedPoints}
      />

      {/* Delete Confirmation Dialog */}
      {deletingSprintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Confirm Delete Sprint
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this sprint? Associated tasks will be returned to the unassigned Product Backlog.
            </p>
            <div className="flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setDeletingSprintId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Delete Sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
