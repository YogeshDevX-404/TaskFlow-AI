import React, { useState } from 'react';
import {
  WorkAssignment,
  AssignmentStatus,
  IReferenceImage,
  IAcceptanceCriterion,
  IProofOfWork,
} from '../../types/workAssignment';
import { AcceptanceCriterionStatus, ProofCategory } from '../../config/assignmentConfig';
import {
  AssignmentStatusBadge,
  AssignmentPriorityBadge,
  AssignmentDueBadge,
} from './WorkAssignmentBadge';
import { WorkAssignmentComments } from './WorkAssignmentComments';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTimerStore } from '../../store/useTimerStore';
import {
  X,
  Clock,
  Play,
  UserCheck,
  Send,
  CheckCircle2,
  RotateCcw,
  PauseCircle,
  FolderKanban,
  CheckSquare,
  GitPullRequest,
  Paperclip,
  Trash2,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  History,
  FileCheck2,
  Code2,
  AlertTriangle,
  User,
  Shield,
  Timer,
  Image as ImageIcon,
  ListOrdered,
  Target,
  Sparkles,
  Plus,
  Maximize2,
  SplitSquareVertical,
  Check,
  XCircle,
  AlertCircle,
  Eye,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface DetailModalProps {
  assignment: WorkAssignment | null;
  onClose: () => void;
  onOpenReassignModal: (assignment: WorkAssignment) => void;
  onOpenSubmitModal: (assignment: WorkAssignment) => void;
  onOpenReviewModal: (assignment: WorkAssignment) => void;
  onOpenProgressModal: (assignment: WorkAssignment) => void;
}

type DetailTab =
  | 'overview'
  | 'images'
  | 'criteria'
  | 'proof'
  | 'submissions'
  | 'progress'
  | 'history'
  | 'comments';

export const WorkAssignmentDetailModal: React.FC<DetailModalProps> = ({
  assignment,
  onClose,
  onOpenReassignModal,
  onOpenSubmitModal,
  onOpenReviewModal,
  onOpenProgressModal,
}) => {
  const { user } = useAuthStore();
  const {
    updateStatus,
    deleteAssignment,
    addReferenceImages,
    removeReferenceImage,
    updateAcceptanceCriterionStatus,
    addAcceptanceCriterion,
    removeAcceptanceCriterion,
    addProofOfWork,
    removeProofOfWork,
    actionLoading,
  } = useWorkAssignmentStore();
  const { activeTimer } = useTimerStore();

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockInput, setShowBlockInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Lightbox modal for reference image or proof
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    caption?: string;
    description?: string;
  } | null>(null);

  // Add Reference Image Dialog
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageDesc, setNewImageDesc] = useState('');

  // Add Acceptance Criterion Dialog
  const [showAddCritModal, setShowAddCritModal] = useState(false);
  const [newCritTitle, setNewCritTitle] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritRequired, setNewCritRequired] = useState(true);

  // Add Proof of Work Dialog
  const [showAddProofModal, setShowAddProofModal] = useState(false);
  const [proofTitle, setProofTitle] = useState('');
  const [proofDesc, setProofDesc] = useState('');
  const [proofCategory, setProofCategory] = useState<ProofCategory>('Progress Evidence');
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [proofGithubPr, setProofGithubPr] = useState('');
  const [proofGithubSha, setProofGithubSha] = useState('');
  const [proofBeforeAfterType, setProofBeforeAfterType] = useState<'before' | 'after' | ''>('');

  // Proof Category Filter
  const [selectedProofCategory, setSelectedProofCategory] = useState<string>('ALL');

  if (!assignment) return null;

  const currentUserId = (user?.id || (user as any)?._id)?.toString();
  const isAssignee =
    assignment.assignedTo?._id?.toString() === currentUserId ||
    assignment.assignedTo?.id?.toString() === currentUserId;
  const isAssigner =
    assignment.assignedBy?._id?.toString() === currentUserId ||
    assignment.assignedBy?.id?.toString() === currentUserId;

  const assigneeName =
    assignment.assignedTo?.name ||
    `${assignment.assignedTo?.firstName || ''} ${assignment.assignedTo?.lastName || ''}`.trim() ||
    assignment.assignedTo?.email ||
    'Unassigned';

  const assignerName =
    assignment.assignedBy?.name ||
    `${assignment.assignedBy?.firstName || ''} ${assignment.assignedBy?.lastName || ''}`.trim() ||
    assignment.assignedBy?.email ||
    'System';

  const estHours =
    (assignment.estimatedHours || 0) +
    (assignment.estimatedMinutes ? assignment.estimatedMinutes / 60 : 0);
  const loggedHours = (assignment.totalLoggedSeconds || 0) / 3600;

  // Criteria Stats
  const criteriaList = assignment.acceptanceCriteria || [];
  const completedCriteriaCount = criteriaList.filter((c) => c.status === 'Completed').length;
  const criteriaCompletionPercent =
    criteriaList.length > 0
      ? Math.round((completedCriteriaCount / criteriaList.length) * 100)
      : 0;

  // Handlers
  const handleAcknowledge = async () => {
    await updateStatus(assignment.id, 'Acknowledged');
  };

  const handleStartWork = async () => {
    await updateStatus(assignment.id, 'In Progress');
  };

  const handleBlockWork = async () => {
    if (!blockReason.trim()) return;
    await updateStatus(assignment.id, 'Blocked', blockReason.trim());
    setShowBlockInput(false);
    setBlockReason('');
  };

  const handleUnblockWork = async () => {
    await updateStatus(assignment.id, 'In Progress', 'Impediment resolved');
  };

  const handleDelete = async () => {
    const success = await deleteAssignment(assignment.id);
    if (success) {
      onClose();
    }
  };

  // Add Reference Image Handler
  const handleCreateReferenceImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    await addReferenceImages(assignment.id, [
      {
        fileName: newImageName.trim() || 'Reference Image',
        fileUrl: newImageUrl.trim(),
        caption: newImageCaption.trim() || undefined,
        description: newImageDesc.trim() || undefined,
        order: (assignment.referenceImages?.length || 0) + 1,
      },
    ]);
    setShowAddImageModal(false);
    setNewImageUrl('');
    setNewImageName('');
    setNewImageCaption('');
    setNewImageDesc('');
  };

  // Add Acceptance Criterion Handler
  const handleCreateAcceptanceCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritTitle.trim()) return;
    await addAcceptanceCriterion(assignment.id, {
      title: newCritTitle.trim(),
      description: newCritDesc.trim() || undefined,
      isRequired: newCritRequired,
    });
    setShowAddCritModal(false);
    setNewCritTitle('');
    setNewCritDesc('');
    setNewCritRequired(true);
  };

  // Toggle Criterion Status
  const handleToggleCriterionStatus = async (
    criterionId: string,
    currentStatus: AcceptanceCriterionStatus
  ) => {
    const nextStatus: AcceptanceCriterionStatus =
      currentStatus === 'Completed'
        ? 'Not Completed'
        : currentStatus === 'Not Completed'
        ? 'Completed'
        : 'Not Completed';
    await updateAcceptanceCriterionStatus(assignment.id, criterionId, nextStatus);
  };

  // Add Proof of Work Handler
  const handleCreateProofOfWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofTitle.trim()) return;
    await addProofOfWork(assignment.id, {
      title: proofTitle.trim(),
      description: proofDesc.trim() || undefined,
      category: proofCategory,
      fileUrl: proofFileUrl.trim() || undefined,
      githubPrUrl: proofGithubPr.trim() || undefined,
      githubCommitSha: proofGithubSha.trim() || undefined,
      isBeforeAfter: !!proofBeforeAfterType,
      beforeAfterType: (proofBeforeAfterType as any) || undefined,
    });
    setShowAddProofModal(false);
    setProofTitle('');
    setProofDesc('');
    setProofFileUrl('');
    setProofGithubPr('');
    setProofGithubSha('');
    setProofBeforeAfterType('');
  };

  const filteredProofs = (assignment.proofOfWork || []).filter((p) => {
    if (selectedProofCategory === 'ALL') return true;
    return p.category === selectedProofCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-900/80">
                {assignment.assignmentId}
              </span>
              <AssignmentStatusBadge status={assignment.status} size="md" />
              <AssignmentPriorityBadge priority={assignment.priority} size="md" />
              <AssignmentDueBadge
                isOverdue={assignment.isOverdue}
                isDueSoon={assignment.isDueSoon}
                dueDate={assignment.dueDate}
              />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {assignment.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAssigner && (
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between gap-4 text-xs text-rose-700 dark:text-rose-300">
            <span className="font-semibold">
              Are you sure you want to permanently delete this assignment?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Action Lifecycle Bar */}
        <div className="px-6 py-3 bg-indigo-50/30 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* People & Time Quick Chips */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Assigned To:</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                {assignment.assignedTo?.avatar ? (
                  <img
                    src={assignment.assignedTo.avatar}
                    alt={assigneeName}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    {assigneeName.charAt(0)}
                  </div>
                )}
                <span>{assigneeName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Assigned By:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {assignerName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {loggedHours.toFixed(1)}h logged / {estHours.toFixed(1)}h est.
              </span>
            </div>

            {criteriaList.length > 0 && (
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  QA Criteria: {completedCriteriaCount}/{criteriaList.length} ({criteriaCompletionPercent}%)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Developer Actions */}
            {isAssignee && assignment.status === 'Assigned' && (
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            )}

            {isAssignee && ['Assigned', 'Acknowledged'].includes(assignment.status) && (
              <button
                onClick={handleStartWork}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Work</span>
              </button>
            )}

            {isAssignee && ['In Progress', 'Changes Requested'].includes(assignment.status) && (
              <>
                <button
                  onClick={() => onOpenProgressModal(assignment)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Update %</span>
                </button>

                <button
                  onClick={() => setShowBlockInput(!showBlockInput)}
                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Mark Blocked</span>
                </button>

                <button
                  onClick={() => onOpenSubmitModal(assignment)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </>
            )}

            {isAssignee && assignment.status === 'Blocked' && (
              <button
                onClick={handleUnblockWork}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume (Unblock)</span>
              </button>
            )}

            {/* Manager Actions */}
            {isAssigner && assignment.status === 'Submitted' && (
              <button
                onClick={() => onOpenReviewModal(assignment)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Review Deliverables</span>
              </button>
            )}

            {isAssigner && (
              <button
                onClick={() => onOpenReassignModal(assignment)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Reassign</span>
              </button>
            )}
          </div>
        </div>

        {/* Blocked Reason Drawer */}
        {showBlockInput && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 space-y-2">
            <label className="block text-xs font-bold text-rose-800 dark:text-rose-200">
              Explain why this assignment is blocked:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Waiting for backend API staging deployment or OAuth credentials..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleBlockWork}
                disabled={!blockReason.trim() || actionLoading}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Confirm Block
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto text-xs font-bold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Instructions & Steps</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'images'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Reference Images ({assignment.referenceImages?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('criteria')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'criteria'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              QA Criteria ({completedCriteriaCount}/{criteriaList.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('proof')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'proof'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Proof of Work ({assignment.proofOfWork?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'submissions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Send className="w-4 h-4 text-purple-500" />
            <span>
              Submissions & Review ({assignment.submissions?.length || (assignment.submission ? 1 : 0)})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'progress'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Progress ({assignment.progress || 0}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussion</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* 1. OVERVIEW & INSTRUCTIONS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Blocked Alert */}
              {assignment.status === 'Blocked' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Work is Currently Blocked</h4>
                    <p className="mt-0.5">
                      {assignment.blockedReason || 'Awaiting resolution from team lead/manager.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions Box */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>General Instructions & Objective</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {assignment.instructions || 'No general instructions specified.'}
                </div>
              </div>

              {/* Step-by-Step Implementation Guide */}
              {assignment.instructionSteps && assignment.instructionSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sequential Steps ({assignment.instructionSteps.length})</span>
                  </h4>
                  <div className="space-y-2.5">
                    {assignment.instructionSteps.map((step) => (
                      <div
                        key={step.id || step.stepNumber}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                      >
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {step.title}
                            </span>
                            {step.isRequired && (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                                Required
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Result & Definition of Done */}
              {assignment.expectedResult && (
                <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Expected Result & Delivery Outcome</span>
                  </h4>

                  {assignment.expectedResult.description && (
                    <p className="text-xs text-slate-800 dark:text-slate-200">
                      {assignment.expectedResult.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    {assignment.expectedResult.uiPreviewDetails && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          UI Preview Specs
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">
                          {assignment.expectedResult.uiPreviewDetails}
                        </p>
                      </div>
                    )}

                    {assignment.expectedResult.apiExpectedResponse && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          API Response Specs
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {assignment.expectedResult.apiExpectedResponse}
                        </p>
                      </div>
                    )}
                  </div>

                  {assignment.expectedResult.behavioralNotes && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Behavior & Edge Cases
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {assignment.expectedResult.behavioralNotes}
                      </p>
                    </div>
                  )}

                  {assignment.expectedResult.successConditions &&
                    assignment.expectedResult.successConditions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Success Conditions
                        </span>
                        {assignment.expectedResult.successConditions.map((cond, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{cond}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Linked Workspace Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Workspace Hierarchy
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <FolderKanban className="w-4 h-4 text-indigo-500" />
                    <span>Project: {assignment.project?.name || '—'}</span>
                  </div>
                  {assignment.task && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckSquare className="w-4 h-4 text-sky-500" />
                      <span>Task: {assignment.task.title}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    GitHub Integration
                  </span>
                  {assignment.githubPullRequest ? (
                    <a
                      href={assignment.githubPullRequest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      <span>
                        PR #{assignment.githubPullRequest.prNumber}: {assignment.githubPullRequest.title}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ) : assignment.githubIssue ? (
                    <a
                      href={assignment.githubIssue.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>
                        Issue #{assignment.githubIssue.issueNumber}: {assignment.githubIssue.title}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No external PR or Issue linked.</p>
                  )}
                </div>
              </div>

              {/* Reference Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Attached Resources ({assignment.attachments.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assignment.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 font-semibold group transition"
                      >
                        <span className="truncate">{att.fileName}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. REFERENCE IMAGES GALLERY */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Visual Design Reference & Wireframes
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    High-fidelity mockups, UI screenshots, and diagrams for developer visual parity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddImageModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reference Image</span>
                </button>
              </div>

              {assignment.referenceImages && assignment.referenceImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {assignment.referenceImages.map((img) => (
                    <div
                      key={img.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 overflow-hidden group shadow-sm flex flex-col"
                    >
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: img.fileUrl,
                            title: img.fileName,
                            caption: img.caption,
                            description: img.description,
                          })
                        }
                        className="h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden relative cursor-pointer"
                      >
                        <img
                          src={img.fileUrl}
                          alt={img.fileName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as any).src = 'https://placehold.co/400x300?text=Preview';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2 font-bold text-xs">
                          <Maximize2 className="w-4 h-4" />
                          <span>View Fullscreen</span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {img.fileName}
                            </h5>
                            {isAssigner && (
                              <button
                                onClick={() => removeReferenceImage(assignment.id, img.id)}
                                className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {img.caption && (
                            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {img.caption}
                            </p>
                          )}
                          {img.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {img.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <span>
                            {img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : 'Added'}
                          </span>
                          <a
                            href={img.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No reference images uploaded yet
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Add mockups, wireframes, and design specs to guide development.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddImageModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload First Image</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. ACCEPTANCE CRITERIA CHECKLIST */}
          {activeTab === 'criteria' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Acceptance Criteria & Verification Checklist
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Check off verification criteria as you implement and test requirements.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCritModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Criterion</span>
                </button>
              </div>

              {/* Progress Summary Banner */}
              {criteriaList.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span>Checklist Completion:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {completedCriteriaCount} of {criteriaList.length} criteria met ({criteriaCompletionPercent}%)
                      </span>
                    </div>
                    <div className="w-64 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${criteriaCompletionPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 text-right">
                    <span>Click circle icon to toggle completion status</span>
                  </div>
                </div>
              )}

              {/* Criteria List */}
              {criteriaList.length > 0 ? (
                <div className="space-y-2.5">
                  {criteriaList.map((crit) => {
                    const isDone = crit.status === 'Completed';
                    const isBlocked = crit.status === 'Blocked';

                    return (
                      <div
                        key={crit.id}
                        className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 text-xs ${
                          isDone
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                            : isBlocked
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleCriterionStatus(crit.id, crit.status)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : isBlocked
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {crit.title}
                              </span>
                              {crit.isRequired && (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                                  Required
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                    : isBlocked
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {crit.status}
                              </span>
                            </div>

                            {crit.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {crit.description}
                              </p>
                            )}

                            {crit.notes && (
                              <div className="p-2 bg-slate-100/70 dark:bg-slate-900/60 rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
                                <strong>Notes:</strong> {crit.notes}
                              </div>
                            )}

                            {crit.updatedAt && (
                              <p className="text-[10px] text-slate-400">
                                Updated {new Date(crit.updatedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {isAssigner && (
                          <button
                            type="button"
                            onClick={() => removeAcceptanceCriterion(assignment.id, crit.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No acceptance criteria defined
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Add criteria to establish unambiguous Definition of Done.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddCritModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Criterion</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. PROOF OF WORK & EVIDENCE */}
          {activeTab === 'proof' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Proof of Work & Output Artifacts
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Recorded evidence, screenshots, before/after comparisons, and test outputs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddProofModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Proof Item</span>
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                {['ALL', 'Progress Evidence', 'Before', 'After', 'Testing', 'Final Result'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedProofCategory(cat)}
                      className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                        selectedProofCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              {/* Proofs Grid */}
              {filteredProofs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProofs.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {p.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                              {p.category}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              {p.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeProofOfWork(assignment.id, p.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Preview if fileUrl */}
                      {p.fileUrl && (
                        <div
                          onClick={() =>
                            setLightboxImage({
                              url: p.fileUrl!,
                              title: p.title,
                              caption: p.category,
                              description: p.description,
                            })
                          }
                          className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <img
                            src={p.fileUrl}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              (e.target as any).src = 'https://placehold.co/400x200?text=Artifact';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1 font-bold text-xs">
                            <Maximize2 className="w-4 h-4" />
                            <span>Preview</span>
                          </div>
                        </div>
                      )}

                      {/* Links for GitHub PR or Commit */}
                      <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                        {p.githubPrUrl && (
                          <a
                            href={p.githubPrUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                          >
                            <GitPullRequest className="w-3 h-3" />
                            <span>PR Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        {p.githubCommitSha && (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                            <Code2 className="w-3 h-3 text-indigo-500" />
                            <span>SHA: {p.githubCommitSha.substring(0, 7)}</span>
                          </span>
                        )}

                        <span className="text-slate-400 text-[10px] ml-auto">
                          {p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                  <Shield className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No proof items recorded
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Attach screenshots, test outputs, or GitHub references to prove completion.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. SUBMISSIONS & REVIEW HISTORY */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Deliverable Submissions & Manager Review Audit
                </h4>
                <p className="text-[11px] text-slate-500">
                  Full versioned history of work submissions, review decisions, and revision notes.
                </p>
              </div>

              {assignment.submissions && assignment.submissions.length > 0 ? (
                <div className="space-y-4">
                  {assignment.submissions.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                            Version {sub.version}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              sub.status === 'Approved' || sub.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : sub.status === 'Changes Requested'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                : sub.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Developer Note */}
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block">
                          Developer Completion Note:
                        </span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {sub.completionNote || 'No summary note provided.'}
                        </div>
                      </div>

                      {/* GitHub Deliverable Links */}
                      {(sub.githubPrUrl || sub.githubCommitSha) && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {sub.githubPrUrl && (
                            <a
                              href={sub.githubPrUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold hover:underline"
                            >
                              <GitPullRequest className="w-3.5 h-3.5" />
                              <span>View PR</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {sub.githubCommitSha && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>SHA: {sub.githubCommitSha}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Criteria Snapshot */}
                      {sub.criteriaSnapshot && sub.criteriaSnapshot.length > 0 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-1.5">
                          <span className="font-bold text-[10px] uppercase text-slate-400 block">
                            Acceptance Criteria Status at Submission Time:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                            {sub.criteriaSnapshot.map((c, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                {c.status === 'Completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                )}
                                <span className="truncate">{c.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manager Review */}
                      {sub.review && (
                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-700 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {sub.review.decision === 'approve' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <RotateCcw className="w-4 h-4 text-orange-500" />
                              )}
                              <span>
                                Manager Review ({sub.review.decision === 'approve' ? 'Approved' : 'Revisions Requested'})
                              </span>
                            </span>
                            {sub.review.reviewedAt && (
                              <span className="text-[10px] text-slate-400">
                                {new Date(sub.review.reviewedAt).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {sub.review.reason && (
                            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl text-orange-800 dark:text-orange-200">
                              <strong>Feedback / Required Changes:</strong> {sub.review.reason}
                            </div>
                          )}

                          {sub.review.completionNote && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-200">
                              <strong>Approval Note:</strong> {sub.review.completionNote}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : assignment.submission ? (
                <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    Latest Submission
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200">
                    {assignment.submission.completionNote}
                  </p>
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                  <Send className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No deliverables submitted yet
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Once the developer finishes work and clicks 'Submit for Review', deliverables will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 6. PROGRESS MILESTONES */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Current Completion Status</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {assignment.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, assignment.progress || 0))}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Progress Milestone History
                </h4>
                {assignment.progressHistory && assignment.progressHistory.length > 0 ? (
                  <div className="space-y-3">
                    {assignment.progressHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            Reached {item.percentage}%
                          </span>
                          <span className="text-[10px]">
                            {new Date(item.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        {item.comment && (
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {item.comment}
                          </p>
                        )}
                        {item.attachmentUrl && (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{item.attachmentName || 'View attached proof'}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No progress milestones recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* 7. AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Full Status Lifecycle Audit Trail
              </h4>

              <div className="space-y-2">
                {assignment.statusHistory && assignment.statusHistory.length > 0 ? (
                  assignment.statusHistory.map((sh, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">
                          {sh.fromStatus} &rarr;
                        </span>
                        <AssignmentStatusBadge status={sh.toStatus} size="sm" />
                        {sh.reason && (
                          <span className="text-slate-500 italic">({sh.reason})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sh.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No status history yet.</p>
                )}
              </div>
            </div>
          )}

          {/* 8. DISCUSSION */}
          {activeTab === 'comments' && (
            <WorkAssignmentComments assignmentId={assignment.id} />
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="font-bold text-sm">{lightboxImage.title}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            {(lightboxImage.caption || lightboxImage.description) && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
                {lightboxImage.caption && (
                  <p className="font-bold text-indigo-400 mb-0.5">{lightboxImage.caption}</p>
                )}
                {lightboxImage.description && <p>{lightboxImage.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Reference Image Dialog Modal */}
      {showAddImageModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Reference Image
              </h3>
              <button
                onClick={() => setShowAddImageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReferenceImage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or Figma link"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navigation Header Mockup"
                  value={newImageName}
                  onChange={(e) => setNewImageName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile 390px breakpoint"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pay attention to font weight and spacing"
                  value={newImageDesc}
                  onChange={(e) => setNewImageDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddImageModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newImageUrl.trim() || actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Acceptance Criterion Dialog Modal */}
      {showAddCritModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Acceptance Criterion
              </h3>
              <button
                onClick={() => setShowAddCritModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAcceptanceCriterion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Criterion Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Password must be hashed with Argon2id"
                  value={newCritTitle}
                  onChange={(e) => setNewCritTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Testing Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verify unit test passes and salt is 16 bytes minimum"
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={newCritRequired}
                  onChange={(e) => setNewCritRequired(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Required for approval</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCritModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCritTitle.trim() || actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Add Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Proof of Work Dialog Modal */}
      {showAddProofModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Attach Proof of Work / Artifact
              </h3>
              <button
                onClick={() => setShowAddProofModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProofOfWork} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proof Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cypress E2E test report"
                    value={proofTitle}
                    onChange={(e) => setProofTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={proofCategory}
                    onChange={(e) => setProofCategory(e.target.value as ProofCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Progress Evidence">Progress Evidence</option>
                    <option value="Before">Before</option>
                    <option value="After">After</option>
                    <option value="Testing">Testing</option>
                    <option value="Final Result">Final Result</option>
                    <option value="Bug/Issue Evidence">Bug/Issue Evidence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Screenshot URL or Demo Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://loom.com/... or screenshot URL"
                  value={proofFileUrl}
                  onChange={(e) => setProofFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub PR URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={proofGithubPr}
                    onChange={(e) => setProofGithubPr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Commit SHA (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7f9a2b1"
                    value={proofGithubSha}
                    onChange={(e) => setProofGithubSha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Explanation
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail the verified behavior, test outcome, or visual changes..."
                  value={proofDesc}
                  onChange={(e) => setProofDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProofModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!proofTitle.trim() || actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Record Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
