import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, CornerDownLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../store/useUIStore';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AIAssistantDrawer: React.FC = () => {
  const { aiDrawerOpen, setAiDrawerOpen } = useUIStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your TaskFlow AI Copilot. I can analyze sprint velocity, generate user stories, summarize PR code reviews, or draft release notes.',
      time: 'Just now',
    },
  ]);

  const handleSend = (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput('');
    setLoading(true);

    setTimeout(() => {
      let aiReply = 'I analyzed the recent project commits and open issue queue. Sprint 24 velocity is on track at 84% completion.';
      if (textToSend.toLowerCase().includes('sprint') || textToSend.toLowerCase().includes('summary')) {
        aiReply = '### Sprint 24 Executive Summary\n\n- **Completed Tasks**: 28 / 42 (66% completion)\n- **High Priority Blockers**: ENG-101 (Redis Cluster Migration) in progress.\n- **PR Velocity**: 6 PRs merged today with zero regression bugs.';
      } else if (textToSend.toLowerCase().includes('release') || textToSend.toLowerCase().includes('notes')) {
        aiReply = '### v3.2.0 Draft Release Notes\n\n- **Features**: Added PKCE OAuth2 support for desktop clients.\n- **Fixes**: Resolved race condition in JWT token refresh endpoint.\n- **Performance**: Reduced Redis latency by 35ms on cache layer.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          time: 'Just now',
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const quickPrompts = [
    'Summarize current sprint blockers',
    'Draft release notes for v3.2',
    'Generate user story for API webhooks',
  ];

  return (
    <Drawer
      isOpen={aiDrawerOpen}
      onClose={() => setAiDrawerOpen(false)}
      title="TaskFlow AI Copilot"
      width="max-w-lg"
    >
      <div className="flex flex-col h-[calc(100vh-120px)] justify-between gap-4">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'ai'
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {msg.sender === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span className="text-[10px] opacity-60 mt-1 block text-right">{msg.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 text-indigo-400 text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini Pro is synthesizing workspace data...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Suggested Copilot Actions</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-medium border border-indigo-500/20 transition-colors text-left"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask AI to analyze issues, generate stories, or summarize..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full h-11 pr-12 pl-4 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Drawer>
  );
};
