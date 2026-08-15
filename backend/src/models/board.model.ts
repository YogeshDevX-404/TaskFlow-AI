import { Schema, Document, model, Types } from 'mongoose';
import { TaskStatus } from './task.model';

export interface IBoardColumn {
  id: string;
  name: string;
  statusKey: TaskStatus;
  color: string;
  icon: string;
  order: number;
  isCollapsed: boolean;
  isArchived: boolean;
  wipLimit: number;
}

export interface IBoardSettings {
  cardSize: 'compact' | 'default' | 'expanded';
  showLabels: boolean;
  showStoryPoints: boolean;
  showAvatars: boolean;
  showDueDates: boolean;
  groupBy: 'status' | 'assignee' | 'priority' | 'labels' | 'project';
}

export interface IBoardPayload {
  id: string;
  project: string;
  columns: IBoardColumn[];
  settings: IBoardSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoardDocument extends Document {
  project: Types.ObjectId;
  columns: IBoardColumn[];
  settings: IBoardSettings;
  createdAt: Date;
  updatedAt: Date;
  toBoardPayload(): IBoardPayload;
}

export const DEFAULT_BOARD_COLUMNS: IBoardColumn[] = [
  {
    id: 'col-backlog',
    name: 'Backlog',
    statusKey: 'Backlog',
    color: '#64748B',
    icon: 'Inbox',
    order: 0,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 0,
  },
  {
    id: 'col-todo',
    name: 'Todo',
    statusKey: 'Todo',
    color: '#3B82F6',
    icon: 'Circle',
    order: 1,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 0,
  },
  {
    id: 'col-in-progress',
    name: 'In Progress',
    statusKey: 'In Progress',
    color: '#8B5CF6',
    icon: 'Clock',
    order: 2,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 5,
  },
  {
    id: 'col-in-review',
    name: 'In Review',
    statusKey: 'In Review',
    color: '#EC4899',
    icon: 'Eye',
    order: 3,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 3,
  },
  {
    id: 'col-testing',
    name: 'Testing',
    statusKey: 'Testing',
    color: '#EAB308',
    icon: 'FlaskConical',
    order: 4,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 3,
  },
  {
    id: 'col-done',
    name: 'Done',
    statusKey: 'Done',
    color: '#10B981',
    icon: 'CheckCircle2',
    order: 5,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 0,
  },
  {
    id: 'col-blocked',
    name: 'Blocked',
    statusKey: 'Blocked',
    color: '#EF4444',
    icon: 'AlertCircle',
    order: 6,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 0,
  },
  {
    id: 'col-cancelled',
    name: 'Cancelled',
    statusKey: 'Cancelled',
    color: '#6B7280',
    icon: 'XCircle',
    order: 7,
    isCollapsed: false,
    isArchived: false,
    wipLimit: 0,
  },
];

export const DEFAULT_BOARD_SETTINGS: IBoardSettings = {
  cardSize: 'default',
  showLabels: true,
  showStoryPoints: true,
  showAvatars: true,
  showDueDates: true,
  groupBy: 'status',
};

const BoardColumnSchema = new Schema<IBoardColumn>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    statusKey: {
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
      required: true,
    },
    color: { type: String, default: '#64748B' },
    icon: { type: String, default: 'Circle' },
    order: { type: Number, default: 0 },
    isCollapsed: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    wipLimit: { type: Number, default: 0 },
  },
  { _id: false }
);

const BoardSettingsSchema = new Schema<IBoardSettings>(
  {
    cardSize: {
      type: String,
      enum: ['compact', 'default', 'expanded'],
      default: 'default',
    },
    showLabels: { type: Boolean, default: true },
    showStoryPoints: { type: Boolean, default: true },
    showAvatars: { type: Boolean, default: true },
    showDueDates: { type: Boolean, default: true },
    groupBy: {
      type: String,
      enum: ['status', 'assignee', 'priority', 'labels', 'project'],
      default: 'status',
    },
  },
  { _id: false }
);

const BoardSchema = new Schema<IBoardDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
      index: true,
    },
    columns: {
      type: [BoardColumnSchema],
      default: DEFAULT_BOARD_COLUMNS,
    },
    settings: {
      type: BoardSettingsSchema,
      default: DEFAULT_BOARD_SETTINGS,
    },
  },
  { timestamps: true }
);

BoardSchema.methods.toBoardPayload = function (): IBoardPayload {
  return {
    id: this._id.toString(),
    project: this.project ? this.project.toString() : '',
    columns: this.columns || DEFAULT_BOARD_COLUMNS,
    settings: this.settings || DEFAULT_BOARD_SETTINGS,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const BoardModel = model<IBoardDocument>('Board', BoardSchema);
