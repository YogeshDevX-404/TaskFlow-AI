import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Sliders,
  Search,
  Filter,
  Check,
  Server,
  Zap,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { EmailApiService, IEmailLog } from '../../services/api/emailService';
import { axiosInstance } from '../../services/api/axiosInstance';
import { useNotificationStore } from '../../store/useNotificationStore';

export const EmailSettingsSection: React.FC = () => {
  const preferences = useNotificationStore((state) => state.preferences);
  const updatePreferences = useNotificationStore((state) => state.updatePreferences);

  // Email Test state
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Email Logs state
  const [logs, setLogs] = useState<IEmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Template Preview state
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await EmailApiService.getLogs({
        page,
        limit: 10,
        status: statusFilter,
        type: typeFilter,
        search: searchQuery,
      });

      if (response && response.data) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch email logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const response = await EmailApiService.sendTestEmail(testEmailRecipient);

      if (response && response.success) {
        setTestResult({
          success: true,
          message: `Test email successfully queued/sent to ${testEmailRecipient}`,
        });
        fetchLogs();
      } else {
        setTestResult({
          success: false,
          message: 'Failed to send test email. Please check server logs.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error occurred while sending test email',
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleRetryEmail = async (logId: string) => {
    setRetryingId(logId);
    try {
      await EmailApiService.retryEmail(logId);
      fetchLogs();
    } catch (err) {
      console.error('Failed to retry email:', err);
    } finally {
      setRetryingId(null);
    }
  };

  const handleOpenPreview = async (templateName: string) => {
    setPreviewTemplate(templateName);
    setLoadingPreview(true);
    try {
      const response = await axiosInstance.get(`/email/preview/${templateName}`, {
        responseType: 'text',
      });
      setPreviewHtml(response.data);
    } catch (err) {
      console.error('Failed to fetch template preview:', err);
      setPreviewHtml('<p>Failed to load template preview.</p>');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      updatePreferences({ [key]: !preferences[key] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-900 border border-indigo-500/20 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Mail className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Decoupled Provider Engine
          </div>
          <h2 className="text-xl font-bold mb-2">Transactional Email Center</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Manage system-wide transactional email notifications, audit logs, provider credentials, and delivery queues across all organization workspaces.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Server className="w-3.5 h-3.5 text-emerald-400" /> Provider: <span className="text-white font-semibold">Development Log Mode</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Security Override: <span className="text-white font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Preferences & Test Email */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Preferences Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Personal Email Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Control which transactional events send email alerts</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block">Global Email Dispatch</span>
                <span className="text-xs text-slate-500 block">Master toggle for non-security emails</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleTogglePreference('emailNotifications')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block">Task Assignment & Reassignment</span>
                <span className="text-xs text-slate-500 block">Emails when you are assigned or task status changes</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.taskNotifications}
                onChange={() => handleTogglePreference('taskNotifications')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block">Comment @Mentions & Replies</span>
                <span className="text-xs text-slate-500 block">Instant notification when teammates tag you</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.mentionNotifications}
                onChange={() => handleTogglePreference('mentionNotifications')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>
          </div>
        </div>

        {/* Test Email Dispatch Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Send Test Email</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verify email routing and provider output</p>
            </div>
          </div>

          <form onSubmit={handleSendTestEmail} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Recipient Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@organization.com"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sendingTest || !testEmailRecipient}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition cursor-pointer"
            >
              {sendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Dispatch Test Payload
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                {testResult.message}
              </div>
            )}
          </form>

          {/* Quick Template Previews */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Live Template Previews:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleOpenPreview('task_assignment')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition"
              >
                <Eye className="w-3 h-3 text-indigo-500" /> Task Assignment
              </button>
              <button
                type="button"
                onClick={() => handleOpenPreview('organization_invitation')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition"
              >
                <Eye className="w-3 h-3 text-indigo-500" /> Org Invitation
              </button>
              <button
                type="button"
                onClick={() => handleOpenPreview('comment_mention')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition"
              >
                <Eye className="w-3 h-3 text-indigo-500" /> Comment Mention
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Logs & Delivery Audit Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" /> Email Delivery Audit Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track delivery status, provider errors, and idempotency keys</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search recipient or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-60"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Sent">Sent</option>
              <option value="Queued">Queued</option>
              <option value="Failed">Failed</option>
              <option value="Skipped">Skipped</option>
            </select>

            <button
              onClick={fetchLogs}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Recipient</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Dispatched At</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {loadingLogs ? 'Loading email delivery logs...' : 'No email delivery logs found matching filters.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-semibold">{log.recipient}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{log.subject}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          log.status === 'Sent'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : log.status === 'Failed'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : log.status === 'Skipped'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {log.status === 'Sent' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'Failed' && <XCircle className="w-3 h-3" />}
                        {log.status === 'Skipped' && <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{log.provider}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.status === 'Failed' && (
                        <button
                          onClick={() => handleRetryEmail(log.id)}
                          disabled={retryingId === log.id}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer transition"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} /> Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" /> Template Preview: <span className="font-mono text-indigo-600">{previewTemplate}</span>
              </h3>
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  setPreviewHtml(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {loadingPreview ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" /> Rendering template...
                </div>
              ) : (
                <iframe
                  title="Template Preview"
                  srcDoc={previewHtml || ''}
                  className="w-full h-[500px] rounded-xl border border-slate-200 shadow-inner bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
