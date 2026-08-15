import { Schema, Document, model, Types } from 'mongoose';

export interface IRetrospectiveActionItem {
  title: string;
  description?: string;
  assignee?: Types.ObjectId;
  dueDate?: Date;
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface ISprintRetrospectiveDocument extends Document {
  sprintId: Types.ObjectId;
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  wentWell: string;
  improvements: string;
  actionItems: IRetrospectiveActionItem[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RetrospectiveActionItemSchema = new Schema<IRetrospectiveActionItem>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed'],
    default: 'Open',
  },
});

const SprintRetrospectiveSchema = new Schema<ISprintRetrospectiveDocument>(
  {
    sprintId: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: true,
      unique: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    wentWell: {
      type: String,
      default: '',
    },
    improvements: {
      type: String,
      default: '',
    },
    actionItems: [RetrospectiveActionItemSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SprintRetrospective = model<ISprintRetrospectiveDocument>(
  'SprintRetrospective',
  SprintRetrospectiveSchema
);
