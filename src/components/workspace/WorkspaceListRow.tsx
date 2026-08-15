import React, { useState } from 'react';
import {
  MoreHorizontal,
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

interface WorkspaceListRowProps {
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

export const WorkspaceListRow: React.FC<WorkspaceListRowProps> = ({
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
    <tr
      className={`group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
        isActive ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
      }`}
    >
      {/* Workspace Name & Icon */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <WorkspaceIcon icon={workspace.icon} color={workspace.color} size={18} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {workspace.name}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <Check size={9} /> Active
                </span>
              )}
              {workspace.isArchived && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  Archived
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              /{workspace.slug}
            </span>
          </div>
        </div>
      </td>

      {/* Description */}
      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate hidden sm:table-cell">
        {workspace.description || '—'}
      </td>

      {/* Owner */}
      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-slate-400" />
          <span className="truncate max-w-[120px]">{ownerName}</span>
        </div>
      </td>

      {/* Visibility */}
      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 capitalize">
          {workspace.visibility === 'private' ? (
            <Lock size={12} />
          ) : workspace.visibility === 'public' ? (
            <Globe size={12} />
          ) : (
            <Building size={12} />
          )}
          <span>{workspace.visibility}</span>
        </div>
      </td>

      {/* Favorites & Pins */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleFavorite}
            className={`p-1 rounded transition-colors ${
              workspace.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
            }`}
            title={workspace.isFavorite ? 'Unstar' : 'Star'}
          >
            <Star size={13} className={workspace.isFavorite ? 'fill-amber-500' : ''} />
          </button>

          <button
            onClick={onTogglePin}
            className={`p-1 rounded transition-colors ${
              workspace.isPinned ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
            }`}
            title={workspace.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={13} className={workspace.isPinned ? 'fill-indigo-500' : ''} />
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onSelect}
            disabled={isActive || workspace.isArchived}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white cursor-default'
                : workspace.isArchived
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600'
            }`}
          >
            {isActive ? 'Current' : 'Switch'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreHorizontal size={16} />
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
      </td>
    </tr>
  );
};
