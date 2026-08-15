import { Schema, Document, model, Types } from 'mongoose';

export type SprintStatus = 'Planning' | 'Active' | 'Completed' | 'Cancelled';

export interface ISprintPayload {
  id: string;
  name: string;
  goal?: string;
  description?: string;
  status: SprintStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  completedDate?: string | Date;
  project: string | any;
  workspace?: string | any;
  organization?: string | any;
  createdBy?: string | any;
  updatedBy?: string | any;
  tasks?: string[] | any[];
  taskIds?: string[];
  velocity: number;
  capacity: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISprintDocument extends Document {
  name: string;
  goal: string;
  description: string;
  status: SprintStatus;
  startDate?: Date;
  endDate?: Date;
  completedDate?: Date;
  project: Types.ObjectId;
  workspace?: Types.ObjectId;
  organization?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  tasks: Types.ObjectId[];
  velocity: number;
  capacity: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  toSprintPayload(): ISprintPayload;
}

const SprintSchema = new Schema<ISprintDocument>(
  {
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true,
      maxlength: [100, 'Sprint name cannot exceed 100 characters'],
    },
    goal: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Sprint goal cannot exceed 500 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Completed', 'Cancelled'],
      default: 'Planning',
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
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
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    velocity: {
      type: Number,
      default: 0,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

SprintSchema.methods.toSprintPayload = function (): ISprintPayload {
  const sprintObj = this.toObject({ getters: true });

  const formatRef = (ref: any) => {
    if (!ref) return undefined;
    if (typeof ref === 'object' && ref._id) {
      return {
        id: ref._id.toString(),
        name: ref.name || ref.title || `${ref.firstName || ''} ${ref.lastName || ''}`.trim(),
        ...ref,
      };
    }
    return ref.toString();
  };

  return {
    id: sprintObj._id.toString(),
    name: sprintObj.name,
    goal: sprintObj.goal || '',
    description: sprintObj.description || '',
    status: sprintObj.status,
    startDate: sprintObj.startDate ? sprintObj.startDate.toISOString() : undefined,
    endDate: sprintObj.endDate ? sprintObj.endDate.toISOString() : undefined,
    completedDate: sprintObj.completedDate ? sprintObj.completedDate.toISOString() : undefined,
    project: formatRef(sprintObj.project),
    workspace: formatRef(sprintObj.workspace),
    organization: formatRef(sprintObj.organization),
    createdBy: formatRef(sprintObj.createdBy),
    updatedBy: formatRef(sprintObj.updatedBy),
    tasks: Array.isArray(sprintObj.tasks)
      ? sprintObj.tasks.map((t: any) => (typeof t === 'object' && t._id ? t._id.toString() : t.toString()))
      : [],
    taskIds: Array.isArray(sprintObj.tasks)
      ? sprintObj.tasks.map((t: any) => (typeof t === 'object' && t._id ? t._id.toString() : t.toString()))
      : [],
    velocity: sprintObj.velocity || 0,
    capacity: sprintObj.capacity || 0,
    isArchived: Boolean(sprintObj.isArchived),
    createdAt: sprintObj.createdAt,
    updatedAt: sprintObj.updatedAt,
  };
};

export const Sprint = model<ISprintDocument>('Sprint', SprintSchema);
