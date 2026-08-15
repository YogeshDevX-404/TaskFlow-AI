import React from 'react';
import {
  Info,
  FolderGit2,
  Globe,
  Lock,
  Building,
  User,
  Calendar,
  Layers,
  Key,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ProjectInfoCardProps {
  info: {
    name: string;
    key: string;
    description: string;
    workspace: string;
    organization: string;
    visibility: 'public' | 'private' | 'internal';
    status: string;
    owner: {
      name: string;
      email: string;
    };
    repositoryUrl: string;
    websiteUrl: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ info }) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Information</h3>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40">
          KEY: {info.key}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Project Name */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-slate-400" /> Project Name
          </span>
          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{info.name}</p>
        </div>

        {/* Project Key */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Key className="w-3 h-3 text-slate-400" /> Project Key
          </span>
          <p className="font-mono font-bold text-slate-900 dark:text-slate-100">{info.key}</p>
        </div>

        {/* Status & Visibility */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" /> Status & Visibility
          </span>
          <div className="flex items-center gap-2">
            <span className="capitalize font-bold text-emerald-600 dark:text-emerald-400">
              {info.status.replace('_', ' ')}
            </span>
            <span className="text-slate-400">•</span>
            <span className="capitalize font-medium text-slate-600 dark:text-slate-300">
              {info.visibility}
            </span>
          </div>
        </div>

        {/* Workspace */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Building className="w-3 h-3 text-slate-400" /> Workspace
          </span>
          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{info.workspace}</p>
        </div>

        {/* Organization */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Building className="w-3 h-3 text-slate-400" /> Organization
          </span>
          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{info.organization}</p>
        </div>

        {/* Owner */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <User className="w-3 h-3 text-slate-400" /> Project Owner
          </span>
          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{info.owner.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{info.owner.email}</p>
        </div>

        {/* Repository Placeholder */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <FolderGit2 className="w-3 h-3 text-slate-400" /> Repository
          </span>
          {info.repositoryUrl ? (
            <a
              href={info.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono font-medium truncate"
            >
              <span>{info.repositoryUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ) : (
            <span className="text-slate-400 italic">No repo linked</span>
          )}
        </div>

        {/* Website */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-400" /> Website
          </span>
          {info.websiteUrl ? (
            <a
              href={info.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono font-medium truncate"
            >
              <span>{info.websiteUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ) : (
            <span className="text-slate-400 italic">No website URL</span>
          )}
        </div>

        {/* Created & Updated Dates */}
        <div className="space-y-1 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400" /> Timeline Dates
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            Created: {new Date(info.createdAt).toLocaleDateString()}
          </p>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            Updated: {new Date(info.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Description Block */}
      <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          Description
        </span>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {info.description || 'No detailed description added for this project.'}
        </p>
      </div>
    </div>
  );
};
