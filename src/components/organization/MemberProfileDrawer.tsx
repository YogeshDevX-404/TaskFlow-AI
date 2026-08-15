import React, { useState } from 'react';
import {
  X,
  Shield,
  Crown,
  Users,
  Eye,
  Mail,
  Calendar,
  UserCheck,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { OrganizationMember, MemberRole } from '../../types/organization';
import { Spinner } from '../ui/Spinner';

export interface MemberProfileDrawerProps {
  member: OrganizationMember | null;
  isOpen: boolean;
  currentUserId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onUpdateRole: (memberId: string, role: MemberRole) => Promise<boolean>;
  onRemoveMember: (memberId: string) => Promise<boolean>;
  onTransferOwnership?: (newOwnerMemberId: string) => Promise<boolean>;
}

const ROLE_DESCRIPTIONS: Record<
  MemberRole,
  { label: string; desc: string; icon: React.ReactNode; color: string }
> = {
  owner: {
    label: 'Organization Owner',
    desc: 'Primary administrative authority over organization, members, and billing.',
    icon: <Crown className="w-4 h-4 text-amber-500" />,
    color: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
  },
  admin: {
    label: 'Administrator',
    desc: 'Full access to workspace settings, members, projects, and permissions.',
    icon: <Shield className="w-4 h-4 text-indigo-500" />,
    color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400',
  },
  member: {
    label: 'Team Member',
    desc: 'Standard access to create, edit, and collaborate on projects and tasks.',
    icon: <Users className="w-4 h-4 text-emerald-500" />,
    color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  },
  guest: {
    label: 'Guest Access',
    desc: 'Limited view-only rights to explicitly assigned workspace resources.',
    icon: <Eye className="w-4 h-4 text-slate-500" />,
    color: 'border-slate-500/30 bg-slate-500/5 text-slate-600 dark:text-slate-400',
  },
};

export const MemberProfileDrawer: React.FC<MemberProfileDrawerProps> = ({
  member,
  isOpen,
  currentUserId,
  isOwner,
  isAdmin,
  onClose,
  onUpdateRole,
  onRemoveMember,
  onTransferOwnership,
}) => {
  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(null);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [isConfirmTransferOpen, setIsConfirmTransferOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen || !member) return null;

  const u = typeof member.user === 'object' ? member.user : null;
  const fullName = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : 'Member';
  const email = u ? u.email : '';
  const avatar = u?.avatar;

  const invBy = typeof member.invitedBy === 'object' ? member.invitedBy : null;
  const invByText = invBy
    ? `${invBy.firstName || ''} ${invBy.lastName || ''}`.trim() || invBy.email
    : 'Direct Access';

  const isSelf = u?.id === currentUserId;
  const canManage =
    (isOwner || (isAdmin && member.role !== 'owner' && member.role !== 'admin')) && !isSelf;

  const currentRoleInfo = ROLE_DESCRIPTIONS[member.role] || ROLE_DESCRIPTIONS.member;

  const handleRoleChangeSubmit = async (role: MemberRole) => {
    setIsUpdating(true);
    setFeedback(null);
    const success = await onUpdateRole(member.id, role);
    setIsUpdating(false);
    if (success) {
      setFeedback({ type: 'success', text: `Role updated to ${ROLE_DESCRIPTIONS[role].label}` });
      setSelectedRole(null);
    } else {
      setFeedback({ type: 'error', text: 'Failed to update member role.' });
    }
  };

  const handleConfirmRemove = async () => {
    setIsUpdating(true);
    setFeedback(null);
    const success = await onRemoveMember(member.id);
    setIsUpdating(false);
    if (success) {
      onClose();
    } else {
      setFeedback({ type: 'error', text: 'Failed to remove member from organization.' });
    }
  };

  const handleConfirmTransfer = async () => {
    if (!onTransferOwnership) return;
    setIsUpdating(true);
    setFeedback(null);
    const success = await onTransferOwnership(member.id);
    setIsUpdating(false);
    if (success) {
      setFeedback({ type: 'success', text: 'Ownership successfully transferred.' });
      setIsConfirmTransferOpen(false);
    } else {
      setFeedback({ type: 'error', text: 'Failed to transfer ownership.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Member Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {feedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Profile Avatar & Header */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/20 shadow-md mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md mb-3">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{fullName}</span>
                {isSelf && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    YOU
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {email}
              </p>

              <div
                className={`mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${currentRoleInfo.color}`}
              >
                {currentRoleInfo.icon}
                <span>{currentRoleInfo.label}</span>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Membership Info
              </h4>
              <div className="bg-slate-50/70 dark:bg-slate-800/30 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined Date:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Invited By:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {invByText}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {member.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Management */}
            {canManage && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Update Role & Access
                </h4>
                <div className="space-y-2">
                  {(['admin', 'member', 'guest'] as const).map((r) => {
                    const info = ROLE_DESCRIPTIONS[r];
                    const isCurrentRole = member.role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={isUpdating || isCurrentRole}
                        onClick={() => handleRoleChangeSubmit(r)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isCurrentRole
                            ? 'border-indigo-500/50 bg-indigo-500/10 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {info.icon}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {info.label}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                              {info.desc}
                            </p>
                          </div>
                        </div>
                        {isCurrentRole && (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transfer Ownership Option for Owners */}
            {isOwner && !isSelf && member.role !== 'owner' && (
              <div className="pt-2">
                <button
                  onClick={() => setIsConfirmTransferOpen(true)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transfer Organization Ownership</span>
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {canManage && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {isConfirmRemoveOpen ? (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Are you sure you want to remove this member?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmRemove}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isUpdating ? <Spinner size="sm" className="text-white" /> : 'Yes, Remove'}
                    </button>
                    <button
                      onClick={() => setIsConfirmRemoveOpen(false)}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmRemoveOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Member from Organization</span>
                </button>
              )}
            </div>
          )}

          {/* Confirm Transfer Ownership Modal */}
          {isConfirmTransferOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <ArrowRightLeft className="w-6 h-6" />
                  <h3 className="text-sm font-bold">Transfer Ownership?</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Transferring ownership will make <strong className="text-slate-900 dark:text-white">{fullName}</strong> the primary Owner of this organization. Your role will be changed to Administrator.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleConfirmTransfer}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isUpdating ? <Spinner size="sm" className="text-white" /> : 'Confirm Transfer'}
                  </button>
                  <button
                    onClick={() => setIsConfirmTransferOpen(false)}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
