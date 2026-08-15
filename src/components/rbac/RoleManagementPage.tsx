import React, { useState, useEffect } from 'react';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useRoleStore } from '../../store/useRoleStore';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleList } from './RoleList';
import { RoleModal } from './RoleModal';
import { DeleteRoleDialog } from './DeleteRoleDialog';
import { Role } from '../../types/rbac';
import {
  ShieldCheck,
  Sparkles,
  Grid,
  List,
  RefreshCw,
  Plus,
  Layers,
  Sliders,
  Building2,
  Users,
} from 'lucide-react';

export const RoleManagementPage: React.FC = () => {
  const { activeOrganization } = useOrganizationStore();
  const { permissions, roles, isLoading, fetchPermissions, fetchRoles } = useRoleStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'directory'>('matrix');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
    if (activeOrganization) {
      fetchRoles(activeOrganization.id);
    }
  }, [activeOrganization, fetchPermissions, fetchRoles]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleOpenDuplicateModal = (role: Role) => {
    setModalMode('duplicate');
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const systemRolesCount = roles.filter((r) => r.isSystem).length;
  const customRolesCount = roles.filter((r) => !r.isSystem).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Enterprise Role Based Access Control (RBAC)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Matrix Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Configure fine-grained permissions, customize organization security roles, and enforce feature access control across modules.
            </p>

            {activeOrganization && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Active Workspace:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {activeOrganization.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              fetchPermissions();
              if (activeOrganization) fetchRoles(activeOrganization.id);
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Refresh Roles & Permissions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {roles.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Configured Roles</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {systemRolesCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">System Default Roles</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {customRolesCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Workspace Custom Roles</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {permissions.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Granular Permissions</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Permission Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Role Directory</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {isLoading && roles.length === 0 ? (
        <div className="space-y-4 py-12">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      ) : activeTab === 'matrix' ? (
        <PermissionMatrix
          onEditRole={handleOpenEditModal}
          onDuplicateRole={handleOpenDuplicateModal}
        />
      ) : (
        <RoleList
          roles={roles}
          onEditRole={handleOpenEditModal}
          onDuplicateRole={handleOpenDuplicateModal}
          onDeleteRole={handleOpenDeleteDialog}
          onCreateRole={handleOpenCreateModal}
        />
      )}

      {/* Modals */}
      <RoleModal
        isOpen={isModalOpen}
        mode={modalMode}
        role={selectedRole}
        onClose={() => setIsModalOpen(false)}
      />

      <DeleteRoleDialog
        isOpen={isDeleteDialogOpen}
        role={selectedRole}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
