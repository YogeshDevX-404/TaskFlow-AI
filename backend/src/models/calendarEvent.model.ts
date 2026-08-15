import { Schema, Document, model, Types } from 'mongoose';

export type CalendarEventType = 'Task' | 'Sprint' | 'Milestone' | 'Release' | 'Meeting' | 'Deadline';
export type CalendarEventStatus = 'Planned' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
export type CalendarEventPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ICalendarEventPayload {
  id: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string | Date;
  endDate: string | Date;
  allDay?: boolean;
  color?: string;
  status: CalendarEventStatus;
  priority: CalendarEventPriority;
  organization?: any;
  workspace?: any;
  project?: any;
  sprint?: any;
  taskId?: any;
  assignees?: any[];
  dependencies?: string[];
  progress?: number;
  isMilestone?: boolean;
  tags?: string[];
  createdBy?: any;
  updatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICalendarEventDocument extends Document {
  title: string;
  description: string;
  eventType: CalendarEventType;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color: string;
  status: CalendarEventStatus;
  priority: CalendarEventPriority;
  organization?: Types.ObjectId;
  workspace?: Types.ObjectId;
  project?: Types.ObjectId;
  sprint?: Types.ObjectId;
  taskId?: Types.ObjectId;
  assignees: Types.ObjectId[];
  dependencies: Types.ObjectId[];
  progress: number;
  isMilestone: boolean;
  tags: string[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toCalendarEventPayload(): ICalendarEventPayload;
}

const CalendarEventSchema = new Schema<ICalendarEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['Task', 'Sprint', 'Milestone', 'Release', 'Meeting', 'Deadline'],
      default: 'Milestone',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed', 'Delayed', 'Cancelled'],
      default: 'Planned',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CalendarEvent',
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isMilestone: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.methods.toCalendarEventPayload = function (): ICalendarEventPayload {
  const obj = this.toObject({ getters: true });

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
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description || '',
    eventType: obj.eventType,
    startDate: obj.startDate ? obj.startDate.toISOString() : new Date().toISOString(),
    endDate: obj.endDate ? obj.endDate.toISOString() : new Date().toISOString(),
    allDay: Boolean(obj.allDay),
    color: obj.color || '#6366f1',
    status: obj.status || 'Planned',
    priority: obj.priority || 'Medium',
    organization: formatRef(obj.organization),
    workspace: formatRef(obj.workspace),
    project: formatRef(obj.project),
    sprint: formatRef(obj.sprint),
    taskId: formatRef(obj.taskId),
    assignees: Array.isArray(obj.assignees) ? obj.assignees.map(formatRef) : [],
    dependencies: Array.isArray(obj.dependencies)
      ? obj.dependencies.map((d: any) => (typeof d === 'object' && d._id ? d._id.toString() : d.toString()))
      : [],
    progress: obj.progress || 0,
    isMilestone: Boolean(obj.isMilestone),
    tags: obj.tags || [],
    createdBy: formatRef(obj.createdBy),
    updatedBy: formatRef(obj.updatedBy),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const CalendarEvent = model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema);
