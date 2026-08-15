import { Schema, Document, model, Types } from 'mongoose';

export interface IReaction {
  emoji: string; // 👍, ❤️, 🔥, 🚀, 🎉, 👀
  users: Types.ObjectId[];
}

export interface ICommentPayload {
  id: string;
  task?: string | any;
  assignment?: string | any;
  project: string | any;
  workspace: string | any;
  organization: string | any;
  author: string | any;
  content: string;
  edited: boolean;
  editedAt?: Date | string | null;
  mentions: Array<string | any>;
  parentComment?: string | any | null;
  replyCount: number;
  reactionCount: number;
  reactions: Array<{
    emoji: string;
    users: string[];
    count: number;
    hasReacted?: boolean;
  }>;
  isDeleted: boolean;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICommentDocument extends Document {
  task?: Types.ObjectId;
  assignment?: Types.ObjectId;
  project: Types.ObjectId;
  workspace: Types.ObjectId;
  organization: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  edited: boolean;
  editedAt?: Date;
  mentions: Types.ObjectId[];
  parentComment?: Types.ObjectId | null;
  replyCount: number;
  reactionCount: number;
  reactions: IReaction[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toCommentPayload(currentUserId?: string): ICommentPayload;
}

const ReactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: false }
);

const CommentSchema = new Schema<ICommentDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'WorkAssignment',
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactions: {
      type: [ReactionSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
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

CommentSchema.index({ task: 1, createdAt: -1 });
CommentSchema.index({ assignment: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });

CommentSchema.methods.toCommentPayload = function (currentUserId?: string): ICommentPayload {
  const userIdStr = currentUserId ? currentUserId.toString() : '';

  const formattedReactions = (this.reactions || []).map((r: IReaction) => {
    const userStrs = (r.users || []).map((u: any) =>
      typeof u === 'object' && u._id ? u._id.toString() : u.toString()
    );
    return {
      emoji: r.emoji,
      users: userStrs,
      count: userStrs.length,
      hasReacted: userIdStr ? userStrs.includes(userIdStr) : false,
    };
  });

  const formattedMentions = (this.mentions || []).map((m: any) => {
    if (typeof m === 'object' && m._id) {
      return {
        id: m._id.toString(),
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'User',
        email: m.email,
        avatar: m.avatar,
      };
    }
    return m.toString();
  });

  let authorPayload = this.author;
  if (typeof this.author === 'object' && this.author._id) {
    authorPayload = {
      id: this.author._id.toString(),
      name:
        this.author.name ||
        `${this.author.firstName || ''} ${this.author.lastName || ''}`.trim() ||
        'User',
      email: this.author.email,
      avatar: this.author.avatar,
      role: this.author.role || 'Member',
    };
  }

  return {
    id: this._id ? this._id.toString() : this.id,
    task: typeof this.task === 'object' && this.task?._id ? this.task._id.toString() : this.task || undefined,
    assignment:
      typeof this.assignment === 'object' && this.assignment?._id
        ? this.assignment._id.toString()
        : this.assignment || undefined,
    project:
      typeof this.project === 'object' && this.project._id
        ? this.project._id.toString()
        : this.project,
    workspace:
      typeof this.workspace === 'object' && this.workspace._id
        ? this.workspace._id.toString()
        : this.workspace,
    organization:
      typeof this.organization === 'object' && this.organization._id
        ? this.organization._id.toString()
        : this.organization,
    author: authorPayload,
    content: this.isDeleted ? '[This comment was deleted]' : this.content,
    edited: this.edited || false,
    editedAt: this.editedAt,
    mentions: formattedMentions,
    parentComment:
      typeof this.parentComment === 'object' && this.parentComment?._id
        ? this.parentComment._id.toString()
        : this.parentComment || null,
    replyCount: this.replyCount || 0,
    reactionCount: this.reactionCount || 0,
    reactions: formattedReactions,
    isDeleted: this.isDeleted || false,
    deletedAt: this.deletedAt || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CommentModel = model<ICommentDocument>('Comment', CommentSchema);
