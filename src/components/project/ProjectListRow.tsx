import React from 'react';
import { Project, ProjectStatus } from '../../types/project';
import { ProjectIcon } from './ProjectIcon';
import {
  Star,
  Pin,
  MoreHorizontal,
  GitBranch,
  ExternalLink,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Layout,
  Clock,
  CheckCircle2,
  PauseCircle,
  ArchiveIcon,
} from 'lucide-react';

interface ProjectListRowProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onFavorite: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  planning: {
    label: 'Planning',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Clock,
  },
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  on_hold: {
    label: 'On Hold',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: PauseCircle,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    bg: 'bg-gray-500/10 dark:bg-gray-500/20',
    text: 'text-gray-600 dark:text-gray-400 border-gray-500/20',
    icon: ArchiveIcon,
  },
};

export const ProjectListRow: React.FC<ProjectListRowProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
  onFavorite,
  onPin,
  onArchive,
  onRestore,
  onDuplicate,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;

  const workspaceName =
    typeof project.workspace === 'object' ? project.workspace.name : project.workspace || 'Workspace';

  const ownerName =
    typeof project.owner === 'object' ? project.owner.name : 'Project Lead';

  const progress = project.progress ?? 0;

  return (
    <tr
      id={`project-row-${project.id}`}
      className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      {/* Pin & Favorite */}
      <td className="py-3 px-4 w-12 text-center">
        <div className="flex items-center gap-1 justify-center">
          <button
            type="button"
            onClick={() => onFavorite(project.id)}
            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
              project.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'
            }`}
          >
            <Star className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onPin(project.id)}
            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
              project.isPinned ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>
      </td>

      {/* Project Key */}
      <td className="py-3 px-3 w-24">
        <span className="px-2 py-0.5 text-xs font-mono font-bold tracking-wider rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {project.projectKey}
        </span>
      </td>

      {/* Name & Icon */}
      <td className="py-3 px-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <ProjectIcon icon={project.icon} className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0" iconClassName="w-4 h-4" />
          <div className="min-w-0">
            <h4
              onClick={() => onSelect(project)}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate transition-colors"
            >
              {project.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
      </td>

      {/* Workspace */}
      <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
        {workspaceName}
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusCfg.bg} ${statusCfg.text}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
      </td>

      {/* Progress */}
      <td className="py-3 px-4 w-32">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8 text-right">
            {progress}%
          </span>
        </div>
      </td>

      {/* Owner */}
      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
        {ownerName}
      </td>

      {/* Repository / Links */}
      <td className="py-3 px-4 text-center">
        {project.repositoryUrl ? (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-block"
            title="Repository"
          >
            <GitBranch className="w-4 h-4" />
          </a>
        ) : (
          <span className="text-slate-300 dark:text-slate-700">-</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-4 top-10 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-sm text-left">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelect(project);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <Layout className="w-4 h-4 text-indigo-500" />
                View Dashboard
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(project);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4 text-blue-500" />
                Edit Details
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(project.id);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <Copy className="w-4 h-4 text-emerald-500" />
                Duplicate Project
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              {project.isArchived ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRestore(project.id);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive(project.id);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(project);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
};
