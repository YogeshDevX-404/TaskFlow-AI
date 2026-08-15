import React, { useState } from 'react';
import { Project } from '../../types/project';
import { ProjectIcon } from '../project/ProjectIcon';
import {
  Star,
  Pin,
  Share2,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Building,
  Globe,
  FolderGit2,
  Edit3,
} from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onOpenSettings?: () => void;
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onEdit,
  onOpenSettings,
  onToggleFavorite,
  onTogglePin,
}) => {
  const [isFavorite, setIsFavorite] = useState(!!project.isFavorite);
  const [isPinned, setIsPinned] = useState(!!project.isPinned);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const workspaceName =
    typeof project.workspace === 'object' ? project.workspace.name : project.workspace || 'Workspace';

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) onToggleFavorite(project.id);
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
    if (onTogglePin) onTogglePin(project.id);
  };

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Cover Image */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-950 dark:via-purple-900 dark:to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

        {/* Top Right Quick Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handlePin}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              isPinned
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
            }`}
            title={isPinned ? 'Unpin project' : 'Pin project to dashboard'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-xl bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60 hover:text-white transition-all"
            title="Share project dashboard"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Info Strip */}
      <div className="p-6 relative -mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <ProjectIcon
            icon={project.icon}
            className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0"
            iconClassName="w-10 h-10"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {project.projectKey}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {workspaceName}
              </span>
              <span className="capitalize px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl line-clamp-2">
              {project.description || 'Enterprise platform workspace and core project dashboard.'}
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Project
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings Shortcut
            </button>
          )}
        </div>
      </div>

      {/* Share Modal Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-500" />
                Share Project Dashboard
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anyone with authorized workspace permissions can view this project dashboard.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
