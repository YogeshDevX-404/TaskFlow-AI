import { Schema, Document, model, Types } from 'mongoose';

export type TaskType =
  | 'Task'
  | 'Bug'
  | 'Story'
  | 'Epic'
  | 'Feature'
  | 'Improvement'
  | 'Research'
  | 'Spike';

export type TaskStatus =
  | 'Backlog'
  | 'Todo'
  | 'In Progress'
  | 'In Review'
  | 'Testing'
  | 'Done'
  | 'Blocked'
  | 'Cancelled';

export type TaskPriority =
  | 'Lowest'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Highest'
  | 'Urgent';

export type DependencyType =
  | 'blocks'
  | 'blocked_by'
  | 'depends_on'
  | 'related_to'
  | 'duplicate_of'
  | 'child_of'
  | 'parent_of';

export interface IDependencyPayload {
  id?: string;
  targetTask: string | any;
  type: DependencyType;
  createdAt?: string | Date;
}

export interface IDependencySubdoc {
  _id?: Types.ObjectId;
  targetTask: Types.ObjectId;
  type: DependencyType;
  createdAt?: Date;
}

export interface ISubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface ITaskPayload {
  id: string;
  title: string;
  taskKey: string;
  description: string;
  project: string | any;
  workspace: string | any;
  organization: string | any;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee?: string | any;
  reporter?: string | any;
  labels: string[];
  startDate?: string;
  dueDate?: string;
  estimatedHours: number;
  spentHours: number;
  storyPoints: number;
  watchers: string[];
  watcherDetails?: any[];
  favoritesCount: number;
  isFavorite: boolean;
  isWatching: boolean;
  isArchived: boolean;
  parentTask?: string | any;
  depth?: number;
  sortOrder?: number;
  epic?: string | any;
  story?: string | any;
  sprint?: string | any;
  release?: string | any;
  childrenCount?: number;
  subtaskStats?: ISubtaskProgress;
  dependencies?: IDependencyPayload[];
  attachmentCount?: number;
  commentCount?: number;
  createdBy?: string | any;
  updatedBy?: string | any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends Document {
  title: string;
  taskKey: string;
  description: string;
  project: Types.ObjectId;
  workspace: Types.ObjectId;
  organization: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee?: Types.ObjectId;
  reporter?: Types.ObjectId;
  labels: string[];
  startDate?: Date;
  dueDate?: Date;
  estimatedHours: number;
  spentHours: number;
  storyPoints: number;
  watchers: Types.ObjectId[];
  favorites: Types.ObjectId[];
  isArchived: boolean;
  parentTask?: Types.ObjectId | null;
  depth: number;
  sortOrder: number;
  epic?: Types.ObjectId | null;
  story?: Types.ObjectId | null;
  sprint?: Types.ObjectId | null;
  release?: Types.ObjectId | null;
  dependencies: IDependencySubdoc[];
  subtaskStats?: ISubtaskProgress;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toTaskPayload(userId?: string): ITaskPayload;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    taskKey: {
      type: String,
      required: [true, 'Task Key is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace is required'],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Backlog',
        'Todo',
        'In Progress',
        'In Review',
        'Testing',
        'Done',
        'Blocked',
        'Cancelled',
      ],
      default: 'Todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Lowest', 'Low', 'Medium', 'High', 'Highest', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'Task',
        'Bug',
        'Story',
        'Epic',
        'Feature',
        'Improvement',
        'Research',
        'Spike',
      ],
      default: 'Task',
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    labels: {
      type: [String],
      default: [],
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    spentHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    storyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    depth: {
      type: Number,
      default: 0,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    epic: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
      index: true,
    },
    release: {
      type: Schema.Types.ObjectId,
      ref: 'Release',
      default: null,
      index: true,
    },
    dependencies: [
      {
        targetTask: {
          type: Schema.Types.ObjectId,
          ref: 'Task',
          required: true,
        },
        type: {
          type: String,
          enum: [
            'blocks',
            'blocked_by',
            'depends_on',
            'related_to',
            'duplicate_of',
            'child_of',
            'parent_of',
          ],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

TaskSchema.index({ title: 'text', description: 'text', taskKey: 'text' });
TaskSchema.index({ organization: 1, assignee: 1, status: 1 });
TaskSchema.index({ organization: 1, project: 1, assignee: 1 });
TaskSchema.index({ assignee: 1, dueDate: 1 });

TaskSchema.methods.toTaskPayload = function (userId?: string): ITaskPayload {
  const currentUserId = userId ? userId.toString() : '';
  const watchersList = (this.watchers || []).map((w: any) =>
    typeof w === 'object' && w._id ? w._id.toString() : w.toString()
  );
  const watcherDetailsList = (this.watchers || [])
    .filter((w: any) => typeof w === 'object' && w._id)
    .map((w: any) => ({
      id: w._id.toString(),
      name: w.name || `${w.firstName || ''} ${w.lastName || ''}`.trim() || 'User',
      email: w.email,
      avatar: w.avatar,
    }));
  const favoritesList = (this.favorites || []).map((f: any) =>
    typeof f === 'object' && f._id ? f._id.toString() : f.toString()
  );

  return {
    id: this._id ? this._id.toString() : this.id,
    title: this.title,
    taskKey: this.taskKey,
    description: this.description || '',
    project: this.project,
    workspace: this.workspace,
    organization: this.organization,
    status: this.status,
    priority: this.priority,
    type: this.type,
    assignee: this.assignee,
    reporter: this.reporter,
    labels: this.labels || [],
    startDate: this.startDate ? this.startDate.toISOString() : undefined,
    dueDate: this.dueDate ? this.dueDate.toISOString() : undefined,
    estimatedHours: this.estimatedHours || 0,
    spentHours: this.spentHours || 0,
    storyPoints: this.storyPoints || 0,
    watchers: watchersList,
    watcherDetails: watcherDetailsList,
    favoritesCount: favoritesList.length,
    isFavorite: currentUserId ? favoritesList.includes(currentUserId) : false,
    isWatching: currentUserId ? watchersList.includes(currentUserId) : false,
    isArchived: this.isArchived || false,
    parentTask: this.parentTask,
    depth: this.depth || 0,
    sortOrder: this.sortOrder || 0,
    epic: this.epic,
    story: this.story,
    sprint: this.sprint,
    release: this.release,
    subtaskStats: this.subtaskStats || { total: 0, completed: 0, percentage: 0 },
    dependencies: (this.dependencies || []).map((dep: any) => ({
      id: dep._id ? dep._id.toString() : undefined,
      targetTask: dep.targetTask,
      type: dep.type,
      createdAt: dep.createdAt,
    })),
    attachmentCount: (this as any).attachmentCount ?? 0,
    commentCount: (this as any).commentCount ?? 0,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const TaskModel = model<ITaskDocument>('Task', TaskSchema);
