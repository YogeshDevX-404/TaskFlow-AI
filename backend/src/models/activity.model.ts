import { Schema, Document, model, Types } from 'mongoose';

export type ActivityAction =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_restored'
  | 'task_archived'
  | 'assignment_created'
  | 'assignment_updated'
  | 'assignment_reassigned'
  | 'assignment_progress_updated'
  | 'assignment_submitted'
  | 'assignment_changes_requested'
  | 'assignment_completed'
  | 'assignment_cancelled'
  | 'assignment_archived'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'reporter_changed'
  | 'label_added'
  | 'label_removed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'attachment_uploaded'
  | 'attachment_deleted'
  | 'project_updated'
  | 'project_archived'
  | 'workspace_updated'
  | 'organization_updated'
  | 'member_added'
  | 'member_removed'
  | 'role_changed'
  | 'login'
  | 'logout';

export type EntityType =
  | 'Task'
  | 'WorkAssignment'
  | 'Assignment'
  | 'Project'
  | 'Workspace'
  | 'Organization'
  | 'Comment'
  | 'Attachment'
  | 'Member'
  | 'Role'
  | 'Auth';

export interface IActivityPayload {
  id: string;
  organization: any;
  workspace?: any;
  project?: any;
  task?: any;
  assignment?: any;
  user: any;
  action: ActivityAction | string;
  entityType: EntityType | string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IActivityDocument extends Document {
  organization: Types.ObjectId;
  workspace?: Types.ObjectId | null;
  project?: Types.ObjectId | null;
  task?: Types.ObjectId | null;
  assignment?: Types.ObjectId | null;
  user: Types.ObjectId;
  action: ActivityAction | string;
  entityType: EntityType | string;
  entityId: Types.ObjectId | string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  toActivityPayload(): IActivityPayload;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required for audit activity'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'WorkAssignment',
      default: null,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for audit activity'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action type is required'],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      index: true,
    },
    entityId: {
      type: Schema.Types.Mixed,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for high performance auditing and queries
ActivitySchema.index({ organization: 1, createdAt: -1 });
ActivitySchema.index({ task: 1, createdAt: -1 });
ActivitySchema.index({ assignment: 1, createdAt: -1 });
ActivitySchema.index({ project: 1, createdAt: -1 });
ActivitySchema.index({ workspace: 1, createdAt: -1 });
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ action: 1, createdAt: -1 });

ActivitySchema.methods.toActivityPayload = function (): IActivityPayload {
  const formatUser = (u: any) => {
    if (!u) return { id: '', name: 'System User', email: '', avatar: '' };
    if (typeof u === 'object' && u._id) {
      return {
        id: u._id.toString(),
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
        email: u.email || '',
        avatar: u.avatar || '',
      };
    }
    return { id: u.toString(), name: 'User', email: '', avatar: '' };
  };

  const formatRef = (ref: any) => {
    if (!ref) return null;
    if (typeof ref === 'object' && ref._id) {
      return {
        id: ref._id.toString(),
        name: ref.name || ref.title || ref.taskKey || ref.assignmentId || 'Item',
        key: ref.taskKey || ref.projectKey || ref.slug || ref.assignmentId || '',
      };
    }
    return ref.toString();
  };

  return {
    id: this._id ? this._id.toString() : this.id,
    organization: formatRef(this.organization),
    workspace: formatRef(this.workspace),
    project: formatRef(this.project),
    task: formatRef(this.task),
    assignment: formatRef(this.assignment),
    user: formatUser(this.user),
    action: this.action,
    entityType: this.entityType,
    entityId: typeof this.entityId === 'object' && this.entityId?._id ? this.entityId._id.toString() : String(this.entityId),
    oldValue: this.oldValue ?? null,
    newValue: this.newValue ?? null,
    metadata: this.metadata || {},
    ipAddress: this.ipAddress || null,
    userAgent: this.userAgent || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ActivityModel = model<IActivityDocument>('Activity', ActivitySchema);
