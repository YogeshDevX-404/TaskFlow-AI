import React, { useState, useMemo } from 'react';
import { ProjectMember, ProjectMemberRole, ProjectMemberStatus } from '../../../types/projectMember';
import { useProjectMembers, useAddProjectMember, useUpdateProjectMember, useRemoveProjectMember } from '../../../hooks/useProjectMembers';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { AddProjectMemberModal } from './AddProjectMemberModal';
import { EditProjectMemberModal } from './EditProjectMemberModal';
import { ProjectMemberDetailDrawer } from './ProjectMemberDetailDrawer';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit3,
  Trash2,
  Mail,
  Github,
  CheckCircle2,
  Clock,
  Shield,
  LayoutGrid,
  List,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Activity,
  ChevronRight,
  Send,
} from 'lucide-react';

interface ProjectMembersViewProps {
  projectId: string;
  projectName?: string;
}

export const ProjectMembersView: React.FC<ProjectMembersViewProps> = ({
  projectId,
  projectName = 'Current Project',
}) => {
  const {
    members,
    selectedMember,
    activities,
    isLoading,
    isActionLoading,
    error,
    setSelectedMember,
    refetch,
  } = useProjectMembers(projectId);

  const { addMember } = useAddProjectMember();
  const { updateMember } = useUpdateProjectMember();
  const { removeMember } = useRemoveProjectMember();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'members' | 'pending' | 'activity'>('members');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'role'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Stats
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const ownersCount = members.filter((m) => m.role === 'Project Owner').length;

  // Filter & Sort members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Tab filter
        if (activeTab === 'pending' && m.status !== 'pending') return false;

        // Role filter
        if (selectedRole !== 'all' && m.role !== selectedRole) return false;

        // Status filter
        if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name =
            typeof m.user === 'object'
              ? `${m.user.firstName} ${m.user.lastName}`.toLowerCase()
              : m.user.toLowerCase();
          const email = typeof m.user === 'object' ? m.user.email.toLowerCase() : '';
          const gh = typeof m.user === 'object' ? (m.user.githubUsername || '').toLowerCase() : '';
          return name.includes(q) || email.includes(q) || gh.includes(q) || m.role.toLowerCase().includes(q);
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = typeof a.user === 'object' ? `${a.user.firstName} ${a.user.lastName}` : '';
          const nameB = typeof b.user === 'object' ? `${b.user.firstName} ${b.user.lastName}` : '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'oldest') {
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        }
        if (sortBy === 'role') {
          const roleOrder: Record<string, number> = {
            'Project Owner': 1,
            'Project Admin': 2,
            'Developer': 3,
            'Tester': 4,
            'Viewer': 5,
          };
          return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
        }
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      });
  }, [members, activeTab, selectedRole, selectedStatus, searchQuery, sortBy]);

  // Existing emails for duplicate check
  const existingEmails = members
    .map((m) => (typeof m.user === 'object' ? m.user.email : ''))
    .filter(Boolean);

  // Handlers
  const handleAddMemberSubmit = async (data: {
    email: string;
    role: ProjectMemberRole;
    status: ProjectMemberStatus;
  }) => {
    const newM = await addMember(projectId, data);
    if (newM) {
      showNotification('success', `Added ${data.email} to project as ${data.role}.`);
      return newM;
    }
  };

  const handleEditMemberSubmit = async (
    memberId: string,
    data: { role?: ProjectMemberRole; status?: ProjectMemberStatus }
  ) => {
    const success = await updateMember(projectId, memberId, data);
    if (success) {
      showNotification('success', 'Project member updated successfully.');
      return true;
    }
    return false;
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToRemove) return;
    const success = await removeMember(projectId, memberToRemove.id);
    if (success) {
      showNotification('success', 'Member removed from project.');
      setMemberToRemove(null);
    }
  };

  const handleResendInvite = (m: ProjectMember) => {
    const email = typeof m.user === 'object' ? m.user.email : 'member';
    showNotification('success', `Invitation email re-sent to ${email}.`);
  };

  return (
    <div id="project-members-container" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border animate-slide-in ${
            notification.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100 backdrop-blur-md'
              : 'bg-rose-900/90 border-rose-700 text-rose-100 backdrop-blur-md'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Members</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Contributors</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Invites</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Leads & Owners</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{ownersCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container Header with Actions */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Project Team & Access Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage member roles, permissions, and pending invitations for {projectName}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Members"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Views Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b md:border-b-0 border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Members
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Invitations
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Member Log
            </button>
          </div>

          {/* Table / Grid toggle */}
          {activeTab !== 'activity' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start md:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls (When Tab is NOT activity) */}
        {activeTab !== 'activity' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name, email, GitHub..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Project Owner">Project Owner</option>
                <option value="Project Admin">Project Admin</option>
                <option value="Developer">Developer</option>
                <option value="Tester">Tester</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Members</option>
                <option value="pending">Pending Invitations</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="newest">Sort: Newest Joined</option>
                <option value="oldest">Sort: Oldest Joined</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="role">Sort: Role Hierarchy</option>
              </select>
            </div>
          </div>
        )}

        {/* Activity Tab View */}
        {activeTab === 'activity' ? (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Recent Membership Activity
            </h3>
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={act.actorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={act.actorName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {act.actorName}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          /* Empty State */
          <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No project members match your search or filters.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try clearing your search query or role filter.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
                setSelectedStatus('all');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {filteredMembers.map((m) => {
                  const userName =
                    typeof m.user === 'object'
                      ? `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.email
                      : 'Member';
                  const userEmail = typeof m.user === 'object' ? m.user.email : '';
                  const userGithub =
                    typeof m.user === 'object' ? m.user.githubUsername : undefined;
                  const userAvatar = typeof m.user === 'object' ? m.user.avatar : undefined;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMember(m)}
                    >
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {userAvatar ? (
                            <img
                              src={userAvatar}
                              alt={userName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                              {userName.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                              <span>{userName}</span>
                              {userGithub && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  (@{userGithub})
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <RoleBadge role={m.role} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={m.status} size="sm" />
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(m.joinedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {m.status === 'pending' && (
                            <button
                              onClick={() => handleResendInvite(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              title="Resend Invite"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setEditingMember(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            title="Edit Role & Status"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setMemberToRemove(m)}
                            disabled={m.role === 'Project Owner'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title={
                              m.role === 'Project Owner' ? 'Cannot remove sole owner' : 'Remove Member'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* GRID / CARDS VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((m) => {
              const userName =
                typeof m.user === 'object'
                  ? `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.email
                  : 'Member';
              const userEmail = typeof m.user === 'object' ? m.user.email : '';
              const userAvatar = typeof m.user === 'object' ? m.user.avatar : undefined;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {userName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">
                          {userName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <RoleBadge role={m.role} size="sm" />
                    <StatusBadge status={m.status} size="sm" />
                  </div>

                  <div
                    className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] font-mono">
                      Joined {new Date(m.joinedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingMember(m)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600"
                        title="Edit Role"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMemberToRemove(m)}
                        disabled={m.role === 'Project Owner'}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddProjectMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMemberSubmit}
        isLoading={isActionLoading}
        error={error}
        existingEmails={existingEmails}
      />

      {/* Edit Member Modal */}
      <EditProjectMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={handleEditMemberSubmit}
        isLoading={isActionLoading}
        error={error}
      />

      {/* Member Detail Drawer */}
      <ProjectMemberDetailDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(m) => {
          setSelectedMember(null);
          setEditingMember(m);
        }}
        onRemove={(m) => {
          setSelectedMember(null);
          setMemberToRemove(m);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Remove Member from Project?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {typeof memberToRemove.user === 'object'
                  ? `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`
                  : 'this member'}
              </strong>{' '}
              from the project? They will lose all access to tasks and repository settings.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMemberConfirm}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
