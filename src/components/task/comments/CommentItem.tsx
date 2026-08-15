import React, { useState } from 'react';
import { Comment } from '../../../types/comment';
import { useAuthStore } from '../../../store/useAuthStore';
import { useCommentStore } from '../../../store/useCommentStore';
import { ReactionBar } from './ReactionBar';
import { RichTextEditor } from './RichTextEditor';
import {
  Reply,
  Quote,
  Edit2,
  Trash2,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  taskId: string;
  isNested?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  taskId,
  isNested = false,
}) => {
  const { user } = useAuthStore();
  const {
    updateComment,
    deleteComment,
    restoreComment,
    toggleReaction,
    setQuotedComment,
    setReplyingToComment,
    repliesMap,
    fetchReplies,
    createComment,
  } = useCommentStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const author = comment.author;
  const authorName =
    typeof author === 'object' && author
      ? author.name || 'User'
      : 'User';
  const authorAvatar = typeof author === 'object' ? author.avatar : undefined;
  const authorRole = typeof author === 'object' ? author.role : undefined;

  const currentUserId = user?.id;
  const isAuthor =
    currentUserId &&
    typeof author === 'object' &&
    author &&
    (author.id === currentUserId || (author as any)._id === currentUserId);

  const nestedReplies = repliesMap[comment.id] || comment.replies || [];

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const handleToggleReplies = () => {
    if (!showReplies && (!repliesMap[comment.id] || repliesMap[comment.id].length === 0)) {
      fetchReplies(comment.id);
    }
    setShowReplies(!showReplies);
  };

  const handleSaveEdit = async (newContent: string) => {
    const success = await updateComment(comment.id, newContent);
    if (success) {
      setIsEditing(false);
    }
    return success;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteComment(comment.id);
    setIsDeleting(false);
  };

  const handleRestore = async () => {
    await restoreComment(comment.id);
  };

  const handleToggleReaction = (emoji: string) => {
    toggleReaction(comment.id, emoji);
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={`group relative flex gap-3 transition-colors ${
        isNested ? 'pt-3' : 'py-3.5 border-b border-slate-100 dark:border-slate-800/60'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Header line */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
              {authorName}
            </span>
            {authorRole && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                {authorRole}
              </span>
            )}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(comment.createdAt)}
            </span>
            {comment.edited && !comment.isDeleted && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic">
                (edited)
              </span>
            )}
          </div>

          {/* Action buttons on hover */}
          {!comment.isDeleted && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setReplyingToComment(comment);
                  setShowReplyForm(true);
                }}
                className="p-1 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setQuotedComment(comment)}
                className="p-1 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Quote reply"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              {isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Edit comment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Comment Body */}
        {comment.isDeleted ? (
          <div className="flex items-center justify-between p-2.5 my-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 italic">
            <span>This comment was deleted</span>
            {isAuthor && (
              <button
                type="button"
                onClick={handleRestore}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline not-italic text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </button>
            )}
          </div>
        ) : isEditing ? (
          <div className="mt-2">
            <RichTextEditor
              taskId={taskId}
              initialValue={comment.content}
              onSubmit={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save edit"
            />
          </div>
        ) : (
          <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed break-words">
            {comment.content}
          </div>
        )}

        {/* Reaction Bar */}
        {!comment.isDeleted && (
          <ReactionBar
            reactions={comment.reactions || []}
            onToggleReaction={handleToggleReaction}
          />
        )}

        {/* Inline Reply Editor */}
        {showReplyForm && (
          <div className="mt-3">
            <RichTextEditor
              taskId={taskId}
              onSubmit={async (content) => {
                const res = await createComment(taskId, content, comment.id);
                if (res) {
                  setShowReplyForm(false);
                  setShowReplies(true);
                }
                return !!res;
              }}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${authorName}...`}
              submitLabel="Post Reply"
            />
          </div>
        )}

        {/* Nested Thread Toggle */}
        {(comment.replyCount > 0 || nestedReplies.length > 0) && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleToggleReplies}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                {showReplies
                  ? 'Hide replies'
                  : `View ${comment.replyCount || nestedReplies.length} ${
                      (comment.replyCount || nestedReplies.length) === 1 ? 'reply' : 'replies'
                    }`}
              </span>
              {showReplies ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Nested Comments Container */}
            {showReplies && (
              <div className="mt-2 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
                {nestedReplies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    taskId={taskId}
                    isNested={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
