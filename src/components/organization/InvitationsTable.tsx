import React from 'react';
import {
  Mail,
  Shield,
  Users,
  Eye,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { OrganizationInvite, MemberRole, InviteStatus } from '../../types/organization';
import { Spinner } from '../ui/Spinner';

export interface InvitationsTableProps {
  invitations: OrganizationInvite[];
  isActionLoading?: boolean;
  onResendInvite: (inviteId: string) => void;
  onCancelInvite: (inviteId: string) => void;
}

const STATUS_BADGES: Record<
  InviteStatus,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />,
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  accepted: {
    label: 'Accepted',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  expired: {
    label: 'Expired',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
};

const ROLE_BADGES: Record<MemberRole, { label: string; icon: React.ReactNode }> = {
  owner: { label: 'Owner', icon: <Shield className="w-3 h-3 text-amber-500" /> },
  admin: { label: 'Admin', icon: <Shield className="w-3 h-3 text-indigo-500" /> },
  member: { label: 'Member', icon: <Users className="w-3 h-3 text-emerald-500" /> },
  guest: { label: 'Guest', icon: <Eye className="w-3 h-3 text-slate-500" /> },
};

export const InvitationsTable: React.FC<InvitationsTableProps> = ({
  invitations,
  isActionLoading,
  onResendInvite,
  onCancelInvite,
}) => {
  if (invitations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          No Invitations Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          There are currently no active or previous invitations sent for this organization.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Invited Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Expires At</th>
              <th className="py-3.5 px-4">Invited By</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {invitations.map((invite) => {
              const statusInfo = STATUS_BADGES[invite.status] || STATUS_BADGES.pending;
              const roleInfo = ROLE_BADGES[invite.role] || ROLE_BADGES.member;

              const invBy = typeof invite.invitedBy === 'object' ? invite.invitedBy : null;
              const invByText = invBy
                ? `${invBy.firstName || ''} ${invBy.lastName || ''}`.trim() || invBy.email
                : 'Administrator';

              const formattedExpires = new Date(invite.expiresAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              const isExpired = new Date(invite.expiresAt) < new Date();

              return (
                <tr
                  key={invite.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Email */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono text-xs truncate">
                        {invite.email}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {roleInfo.icon}
                      <span>{roleInfo.label}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </td>

                  {/* Expires At */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 opacity-60" />
                      <span>{formattedExpires}</span>
                      {isExpired && invite.status === 'pending' && (
                        <span className="text-[10px] text-amber-500 font-bold ml-1">(Expired)</span>
                      )}
                    </div>
                  </td>

                  {/* Invited By */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                    <span className="text-[11px]">{invByText}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {(invite.status === 'pending' || invite.status === 'expired') && (
                        <button
                          onClick={() => onResendInvite(invite.id)}
                          disabled={isActionLoading}
                          title="Resend invitation email"
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend</span>
                        </button>
                      )}

                      {invite.status === 'pending' && (
                        <button
                          onClick={() => onCancelInvite(invite.id)}
                          disabled={isActionLoading}
                          title="Cancel invitation"
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
