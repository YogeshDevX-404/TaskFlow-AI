import React, { useState, useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Project, ProjectStatus, ProjectVisibility } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { ProjectListRow } from './ProjectListRow';
import { ProjectCompactRow } from './ProjectCompactRow';
import { ProjectModal } from './ProjectModal';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { ProjectDetailDashboard } from './ProjectDetailDashboard';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  AlignJustify,
  FolderKanban,
  Star,
  Pin,
  Archive,
  CheckCircle2,
  Clock,
  PauseCircle,
  TrendingUp,
  SlidersHorizontal,
  Folder,
  X,
  RefreshCw,
} from 'lucide-react';

export const ProjectManagementPage: React.FC = () => {
  const {
    projects,
    activeProject,
    isLoading,
    isActionLoading,
    setActiveProject,
    toggleFavorite,
    togglePin,
    archiveProject,
    restoreProject,
    duplicateProject,
    deleteProject,
    createProject,
    updateProject,
    refetch,
  } = useProjects();

  const { workspaces } = useWorkspaceStore();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>('grid');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'projectKey' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Filtered & Sorted projects list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Archive filter
      if (showArchivedOnly) {
        if (!p.isArchived) return false;
      } else {
        if (p.isArchived) return false;
      }

      // Favorite filter
      if (showFavoritesOnly && !p.isFavorite) return false;

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Visibility filter
      if (visibilityFilter !== 'all' && p.visibility !== visibilityFilter) return false;

      // Workspace filter
      if (workspaceFilter !== 'all') {
        const wsId = typeof p.workspace === 'object' ? p.workspace.id : p.workspace;
        if (wsId !== workspaceFilter) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(q);
        const keyMatch = p.projectKey.toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        if (!nameMatch && !keyMatch && !descMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned items always come first unless custom sorting overrides
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      let compA: any = a[sortBy] || '';
      let compB: any = b[sortBy] || '';

      if (typeof compA === 'string') compA = compA.toLowerCase();
      if (typeof compB === 'string') compB = compB.toLowerCase();

      if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
      if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    projects,
    searchQuery,
    statusFilter,
    visibilityFilter,
    workspaceFilter,
    showFavoritesOnly,
    showArchivedOnly,
    sortBy,
    sortOrder,
  ]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = projects.filter((p) => !p.isArchived).length;
    const active = projects.filter((p) => p.status === 'active' && !p.isArchived).length;
    const favorites = projects.filter((p) => p.isFavorite && !p.isArchived).length;
    const archived = projects.filter((p) => p.isArchived).length;
    return { total, active, favorites, archived };
  }, [projects]);

  const handleModalSubmit = async (data: any) => {
    if (projectToEdit) {
      await updateProject(projectToEdit.id, data);
    } else {
      await createProject(data);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    await deleteProject(id);
    if (selectedProjectForDetail?.id === id) {
      setSelectedProjectForDetail(null);
    }
  };

  // If viewing project detail dashboard
  if (selectedProjectForDetail) {
    return (
      <ProjectDetailDashboard
        project={selectedProjectForDetail}
        onBack={() => setSelectedProjectForDetail(null)}
        onEdit={(p) => {
          setProjectToEdit(p);
          setIsModalOpen(true);
        }}
        onDelete={(p) => setProjectToDelete(p)}
        onArchive={(id) => archiveProject(id)}
        onRestore={(id) => restoreProject(id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Projects Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize deliverables, repositories, and workflows inside workspace containers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setProjectToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Projects</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics.total}
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Folder className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {metrics.active}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
            showFavoritesOnly
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Starred</span>
            <p className="text-2xl font-bold text-amber-500 mt-0.5">
              {metrics.favorites}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div
          onClick={() => setShowArchivedOnly(!showArchivedOnly)}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
            showArchivedOnly
              ? 'border-purple-500 ring-2 ring-purple-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Archived</span>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {metrics.archived}
            </p>
          </div>
          <div className="p-3 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-xl">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search, Filter Bar, & View Toggles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name or key..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Select Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* Workspace Filter */}
            <select
              value={workspaceFilter}
              onChange={(e) => setWorkspaceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Workspaces</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>

            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">All Visibility</option>
              <option value="workspace">Workspace</option>
              <option value="organization">Organization</option>
              <option value="private">Private</option>
            </select>

            {/* Sort options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="projectKey-asc">Project Key (A-Z)</option>
            </select>

            {/* View Switchers */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Compact View"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List Container */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Projects Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              No projects match your current search criteria or active filters. Try clearing your search query or create a new project.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setVisibilityFilter('all');
              setWorkspaceFilter('all');
              setShowFavoritesOnly(false);
              setShowArchivedOnly(false);
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => setSelectedProjectForDetail(p)}
              onEdit={(p) => {
                setProjectToEdit(p);
                setIsModalOpen(true);
              }}
              onDelete={(p) => setProjectToDelete(p)}
              onFavorite={toggleFavorite}
              onPin={togglePin}
              onArchive={archiveProject}
              onRestore={restoreProject}
              onDuplicate={duplicateProject}
            />
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Fav</th>
                  <th className="py-3 px-3 w-24">Key</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Workspace</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4 text-center">Repo</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <ProjectListRow
                    key={project.id}
                    project={project}
                    onSelect={(p) => setSelectedProjectForDetail(p)}
                    onEdit={(p) => {
                      setProjectToEdit(p);
                      setIsModalOpen(true);
                    }}
                    onDelete={(p) => setProjectToDelete(p)}
                    onFavorite={toggleFavorite}
                    onPin={togglePin}
                    onArchive={archiveProject}
                    onRestore={restoreProject}
                    onDuplicate={duplicateProject}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Compact View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProjects.map((project) => (
            <ProjectCompactRow
              key={project.id}
              project={project}
              onSelect={(p) => setSelectedProjectForDetail(p)}
              onFavorite={toggleFavorite}
              onPin={togglePin}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={projectToEdit}
        isLoading={isActionLoading}
      />

      <DeleteProjectDialog
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
};
