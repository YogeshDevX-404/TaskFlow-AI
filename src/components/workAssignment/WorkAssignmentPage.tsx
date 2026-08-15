import React, { useEffect, useState } from 'react';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useSocketStore } from '../../store/useSocketStore';
import { WorkAssignment } from '../../types/workAssignment';
import { WorkAssignmentMetricsBar } from './WorkAssignmentMetricsBar';
import { WorkAssignmentFiltersBar } from './WorkAssignmentFiltersBar';
import { AssignmentKanbanBoard } from './AssignmentKanbanBoard';
import { AssignmentListTable } from './AssignmentListTable';
import { DeveloperWorkloadMatrix } from './DeveloperWorkloadMatrix';
import { AssignmentMonitoringDashboard } from './monitoring/AssignmentMonitoringDashboard';
import { CreateWorkAssignmentModal } from './CreateWorkAssignmentModal';
import { WorkAssignmentDetailModal } from './WorkAssignmentDetailModal';
import { ReassignWorkModal } from './ReassignWorkModal';
import { SubmitWorkModal } from './SubmitWorkModal';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import { UpdateProgressModal } from './UpdateProgressModal';
import { socketService } from '../../services/socketService';
import {
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const WorkAssignmentPage: React.FC = () => {
  const { activeOrganization } = useOrganizationStore();
  const { activeWorkspace } = useWorkspaceStore();
  const {
    assignments,
    myAssignments,
    scope,
    viewMode,
    selectedAssignment,
    setSelectedAssignment,
    fetchAssignments,
    fetchMyAssignments,
    fetchAssignmentById,
    updateStatus,
    addLocalAssignment,
    updateLocalAssignment,
    removeLocalAssignment,
    loading,
    error,
  } = useWorkAssignmentStore();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [targetAssignment, setTargetAssignment] = useState<WorkAssignment | null>(null);
  const [preselectedDevId, setPreselectedDevId] = useState<string | null>(null);

  // Initial and reactive fetch
  useEffect(() => {
    if (activeOrganization?.id) {
      if (scope === 'my') {
        fetchMyAssignments();
      } else {
        fetchAssignments();
      }
    }
  }, [activeOrganization, activeWorkspace, scope]);

  // Real-time socket events registration
  useEffect(() => {
    const handleAssignmentCreated = (data: any) => {
      if (data) addLocalAssignment(data);
    };

    const handleAssignmentUpdated = (data: any) => {
      if (data?.id) updateLocalAssignment(data.id, data);
    };

    const handleAssignmentDeleted = (data: any) => {
      if (data?.id) removeLocalAssignment(data.id);
    };

    socketService.on('assignment:created', handleAssignmentCreated);
    socketService.on('assignment:updated', handleAssignmentUpdated);
    socketService.on('assignment:deleted', handleAssignmentDeleted);
    socketService.on('assignment:status_changed', handleAssignmentUpdated);
    socketService.on('assignment:progress_updated', handleAssignmentUpdated);
    socketService.on('assignment:reassigned', handleAssignmentUpdated);
    socketService.on('assignment:submitted', handleAssignmentUpdated);
    socketService.on('assignment:reviewed', handleAssignmentUpdated);

    return () => {
      socketService.off('assignment:created', handleAssignmentCreated);
      socketService.off('assignment:updated', handleAssignmentUpdated);
      socketService.off('assignment:deleted', handleAssignmentDeleted);
      socketService.off('assignment:status_changed', handleAssignmentUpdated);
      socketService.off('assignment:progress_updated', handleAssignmentUpdated);
      socketService.off('assignment:reassigned', handleAssignmentUpdated);
      socketService.off('assignment:submitted', handleAssignmentUpdated);
      socketService.off('assignment:reviewed', handleAssignmentUpdated);
    };
  }, [addLocalAssignment, updateLocalAssignment, removeLocalAssignment]);

  const activeAssignmentsList = scope === 'my' ? myAssignments : assignments;

  const handleQuickAction = async (action: string, assignment: WorkAssignment) => {
    setTargetAssignment(assignment);
    switch (action) {
      case 'acknowledge':
        await updateStatus(assignment.id, 'Acknowledged');
        break;
      case 'start':
        await updateStatus(assignment.id, 'In Progress');
        break;
      case 'submit':
        setSubmitModalOpen(true);
        break;
      case 'review':
        setReviewModalOpen(true);
        break;
      case 'reassign':
        setReassignModalOpen(true);
        break;
      case 'progress':
        setProgressModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleAssignToSpecificDeveloper = (devId: string) => {
    setPreselectedDevId(devId);
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Work Assignments & Dispatch Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dispatch, track, review, and collaborate on structured engineering assignments with real-time capacity intelligence.
          </p>
        </div>

        <button
          onClick={() => {
            if (scope === 'my') fetchMyAssignments();
            else fetchAssignments();
          }}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Summary Row */}
      <WorkAssignmentMetricsBar assignments={activeAssignmentsList} />

      {/* Filter and Control Bar */}
      <WorkAssignmentFiltersBar
        onOpenCreateModal={() => {
          setPreselectedDevId(null);
          setCreateModalOpen(true);
        }}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main View Area (Kanban / List Table / Developer Matrix / Monitoring Dashboard) */}
      {viewMode === 'kanban' ? (
        <AssignmentKanbanBoard
          assignments={activeAssignmentsList}
          onSelectAssignment={(a) => {
            setSelectedAssignment(a);
            setTargetAssignment(a);
          }}
          onQuickAction={handleQuickAction}
          onOpenCreateModal={() => {
            setPreselectedDevId(null);
            setCreateModalOpen(true);
          }}
        />
      ) : viewMode === 'list' ? (
        <AssignmentListTable
          assignments={activeAssignmentsList}
          onSelectAssignment={(a) => {
            setSelectedAssignment(a);
            setTargetAssignment(a);
          }}
          onQuickAction={handleQuickAction}
        />
      ) : viewMode === 'workload-matrix' ? (
        <DeveloperWorkloadMatrix
          assignments={assignments}
          onSelectAssignment={(a) => {
            setSelectedAssignment(a);
            setTargetAssignment(a);
          }}
          onAssignToDeveloper={handleAssignToSpecificDeveloper}
        />
      ) : (
        <AssignmentMonitoringDashboard
          onSelectAssignment={async (assignmentId) => {
            const found =
              assignments.find((a) => a.id === assignmentId) ||
              (await fetchAssignmentById(assignmentId));
            if (found) {
              setSelectedAssignment(found);
              setTargetAssignment(found);
            }
          }}
          onOpenReviewModal={(assignment) => {
            setTargetAssignment(assignment);
            setReviewModalOpen(true);
          }}
          onOpenReassignModal={async (assignmentId) => {
            const found =
              assignments.find((a) => a.id === assignmentId) ||
              (await fetchAssignmentById(assignmentId));
            if (found) {
              setTargetAssignment(found);
              setReassignModalOpen(true);
            }
          }}
        />
      )}

      {/* Create Work Assignment Modal */}
      <CreateWorkAssignmentModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setPreselectedDevId(null);
        }}
        preselectedDeveloperId={preselectedDevId}
      />

      {/* Detail Modal */}
      <WorkAssignmentDetailModal
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onOpenReassignModal={(a) => {
          setTargetAssignment(a);
          setReassignModalOpen(true);
        }}
        onOpenSubmitModal={(a) => {
          setTargetAssignment(a);
          setSubmitModalOpen(true);
        }}
        onOpenReviewModal={(a) => {
          setTargetAssignment(a);
          setReviewModalOpen(true);
        }}
        onOpenProgressModal={(a) => {
          setTargetAssignment(a);
          setProgressModalOpen(true);
        }}
      />

      {/* Reassign Modal */}
      <ReassignWorkModal
        isOpen={reassignModalOpen}
        assignment={targetAssignment}
        onClose={() => {
          setReassignModalOpen(false);
          setTargetAssignment(null);
        }}
      />

      {/* Submit Work Modal */}
      <SubmitWorkModal
        isOpen={submitModalOpen}
        assignment={targetAssignment}
        onClose={() => {
          setSubmitModalOpen(false);
          setTargetAssignment(null);
        }}
      />

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={reviewModalOpen}
        assignment={targetAssignment}
        onClose={() => {
          setReviewModalOpen(false);
          setTargetAssignment(null);
        }}
      />

      {/* Update Progress Modal */}
      <UpdateProgressModal
        isOpen={progressModalOpen}
        assignment={targetAssignment}
        onClose={() => {
          setProgressModalOpen(false);
          setTargetAssignment(null);
        }}
      />
    </div>
  );
};
