import React, { useState, useEffect } from 'react';
import { ProjectMember, ProjectMemberRole, ProjectMemberStatus } from '../../../types/projectMember';
import { RoleBadge } from './RoleBadge';
import { X, Shield, AlertCircle, Save } from 'lucide-react';

interface EditProjectMemberModalProps {
  isOpen: boolean;
  member: ProjectMember | null;
  onClose: () => void;
  onSubmit: (memberId: string, data: { role?: ProjectMemberRole; status?: ProjectMemberStatus }) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
}

export const EditProjectMemberModal: React.FC<EditProjectMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [role, setRole] = useState<ProjectMemberRole>('Developer');
  const [status, setStatus] = useState<ProjectMemberStatus>('active');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setStatus(member.status);
      setLocalError(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const getUserName = () => {
    if (typeof member.user === 'object') {
      return `${member.user.firstName} ${member.user.lastName}`.trim() || member.user.email;
    }
    return member.user || 'Project Member';
  };

  const getUserEmail = () => {
    if (typeof member.user === 'object') {
      return member.user.email;
    }
    return '';
  };

  const getUserAvatar = () => {
    if (typeof member.user === 'object' && member.user.avatar) {
      return member.user.avatar;
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const success = await onSubmit(member.id, { role, status });
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Edit Member Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update role or membership status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Member Preview Header */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {getUserAvatar() ? (
            <img
              src={getUserAvatar()}
              alt={getUserName()}
              className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shrink-0">
              {getUserName().charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {getUserName()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getUserEmail()}</p>
          </div>
          <RoleBadge role={member.role} size="sm" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(localError || error) && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Role Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Project Role
            </label>
            <div className="space-y-1.5">
              {(
                [
                  { role: 'Project Owner', desc: 'Full project ownership & billing control' },
                  { role: 'Project Admin', desc: 'Can manage project settings and members' },
                  { role: 'Developer', desc: 'Can create, edit & execute tasks' },
                  { role: 'Tester', desc: 'Can report bugs and verify tasks' },
                  { role: 'Viewer', desc: 'Read-only access to project' },
                ] as const
              ).map((r) => {
                const active = role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setRole(r.role)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{r.role}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</p>
                    </div>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Membership Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectMemberStatus)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
