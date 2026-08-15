import React, { useState, useEffect, useCallback } from 'react';
import {
  GitHubIntegrationApiService,
  IGitHubOrg,
  IGitHubRepo,
  IFetchRepositoriesParams,
  IGitHubStatusResponse,
} from '../../services/api/githubIntegrationService';
import { ProjectService } from '../../services/api/projectService';
import { Project } from '../../types/project';
import { GitHubOrgSelector } from './GitHubOrgSelector';
import { RepositoryCard } from './RepositoryCard';
import { RepositoryDetailsModal } from './RepositoryDetailsModal';
import {
  Search,
  Filter,
  RefreshCw,
  GitBranch,
  Github,
  AlertCircle,
  FolderGit2,
  Lock,
  Globe,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Building2,
  CheckCircle2,
  X,
} from 'lucide-react';

interface RepositoryBrowserProps {
  initialProjectId?: string;
  onProjectConnected?: () => void;
}

export const RepositoryBrowser: React.FC<RepositoryBrowserProps> = ({
  initialProjectId,
  onProjectConnected,
}) => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<IGitHubStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Orgs and Repos state
  const [organizations, setOrganizations] = useState<IGitHubOrg[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<IGitHubOrg | null>(null);
  const [repositories, setRepositories] = useState<IGitHubRepo[]>([]);
  const [totalRepos, setTotalRepos] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters and Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [archivedFilter, setArchivedFilter] = useState<boolean | undefined>(undefined);
  const [forkFilter, setForkFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'stars' | 'forks' | 'name'>('updated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9);

  // Projects state for connecting
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedRepoForConnect, setSelectedRepoForConnect] = useState<IGitHubRepo | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSuccessMsg, setConnectSuccessMsg] = useState<string | null>(null);

  // Details Modal state
  const [inspectedRepo, setInspectedRepo] = useState<IGitHubRepo | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load GitHub Connection status & projects
  const loadStatusAndProjects = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const [statusRes, projectsRes] = await Promise.all([
        GitHubIntegrationApiService.getStatus(),
        ProjectService.getProjects(),
      ]);
      setConnectionStatus(statusRes);
      if (projectsRes && Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
        if (!selectedProjectId && projectsRes.data.length > 0) {
          setSelectedProjectId(projectsRes.data[0].id);
        }
      }

      if (statusRes.connected) {
        loadOrganizations();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize GitHub integration status.');
    } finally {
      setLoadingStatus(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadStatusAndProjects();
  }, []);

  // Fetch Organizations
  const loadOrganizations = async () => {
    try {
      const orgs = await GitHubIntegrationApiService.getOrganizations();
      setOrganizations(orgs);
    } catch (err: any) {
      console.error('Failed to load GitHub organizations:', err);
    }
  };

  // Fetch Repositories with filters
  const loadRepositories = useCallback(async () => {
    if (!connectionStatus?.connected) return;

    setLoadingRepos(true);
    setErrorMsg(null);

    try {
      const params: IFetchRepositoriesParams = {
        page: currentPage,
        limit,
        sort: sortBy,
        direction: sortDirection,
        search: debouncedSearch || undefined,
        visibility: visibilityFilter,
        language: languageFilter || undefined,
        archived: archivedFilter,
        fork: forkFilter,
      };

      if (selectedOrg) {
        if (selectedOrg.isPersonal) {
          params.owner = selectedOrg.login;
        } else {
          params.org = selectedOrg.login;
        }
      }

      const res = await GitHubIntegrationApiService.getRepositories(params);
      setRepositories(res.repositories);
      setTotalRepos(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch GitHub repositories.');
    } finally {
      setLoadingRepos(false);
    }
  }, [
    connectionStatus,
    selectedOrg,
    debouncedSearch,
    visibilityFilter,
    languageFilter,
    archivedFilter,
    forkFilter,
    sortBy,
    sortDirection,
    currentPage,
    limit,
  ]);

  useEffect(() => {
    if (connectionStatus?.connected) {
      loadRepositories();
    }
  }, [connectionStatus?.connected, loadRepositories]);

  // Connect Repository to Project
  const handleConnectRepository = async () => {
    if (!selectedRepoForConnect || !selectedProjectId) return;

    setIsConnecting(true);
    setConnectSuccessMsg(null);
    setErrorMsg(null);

    try {
      await GitHubIntegrationApiService.connectProjectRepository(
        selectedProjectId,
        selectedRepoForConnect.owner.login,
        selectedRepoForConnect.name
      );

      const targetProject = projects.find((p) => p.id === selectedProjectId);
      setConnectSuccessMsg(
        `Successfully linked ${selectedRepoForConnect.full_name} to project "${
          targetProject?.name || 'Selected Project'
        }".`
      );

      setSelectedRepoForConnect(null);
      if (onProjectConnected) onProjectConnected();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect repository to project.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect directly from Development OAuth Login
  const handleInitiateOAuth = async () => {
    try {
      const res = await GitHubIntegrationApiService.getConnectUrl();
      if (res?.url) {
        window.open(res.url, 'GitHubOAuth', 'width=600,height=700');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate GitHub OAuth');
    }
  };

  if (loadingStatus) {
    return (
      <div className="p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          Checking GitHub integration and permissions...
        </p>
      </div>
    );
  }

  // If GitHub is NOT connected
  if (!connectionStatus?.connected) {
    return (
      <div id="github-not-connected-banner" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center mx-auto shadow-xl">
          <Github className="w-8 h-8" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Connect Your GitHub Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Link your GitHub account or organizations to access repositories, connect codebases to TaskFlow projects, and view live metadata.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleInitiateOAuth}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg transition-all inline-flex items-center gap-2.5 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Connect GitHub Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="github-repository-browser" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                GitHub Repository Browser
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Connected (@{connectionStatus.connection?.githubUsername})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Browse personal and organization repositories, filter by language or visibility, and link code bases to TaskFlow projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadRepositories}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRepos ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Banners */}
      {connectSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{connectSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setConnectSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 dark:text-rose-300 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
          {/* Org Selector */}
          <GitHubOrgSelector
            organizations={organizations}
            selectedOrg={selectedOrg}
            onSelectOrg={(org) => {
              setSelectedOrg(org);
              setCurrentPage(1);
            }}
          />

          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Search Repositories
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by repo name, description, owner, language..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Visibility Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Visibility
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setVisibilityFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  visibilityFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisibilityFilter('public');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  visibilityFilter === 'public'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisibilityFilter('private');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  visibilityFilter === 'private'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Private
              </button>
            </div>
          </div>

          {/* Sort Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repositories Grid */}
      {loadingRepos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse h-48"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mt-auto" />
            </div>
          ))}
        </div>
      ) : repositories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Repositories Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {debouncedSearch
              ? `No repositories matched "${debouncedSearch}". Try broadening your search query.`
              : 'No repositories available for the selected account or organization filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{repositories.length}</strong> of <strong>{totalRepos}</strong> repositories
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {repositories.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                onConnect={(r) => setSelectedRepoForConnect(r)}
                onViewDetails={(r) => setInspectedRepo(r)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold px-4 text-slate-700 dark:text-slate-300">
                Page {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Connect Repository Modal */}
      {selectedRepoForConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                <FolderGit2 className="w-5 h-5" />
                <h3 className="text-base text-slate-900 dark:text-white">Connect Repository</h3>
              </div>
              <button
                onClick={() => setSelectedRepoForConnect(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selected GitHub Repository
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedRepoForConnect.full_name}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Target TaskFlow Project
              </label>
              {projects.length === 0 ? (
                <p className="text-xs text-rose-500">
                  No active projects found. Please create a project first before linking repositories.
                </p>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectKey})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRepoForConnect(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectRepository}
                disabled={isConnecting || !selectedProjectId}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                {isConnecting ? 'Linking Repository...' : 'Connect to Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {inspectedRepo && (
        <RepositoryDetailsModal
          repository={inspectedRepo}
          onClose={() => setInspectedRepo(null)}
          onConnect={(r) => {
            setInspectedRepo(null);
            setSelectedRepoForConnect(r);
          }}
        />
      )}
    </div>
  );
};
