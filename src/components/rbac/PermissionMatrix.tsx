import React, { useMemo } from 'react';
import { useRoleStore } from '../../store/useRoleStore';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { Permission, Role } from '../../types/rbac';
import {
  Shield,
  Lock,
  Check,
  Search,
  Filter,
  Sparkles,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface PermissionMatrixProps {
  onEditRole?: (role: Role) => void;
  onDuplicateRole?: (role: Role) => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  onEditRole,
  onDuplicateRole,
}) => {
  const { activeOrganization } = useOrganizationStore();
  const {
    permissions,
    roles,
    searchQuery,
    selectedModuleFilter,
    setSearchQuery,
    setSelectedModuleFilter,
    toggleRolePermission,
    isSubmitting,
  } = useRoleStore();

  // Extract unique modules
  const modules = useMemo(() => {
    const modSet = new Set<string>();
    permissions.forEach((p) => {
      if (p.module) modSet.add(p.module);
    });
    return ['All', ...Array.from(modSet)];
  }, [permissions]);

  // Filter permissions based on search query and selected module
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule =
        selectedModuleFilter === 'All' || p.module === selectedModuleFilter;

      return matchesSearch && matchesModule;
    });
  }, [permissions, searchQuery, selectedModuleFilter]);

  // Group filtered permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach((p) => {
      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    });
    return groups;
  }, [filteredPermissions]);

  // Helper to check if a role possesses a permission
  const hasPermission = (role: Role, perm: Permission): boolean => {
    if (role.isSystem && role.slug === 'owner') return true;
    return role.permissions.some((p) => {
      if (typeof p === 'object') {
        return p.id === perm.id || p.name === perm.name;
      }
      return p === perm.id || p === perm.name;
    });
  };

  const handleToggle = async (role: Role, perm: Permission) => {
    if (!activeOrganization) return;
    if (role.isSystem && role.slug === 'owner') return; // Owner locked
    try {
      await toggleRolePermission(role.id, perm.id || perm.name, activeOrganization.id);
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search permissions or modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:inline" />
          {modules.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModuleFilter(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedModuleFilter === mod
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Matrix Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[280px] sticky left-0 bg-slate-50 dark:bg-slate-800/90 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Module & Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="p-4 text-center min-w-[140px] max-w-[180px] border-l border-slate-200 dark:border-slate-800/60"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {role.slug === 'owner' ? (
                          <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        ) : role.isSystem ? (
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : null}
                        <span>{role.name}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          role.isSystem
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                        }`}
                      >
                        {role.isSystem ? 'System Role' : 'Custom Role'}
                      </span>
                      {onEditRole && !role.isSystem && (
                        <button
                          onClick={() => onEditRole(role)}
                          className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Configure
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {Object.keys(groupedPermissions).length === 0 ? (
                <tr>
                  <td
                    colSpan={roles.length + 1}
                    className="p-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No permissions match the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                (Object.entries(groupedPermissions) as [string, Permission[]][]).map(([moduleName, modulePerms]) => (
                  <React.Fragment key={moduleName}>
                    {/* Module Header Row */}
                    <tr className="bg-slate-100/60 dark:bg-slate-800/40 font-semibold text-xs text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                      <td
                        colSpan={roles.length + 1}
                        className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span>{moduleName} Module</span>
                          <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">
                            ({modulePerms.length} permissions)
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Permissions Rows */}
                    {modulePerms.map((perm) => (
                      <tr
                        key={perm.id || perm.name}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                              <code>{perm.name}</code>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {perm.description}
                            </span>
                          </div>
                        </td>

                        {roles.map((role) => {
                          const isAllowed = hasPermission(role, perm);
                          const isOwnerRole = role.isSystem && role.slug === 'owner';

                          return (
                            <td
                              key={role.id}
                              className="p-4 text-center border-l border-slate-100 dark:border-slate-800/40 align-middle"
                            >
                              <div className="flex items-center justify-center">
                                {isOwnerRole ? (
                                  <div
                                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                                    title="Owner has immutable full access permissions"
                                  >
                                    <Lock className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleToggle(role, perm)}
                                    disabled={isSubmitting}
                                    title={`${
                                      isAllowed ? 'Revoke' : 'Grant'
                                    } "${perm.name}" for ${role.name}`}
                                    className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                                      isAllowed
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 ring-1 ring-emerald-200 dark:ring-emerald-800/40'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {isAllowed ? (
                                      <Check className="w-4 h-4 stroke-[2.5]" />
                                    ) : (
                                      <span className="w-4 h-4 block text-center font-bold leading-none">
                                        -
                                      </span>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Matrix Legend Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
              Granted Permission
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700 inline-block"></span>
              Not Granted
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-indigo-500" />
              Locked System Permission
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Click any checkmark cell to toggle permission state live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
