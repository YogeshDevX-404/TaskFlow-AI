import React from 'react';
import { Project, ProjectStatus, ProjectVisibility } from '../../types/project';
import { ProjectIcon } from './ProjectIcon';
import {
  MoreVertical,
  Star,
  Pin,
  ExternalLink,
  GitBranch,
  Calendar,
  Users,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Layout,
  CheckCircle2,
  Clock,
  PauseCircle,
  AlertCircle,
  ArchiveIcon,
} from 'lucide-react';

interface ProjectCardProps {
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

const VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  private: 'Private',
  workspace: 'Workspace',
  organization: 'Organization',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
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
  const ownerAvatar =
    typeof project.owner === 'object' ? project.owner.avatar : undefined;

  const progress = project.progress ?? 0;

  return (
    <div
      id={`project-card-${project.id}`}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200"
    >
      {/* Cover Image or Gradient Banner */}
      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-slate-900/60" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-xs font-mono font-bold tracking-wider rounded-md bg-black/60 backdrop-blur-md text-white border border-white/20">
              {project.projectKey}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-black/40 backdrop-blur-md text-slate-200">
              {VISIBILITY_LABELS[project.visibility]}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPin(project.id);
              }}
              title={project.isPinned ? 'Unpin project' : 'Pin project'}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                project.isPinned
                  ? 'bg-amber-500 text-white'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(project.id);
              }}
              title={project.isFavorite ? 'Remove favorite' : 'Add favorite'}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                project.isFavorite
                  ? 'bg-amber-500 text-white'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Status Pill on Cover Bottom Right */}
        <div className="absolute bottom-2.5 right-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border backdrop-blur-md ${statusCfg.bg} ${statusCfg.text}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row with icon & title & menu */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <ProjectIcon icon={project.icon} />
              <div className="min-w-0">
                <h3
                  onClick={() => onSelect(project)}
                  className="text-base font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate transition-colors"
                >
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {workspaceName}
                </p>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-sm">
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
                        Restore Project
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
                        Archive Project
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
                      Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </p>
        </div>

        <div>
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-500 dark:text-slate-400">Progress</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card Footer: Metadata & Owner */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              {ownerAvatar ? (
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                  {ownerName.charAt(0)}
                </div>
              )}
              <span className="truncate max-w-[100px] font-medium text-slate-700 dark:text-slate-300">
                {ownerName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Repository"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                </a>
              )}
              {project.taskCount && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  {project.taskCount.completed}/{project.taskCount.total} tasks
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
