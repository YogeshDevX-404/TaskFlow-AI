import React from 'react';
import { Role } from '../../types/rbac';
import { Shield, Sparkles, Copy, Edit2, Trash2, CheckCircle, Lock, Users } from 'lucide-react';

export interface RoleListProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
  onDuplicateRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onCreateRole: () => void;
}

export const RoleList: React.FC<RoleListProps> = ({
  roles,
  onEditRole,
  onDuplicateRole,
  onDeleteRole,
  onCreateRole,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Role Directory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage system defaults and custom security roles configured for this workspace.
          </p>
        </div>
        <button
          onClick={onCreateRole}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>+ Create Custom Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => {
          const permCount = Array.isArray(role.permissions) ? role.permissions.length : 0;
          const isOwnerRole = role.isSystem && role.slug === 'owner';

          return (
            <div
              key={role.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isOwnerRole ? (
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Shield className="w-5 h-5" />
                      </div>
                    ) : role.isSystem ? (
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                        {role.name}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-0.5 ${
                          role.isSystem
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {role.isSystem ? 'System Default' : 'Custom Role'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 min-h-[36px] line-clamp-2">
                  {role.description || 'No description provided for this role.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {isOwnerRole ? 'Full System Access' : `${permCount} Active Permissions`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onDuplicateRole(role)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  title="Duplicate Role"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                <div className="flex items-center gap-1">
                  {!isOwnerRole && (
                    <button
                      onClick={() => onEditRole(role)}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  )}

                  {!role.isSystem && (
                    <button
                      onClick={() => onDeleteRole(role)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {isOwnerRole && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 px-2 py-1">
                      <Lock className="w-3 h-3" /> Immutable
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
