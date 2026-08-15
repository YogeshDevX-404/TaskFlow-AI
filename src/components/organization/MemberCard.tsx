import React, { useState } from 'react';
import {
  MoreVertical,
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

export interface MemberCardProps {
  member: OrganizationMember;
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
    icon: <Crown className="w-3 h-3 text-amber-500" />,
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  admin: {
    label: 'Admin',
    icon: <Shield className="w-3 h-3 text-indigo-500" />,
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  member: {
    label: 'Member',
    icon: <Users className="w-3 h-3 text-emerald-500" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  guest: {
    label: 'Guest',
    icon: <Eye className="w-3 h-3 text-slate-500" />,
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
};

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserId,
  isOwner,
  isAdmin,
  onSelectMember,
  onUpdateRole,
  onRemoveMember,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const u = typeof member.user === 'object' ? member.user : null;
  const fullName = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : 'Member';
  const email = u ? u.email : '';
  const avatar = u?.avatar;
  const roleInfo = ROLE_BADGES[member.role] || ROLE_BADGES.member;

  const isSelf = u?.id === currentUserId;
  const isTargetOwner = member.role === 'owner';
  const canManage = (isOwner || (isAdmin && member.role !== 'owner' && member.role !== 'admin')) && !isSelf;

  const formattedJoined = new Date(member.joinedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={fullName}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => onSelectMember(member)}
                className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {fullName}
              </h3>
              {isSelf && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                  You
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 shrink-0" />
              <span>{email}</span>
            </p>
          </div>
        </div>

        {/* Context Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs animate-fadeIn"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelectMember(member);
                }}
                className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>View Member Profile</span>
              </button>

              {canManage && (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsRoleDropdownOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Change Role</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onRemoveMember(member.id);
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Member</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role & Joined Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="relative">
          {canManage && isRoleDropdownOpen ? (
            <div className="flex items-center gap-1">
              <select
                value={member.role}
                onChange={(e) => {
                  setIsRoleDropdownOpen(false);
                  onUpdateRole(member.id, e.target.value as MemberRole);
                }}
                className="px-2 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                autoFocus
                onBlur={() => setIsRoleDropdownOpen(false)}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          ) : (
            <div
              onClick={() => canManage && setIsRoleDropdownOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                roleInfo.badgeClass
              } ${canManage ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {roleInfo.icon}
              <span>{roleInfo.label}</span>
              {canManage && <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Joined {formattedJoined}</span>
        </div>
      </div>
    </div>
  );
};
