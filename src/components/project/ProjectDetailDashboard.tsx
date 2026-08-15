import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus } from '../../types/project';
import { ProjectIcon } from './ProjectIcon';
import { ProjectMembersView } from './member/ProjectMembersView';
import { ProjectDashboardView } from '../dashboard/ProjectDashboardView';
import {
  GitHubIntegrationApiService,
  IGitHubRepoConnection,
} from '../../services/api/githubIntegrationService';
import { ConnectedRepositoryCard } from '../github/ConnectedRepositoryCard';
import { RepositoryBrowser } from '../github/RepositoryBrowser';
import {
  ArrowLeft,
  Calendar,
  Clock,
  GitBranch,
  Globe,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Settings,
  Layout,
  FileText,
  Activity,
  ListTodo,
  ExternalLink,
  Edit3,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  ShieldAlert,
  FolderGit2,
  Lock,
  Building,
  UserCheck,
} from 'lucide-react';

interface ProjectDetailDashboardProps {
  project: Project;
  onBack: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export const ProjectDetailDashboard: React.FC<ProjectDetailDashboardProps> = ({
  project,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [settingsTab, setSettingsTab] = useState<'general' | 'details' | 'repository' | 'members' | 'danger'>('general');

  // GitHub Repository connections state
  const [repoConnections, setRepoConnections] = useState<IGitHubRepoConnection[]>([]);
  const [loadingRepoConnections, setLoadingRepoConnections] = useState(false);
  const [showRepoBrowserModal, setShowRepoBrowserModal] = useState(false);

  const loadProjectRepoConnections = useCallback(async () => {
    try {
      setLoadingRepoConnections(true);
      const connections = await GitHubIntegrationApiService.getProjectRepositories(project.id);
      setRepoConnections(connections);
    } catch (err) {
      console.error('Failed to load project GitHub repository connections:', err);
    } finally {
      setLoadingRepoConnections(false);
    }
  }, [project.id]);

  useEffect(() => {
    if (activeTab === 'settings' && settingsTab === 'repository') {
      loadProjectRepoConnections();
    }
  }, [activeTab, settingsTab, loadProjectRepoConnections]);

  const handleSyncRepo = async (connectionId: string) => {
    try {
      const updated = await GitHubIntegrationApiService.syncProjectRepository(project.id, connectionId);
      setRepoConnections((prev) => prev.map((c) => (c.id === connectionId ? updated : c)));
    } catch (err) {
      console.error('Failed to sync repository:', err);
    }
  };

  const handleDisconnectRepo = async (connectionId: string) => {
    try {
      await GitHubIntegrationApiService.disconnectProjectRepository(project.id, connectionId);
      setRepoConnections((prev) => prev.filter((c) => c.id !== connectionId));
    } catch (err) {
      console.error('Failed to disconnect repository:', err);
    }
  };

  const workspaceName =
    typeof project.workspace === 'object' ? project.workspace.name : project.workspace || 'Workspace';

  const ownerName =
    typeof project.owner === 'object' ? project.owner.name : 'Project Owner';
  const ownerEmail =
    typeof project.owner === 'object' ? project.owner.email : 'owner@acme.com';

  const progress = project.progress ?? 50;

  return (
    <div id={`project-detail-${project.id}`} className="space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
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

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </div>

        {/* Info Header */}
        <div className="p-6 relative -mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <ProjectIcon
              icon={project.icon}
              className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0"
              iconClassName="w-10 h-10"
            />
            <div className="space-y-1">
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                {project.description || 'No description added yet.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Project
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'settings' ? 'overview' : 'settings')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Project Settings
            </button>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="px-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layout className="w-4 h-4" />
            Overview Dashboard
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Project Members
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings & Danger Zone
          </button>
        </div>
      </div>

      {/* Overview Dashboard Content */}
      {activeTab === 'overview' && (
        <ProjectDashboardView
          project={project}
          onEditProject={onEdit}
          onOpenSettingsShortcut={() => setActiveTab('settings')}
          onNavigateToMembersTab={() => setActiveTab('members')}
        />
      )}

      {/* Project Members Tab Content */}
      {activeTab === 'members' && (
        <ProjectMembersView projectId={project.id} projectName={project.name} />
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Subtabs sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 space-y-1 h-fit">
            <button
              onClick={() => setSettingsTab('general')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                settingsTab === 'general'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setSettingsTab('details')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                settingsTab === 'details'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={() => setSettingsTab('repository')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                settingsTab === 'repository'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              Repository
            </button>
            <button
              onClick={() => setSettingsTab('members')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                settingsTab === 'members'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Project Members
            </button>
            <button
              onClick={() => setSettingsTab('danger')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                settingsTab === 'danger'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Danger Zone
            </button>
          </div>

          {/* Subtab main panel */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            {settingsTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">General Project Settings</h3>
                <p className="text-xs text-slate-500">
                  Update primary project identifiers, key, status, and visibility options.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-slate-400">Project Key</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {project.projectKey}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <span className="text-slate-400">Visibility</span>
                    <p className="font-semibold capitalize text-slate-900 dark:text-white text-sm">
                      {project.visibility}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onEdit(project)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
                  >
                    Open Edit Modal
                  </button>
                </div>
              </div>
            )}

            {settingsTab === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Details</h3>
                <p className="text-xs text-slate-500">
                  View full description, start dates, and owner info.
                </p>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Description</span>
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {project.description || 'No detailed description set.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'repository' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      GitHub Repository Access & Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Connect, manage, and sync GitHub organizations and repositories linked to this project.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRepoBrowserModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <FolderGit2 className="w-4 h-4" />
                    Browse & Connect Repositories
                  </button>
                </div>

                {/* Primary Repository URL */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Primary Project Repository URL</span>
                  <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {project.repositoryUrl || 'No primary repository URL set'}
                  </p>
                </div>

                {/* Connected GitHub Repositories List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Connected GitHub Repositories ({repoConnections.length})
                  </h4>

                  {loadingRepoConnections ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Loading linked GitHub repositories...
                    </div>
                  ) : repoConnections.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
                      <FolderGit2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-xs text-slate-500">
                        No GitHub repositories are connected to this project yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowRepoBrowserModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Connect GitHub Repository
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {repoConnections.map((conn) => (
                        <ConnectedRepositoryCard
                          key={conn.id}
                          connection={conn}
                          onSync={handleSyncRepo}
                          onDisconnect={handleDisconnectRepo}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* GitHub Repository Browser Modal */}
                {showRepoBrowserModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-auto max-h-[90vh] overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRepoBrowserModal(false);
                          loadProjectRepoConnections();
                        }}
                        className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        ✕
                      </button>

                      <RepositoryBrowser
                        initialProjectId={project.id}
                        onProjectConnected={() => {
                          loadProjectRepoConnections();
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {settingsTab === 'members' && (
              <ProjectMembersView projectId={project.id} projectName={project.name} />
            )}

            {settingsTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-xs text-slate-500">
                    Actions here can impact project visibility or permanently remove data.
                  </p>
                </div>

                {/* Archive / Restore */}
                <div className="p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-500/5 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {project.isArchived ? 'Restore Project' : 'Archive Project'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {project.isArchived
                        ? 'Bring this project back into active search and dashboards.'
                        : 'Hide this project from standard active lists without deleting.'}
                    </p>
                  </div>
                  {project.isArchived ? (
                    <button
                      onClick={() => onRestore(project.id)}
                      className="px-4 py-2 text-xs font-semibold text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 rounded-lg transition-colors shrink-0"
                    >
                      Restore Project
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchive(project.id)}
                      className="px-4 py-2 text-xs font-semibold text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 rounded-lg transition-colors shrink-0"
                    >
                      Archive Project
                    </button>
                  )}
                </div>

                {/* Delete Project */}
                <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-500/5 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                      Delete Project
                    </h4>
                    <p className="text-xs text-slate-500">
                      Permanently remove this project. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(project)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow transition-colors shrink-0"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
