import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronsUpDown,
  Building2,
  Plus,
  Check,
  Search,
  Settings2,
  Archive,
  Layers,
} from 'lucide-react';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { Organization } from '../../types/organization';
import { CreateOrganizationModal } from './CreateOrganizationModal';

export interface OrganizationSwitcherProps {
  onNavigateToOrganizations?: () => void;
  className?: string;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  onNavigateToOrganizations,
  className = '',
}) => {
  const {
    organizations,
    activeOrganization,
    setActiveOrganization,
    fetchOrganizations,
    isLoading,
  } = useOrganizationStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOrg = (org: Organization) => {
    setActiveOrganization(org);
    setIsOpen(false);
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Switcher Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all cursor-pointer group text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {activeOrganization?.logo ? (
            <img
              src={activeOrganization.logo}
              alt={activeOrganization.name}
              className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {activeOrganization?.name ? activeOrganization.name.charAt(0).toUpperCase() : <Building2 className="w-3.5 h-3.5" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
                {activeOrganization ? activeOrganization.name : 'Select Organization'}
              </span>
              {activeOrganization?.isArchived && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Archived
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {activeOrganization ? activeOrganization.slug : 'No active workspace'}
            </p>
          </div>
        </div>

        <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-colors" />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-fadeIn">
          {/* Search Input */}
          <div className="p-1.5 mb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500/50 text-slate-800 dark:text-slate-200 focus:outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1 flex items-center justify-between">
            <span>Your Workspaces</span>
            <span>{organizations.length}</span>
          </div>

          {/* Organizations List */}
          <div className="max-h-48 overflow-y-auto space-y-1 my-1 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">Loading workspaces...</div>
            ) : filteredOrgs.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                {search ? 'No matching organizations' : 'No organizations found'}
              </div>
            ) : (
              filteredOrgs.map((org) => {
                const isActive = activeOrganization?.id === org.id;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelectOrg(org)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-6 h-6 rounded-md object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-md text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-indigo-600'
                              : 'bg-slate-400 dark:bg-slate-700'
                          }`}
                        >
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs truncate font-medium">{org.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{org.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {org.isArchived && <Archive className="w-3 h-3 text-amber-500" />}
                      {isActive && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
            {/* Create Organization Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Organization</span>
            </button>

            {/* Manage Organizations */}
            {onNavigateToOrganizations && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToOrganizations();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Settings2 className="w-4 h-4 text-slate-400" />
                <span>Manage Organizations</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
