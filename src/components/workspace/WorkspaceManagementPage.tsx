import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Layers,
  Sparkles,
  Archive,
  RefreshCw,
  Building,
  Lock,
  Globe,
  Filter,
} from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { WorkspaceCard } from './WorkspaceCard';
import { WorkspaceListRow } from './WorkspaceListRow';
import { WorkspaceModal } from './WorkspaceModal';
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog';
import { Workspace } from '../../types/workspace';

export const WorkspaceManagementPage: React.FC = () => {
  const { activeOrganization } = useOrganizationStore();
  const {
    workspaces,
    activeWorkspace,
    isLoading,
    searchQuery,
    visibilityFilter,
    isArchivedFilter,
    viewMode,
    refreshWorkspaces,
    setActiveWorkspace,
    archiveWorkspace,
    restoreWorkspace,
    toggleFavorite,
    togglePin,
    duplicateWorkspace,
    setSearchQuery,
    setVisibilityFilter,
    setIsArchivedFilter,
    setViewMode,
  } = useWorkspaces();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  // Filtered workspaces for UI
  const displayWorkspaces = useMemo(() => {
    return workspaces.filter((w) => {
      // Archive filter
      if (isArchivedFilter && !w.isArchived) return false;
      if (!isArchivedFilter && w.isArchived) return false;

      // Visibility filter
      if (visibilityFilter !== 'all' && w.visibility !== visibilityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = w.name.toLowerCase().includes(q);
        const matchSlug = w.slug.toLowerCase().includes(q);
        const matchDesc = w.description && w.description.toLowerCase().includes(q);
        return matchName || matchSlug || matchDesc;
      }

      return true;
    });
  }, [workspaces, isArchivedFilter, visibilityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = workspaces.length;
    const active = workspaces.filter((w) => !w.isArchived).length;
    const archived = workspaces.filter((w) => w.isArchived).length;
    const starred = workspaces.filter((w) => w.isFavorite || w.isPinned).length;
    return { total, active, archived, starred };
  }, [workspaces]);

  const handleOpenCreate = () => {
    setWorkspaceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (workspace: Workspace) => {
    setWorkspaceToEdit(workspace);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (workspace: Workspace) => {
    await duplicateWorkspace(workspace.id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Workspaces
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage work environments within <span className="font-semibold text-slate-700 dark:text-slate-300">{activeOrganization?.name || 'Organization'}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => refreshWorkspaces()}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            title="Refresh Workspaces"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Create Workspace</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Workspaces"
          value={stats.active}
          icon={<Layers size={18} className="text-indigo-600 dark:text-indigo-400" />}
          bgColor="bg-indigo-50/60 dark:bg-indigo-950/30"
        />
        <StatCard
          title="Starred & Pinned"
          value={stats.starred}
          icon={<Sparkles size={18} className="text-amber-600 dark:text-amber-400" />}
          bgColor="bg-amber-50/60 dark:bg-amber-950/30"
        />
        <StatCard
          title="Archived"
          value={stats.archived}
          icon={<Archive size={18} className="text-slate-600 dark:text-slate-400" />}
          bgColor="bg-slate-100/80 dark:bg-slate-800/40"
        />
        <StatCard
          title="Total Workspaces"
          value={stats.total}
          icon={<Building size={18} className="text-emerald-600 dark:text-emerald-400" />}
          bgColor="bg-emerald-50/60 dark:bg-emerald-950/30"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search workspaces by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          {/* Active vs Archived Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setIsArchivedFilter(false)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                !isArchivedFilter
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setIsArchivedFilter(true)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                isArchivedFilter
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Archived ({stats.archived})
            </button>
          </div>

          {/* Visibility Select */}
          <div className="relative">
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-7"
            >
              <option value="all">All Visibilities</option>
              <option value="organization">Organization</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <Filter
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Grid / List Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Display */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading workspaces...</span>
        </div>
      ) : displayWorkspaces.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <Layers size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            No Workspaces Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `No workspaces matched "${searchQuery}". Try adjusting your filters.`
              : isArchivedFilter
              ? 'No archived workspaces in this organization.'
              : 'Get started by creating your first workspace for this organization.'}
          </p>
          {!isArchivedFilter && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>Create Workspace</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayWorkspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              isActive={activeWorkspace?.id === ws.id}
              onSelect={() => setActiveWorkspace(ws)}
              onEdit={() => handleOpenEdit(ws)}
              onDuplicate={() => handleDuplicate(ws)}
              onArchive={() => archiveWorkspace(ws.id)}
              onRestore={() => restoreWorkspace(ws.id)}
              onDelete={() => setWorkspaceToDelete(ws)}
              onToggleFavorite={() => toggleFavorite(ws.id)}
              onTogglePin={() => togglePin(ws.id)}
            />
          ))}
        </div>
      ) : (
        /* List Layout Table */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3 px-4">Workspace</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Description</th>
                  <th className="py-3 px-4 hidden md:table-cell">Owner</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Visibility</th>
                  <th className="py-3 px-4">Starred</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayWorkspaces.map((ws) => (
                  <WorkspaceListRow
                    key={ws.id}
                    workspace={ws}
                    isActive={activeWorkspace?.id === ws.id}
                    onSelect={() => setActiveWorkspace(ws)}
                    onEdit={() => handleOpenEdit(ws)}
                    onDuplicate={() => handleDuplicate(ws)}
                    onArchive={() => archiveWorkspace(ws.id)}
                    onRestore={() => restoreWorkspace(ws.id)}
                    onDelete={() => setWorkspaceToDelete(ws)}
                    onToggleFavorite={() => toggleFavorite(ws.id)}
                    onTogglePin={() => togglePin(ws.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <WorkspaceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setWorkspaceToEdit(null);
        }}
        workspaceToEdit={workspaceToEdit}
      />

      <DeleteWorkspaceDialog
        isOpen={!!workspaceToDelete}
        workspace={workspaceToDelete}
        onClose={() => setWorkspaceToDelete(null)}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 ${bgColor} transition-all`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon}
      </div>
      <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
};
