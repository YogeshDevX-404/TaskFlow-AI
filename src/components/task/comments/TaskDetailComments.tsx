import React, { useEffect } from 'react';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { CommentFilterBar } from './CommentFilterBar';
import { CommentItem } from './CommentItem';
import { RichTextEditor } from './RichTextEditor';
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

interface TaskDetailCommentsProps {
  taskId: string;
}

export const TaskDetailComments: React.FC<TaskDetailCommentsProps> = ({ taskId }) => {
  const { comments, isLoading, error, filters, setFilters, refreshComments } = useComments(taskId);
  const {
    createComment,
    isLoading: isCreating,
    quotedComment,
    replyingToComment,
    setQuotedComment,
    setReplyingToComment,
  } = useCreateComment();

  useEffect(() => {
    refreshComments();
  }, [taskId]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Filter and Search Bar */}
      <CommentFilterBar
        filters={filters}
        onFilterChange={setFilters}
        commentCount={comments.length}
      />

      {/* Error state */}
      {error && (
        <div className="p-3 mb-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refreshComments}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/60 rounded text-red-800 dark:text-red-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Comment List Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-[200px]">
        {isLoading && comments.length === 0 ? (
          // Skeleton loading state
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-2.5">
              <MessageSquare className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No comments yet
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
              Start the discussion or mention team members using @username.
            </p>
          </div>
        ) : (
          // Render Comments
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} taskId={taskId} />
          ))
        )}
      </div>

      {/* Sticky Bottom Rich Text Editor */}
      <div className="sticky bottom-0 pt-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 mt-2">
        <RichTextEditor
          taskId={taskId}
          autoSaveKey={taskId}
          onSubmit={async (content) => {
            const parentId = replyingToComment?.id;
            const res = await createComment(taskId, content, parentId);
            return !!res;
          }}
          quotedComment={quotedComment}
          onClearQuote={() => setQuotedComment(null)}
          replyingToComment={replyingToComment}
          onClearReply={() => setReplyingToComment(null)}
          isSubmitting={isCreating}
          placeholder="Type a comment... (Markdown & @mentions supported)"
          submitLabel={replyingToComment ? 'Post Reply' : 'Comment'}
        />
      </div>
    </div>
  );
};
