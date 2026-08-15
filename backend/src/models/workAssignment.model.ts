import { Schema, Document, model, Types } from 'mongoose';
import { ProofCategory, AcceptanceCriterionStatus, SubmissionStatus } from '../config/assignmentConfig';

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
  uploadedAt: Date | string;
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
  updatedAt?: Date | string;
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
  uploadedAt: Date | string;
}

export interface IAssignmentSubmissionVersion {
  id: string;
  version: number;
  submittedBy: any;
  submittedAt: Date | string;
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
    reviewedBy?: any;
    reviewedAt?: Date | string;
    decision?: 'approve' | 'request_changes' | 'reject';
    reason?: string;
    feedbackAttachments?: IAssignmentAttachment[];
    completionNote?: string;
  };
}

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
  createdAt: Date | string;
}

export interface IAssignmentProgressUpdate {
  percentage: number;
  comment?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  evidenceAttachments?: IProofOfWork[];
  updatedBy: any;
  updatedAt: Date | string;
}

export interface IAssignmentReassignmentEntry {
  previousDeveloper: any;
  newDeveloper: any;
  changedBy: any;
  reason?: string;
  timestamp: Date | string;
}

export interface IAssignmentStatusHistoryEntry {
  fromStatus: AssignmentStatus;
  toStatus: AssignmentStatus;
  changedBy: any;
  reason?: string;
  timestamp: Date | string;
}

export interface IAssignmentPayload {
  id: string;
  assignmentId: string;
  organization: any;
  workspace: any;
  project: any;
  task?: any;
  assignedTo: any;
  assignedBy: any;
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
  instructionSteps: IInstructionStep[];
  expectedResult: IExpectedResult;
  referenceImages: IReferenceImage[];
  acceptanceCriteria: IAcceptanceCriterion[];
  proofOfWork: IProofOfWork[];
  submissions: IAssignmentSubmissionVersion[];
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
    reviewedBy?: any;
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

export interface IWorkAssignmentDocument extends Document {
  assignmentId: string;
  organization: Types.ObjectId;
  workspace: Types.ObjectId;
  project: Types.ObjectId;
  task?: Types.ObjectId | null;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  githubRepositoryConnection?: Types.ObjectId | null;
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
  instructionSteps: IInstructionStep[];
  expectedResult: IExpectedResult;
  referenceImages: IReferenceImage[];
  acceptanceCriteria: IAcceptanceCriterion[];
  proofOfWork: IProofOfWork[];
  submissions: IAssignmentSubmissionVersion[];
  priority: AssignmentPriority;
  status: AssignmentStatus;
  dueDate?: Date | null;
  estimatedHours: number;
  estimatedMinutes: number;
  attachments: IAssignmentAttachment[];
  progress: number;
  progressHistory: IAssignmentProgressUpdate[];
  reassignmentHistory: IAssignmentReassignmentEntry[];
  statusHistory: IAssignmentStatusHistoryEntry[];
  submission?: {
    completionNote?: string;
    submittedAt?: Date;
    githubPrUrl?: string;
    githubCommitSha?: string;
    proofAttachments?: IAssignmentAttachment[];
  };
  review?: {
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    changesRequestedReason?: string;
    completionNote?: string;
  };
  blockedReason?: string;
  cancellationReason?: string;
  acknowledgedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  completedBy?: Types.ObjectId | null;
  cancelledAt?: Date | null;
  cancelledBy?: Types.ObjectId | null;
  archivedAt?: Date | null;
  archivedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  toPayload(loggedSeconds?: number): IAssignmentPayload;
}

const AttachmentItemSchema = new Schema(
  {
    id: { type: String, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, default: null },
    fileType: { type: String, default: 'image' },
    mimeType: { type: String, default: 'image/png' },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProgressHistorySchema = new Schema(
  {
    percentage: { type: Number, required: true, min: 0, max: 100 },
    comment: { type: String, default: '' },
    attachmentUrl: { type: String, default: null },
    attachmentName: { type: String, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReassignmentHistorySchema = new Schema(
  {
    previousDeveloper: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    newDeveloper: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WorkAssignmentSchema = new Schema<IWorkAssignmentDocument>(
  {
    assignmentId: {
      type: String,
      required: [true, 'Human-readable assignment ID is required'],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace is required'],
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned developer is required'],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner is required'],
      index: true,
    },
    githubRepositoryConnection: {
      type: Schema.Types.ObjectId,
      ref: 'GitHubRepositoryConnection',
      default: null,
      index: true,
    },
    githubIssue: {
      issueNumber: { type: Number },
      title: { type: String },
      state: { type: String },
      url: { type: String },
      repositoryName: { type: String },
    },
    githubPullRequest: {
      prNumber: { type: Number },
      title: { type: String },
      state: { type: String },
      url: { type: String },
      branch: { type: String },
      repositoryName: { type: String },
    },
    title: {
      type: String,
      required: [true, 'Work title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Assigned',
        'Acknowledged',
        'In Progress',
        'Blocked',
        'Submitted',
        'Changes Requested',
        'Completed',
        'Cancelled',
        'Archived',
      ],
      default: 'Assigned',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Estimated minutes cannot be negative'],
      max: [59, 'Estimated minutes cannot exceed 59'],
    },
    attachments: [AttachmentItemSchema],
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be below 0%'],
      max: [100, 'Progress cannot exceed 100%'],
    },
    progressHistory: [ProgressHistorySchema],
    reassignmentHistory: [ReassignmentHistorySchema],
    statusHistory: [StatusHistorySchema],
    submission: {
      completionNote: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
      githubPrUrl: { type: String, default: '' },
      githubCommitSha: { type: String, default: '' },
      proofAttachments: [AttachmentItemSchema],
    },
    review: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      changesRequestedReason: { type: String, default: '' },
      completionNote: { type: String, default: '' },
    },
    blockedReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant query filtering and multi-tenancy isolation
WorkAssignmentSchema.index({ organization: 1, assignmentId: 1 }, { unique: true });
WorkAssignmentSchema.index({ organization: 1, assignedTo: 1, status: 1 });
WorkAssignmentSchema.index({ organization: 1, project: 1, status: 1 });
WorkAssignmentSchema.index({ organization: 1, workspace: 1, status: 1 });
WorkAssignmentSchema.index({ organization: 1, dueDate: 1, status: 1 });

WorkAssignmentSchema.methods.toPayload = function (loggedSeconds: number = 0): IAssignmentPayload {
  const now = new Date();
  const isTerminal = ['Completed', 'Cancelled', 'Archived'].includes(this.status);
  const isOverdue = !isTerminal && this.dueDate ? new Date(this.dueDate) < now : false;

  const dueSoonThresholdHours = 24;
  const isDueSoon =
    !isTerminal &&
    !isOverdue &&
    this.dueDate &&
    new Date(this.dueDate).getTime() - now.getTime() <= dueSoonThresholdHours * 60 * 60 * 1000;

  return {
    id: this._id.toString(),
    assignmentId: this.assignmentId,
    organization: this.organization,
    workspace: this.workspace,
    project: this.project,
    task: this.task,
    assignedTo: this.assignedTo,
    assignedBy: this.assignedBy,
    githubRepositoryConnection: this.githubRepositoryConnection,
    githubIssue: this.githubIssue,
    githubPullRequest: this.githubPullRequest,
    title: this.title,
    description: this.description || '',
    instructions: this.instructions || '',
    instructionSteps: this.instructionSteps || [],
    expectedResult: this.expectedResult || { description: '' },
    referenceImages: this.referenceImages || [],
    acceptanceCriteria: this.acceptanceCriteria || [],
    proofOfWork: this.proofOfWork || [],
    submissions: this.submissions || [],
    priority: this.priority,
    status: this.status,
    dueDate: this.dueDate ? this.dueDate.toISOString() : null,
    estimatedHours: this.estimatedHours || 0,
    estimatedMinutes: this.estimatedMinutes || 0,
    attachments: this.attachments || [],
    progress: this.progress || 0,
    progressHistory: (this.progressHistory || []).map((p: any) => ({
      percentage: p.percentage,
      comment: p.comment,
      attachmentUrl: p.attachmentUrl,
      attachmentName: p.attachmentName,
      updatedBy: p.updatedBy,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    })),
    reassignmentHistory: (this.reassignmentHistory || []).map((r: any) => ({
      previousDeveloper: r.previousDeveloper,
      newDeveloper: r.newDeveloper,
      changedBy: r.changedBy,
      reason: r.reason,
      timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
    })),
    statusHistory: (this.statusHistory || []).map((s: any) => ({
      fromStatus: s.fromStatus,
      toStatus: s.toStatus,
      changedBy: s.changedBy,
      reason: s.reason,
      timestamp: s.timestamp ? new Date(s.timestamp).toISOString() : new Date().toISOString(),
    })),
    submission: this.submission
      ? {
          completionNote: this.submission.completionNote,
          submittedAt: this.submission.submittedAt
            ? new Date(this.submission.submittedAt).toISOString()
            : undefined,
          githubPrUrl: this.submission.githubPrUrl,
          githubCommitSha: this.submission.githubCommitSha,
          proofAttachments: this.submission.proofAttachments || [],
        }
      : undefined,
    review: this.review
      ? {
          reviewedBy: this.review.reviewedBy,
          reviewedAt: this.review.reviewedAt
            ? new Date(this.review.reviewedAt).toISOString()
            : undefined,
          changesRequestedReason: this.review.changesRequestedReason,
          completionNote: this.review.completionNote,
        }
      : undefined,
    blockedReason: this.blockedReason || '',
    cancellationReason: this.cancellationReason || '',
    acknowledgedAt: this.acknowledgedAt ? new Date(this.acknowledgedAt).toISOString() : null,
    startedAt: this.startedAt ? new Date(this.startedAt).toISOString() : null,
    completedAt: this.completedAt ? new Date(this.completedAt).toISOString() : null,
    completedBy: this.completedBy,
    cancelledAt: this.cancelledAt ? new Date(this.cancelledAt).toISOString() : null,
    cancelledBy: this.cancelledBy,
    archivedAt: this.archivedAt ? new Date(this.archivedAt).toISOString() : null,
    archivedBy: this.archivedBy,
    isOverdue: !!isOverdue,
    isDueSoon: !!isDueSoon,
    totalLoggedSeconds: loggedSeconds,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const WorkAssignmentModel = model<IWorkAssignmentDocument>('WorkAssignment', WorkAssignmentSchema);
