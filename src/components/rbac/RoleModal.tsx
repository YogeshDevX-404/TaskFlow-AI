import React, { useState, useEffect } from 'react';
import { Permission, Role } from '../../types/rbac';
import { useRoleStore } from '../../store/useRoleStore';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { X, Shield, Sparkles, Check, AlertCircle } from 'lucide-react';

export interface RoleModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'duplicate';
  role?: Role | null;
  onClose: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  mode,
  role,
  onClose,
}) => {
  const { activeOrganization } = useOrganizationStore();
  const { permissions, createRole, updateRole, duplicateRole, isSubmitting, error, clearError } =
    useRoleStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    setLocalError(null);

    if (mode === 'edit' && role) {
      setName(role.name);
      setDescription(role.description || '');
      const permIds = role.permissions.map((p) =>
        typeof p === 'object' ? p.id || p.name : p
      );
      setSelectedPermissions(permIds);
    } else if (mode === 'duplicate' && role) {
      setName(`${role.name} Copy`);
      setDescription(`Copy of ${role.name}. ${role.description || ''}`);
      const permIds = role.permissions.map((p) =>
        typeof p === 'object' ? p.id || p.name : p
      );
      setSelectedPermissions(permIds);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [mode, role, isOpen, clearError]);

  if (!isOpen) return null;

  // Group permissions by module
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPermissions[p.module]) {
      groupedPermissions[p.module] = [];
    }
    groupedPermissions[p.module].push(p);
  });

  const togglePermission = (permIdentifier: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permIdentifier)
        ? prev.filter((id) => id !== permIdentifier)
        : [...prev, permIdentifier]
    );
  };

  const toggleModuleAll = (modulePerms: Permission[]) => {
    const permIdentifiers = modulePerms.map((p) => p.id || p.name);
    const allSelected = permIdentifiers.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !permIdentifiers.includes(id))
      );
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...permIdentifiers])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) {
      setLocalError('Organization context missing.');
      return;
    }

    if (!name.trim()) {
      setLocalError('Role name is required.');
      return;
    }

    try {
      setLocalError(null);
      if (mode === 'create') {
        await createRole({
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
          organizationId: activeOrganization.id,
        });
      } else if (mode === 'edit' && role) {
        await updateRole(role.id, {
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
          organizationId: activeOrganization.id,
        });
      } else if (mode === 'duplicate' && role) {
        await duplicateRole(role.id, {
          name: name.trim(),
          organizationId: activeOrganization.id,
        });
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                {mode === 'create'
                  ? 'Create Custom Role'
                  : mode === 'edit'
                  ? `Edit Role: ${role?.name}`
                  : `Duplicate Role: ${role?.name}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure role identity and security permissions for this workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {(localError || error) && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Role Identity Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lead QA Engineer, Release Manager"
                disabled={mode === 'edit' && role?.isSystem}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities and scope of this role..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Permissions Matrix Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Granted Permissions ({selectedPermissions.length} Selected)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedPermissions(
                    selectedPermissions.length === permissions.length
                      ? []
                      : permissions.map((p) => p.id || p.name)
                  )
                }
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
              >
                {selectedPermissions.length === permissions.length
                  ? 'Deselect All'
                  : 'Select All Permissions'}
              </button>
            </div>

            <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
              {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => {
                const modulePermIds = modulePerms.map((p) => p.id || p.name);
                const isModuleAllSelected = modulePermIds.every((id) =>
                  selectedPermissions.includes(id)
                );

                return (
                  <div
                    key={moduleName}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {moduleName} Module
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(modulePerms)}
                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer font-medium"
                      >
                        {isModuleAllSelected ? 'Deselect Module' : 'Select Module All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {modulePerms.map((perm) => {
                        const permId = perm.id || perm.name;
                        const isChecked = selectedPermissions.includes(permId);

                        return (
                          <label
                            key={permId}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                              isChecked
                                ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-slate-900 dark:text-slate-100'
                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(permId)}
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="text-xs">
                              <span className="font-semibold block">{perm.name}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {perm.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving Role...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {mode === 'create'
                      ? 'Create Role'
                      : mode === 'edit'
                      ? 'Save Changes'
                      : 'Duplicate Role'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
