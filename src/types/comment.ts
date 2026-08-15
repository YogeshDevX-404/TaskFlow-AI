export interface CommentAuthor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface CommentReaction {
  emoji: string; // 👍, ❤️, 🔥, 🚀, 🎉, 👀
  users: string[];
  count: number;
  hasReacted?: boolean;
}

export interface Comment {
  id: string;
  task: string;
  project: string;
  workspace: string;
  organization: string;
  author: CommentAuthor;
  content: string;
  edited: boolean;
  editedAt?: string | null;
  mentions: Array<CommentAuthor | string>;
  parentComment?: string | null;
  replyCount: number;
  reactionCount: number;
  reactions: CommentReaction[];
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CommentFilterOptions {
  authorId?: string;
  mentionedUserId?: string;
  editedOnly?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest';
  parentCommentId?: string;
}

export interface CreateCommentPayload {
  taskId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentPayload {
  content: string;
}
