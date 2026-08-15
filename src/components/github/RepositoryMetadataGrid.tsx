import React, { useState } from 'react';
import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  GitBranch,
  Code,
  Copy,
  Check,
  Calendar,
  Terminal,
  Globe,
  Lock,
} from 'lucide-react';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';

interface RepositoryMetadataGridProps {
  connection: IGitHubRepoConnection;
}

const getLanguageColor = (lang?: string): string => {
  if (!lang) return 'bg-slate-500';
  const lower = lang.toLowerCase();
  if (lower.includes('typescript')) return 'bg-blue-500';
  if (lower.includes('javascript')) return 'bg-yellow-400';
  if (lower.includes('python')) return 'bg-sky-400';
  if (lower.includes('java')) return 'bg-amber-600';
  if (lower.includes('go')) return 'bg-cyan-400';
  if (lower.includes('rust')) return 'bg-orange-500';
  if (lower.includes('html')) return 'bg-rose-500';
  if (lower.includes('css')) return 'bg-indigo-400';
  if (lower.includes('c#') || lower.includes('csharp')) return 'bg-emerald-500';
  if (lower.includes('php')) return 'bg-purple-400';
  return 'bg-indigo-500';
};

export const RepositoryMetadataGrid: React.FC<RepositoryMetadataGridProps> = ({ connection }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const cloneHttps = connection.cloneUrl || `https://github.com/${connection.fullName}.git`;
  const cloneSsh = connection.sshUrl || `git@github.com:${connection.fullName}.git`;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Stars */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Stars
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {connection.stargazersCount?.toLocaleString() || 0}
          </p>
        </div>

        {/* Forks */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <GitFork className="w-3.5 h-3.5 text-indigo-400" />
            Forks
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {connection.forksCount?.toLocaleString() || 0}
          </p>
        </div>

        {/* Watchers */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Watchers
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {connection.watchersCount?.toLocaleString() || Math.floor((connection.stargazersCount || 0) * 0.4)}
          </p>
        </div>

        {/* Issues */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Open Issues
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1">
            {connection.openIssuesCount?.toLocaleString() || 0}
          </p>
        </div>

        {/* Primary Language */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            Language
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(connection.language)}`} />
            <p className="text-sm font-bold text-slate-100 truncate">
              {connection.language || 'Markdown'}
            </p>
          </div>
        </div>

        {/* Default Branch */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            Default Branch
          </div>
          <p className="text-sm font-mono font-bold text-slate-200 mt-1 truncate">
            {connection.defaultBranch || 'main'}
          </p>
        </div>
      </div>

      {/* Clone & Repository URLs Box */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Clone Repository & Endpoint URLs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* HTTPS Clone URL */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">HTTPS Clone URL</span>
              <code className="text-xs text-indigo-300 font-mono truncate block mt-0.5">{cloneHttps}</code>
            </div>
            <button
              id="btn-copy-https-clone"
              onClick={() => handleCopy(cloneHttps, 'https')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 text-xs flex items-center gap-1"
            >
              {copiedType === 'https' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* SSH Clone URL */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">SSH Clone URL</span>
              <code className="text-xs text-indigo-300 font-mono truncate block mt-0.5">{cloneSsh}</code>
            </div>
            <button
              id="btn-copy-ssh-clone"
              onClick={() => handleCopy(cloneSsh, 'ssh')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 text-xs flex items-center gap-1"
            >
              {copiedType === 'ssh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Repository Timeline Metadata */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4 text-xs text-slate-400 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Created on GitHub: <strong className="text-slate-200">{formatDate(connection.githubCreatedAt)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Last Pushed: <strong className="text-slate-200">{formatDate(connection.githubPushedAt)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Last Updated: <strong className="text-slate-200">{formatDate(connection.githubUpdatedAt)}</strong></span>
        </div>
      </div>
    </div>
  );
};
