import React, { useState, useMemo } from 'react';
import {
  ChevronsUpDown,
  Plus,
  Search,
  Check,
  Star,
  Pin,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { WorkspaceIcon } from './WorkspaceIcon';
import { Workspace } from '../../types/workspace';

interface WorkspaceSwitcherProps {
  onOpenCreateModal?: () => void;
  onOpenManagement?: () => void;
  className?: string;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  onOpenCreateModal,
  onOpenManagement,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    toggleFavorite,
    togglePin,
    isLoading,
  } = useWorkspaces();

  const filteredWorkspaces = useMemo(() => {
    if (!search.trim()) return workspaces.filter((w) => !w.isArchived);
    const q = search.toLowerCase();
    return workspaces.filter(
      (w) =>
        !w.isArchived &&
        (w.name.toLowerCase().includes(q) ||
          w.slug.toLowerCase().includes(q) ||
          (w.description && w.description.toLowerCase().includes(q)))
    );
  }, [workspaces, search]);

  const pinnedOrFavoriteWorkspaces = useMemo(() => {
    return filteredWorkspaces.filter((w) => w.isPinned || w.isFavorite);
  }, [filteredWorkspaces]);

  const otherWorkspaces = useMemo(() => {
    return filteredWorkspaces.filter((w) => !w.isPinned && !w.isFavorite);
  }, [filteredWorkspaces]);

  const handleSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {activeWorkspace ? (
            <WorkspaceIcon
              icon={activeWorkspace.icon}
              color={activeWorkspace.color}
              size={18}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
          )}

          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Workspace
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
            </span>
          </div>
        </div>

        <ChevronsUpDown
          size={16}
          className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0"
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Filter workspaces..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Loading workspaces...
                </div>
              ) : filteredWorkspaces.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No workspaces found.
                </div>
              ) : (
                <>
                  {/* Pinned & Favorites Section */}
                  {pinnedOrFavoriteWorkspaces.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" />
                        Starred & Pinned
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {pinnedOrFavoriteWorkspaces.map((ws) => (
                          <WorkspaceItem
                            key={ws.id}
                            workspace={ws}
                            isActive={activeWorkspace?.id === ws.id}
                            onSelect={() => handleSelect(ws)}
                            onToggleFavorite={() => toggleFavorite(ws.id)}
                            onTogglePin={() => togglePin(ws.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Other Workspaces Section */}
                  {otherWorkspaces.length > 0 && (
                    <div>
                      {pinnedOrFavoriteWorkspaces.length > 0 && (
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Workspaces
                        </div>
                      )}
                      <div className="space-y-0.5 mt-1">
                        {otherWorkspaces.map((ws) => (
                          <WorkspaceItem
                            key={ws.id}
                            workspace={ws}
                            isActive={activeWorkspace?.id === ws.id}
                            onSelect={() => handleSelect(ws)}
                            onToggleFavorite={() => toggleFavorite(ws.id)}
                            onTogglePin={() => togglePin(ws.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
              {onOpenCreateModal && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCreateModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  <Plus size={14} />
                  <span>Create Workspace</span>
                </button>
              )}

              {onOpenManagement && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenManagement();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings size={14} />
                  <span>Workspace Settings & List</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface WorkspaceItemProps {
  workspace: Workspace;
  isActive: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  isActive,
  onSelect,
  onToggleFavorite,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <WorkspaceIcon
          icon={workspace.icon}
          color={workspace.color}
          size={16}
        />
        <div className="flex flex-col min-w-0">
          <span className="truncate font-semibold">{workspace.name}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            {workspace.visibility}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            workspace.isFavorite ? 'text-amber-500 opacity-100' : 'text-slate-400'
          }`}
          title={workspace.isFavorite ? 'Unstar workspace' : 'Star workspace'}
        >
          <Star
            size={12}
            className={workspace.isFavorite ? 'fill-amber-500' : ''}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
            workspace.isPinned ? 'text-indigo-500 opacity-100' : 'text-slate-400'
          }`}
          title={workspace.isPinned ? 'Unpin workspace' : 'Pin workspace'}
        >
          <Pin
            size={12}
            className={workspace.isPinned ? 'fill-indigo-500' : ''}
          />
        </button>

        {isActive && (
          <Check size={14} className="text-indigo-600 dark:text-indigo-400 ml-1" />
        )}
      </div>
    </div>
  );
};
