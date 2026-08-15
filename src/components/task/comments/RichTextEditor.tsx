import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  SquareCode,
  Link as LinkIcon,
  AtSign,
  Send,
  X,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { Comment } from '../../../types/comment';
import { MentionDropdown } from './MentionDropdown';

interface RichTextEditorProps {
  taskId: string;
  initialValue?: string;
  onSubmit: (content: string) => Promise<boolean | void>;
  onCancel?: () => void;
  quotedComment?: Comment | null;
  onClearQuote?: () => void;
  replyingToComment?: Comment | null;
  onClearReply?: () => void;
  placeholder?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  autoSaveKey?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  taskId,
  initialValue = '',
  onSubmit,
  onCancel,
  quotedComment,
  onClearQuote,
  replyingToComment,
  onClearReply,
  placeholder = 'Write a comment... (Markdown supported, use @ to mention)',
  submitLabel = 'Comment',
  isSubmitting = false,
  autoSaveKey,
}) => {
  const [content, setContent] = useState(initialValue);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [draftSaved, setDraftSaved] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto load draft
  useEffect(() => {
    if (!initialValue && autoSaveKey) {
      try {
        const savedDraft = localStorage.getItem(`comment_draft_${autoSaveKey}`);
        if (savedDraft) {
          setContent(savedDraft);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [initialValue, autoSaveKey]);

  // Auto save draft
  useEffect(() => {
    if (autoSaveKey && content && content !== initialValue) {
      try {
        localStorage.setItem(`comment_draft_${autoSaveKey}`, content);
        setDraftSaved(true);
        const timer = setTimeout(() => setDraftSaved(false), 2000);
        return () => clearTimeout(timer);
      } catch (e) {
        // ignore
      }
    }
  }, [content, autoSaveKey, initialValue]);

  const handleClearDraft = () => {
    if (autoSaveKey) {
      try {
        localStorage.removeItem(`comment_draft_${autoSaveKey}`);
      } catch (e) {
        // ignore
      }
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 0);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Detect @ mention trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1 && (lastAtPos === 0 || /\s/.test(textBeforeCursor[lastAtPos - 1]))) {
      const query = textBeforeCursor.substring(lastAtPos + 1);
      if (!/\s/.test(query)) {
        setMentionQuery(query);
        setShowMentionMenu(true);
        return;
      }
    }
    setShowMentionMenu(false);
  };

  const handleSelectMentionUser = (user: { id: string; name: string; email: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    const mentionTag = `@${user.name.replace(/\s+/g, '')} `;
    const newContent =
      content.substring(0, lastAtPos) + mentionTag + content.substring(cursorPos);

    setContent(newContent);
    setShowMentionMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lastAtPos + mentionTag.length, lastAtPos + mentionTag.length);
    }, 0);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    let finalContent = content.trim();

    // Attach quote if present
    if (quotedComment) {
      const quoteAuthor =
        quotedComment.author?.name ||
        `${quotedComment.author?.firstName || ''} ${quotedComment.author?.lastName || ''}`.trim() ||
        'User';
      const quoteText = quotedComment.content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      finalContent = `> **${quoteAuthor}** wrote:\n${quoteText}\n\n${finalContent}`;
    }

    const success = await onSubmit(finalContent);
    if (success !== false) {
      setContent('');
      handleClearDraft();
      if (onClearQuote) onClearQuote();
      if (onClearReply) onClearReply();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      if (onCancel) onCancel();
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      {/* Replying or Quote Context Banner */}
      {(replyingToComment || quotedComment) && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
            <Quote className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
              {replyingToComment
                ? `Replying to ${
                    replyingToComment.author?.name || 'User'
                  }`
                : `Quoting ${quotedComment?.author?.name || 'User'}`}
            </span>
            <span className="text-slate-400 dark:text-slate-500 truncate max-w-xs italic hidden sm:inline">
              "{(replyingToComment || quotedComment)?.content}"
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClearReply) onClearReply();
              if (onClearQuote) onClearQuote();
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Header: Tabs & Formatting Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-2 py-1.5 flex-wrap gap-1">
        {/* Write / Preview Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'write'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>

        {/* Formatting Buttons (Visible only in Write tab) */}
        {activeTab === 'write' && (
          <div className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Heading (### Text)"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Unordered List (- item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Numbered List (1. item)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- [ ] ')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Checklist (- [ ] item)"
            >
              <ListTodo className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Quote (> text)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Code Block (```code```)"
            >
              <SquareCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://)')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Link ([Text](url))"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('@')}
              className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Mention (@user)"
            >
              <AtSign className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Textarea or Markdown Preview */}
      <div className="relative p-3 min-h-[100px]">
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-y focus:outline-none leading-relaxed"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none min-h-[80px] text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
            {content.trim() ? (
              content
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic">
                Nothing to preview
              </span>
            )}
          </div>
        )}

        {/* Mention Dropdown Overlay */}
        {showMentionMenu && (
          <MentionDropdown
            query={mentionQuery}
            onSelectUser={handleSelectMentionUser}
            onClose={() => setShowMentionMenu(false)}
            style={{ bottom: '100%', left: '12px' }}
          />
        )}
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 px-3 py-2 bg-slate-50/40 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300">
              ⌘/Ctrl + Enter
            </kbd>{' '}
            to post
          </span>
          {draftSaved && (
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-medium">
              • Draft saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={!content.trim() || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
