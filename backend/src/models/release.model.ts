import { Schema, Document, model, Types } from 'mongoose';

export type ReleaseStatus =
  | 'Planning'
  | 'Scheduled'
  | 'In Development'
  | 'Testing'
  | 'Ready'
  | 'Released'
  | 'Cancelled'
  | 'Archived';

export type GoalType = 'Release' | 'Business' | 'Technical';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Achieved';

export type MilestoneStatus = 'Upcoming' | 'In Progress' | 'Achieved' | 'Delayed';

export interface IMilestoneSubdoc {
  _id?: Types.ObjectId;
  title: string;
  targetDate: Date;
  status: MilestoneStatus;
  description?: string;
  isCompleted: boolean;
}

export interface IGoalSubdoc {
  _id?: Types.ObjectId;
  title: string;
  type: GoalType;
  status: GoalStatus;
}

export interface IReleasePayload {
  id: string;
  name: string;
  version: string;
  description: string;
  project?: any;
  workspace?: any;
  organization?: any;
  status: ReleaseStatus;
  releaseDate?: string;
  startDate?: string;
  endDate?: string;
  owner?: any;
  color: string;
  icon: string;
  milestones: {
    id: string;
    title: string;
    targetDate: string;
    status: MilestoneStatus;
    description?: string;
    isCompleted: boolean;
  }[];
  goals: {
    id: string;
    title: string;
    type: GoalType;
    status: GoalStatus;
  }[];
  tasks: any[];
  progress: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  openBugs: number;
  blockedWork: number;
  isArchived: boolean;
  createdBy?: any;
  updatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReleaseDocument extends Document {
  name: string;
  version: string;
  description: string;
  project?: Types.ObjectId;
  workspace?: Types.ObjectId;
  organization?: Types.ObjectId;
  status: ReleaseStatus;
  releaseDate?: Date;
  startDate?: Date;
  endDate?: Date;
  owner?: Types.ObjectId;
  color: string;
  icon: string;
  milestones: IMilestoneSubdoc[];
  goals: IGoalSubdoc[];
  tasks: Types.ObjectId[];
  isArchived: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toReleasePayload(): IReleasePayload;
}

const MilestoneSchema = new Schema<IMilestoneSubdoc>({
  title: { type: String, required: true, trim: true },
  targetDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Upcoming', 'In Progress', 'Achieved', 'Delayed'],
    default: 'Upcoming',
  },
  description: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
});

const GoalSchema = new Schema<IGoalSubdoc>({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Release', 'Business', 'Technical'],
    default: 'Release',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Achieved'],
    default: 'Not Started',
  },
});

const ReleaseSchema = new Schema<IReleaseDocument>(
  {
    name: {
      type: String,
      required: [true, 'Release name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    version: {
      type: String,
      required: [true, 'Release version is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Planning',
        'Scheduled',
        'In Development',
        'Testing',
        'Ready',
        'Released',
        'Cancelled',
        'Archived',
      ],
      default: 'Planning',
      index: true,
    },
    releaseDate: {
      type: Date,
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: 'rocket',
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },
    goals: {
      type: [GoalSchema],
      default: [],
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
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
  }
);

ReleaseSchema.methods.toReleasePayload = function (): IReleasePayload {
  const milestoneList = (this.milestones || []).map((m: any) => ({
    id: m._id ? m._id.toString() : m.id,
    title: m.title,
    targetDate: m.targetDate ? new Date(m.targetDate).toISOString() : '',
    status: m.status,
    description: m.description || '',
    isCompleted: m.isCompleted || false,
  }));

  const goalList = (this.goals || []).map((g: any) => ({
    id: g._id ? g._id.toString() : g.id,
    title: g.title,
    type: g.type,
    status: g.status,
  }));

  const populatedTasks = Array.isArray(this.tasks) ? this.tasks : [];

  let totalTasks = 0;
  let completedTasks = 0;
  let openBugs = 0;
  let blockedWork = 0;

  populatedTasks.forEach((t: any) => {
    if (typeof t === 'object' && t !== null) {
      totalTasks++;
      if (t.status === 'Done') completedTasks++;
      if (t.type === 'Bug' && t.status !== 'Done') openBugs++;
      if (t.status === 'Blocked') blockedWork++;
    }
  });

  const remainingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    id: this._id ? this._id.toString() : this.id,
    name: this.name,
    version: this.version,
    description: this.description || '',
    project: this.project,
    workspace: this.workspace,
    organization: this.organization,
    status: this.status,
    releaseDate: this.releaseDate ? this.releaseDate.toISOString() : undefined,
    startDate: this.startDate ? this.startDate.toISOString() : undefined,
    endDate: this.endDate ? this.endDate.toISOString() : undefined,
    owner: this.owner,
    color: this.color || '#6366f1',
    icon: this.icon || 'rocket',
    milestones: milestoneList,
    goals: goalList,
    tasks: populatedTasks,
    progress,
    totalTasks,
    completedTasks,
    remainingTasks,
    openBugs,
    blockedWork,
    isArchived: !!this.isArchived,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ReleaseModel = model<IReleaseDocument>('Release', ReleaseSchema);
