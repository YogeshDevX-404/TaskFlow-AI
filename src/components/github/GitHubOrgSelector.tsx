import React from 'react';
import { IGitHubOrg } from '../../services/api/githubIntegrationService';
import { Building2, User, ChevronDown, Check, FolderGit2 } from 'lucide-react';

interface GitHubOrgSelectorProps {
  organizations: IGitHubOrg[];
  selectedOrg: IGitHubOrg | null;
  onSelectOrg: (org: IGitHubOrg | null) => void;
  loading?: boolean;
}

export const GitHubOrgSelector: React.FC<GitHubOrgSelectorProps> = ({
  organizations,
  selectedOrg,
  onSelectOrg,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full sm:w-72" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
        GitHub Account / Org
      </label>
      <button
        type="button"
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-medium hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm cursor-pointer disabled:opacity-60"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOrg?.avatar_url ? (
            <img
              src={selectedOrg.avatar_url}
              alt={selectedOrg.login}
              className="w-5 h-5 rounded-md object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
          ) : selectedOrg?.isPersonal ? (
            <User className="w-5 h-5 text-indigo-500 shrink-0" />
          ) : (
            <Building2 className="w-5 h-5 text-indigo-500 shrink-0" />
          )}

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {selectedOrg ? selectedOrg.name || selectedOrg.login : 'All Repositories'}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {selectedOrg ? `@${selectedOrg.login}` : 'Select Account / Organization'}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onSelectOrg(null);
              setIsOpen(false);
            }}
            className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
              selectedOrg === null ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="font-semibold">All Accessible Repositories</p>
                <p className="text-[10px] text-slate-400">Personal + All GitHub Orgs</p>
              </div>
            </div>
            {selectedOrg === null && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {organizations.map((org) => {
            const isSelected = selectedOrg?.login.toLowerCase() === org.login.toLowerCase();
            return (
              <button
                key={org.id || org.login}
                type="button"
                onClick={() => {
                  onSelectOrg(org);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={org.avatar_url}
                    alt={org.login}
                    className="w-5 h-5 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate">{org.name || org.login}</span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {org.isPersonal ? 'Personal Account' : `Organization (@${org.login})`}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
