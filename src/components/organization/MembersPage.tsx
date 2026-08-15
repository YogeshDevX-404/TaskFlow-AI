import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Shield,
  Clock,
  Crown,
  Eye,
  ArrowUpDown,
  Mail,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrganizationMembers } from '../../hooks/useOrganizationMembers';
import { useInvitations } from '../../hooks/useInvitations';
import { OrganizationMember, MemberRole } from '../../types/organization';
import { MemberCard } from './MemberCard';
import { MemberTable } from './MemberTable';
import { InvitationsTable } from './InvitationsTable';
import { InviteMemberModal } from './InviteMemberModal';
import { MemberProfileDrawer } from './MemberProfileDrawer';
import { AcceptInviteModal } from './AcceptInviteModal';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { Spinner } from '../ui/Spinner';

export const MembersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { activeOrganization } = useOrganizationStore();

  const {
    members,
    totalMembers,
    isLoading,
    isActionLoading,
    error,
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    selectedMember,
    refreshMembers,
    removeMember,
    updateMemberRole,
    transferOwnership,
    setSelectedMember,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    clearError,
  } = useOrganizationMembers();

  const {
    invitations,
    totalInvitations,
    resendInvitation,
    cancelInvitation,
    refreshInvitations,
  } = useInvitations();

  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [acceptToken, setAcceptToken] = useState<string | null>(null);

  // Check URL query parameters for accept invite token (?token=xyz)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setAcceptToken(token);
    }
  }, []);

  const currentUserId = user?.id;
  const isOwner = activeOrganization?.owner === currentUserId;
  const currentMember = members.find((m) => {
    const u = typeof m.user === 'object' ? m.user : null;
    return u?.id === currentUserId;
  });
  const isAdmin = isOwner || currentMember?.role === 'admin' || currentMember?.role === 'owner';

  // Metrics calculation
  const adminCount = members.filter((m) => m.role === 'admin' || m.role === 'owner').length;
  const pendingInviteCount = invitations.filter((i) => i.status === 'pending').length;
  const guestCount = members.filter((m) => m.role === 'guest').length;

  if (!activeOrganization) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          No Workspace Selected
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          Please select or create an organization workspace to manage members and invitations.
        </p>
        <OrganizationSwitcher />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Organization Members
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {totalMembers} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage member access, roles, permissions, and pending invitations for{' '}
            <strong className="text-slate-700 dark:text-slate-300">{activeOrganization.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OrganizationSwitcher />

          {isAdmin && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Members
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalMembers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Admins & Owners
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{adminCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Pending Invites
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{pendingInviteCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Guest Accounts
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{guestCount}</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'members'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Members</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px]">
              {totalMembers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'invitations'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Pending Invitations</span>
            {pendingInviteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                {pendingInviteCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {activeTab === 'members' && (
            <>
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Tab Views */}
      {isLoading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <Spinner size="lg" className="text-indigo-600 mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading workspace members...</p>
        </div>
      ) : activeTab === 'members' ? (
        members.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No Members Match Criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
              {searchQuery
                ? `No members found matching "${searchQuery}". Try clearing search filters.`
                : 'Start inviting team members to collaborate in this workspace.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite First Member</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                currentUserId={currentUserId}
                isOwner={isOwner}
                isAdmin={isAdmin}
                onSelectMember={setSelectedMember}
                onUpdateRole={updateMemberRole}
                onRemoveMember={removeMember}
              />
            ))}
          </div>
        ) : (
          <MemberTable
            members={members}
            currentUserId={currentUserId}
            isOwner={isOwner}
            isAdmin={isAdmin}
            onSelectMember={setSelectedMember}
            onUpdateRole={updateMemberRole}
            onRemoveMember={removeMember}
          />
        )
      ) : (
        <InvitationsTable
          invitations={invitations}
          isActionLoading={isActionLoading}
          onResendInvite={resendInvitation}
          onCancelInvite={cancelInvitation}
        />
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          refreshMembers();
          refreshInvitations();
        }}
      />

      {/* Selected Member Drawer */}
      <MemberProfileDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        currentUserId={currentUserId}
        isOwner={isOwner}
        isAdmin={isAdmin}
        onClose={() => setSelectedMember(null)}
        onUpdateRole={updateMemberRole}
        onRemoveMember={removeMember}
        onTransferOwnership={transferOwnership}
      />

      {/* Accept Invitation Modal (Triggers when token present) */}
      <AcceptInviteModal
        token={acceptToken}
        isOpen={!!acceptToken}
        onClose={() => {
          setAcceptToken(null);
          // Clean token from URL query params cleanly
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, '', url.toString());
        }}
        onSuccess={() => {
          refreshMembers();
        }}
      />
    </div>
  );
};
