import React, { useState } from 'react';
import { useWorkloadOverview, useTeamWorkload } from '../../hooks/useWorkload';
import { useAuthStore } from '../../store/useAuthStore';
import { TeamOverviewSection } from './TeamOverviewSection';
import { MemberWorkloadTable } from './MemberWorkloadTable';
import { ProjectResourceView } from './ProjectResourceView';
import { UpcomingAndOverdueSection } from './UpcomingAndOverdueSection';
import { WorkloadCalendarView } from './WorkloadCalendarView';
import { SmartRecommendationsCard } from './SmartRecommendationsCard';
import { CapacityConfigModal } from './CapacityConfigModal';
import { BulkReassignModal } from './BulkReassignModal';
import { MemberWorkload } from '../../types/workload';
import {
  Users,
  Briefcase,
  Calendar,
  AlertTriangle,
  Lightbulb,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  Layers,
  Filter,
} from 'lucide-react';

export const WorkloadDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const organizationId = (user as any)?.organizationId || '';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'projects' | 'calendar' | 'upcoming-overdue' | 'recommendations'
  >('overview');

  const [selectedMemberForCapacity, setSelectedMemberForCapacity] = useState<MemberWorkload | null>(null);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [isBulkReassignModalOpen, setIsBulkReassignModalOpen] = useState(false);

  // Queries
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useWorkloadOverview({ organizationId });

  const {
    data: teamData,
    isLoading: isTeamLoading,
    refetch: refetchTeam,
  } = useTeamWorkload({ organizationId });

  const handleOpenCapacityModal = (member: MemberWorkload) => {
    setSelectedMemberForCapacity(member);
    setIsCapacityModalOpen(true);
  };

  const handleRefresh = () => {
    refetchOverview();
    refetchTeam();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Team Workload & Resource Planning
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor team capacity, prevent burnout, identify bottlenecks, and reallocate work
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkReassignModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bulk Reassign Tasks
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Workload Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'members'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Member Capacity
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'projects'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Project Resources
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Workload Calendar
        </button>

        <button
          onClick={() => setActiveTab('upcoming-overdue')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'upcoming-overdue'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Upcoming & Overdue
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'recommendations'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Recommendations
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <TeamOverviewSection
            summary={overviewData?.teamSummary}
            isLoading={isOverviewLoading}
          />
          <SmartRecommendationsCard
            organizationId={organizationId}
            onOpenBulkReassign={() => setIsBulkReassignModalOpen(true)}
          />
          <MemberWorkloadTable
            members={teamData?.members || []}
            isLoading={isTeamLoading}
            onOpenCapacityModal={handleOpenCapacityModal}
            onOpenBulkReassignModal={() => setIsBulkReassignModalOpen(true)}
          />
        </div>
      )}

      {activeTab === 'members' && (
        <div className="animate-in fade-in duration-200">
          <MemberWorkloadTable
            members={teamData?.members || []}
            isLoading={isTeamLoading}
            onOpenCapacityModal={handleOpenCapacityModal}
            onOpenBulkReassignModal={() => setIsBulkReassignModalOpen(true)}
          />
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="animate-in fade-in duration-200">
          <ProjectResourceView organizationId={organizationId} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="animate-in fade-in duration-200">
          <WorkloadCalendarView organizationId={organizationId} />
        </div>
      )}

      {activeTab === 'upcoming-overdue' && (
        <div className="animate-in fade-in duration-200">
          <UpcomingAndOverdueSection organizationId={organizationId} />
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="animate-in fade-in duration-200">
          <SmartRecommendationsCard
            organizationId={organizationId}
            onOpenBulkReassign={() => setIsBulkReassignModalOpen(true)}
          />
        </div>
      )}

      {/* Modals */}
      <CapacityConfigModal
        isOpen={isCapacityModalOpen}
        onClose={() => setIsCapacityModalOpen(false)}
        member={selectedMemberForCapacity}
        organizationId={organizationId}
      />

      <BulkReassignModal
        isOpen={isBulkReassignModalOpen}
        onClose={() => setIsBulkReassignModalOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
};
