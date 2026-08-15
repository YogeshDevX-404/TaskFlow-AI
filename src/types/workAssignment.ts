import {
  ProofCategory,
  AcceptanceCriterionStatus,
  SubmissionStatus,
} from '../config/assignmentConfig';

export type AssignmentPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type AssignmentStatus =
  | 'Assigned'
  | 'Acknowledged'
  | 'In Progress'
  | 'Blocked'
  | 'Submitted'
  | 'Changes Requested'
  | 'Completed'
  | 'Cancelled'
  | 'Archived';

export interface IAssignmentAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  publicId?: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: any;
  createdAt: string;
}

export interface IReferenceImage {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  publicId?: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  caption?: string;
  description?: string;
  order: number;
  uploadedBy: any;
  uploadedAt: string;
}

export interface IInstructionStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  isRequired?: boolean;
}

export interface IExpectedResult {
  description: string;
  uiPreviewDetails?: string;
  apiExpectedResponse?: string;
  behavioralNotes?: string;
  successConditions?: string[];
}

export interface IAcceptanceCriterion {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  status: AcceptanceCriterionStatus;
  updatedBy?: any;
  updatedAt?: string;
  notes?: string;
}

export interface IProofOfWork {
  id: string;
  title: string;
  description?: string;
  category: ProofCategory;
  fileUrl?: string;
  fileName?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  githubUrl?: string;
  githubCommitSha?: string;
  githubPrUrl?: string;
  isBeforeAfter?: boolean;
  beforeAfterType?: 'before' | 'after';
  pairedProofId?: string;
  uploadedBy: any;
  uploadedAt: string;
}

export interface IAssignmentSubmissionVersion {
  id: string;
  version: number;
  submittedBy: any;
  submittedAt: string;
  completionNote: string;
  githubPrUrl?: string;
  githubCommitSha?: string;
  githubBranch?: string;
  proofAttachments: IAssignmentAttachment[];
  criteriaSnapshot?: Array<{
    criterionId: string;
    title: string;
    status: AcceptanceCriterionStatus;
    notes?: string;
  }>;
  status: SubmissionStatus;
  review?: {
    reviewedBy?: {
      _id?: string;
      id?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      avatar?: string;
    };
    reviewedAt?: string;
    decision?: 'approve' | 'request_changes' | 'reject';
    reason?: string;
    feedbackAttachments?: IAssignmentAttachment[];
    completionNote?: string;
  };
}

export interface IAssignmentProgressUpdate {
  percentage: number;
  comment?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  evidenceAttachments?: IProofOfWork[];
  updatedBy: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  updatedAt: string;
}

export interface IAssignmentReassignmentEntry {
  previousDeveloper: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  newDeveloper: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  changedBy: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  reason?: string;
  timestamp: string;
}

export interface IAssignmentStatusHistoryEntry {
  fromStatus: AssignmentStatus;
  toStatus: AssignmentStatus;
  changedBy: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  reason?: string;
  timestamp: string;
}

export interface WorkAssignment {
  id: string;
  assignmentId: string;
  organization: any;
  workspace: any;
  project: {
    _id?: string;
    id?: string;
    name: string;
    key?: string;
    slug?: string;
  };
  task?: {
    _id?: string;
    id?: string;
    title: string;
    taskKey?: string;
    status?: string;
    priority?: string;
  } | null;
  assignedTo: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  assignedBy: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  githubRepositoryConnection?: any;
  githubIssue?: {
    issueNumber: number;
    title: string;
    state: string;
    url: string;
    repositoryName?: string;
  };
  githubPullRequest?: {
    prNumber: number;
    title: string;
    state: string;
    url: string;
    branch?: string;
    repositoryName?: string;
  };
  title: string;
  description: string;
  instructions: string;
  instructionSteps?: IInstructionStep[];
  expectedResult?: IExpectedResult;
  referenceImages?: IReferenceImage[];
  acceptanceCriteria?: IAcceptanceCriterion[];
  proofOfWork?: IProofOfWork[];
  submissions?: IAssignmentSubmissionVersion[];
  priority: AssignmentPriority;
  status: AssignmentStatus;
  dueDate?: string | null;
  estimatedHours: number;
  estimatedMinutes: number;
  attachments: IAssignmentAttachment[];
  progress: number;
  progressHistory: IAssignmentProgressUpdate[];
  reassignmentHistory: IAssignmentReassignmentEntry[];
  statusHistory: IAssignmentStatusHistoryEntry[];
  submission?: {
    completionNote?: string;
    submittedAt?: string;
    githubPrUrl?: string;
    githubCommitSha?: string;
    proofAttachments?: IAssignmentAttachment[];
  };
  review?: {
    reviewedBy?: {
      _id?: string;
      id?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      avatar?: string;
    };
    reviewedAt?: string;
    changesRequestedReason?: string;
    completionNote?: string;
  };
  blockedReason?: string;
  cancellationReason?: string;
  acknowledgedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  completedBy?: any;
  cancelledAt?: string | null;
  cancelledBy?: any;
  archivedAt?: string | null;
  archivedBy?: any;
  isOverdue: boolean;
  isDueSoon: boolean;
  totalLoggedSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperWorkloadStats {
  activeAssignmentsCount: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  overdueAssignmentsCount: number;
  capacityWarning?: string;
}

export interface CreateAssignmentInput {
  organizationId: string;
  workspaceId: string;
  projectId: string;
  taskId?: string;
  assignedToId: string;
  title: string;
  description?: string;
  instructions?: string;
  instructionSteps?: IInstructionStep[];
  expectedResult?: IExpectedResult;
  referenceImages?: IReferenceImage[];
  acceptanceCriteria?: Array<Omit<IAcceptanceCriterion, 'updatedBy' | 'updatedAt'>>;
  priority?: AssignmentPriority;
  dueDate?: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
  attachments?: Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    publicId?: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: string;
  }>;
  githubRepositoryConnectionId?: string;
  githubIssue?: {
    issueNumber: number;
    title: string;
    state: string;
    url: string;
    repositoryName?: string;
  };
  githubPullRequest?: {
    prNumber: number;
    title: string;
    state: string;
    url: string;
    branch?: string;
    repositoryName?: string;
  };
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  instructions?: string;
  instructionSteps?: IInstructionStep[];
  expectedResult?: IExpectedResult;
  referenceImages?: IReferenceImage[];
  acceptanceCriteria?: IAcceptanceCriterion[];
  priority?: AssignmentPriority;
  dueDate?: string | null;
  estimatedHours?: number;
  estimatedMinutes?: number;
  attachments?: any[];
  taskId?: string | null;
  githubRepositoryConnectionId?: string | null;
  githubIssue?: any;
  githubPullRequest?: any;
  organizationId?: string;
}

export interface AssignmentFilterParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  assignedToId?: string;
  assignedById?: string;
  status?: string | string[];
  priority?: string | string[];
  isOverdue?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IAssignmentDashboardSummary {
  totalAssignments: number;
  totalActive: number;
  statusCounts: Record<AssignmentStatus | string, number>;
  priorityCounts: Record<AssignmentPriority | string, number>;
  overdueCount: number;
  dueSoonCount: number;
  reviewQueueCount: number;
  changesRequestedCount: number;
  blockedCount: number;
  completedCount: number;
  avgProgress: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  totalLoggedSeconds: number;
  completionRate: number;
}

export interface IDeveloperMonitoringStats {
  developer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  blockedAssignments: number;
  submittedAssignments: number;
  overdueAssignments: number;
  avgProgress: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  workloadStatus: 'Optimal' | 'Busy' | 'Overloaded';
  recentAssignments: Array<{
    id: string;
    assignmentId: string;
    title: string;
    status: AssignmentStatus;
    priority: AssignmentPriority;
    progress: number;
    dueDate?: string | null;
  }>;
}

export interface IProjectMonitoringStats {
  project: {
    id: string;
    name: string;
    key?: string;
    slug?: string;
  };
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  blockedAssignments: number;
  submittedAssignments: number;
  overdueAssignments: number;
  avgProgress: number;
  completionRate: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  activeDeveloperCount: number;
}

export interface IAttentionNeededAssignment extends WorkAssignment {
  urgency: 'critical' | 'high' | 'medium';
  attentionReason: string;
}

export interface IMonitoringFilterParams {
  workspaceId?: string;
  projectId?: string;
  assignedToId?: string;
  priority?: string;
  status?: string;
  dateRangePreset?: 'today' | 'this_week' | 'this_month' | 'last_month' | 'quarter' | 'custom' | string;
  dateFrom?: string;
  dateTo?: string;
  repositoryName?: string;
}

// Bulk Actions
export interface IBulkActionResponse {
  successful: string[];
  failed: Array<{ id: string; reason: string }>;
  message: string;
}

export interface IBulkReassignDTO {
  assignmentIds: string[];
  newDeveloperId: string;
  reason?: string;
}

export interface IBulkPriorityDTO {
  assignmentIds: string[];
  priority: AssignmentPriority;
}

export interface IBulkStatusDTO {
  assignmentIds: string[];
  status: AssignmentStatus;
  reason?: string;
}

export interface IBulkArchiveDTO {
  assignmentIds: string[];
}

// Reports
export interface IAssignmentSummaryReport {
  totalAssignments: number;
  completedAssignments: number;
  completionRate: number;
  overdueCount: number;
  blockedCount: number;
  avgProgress: number;
  avgCompletionDays: number;
  avgSubmissionDays: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
}

export interface IDeveloperWorkReportItem {
  developerId: string;
  developerName: string;
  developerEmail: string;
  avatar?: string;
  role: string;
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  blockedAssignments: number;
  submittedAssignments: number;
  overdueAssignments: number;
  completionRate: number;
  avgProgress: number;
  avgCompletionDays: number;
  estimatedHours: number;
  loggedHours: number;
}

export interface IProjectWorkReportItem {
  projectId: string;
  projectName: string;
  projectKey?: string;
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  blockedAssignments: number;
  submittedAssignments: number;
  overdueAssignments: number;
  completionRate: number;
  avgProgress: number;
  estimatedHours: number;
  loggedHours: number;
  assignedDeveloperCount: number;
}

export interface IOverdueReportItem {
  id: string;
  assignmentId: string;
  title: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  progress: number;
  dueDate: string;
  daysOverdue: number;
  blockedReason?: string;
  developer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  project: {
    id: string;
    name: string;
    key?: string;
  } | null;
}

export interface ISubmissionReport {
  summary: {
    totalAssignmentsWithSubmissions: number;
    totalSubmissionCycles: number;
    pendingReviewCount: number;
    approvedCount: number;
    changesRequestedCount: number;
    avgReviewHours: number;
  };
  items: Array<{
    id: string;
    assignmentId: string;
    title: string;
    status: AssignmentStatus;
    submissionCount: number;
    latestSubmittedAt?: string;
    latestReviewedAt?: string;
    reviewDecision?: string;
    developerName: string;
    projectName: string;
  }>;
}

export interface IWorkloadReportItem {
  developerId: string;
  developerName: string;
  developerEmail: string;
  avatar?: string;
  activeAssignments: number;
  weeklyCapacityHours: number;
  assignedCapacityPct: number;
  availableCapacityHours: number;
  totalEstimatedHours: number;
  totalLoggedHours: number;
  workloadStatus: 'Under Capacity' | 'Optimal' | 'Over Capacity';
}

// Detailed Drilldowns
export interface IDeveloperDetailedDrilldown {
  developer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    joinedAt?: string;
  };
  stats: {
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    blockedAssignments: number;
    overdueAssignments: number;
    submittedAssignments: number;
    totalEstimatedHours: number;
    totalLoggedHours: number;
    workloadStatus: 'Optimal' | 'Busy' | 'Overloaded';
    completionRate: number;
  };
  assignments: WorkAssignment[];
  recentTimeLogs: any[];
}

export interface IProjectDetailedDrilldown {
  project: {
    id: string;
    name: string;
    key?: string;
    description?: string;
    status?: string;
  };
  stats: {
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    blockedAssignments: number;
    overdueAssignments: number;
    submittedAssignments: number;
    totalEstimatedHours: number;
    completionRate: number;
    activeDevelopersCount: number;
  };
  developerDistribution: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    total: number;
    active: number;
    completed: number;
  }>;
  assignments: WorkAssignment[];
}


