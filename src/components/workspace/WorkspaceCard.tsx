import React, { useState } from 'react';
import {
  MoreVertical,
  Star,
  Pin,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  Check,
  Building,
  Lock,
  Globe,
  User,
} from 'lucide-react';
import { WorkspaceIcon } from './WorkspaceIcon';
import { Workspace } from '../../types/workspace';

interface WorkspaceCardProps {
  workspace: Workspace;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  isActive,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  onToggleFavorite,
  onTogglePin,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const ownerName =
    typeof workspace.owner === 'object' && workspace.owner ? workspace.owner.name : 'Unknown Owner';

  return (
    <div
      className={`relative group rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
        isActive
          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-md'
          : workspace.isArchived
          ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-75'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <WorkspaceIcon
              icon={workspace.icon}
              color={workspace.color}
              size={22}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {workspace.name}
                </h3>
                {isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    <Check size={10} /> Active
                  </span>
                )}
                {workspace.isArchived && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                /{workspace.slug}
              </p>
            </div>
          </div>

          {/* Quick Actions & Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-lg transition-colors ${
                workspace.isFavorite
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
              title={workspace.isFavorite ? 'Unstar workspace' : 'Star workspace'}
            >
              <Star size={14} className={workspace.isFavorite ? 'fill-amber-500' : ''} />
            </button>

            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-colors ${
                workspace.isPinned
                  ? 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
              title={workspace.isPinned ? 'Unpin workspace' : 'Pin workspace'}
            >
              <Pin size={14} className={workspace.isPinned ? 'fill-indigo-500' : ''} />
            </button>

            {/* Overflow Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <Edit size={14} /> Edit Details
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDuplicate();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <Copy size={14} /> Duplicate Workspace
                    </button>

                    {workspace.isArchived ? (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onRestore();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-emerald-600 dark:text-emerald-400"
                      >
                        <RotateCcw size={14} /> Restore Workspace
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onArchive();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-amber-600 dark:text-amber-400"
                      >
                        <Archive size={14} /> Archive Workspace
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 size={14} /> Delete Workspace
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
          {workspace.description || 'No workspace description provided.'}
        </p>
      </div>

      {/* Footer Info & Switch Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <User size={12} className="text-slate-400" />
            <span className="truncate max-w-[100px]">{ownerName}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <div className="flex items-center gap-1 capitalize">
            {workspace.visibility === 'private' ? (
              <Lock size={11} />
            ) : workspace.visibility === 'public' ? (
              <Globe size={11} />
            ) : (
              <Building size={11} />
            )}
            <span>{workspace.visibility}</span>
          </div>
        </div>

        <button
          onClick={onSelect}
          disabled={isActive || workspace.isArchived}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isActive
              ? 'bg-indigo-600 text-white cursor-default'
              : workspace.isArchived
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600'
          }`}
        >
          {isActive ? 'Current' : workspace.isArchived ? 'Archived' : 'Switch'}
        </button>
      </div>
    </div>
  );
};
