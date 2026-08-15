import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Grid,
  List,
  ExternalLink,
  Archive,
  RotateCcw,
  Settings,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { Organization } from '../types/organization';
import { CreateOrganizationModal } from '../components/organization/CreateOrganizationModal';
import { OrganizationSettingsModal } from '../components/organization/OrganizationSettingsModal';
import { Spinner } from '../components/ui/Spinner';

export const OrganizationsPage: React.FC = () => {
  const {
    organizations,
    activeOrganization,
    totalItems,
    page,
    totalPages,
    isLoading,
    fetchOrganizations,
    setActiveOrganization,
    setSearchQuery,
    setStatusFilter,
    setIsArchivedFilter,
    archiveOrganization,
    restoreOrganization,
  } = useOrganizationStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('active');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedOrgForSettings, setSelectedOrgForSettings] = useState<Organization | null>(null);

  useEffect(() => {
    let archivedParam: string = 'false';
    if (activeTab === 'all') archivedParam = 'all';
    if (activeTab === 'archived') archivedParam = 'true';

    fetchOrganizations({
      search: searchInput,
      isArchived: archivedParam,
      page: 1,
    });
  }, [fetchOrganizations, activeTab, searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tab: 'all' | 'active' | 'archived') => {
    setActiveTab(tab);
    if (tab === 'all') setIsArchivedFilter('all');
    if (tab === 'active') setIsArchivedFilter('false');
    if (tab === 'archived') setIsArchivedFilter('true');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      let archivedParam: string = 'false';
      if (activeTab === 'all') archivedParam = 'all';
      if (activeTab === 'archived') archivedParam = 'true';

      fetchOrganizations({
        search: searchInput,
        isArchived: archivedParam,
        page: newPage,
      });
    }
  };

  const activeOrgsCount = organizations.filter((o) => !o.isArchived).length;
  const archivedOrgsCount = organizations.filter((o) => o.isArchived).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Organizations & Workspaces
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Manage your company workspaces, brand assets, team domains, and project hierarchies in one centralized directory.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Workspaces
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalItems}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Workspaces
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {activeOrgsCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Archived
            </p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {archivedOrgsCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Tabs, View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => handleTabChange('active')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Active ({activeOrgsCount})
          </button>
          <button
            onClick={() => handleTabChange('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Workspaces
          </button>
          <button
            onClick={() => handleTabChange('archived')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Archived ({archivedOrgsCount})
          </button>
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, slug, industry..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-xs font-medium text-slate-500">Loading organizations directory...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto font-bold">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Organizations Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchInput
                ? `No organizations matching "${searchInput}". Try adjusting your query.`
                : 'Get started by establishing your first organization workspace.'}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Organization</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {organizations.map((org) => {
            const isActive = activeOrganization?.id === org.id;
            return (
              <div
                key={org.id}
                className={`group rounded-2xl bg-white dark:bg-slate-900 border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between relative ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {org.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                      {org.isArchived && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 h-8">
                    {org.description || 'No description provided for this organization.'}
                  </p>

                  {/* Meta Tags */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    {org.industry && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{org.industry}</span>
                      </div>
                    )}
                    {org.companySize && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{org.companySize}</span>
                      </div>
                    )}
                    {org.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium truncate flex items-center gap-1"
                        >
                          <span>{org.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveOrganization(org)}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
                    }`}
                  >
                    {isActive ? 'Current Active' : 'Switch Workspace'}
                  </button>

                  <div className="flex items-center gap-1">
                    {org.isArchived ? (
                      <button
                        onClick={() => restoreOrganization(org.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                        title="Restore Organization"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveOrganization(org.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                        title="Archive Organization"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrgForSettings(org)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Settings & Edit"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Website</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {organizations.map((org) => {
                  const isActive = activeOrganization?.id === org.id;
                  return (
                    <tr
                      key={org.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        isActive ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {org.logo ? (
                            <img
                              src={org.logo}
                              alt={org.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{org.name}</span>
                              {isActive && (
                                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                  (Active)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{org.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {org.industry || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {org.companySize || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {org.website ? (
                          <a
                            href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>{org.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {org.isArchived ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveOrganization(org)}
                            disabled={isActive}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                            }`}
                          >
                            {isActive ? 'Active' : 'Switch'}
                          </button>

                          <button
                            onClick={() => setSelectedOrgForSettings(org)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Edit / Settings"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalItems} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <OrganizationSettingsModal
        organization={selectedOrgForSettings}
        isOpen={Boolean(selectedOrgForSettings)}
        onClose={() => setSelectedOrgForSettings(null)}
      />
    </div>
  );
};
