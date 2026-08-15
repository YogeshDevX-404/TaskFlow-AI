import React, { useState, useEffect } from 'react';
import { WorkAssignmentService } from '../../services/api/workAssignmentService';
import { useAuthStore } from '../../store/useAuthStore';
import {
  MessageSquare,
  Send,
  Trash2,
  CornerDownRight,
  User,
  Clock,
} from 'lucide-react';

interface CommentsProps {
  assignmentId: string;
}

export const WorkAssignmentComments: React.FC<CommentsProps> = ({ assignmentId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await WorkAssignmentService.getComments(assignmentId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assignment comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchComments();
    }
  }, [assignmentId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const created = await WorkAssignmentService.postComment(
        assignmentId,
        newComment.trim(),
        replyingToId || undefined
      );
      if (created) {
        setComments((prev) => [...prev, created]);
        setNewComment('');
        setReplyingToId(null);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {loading && comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No comments yet
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Discuss blockers, share updates, or ask questions about this assignment.
            </p>
          </div>
        ) : (
          comments.map((c) => {
            const author = c.author || c.user || {};
            const authorName =
              author.name ||
              `${author.firstName || ''} ${author.lastName || ''}`.trim() ||
              author.email ||
              'User';
            const isMe =
              author._id === user?.id ||
              author.id === user?.id ||
              author._id === (user as any)?._id;

            return (
              <div
                key={c.id || c._id}
                className={`p-3 rounded-2xl border text-xs ${
                  isMe
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 ml-4'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={authorName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {authorName}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                        (You)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-7">
                  {c.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handlePostComment} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a comment or update..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
