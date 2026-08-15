import React from 'react';
import { ProjectMember } from '../../../types/projectMember';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import {
  X,
  User,
  Mail,
  Github,
  Calendar,
  Shield,
  UserCheck,
  Building,
  Briefcase,
  Activity,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface ProjectMemberDetailDrawerProps {
  member: ProjectMember | null;
  onClose: () => void;
  onEdit: (member: ProjectMember) => void;
  onRemove: (member: ProjectMember) => void;
}

export const ProjectMemberDetailDrawer: React.FC<ProjectMemberDetailDrawerProps> = ({
  member,
  onClose,
  onEdit,
  onRemove,
}) => {
  if (!member) return null;

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
    return 'N/A';
  };

  const getUserGithub = () => {
    if (typeof member.user === 'object' && member.user.githubUsername) {
      return member.user.githubUsername;
    }
    return null;
  };

  const getUserAvatar = () => {
    if (typeof member.user === 'object' && member.user.avatar) {
      return member.user.avatar;
    }
    return undefined;
  };

  const getAddedBy = () => {
    if (typeof member.addedBy === 'object' && member.addedBy) {
      return `${member.addedBy.firstName} ${member.addedBy.lastName}`.trim();
    }
    return member.addedBy || 'System Admin';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Member Profile & Access
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Main Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt={getUserName()}
                  className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white dark:border-slate-700 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                  {getUserName().charAt(0)}
                </div>
              )}

              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {getUserName()}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{getUserEmail()}</span>
                </p>
                {getUserGithub() && (
                  <a
                    href={`https://github.com/${getUserGithub()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono pt-0.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>@{getUserGithub()}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Role & Status Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Project Role
                </span>
                <RoleBadge role={member.role} size="sm" />
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <StatusBadge status={member.status} size="sm" />
              </div>
            </div>

            {/* Audit & Membership Details */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Audit Trail & History
              </h4>

              <div className="space-y-2.5 pt-1 divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined Date:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Added By:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getAddedBy()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Workspace:
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    Engineering Core
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions Matrix Overview */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                Role Capabilities
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {member.role === 'Project Owner' && (
                  <>
                    <li className="flex items-center gap-2">✓ Full administrative authority</li>
                    <li className="flex items-center gap-2">✓ Manage repository and settings</li>
                    <li className="flex items-center gap-2">✓ Assign/Revoke member roles</li>
                  </>
                )}
                {member.role === 'Project Admin' && (
                  <>
                    <li className="flex items-center gap-2">✓ Manage task workflows & boards</li>
                    <li className="flex items-center gap-2">✓ Add & edit project members</li>
                    <li className="flex items-center gap-2">✓ Configure project integrations</li>
                  </>
                )}
                {member.role === 'Developer' && (
                  <>
                    <li className="flex items-center gap-2">✓ Create, assign, & resolve tasks</li>
                    <li className="flex items-center gap-2">✓ Submit pull requests & commits</li>
                    <li className="flex items-center gap-2">✓ View team activity feed</li>
                  </>
                )}
                {member.role === 'Tester' && (
                  <>
                    <li className="flex items-center gap-2">✓ Report bugs & test issues</li>
                    <li className="flex items-center gap-2">✓ Verify bug resolution status</li>
                    <li className="flex items-center gap-2">✓ View test build logs</li>
                  </>
                )}
                {member.role === 'Viewer' && (
                  <>
                    <li className="flex items-center gap-2">✓ Read-only project roadmap access</li>
                    <li className="flex items-center gap-2">✓ View dashboard metrics</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
            <button
              onClick={() => onRemove(member)}
              disabled={member.role === 'Project Owner'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Member
            </button>

            <button
              onClick={() => onEdit(member)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
