import React from 'react';
import { Project } from '../../types/project';
import { ProjectIcon } from './ProjectIcon';
import { Star, Pin, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ProjectCompactRowProps {
  project: Project;
  onSelect: (project: Project) => void;
  onFavorite: (id: string) => void;
  onPin: (id: string) => void;
}

export const ProjectCompactRow: React.FC<ProjectCompactRowProps> = ({
  project,
  onSelect,
  onFavorite,
  onPin,
}) => {
  const workspaceName =
    typeof project.workspace === 'object' ? project.workspace.name : project.workspace || 'Workspace';

  return (
    <div
      onClick={() => onSelect(project)}
      className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-500/50 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <ProjectIcon
          icon={project.icon}
          className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"
          iconClassName="w-4 h-4"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              [{project.projectKey}]
            </span>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {project.name}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {workspaceName} • {project.status.replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(project.id);
          }}
          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
            project.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'
          }`}
        >
          <Star className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPin(project.id);
          }}
          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
            project.isPinned ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'
          }`}
        >
          <Pin className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
