import React, { useState } from 'react';
import {
  MoreHorizontal,
  Shield,
  Crown,
  Users,
  Eye,
  Trash2,
  UserCheck,
  Calendar,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { OrganizationMember, MemberRole } from '../../types/organization';

export interface MemberTableProps {
  members: OrganizationMember[];
  currentUserId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  onSelectMember: (member: OrganizationMember) => void;
  onUpdateRole: (memberId: string, role: MemberRole) => void;
  onRemoveMember: (memberId: string) => void;
}

const ROLE_BADGES: Record<
  MemberRole,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  owner: {
    label: 'Owner',
    icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  admin: {
    label: 'Admin',
    icon: <Shield className="w-3.5 h-3.5 text-indigo-500" />,
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  },
  member: {
    label: 'Member',
    icon: <Users className="w-3.5 h-3.5 text-emerald-500" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
  guest: {
    label: 'Guest',
    icon: <Eye className="w-3.5 h-3.5 text-slate-500" />,
    badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  },
};

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  currentUserId,
  isOwner,
  isAdmin,
  onSelectMember,
  onUpdateRole,
  onRemoveMember,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Member</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4">Invited By</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {members.map((member) => {
              const u = typeof member.user === 'object' ? member.user : null;
              const fullName = u
                ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
                : 'Member';
              const email = u ? u.email : '';
              const avatar = u?.avatar;

              const invBy = typeof member.invitedBy === 'object' ? member.invitedBy : null;
              const invByText = invBy
                ? `${invBy.firstName || ''} ${invBy.lastName || ''}`.trim() || invBy.email
                : 'Direct Access';

              const roleInfo = ROLE_BADGES[member.role] || ROLE_BADGES.member;
              const isSelf = u?.id === currentUserId;
              const canManage =
                (isOwner || (isAdmin && member.role !== 'owner' && member.role !== 'admin')) &&
                !isSelf;

              const formattedJoined = new Date(member.joinedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              const isMenuOpen = activeMenuId === member.id;

              return (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Member Name & Email */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() => onSelectMember(member)}
                            className="font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {fullName}
                          </span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 shrink-0" /> {email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role Selector / Badge */}
                  <td className="py-3.5 px-4">
                    {canManage ? (
                      <div className="relative inline-block">
                        <select
                          value={member.role}
                          onChange={(e) => onUpdateRole(member.id, e.target.value as MemberRole)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="guest">Guest</option>
                        </select>
                      </div>
                    ) : (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${roleInfo.badgeClass}`}
                      >
                        {roleInfo.icon}
                        <span>{roleInfo.label}</span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        member.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="capitalize">{member.status}</span>
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 opacity-60" />
                      <span>{formattedJoined}</span>
                    </div>
                  </td>

                  {/* Invited By */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    <span className="text-[11px]">{invByText}</span>
                  </td>

                  {/* Action Menu */}
                  <td className="py-3.5 px-4 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : member.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        className="absolute right-4 top-10 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs animate-fadeIn text-left"
                        onMouseLeave={() => setActiveMenuId(null)}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectMember(member);
                          }}
                          className="w-full px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Profile Drawer</span>
                        </button>

                        {canManage && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onRemoveMember(member.id);
                            }}
                            className="w-full px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Member</span>
                          </button>
                        )}
                      </div>
                    )}
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
