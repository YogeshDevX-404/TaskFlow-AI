export interface BaseEmailOptions {
  title: string;
  preheader?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  metadata?: Array<{ label: string; value: string }>;
}

export class EmailTemplates {
  /**
   * Universal responsive HTML layout compatible with major email clients.
   */
  public static getBaseLayout(options: BaseEmailOptions): string {
    const { title, preheader = '', bodyHtml, ctaText, ctaUrl, metadata } = options;

    const metadataRows = metadata && metadata.length > 0
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; margin-bottom: 24px; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          ${metadata
            .map(
              (m) => `
            <tr>
              <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 35%;">${m.label}</td>
              <td style="padding: 10px 16px; font-size: 13px; font-weight: 500; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${m.value}</td>
            </tr>`
            )
            .join('')}
        </table>
      `
      : '';

    const ctaButton = ctaText && ctaUrl
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 24px; margin-bottom: 24px;">
          <tr>
            <td align="center" style="border-radius: 8px; background-color: #4f46e5;">
              <a href="${ctaUrl}" target="_blank" style="font-size: 14px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; background-color: #4f46e5; border: 1px solid #4f46e5;">
                ${ctaText}
              </a>
            </td>
          </tr>
        </table>
      `
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; color: #1e293b;">
  <!-- Preheader text for email clients -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-top-left-radius: 12px; border-top-right-radius: 12px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">TaskFlow AI</span>
                    <span style="display: inline-block; margin-left: 8px; font-size: 10px; font-weight: 700; color: #e0e7ff; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">Enterprise</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${title}
              </h1>

              <div style="font-size: 14px; line-height: 1.6; color: #334155;">
                ${bodyHtml}
              </div>

              ${metadataRows}
              ${ctaButton}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                This transactional email was generated automatically by <strong>TaskFlow AI Engine</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} TaskFlow AI platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Task Assignment Email Template
   */
  public static getTaskAssignmentTemplate(data: {
    recipientName: string;
    projectName: string;
    projectKey: string;
    taskId: string;
    taskKey: string;
    taskTitle: string;
    taskDescription?: string;
    priority: string;
    status: string;
    assigneeName: string;
    reporterName?: string;
    dueDate?: string;
    assignedBy: string;
    assignedAt: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[${data.projectKey}] Assigned to Task: ${data.taskKey} - ${data.taskTitle}`;

    const descSnippet = data.taskDescription
      ? `<p style="margin-top: 12px; padding: 12px; background: #f8fafc; border-left: 3px solid #4f46e5; border-radius: 4px; font-size: 13px; color: #475569; font-style: italic;">
          "${data.taskDescription.length > 250 ? data.taskDescription.substring(0, 250) + '...' : data.taskDescription}"
         </p>`
      : '';

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.recipientName}</strong>,</p>
      <p><strong>${data.assignedBy}</strong> has assigned a task to you in project <strong>${data.projectName} (${data.projectKey})</strong>.</p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #eef2ff; border-radius: 8px; border: 1px solid #c7d2fe;">
        <span style="font-size: 12px; font-weight: 700; color: #4338ca; text-transform: uppercase;">Task ${data.taskKey}</span>
        <h2 style="margin: 4px 0 0 0; font-size: 16px; color: #1e1b4b; font-weight: 700;">${data.taskTitle}</h2>
      </div>

      ${descSnippet}
    `;

    const metadata = [
      { label: 'Project', value: `${data.projectName} (${data.projectKey})` },
      { label: 'Task Key', value: data.taskKey },
      { label: 'Priority', value: data.priority },
      { label: 'Status', value: data.status },
      { label: 'Assigned By', value: data.assignedBy },
      { label: 'Reporter', value: data.reporterName || 'N/A' },
      { label: 'Due Date', value: data.dueDate || 'Not specified' },
      { label: 'Assigned At', value: data.assignedAt },
    ];

    const html = this.getBaseLayout({
      title: `Task Assigned: ${data.taskKey}`,
      preheader: `You were assigned to ${data.taskKey} in ${data.projectName} by ${data.assignedBy}`,
      bodyHtml,
      ctaText: 'Open Task in TaskFlow AI',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Task Assigned: ${data.taskKey} - ${data.taskTitle}\nProject: ${data.projectName}\nAssigned By: ${data.assignedBy}\nPriority: ${data.priority}\nStatus: ${data.status}\nOpen task: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Task Reassignment Email Template
   */
  public static getTaskReassignmentTemplate(data: {
    recipientName: string;
    projectName: string;
    projectKey: string;
    taskKey: string;
    taskTitle: string;
    previousAssigneeName: string;
    newAssigneeName: string;
    assignedBy: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[${data.projectKey}] Task Reassigned to You: ${data.taskKey}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.recipientName}</strong>,</p>
      <p><strong>${data.assignedBy}</strong> reassigned task <strong>${data.taskKey}</strong> to you in project <strong>${data.projectName}</strong>.</p>
    `;

    const metadata = [
      { label: 'Project', value: `${data.projectName} (${data.projectKey})` },
      { label: 'Task Key', value: data.taskKey },
      { label: 'Task Title', value: data.taskTitle },
      { label: 'Previous Assignee', value: data.previousAssigneeName },
      { label: 'New Assignee', value: data.newAssigneeName },
      { label: 'Reassigned By', value: data.assignedBy },
    ];

    const html = this.getBaseLayout({
      title: `Task Reassigned: ${data.taskKey}`,
      preheader: `${data.taskKey} was reassigned to you by ${data.assignedBy}`,
      bodyHtml,
      ctaText: 'View Task Details',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Task Reassigned: ${data.taskKey} - ${data.taskTitle}\nPrevious Assignee: ${data.previousAssigneeName}\nNew Assignee: ${data.newAssigneeName}\nView task: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Comment Mention Email Template
   */
  public static getCommentMentionTemplate(data: {
    recipientName: string;
    commentAuthorName: string;
    projectName: string;
    taskKey: string;
    taskTitle: string;
    commentExcerpt: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `${data.commentAuthorName} mentioned you on ${data.taskKey}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.recipientName}</strong>,</p>
      <p><strong>${data.commentAuthorName}</strong> mentioned you in a comment on task <strong>${data.taskKey}: ${data.taskTitle}</strong>:</p>
      
      <div style="margin: 16px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 4px; font-size: 14px; color: #1e293b;">
        "${data.commentExcerpt}"
      </div>
    `;

    const metadata = [
      { label: 'Task Key', value: data.taskKey },
      { label: 'Project', value: data.projectName },
      { label: 'Comment Author', value: data.commentAuthorName },
    ];

    const html = this.getBaseLayout({
      title: `New Mention on ${data.taskKey}`,
      preheader: `${data.commentAuthorName} mentioned you: "${data.commentExcerpt.substring(0, 80)}..."`,
      bodyHtml,
      ctaText: 'Reply in TaskFlow AI',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `${data.commentAuthorName} mentioned you on ${data.taskKey}:\n"${data.commentExcerpt}"\nReply: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Organization Invitation Email Template
   */
  public static getOrganizationInvitationTemplate(data: {
    recipientEmail: string;
    organizationName: string;
    inviterName: string;
    role: string;
    acceptUrl: string;
    expiresInDays?: number;
  }): { subject: string; html: string; text: string } {
    const subject = `You're invited to join ${data.organizationName} on TaskFlow AI`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello,</p>
      <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on TaskFlow AI with the role of <strong>${data.role}</strong>.</p>
      <p>Click the button below to accept your invitation and access your team workspace.</p>
    `;

    const metadata = [
      { label: 'Organization', value: data.organizationName },
      { label: 'Invited By', value: data.inviterName },
      { label: 'Assigned Role', value: data.role },
      { label: 'Expiration', value: `${data.expiresInDays || 7} days` },
    ];

    const html = this.getBaseLayout({
      title: `Organization Invitation`,
      preheader: `Join ${data.organizationName} on TaskFlow AI`,
      bodyHtml,
      ctaText: 'Accept Invitation',
      ctaUrl: data.acceptUrl,
      metadata,
    });

    const text = `You're invited to join ${data.organizationName} on TaskFlow AI by ${data.inviterName}.\nAccept invitation: ${data.acceptUrl}`;

    return { subject, html, text };
  }

  /**
   * Password Reset Email Template
   */
  public static getPasswordResetTemplate(data: {
    recipientName: string;
    resetUrl: string;
    expiresInMinutes?: number;
  }): { subject: string; html: string; text: string } {
    const subject = `Reset Your TaskFlow AI Password`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.recipientName}</strong>,</p>
      <p>We received a request to reset your password for your TaskFlow AI account.</p>
      <p>Click the button below to set a new password. This link is valid for <strong>${data.expiresInMinutes || 60} minutes</strong>.</p>
      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    `;

    const html = this.getBaseLayout({
      title: `Password Reset Request`,
      preheader: `Instructions to reset your password for TaskFlow AI`,
      bodyHtml,
      ctaText: 'Reset Password',
      ctaUrl: data.resetUrl,
    });

    const text = `Reset your TaskFlow AI password using this link:\n${data.resetUrl}\nLink expires in ${data.expiresInMinutes || 60} minutes.`;

    return { subject, html, text };
  }

  /**
   * Task Status Update Template
   */
  public static getTaskStatusUpdateTemplate(data: {
    recipientName: string;
    taskKey: string;
    taskTitle: string;
    projectName: string;
    oldStatus: string;
    newStatus: string;
    updatedBy: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[Status Update] ${data.taskKey} moved to ${data.newStatus}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.recipientName}</strong>,</p>
      <p><strong>${data.updatedBy}</strong> updated the status of task <strong>${data.taskKey}: ${data.taskTitle}</strong>.</p>
    `;

    const metadata = [
      { label: 'Task Key', value: data.taskKey },
      { label: 'Previous Status', value: data.oldStatus },
      { label: 'New Status', value: data.newStatus },
      { label: 'Updated By', value: data.updatedBy },
    ];

    const html = this.getBaseLayout({
      title: `Task Status Updated`,
      preheader: `${data.taskKey} was moved from ${data.oldStatus} to ${data.newStatus} by ${data.updatedBy}`,
      bodyHtml,
      ctaText: 'Open Task',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `${data.taskKey} moved to ${data.newStatus} by ${data.updatedBy}.\nOpen task: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Due Date Reminder / Overdue Template
   */
  public static getDueDateReminderTemplate(data: {
    recipientName: string;
    taskKey: string;
    taskTitle: string;
    projectName: string;
    dueDate: string;
    isOverdue: boolean;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = data.isOverdue
      ? `[OVERDUE] Task ${data.taskKey} is overdue!`
      : `[REMINDER] Task ${data.taskKey} due soon (${data.dueDate})`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.recipientName}</strong>,</p>
      <p>${
        data.isOverdue
          ? `Your task <strong>${data.taskKey}: ${data.taskTitle}</strong> was due on <strong>${data.dueDate}</strong> and requires immediate action.`
          : `This is a friendly reminder that task <strong>${data.taskKey}: ${data.taskTitle}</strong> is due on <strong>${data.dueDate}</strong>.`
      }</p>
    `;

    const metadata = [
      { label: 'Task Key', value: data.taskKey },
      { label: 'Project', value: data.projectName },
      { label: 'Due Date', value: data.dueDate },
      { label: 'Status', value: data.isOverdue ? 'OVERDUE' : 'DUE SOON' },
    ];

    const html = this.getBaseLayout({
      title: data.isOverdue ? `Task Overdue Alert` : `Task Due Date Reminder`,
      preheader: `${data.taskKey} is ${data.isOverdue ? 'overdue' : 'due soon'} (${data.dueDate})`,
      bodyHtml,
      ctaText: 'View Task',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Task ${data.taskKey} (${data.taskTitle}) is ${data.isOverdue ? 'OVERDUE' : 'due soon'}.\nDue Date: ${data.dueDate}\nView: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Welcome Email Template
   */
  public static getWelcomeEmailTemplate(data: {
    userName: string;
    dashboardUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `Welcome to TaskFlow AI!`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.userName}</strong>,</p>
      <p>Welcome to TaskFlow AI! Your account is now active and ready for smart project management, team collaboration, and automated workflows.</p>
      <p>Get started by creating your first workspace or accepting invitations from your team.</p>
    `;

    const html = this.getBaseLayout({
      title: `Welcome to TaskFlow AI`,
      preheader: `Welcome ${data.userName}! Get started with TaskFlow AI`,
      bodyHtml,
      ctaText: 'Go to Dashboard',
      ctaUrl: data.dashboardUrl,
    });

    const text = `Welcome ${data.userName} to TaskFlow AI!\nGo to dashboard: ${data.dashboardUrl}`;

    return { subject, html, text };
  }

  /**
   * Test Email Template
   */
  public static getTestEmailTemplate(data: {
    testSender: string;
    timestamp: string;
  }): { subject: string; html: string; text: string } {
    const subject = `TaskFlow AI - Email Delivery Test (${data.timestamp})`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello Admin,</p>
      <p>This is a test email dispatched from <strong>TaskFlow AI Email Engine</strong> to verify your SMTP / Email Provider setup.</p>
      <p>If you are reading this email, your provider configuration is fully functional and ready for production traffic!</p>
    `;

    const metadata = [
      { label: 'Triggered By', value: data.testSender },
      { label: 'Timestamp', value: data.timestamp },
      { label: 'Status', value: 'System Functional' },
    ];

    const html = this.getBaseLayout({
      title: `Email Integration Test Successful`,
      preheader: `TaskFlow AI Test Email Verification`,
      bodyHtml,
      metadata,
    });

    const text = `TaskFlow AI Email Test Successful.\nTriggered By: ${data.testSender}\nTime: ${data.timestamp}`;

    return { subject, html, text };
  }

  /**
   * Work Assignment Created Email Template
   */
  public static getWorkAssignedEmailTemplate(data: {
    developerName: string;
    assignmentId: string;
    title: string;
    projectName: string;
    repositoryName?: string;
    priority: string;
    dueDate?: string;
    assignedByName: string;
    instructions?: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[Assignment ${data.assignmentId}] Work Assigned: ${data.title}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.developerName}</strong>,</p>
      <p><strong>${data.assignedByName}</strong> has assigned you work: <strong>${data.assignmentId} - ${data.title}</strong>.</p>
      ${
        data.instructions
          ? `<div style="margin: 16px 0; padding: 12px 16px; background-color: #f1f5f9; border-left: 4px solid #4f46e5; border-radius: 4px; font-size: 13px;">
              <strong>Instructions:</strong><br/>
              ${data.instructions.replace(/\n/g, '<br/>')}
             </div>`
          : ''
      }
      <p>Please review the details, acknowledge the assignment, and start your progress.</p>
    `;

    const metadata = [
      { label: 'Assignment ID', value: data.assignmentId },
      { label: 'Project', value: data.projectName },
      ...(data.repositoryName ? [{ label: 'Repository', value: data.repositoryName }] : []),
      { label: 'Priority', value: data.priority },
      { label: 'Due Date', value: data.dueDate || 'No deadline specified' },
      { label: 'Assigned By', value: data.assignedByName },
    ];

    const html = this.getBaseLayout({
      title: `New Work Assignment: ${data.assignmentId}`,
      preheader: `Work assigned by ${data.assignedByName}: ${data.title}`,
      bodyHtml,
      ctaText: 'Open Assignment',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Work Assigned: ${data.assignmentId} - ${data.title}\nProject: ${data.projectName}\nPriority: ${data.priority}\nAssigned By: ${data.assignedByName}\nDue Date: ${data.dueDate || 'None'}\nOpen: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Work Assignment Reassigned Email Template
   */
  public static getWorkReassignedEmailTemplate(data: {
    developerName: string;
    assignmentId: string;
    title: string;
    projectName: string;
    changedByName: string;
    reason?: string;
    isNewDeveloper: boolean;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[Assignment ${data.assignmentId}] Work Reassigned: ${data.title}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.developerName}</strong>,</p>
      <p>${
        data.isNewDeveloper
          ? `You have been assigned to <strong>${data.assignmentId}: ${data.title}</strong> by <strong>${data.changedByName}</strong>.`
          : `Assignment <strong>${data.assignmentId}: ${data.title}</strong> has been reassigned to another developer by <strong>${data.changedByName}</strong>.`
      }</p>
      ${
        data.reason
          ? `<p style="margin: 12px 0; padding: 10px 14px; background-color: #f8fafc; border-left: 3px solid #64748b; font-size: 13px;">
              <strong>Reassignment Reason:</strong> ${data.reason}
             </p>`
          : ''
      }
    `;

    const metadata = [
      { label: 'Assignment ID', value: data.assignmentId },
      { label: 'Project', value: data.projectName },
      { label: 'Updated By', value: data.changedByName },
    ];

    const html = this.getBaseLayout({
      title: `Work Assignment Reassigned`,
      preheader: `${data.assignmentId} reassigned by ${data.changedByName}`,
      bodyHtml,
      ctaText: 'View Assignment',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Work Reassigned: ${data.assignmentId} - ${data.title}\nProject: ${data.projectName}\nBy: ${data.changedByName}\nReason: ${data.reason || 'None'}\nView: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Changes Requested Email Template
   */
  public static getChangesRequestedEmailTemplate(data: {
    developerName: string;
    assignmentId: string;
    title: string;
    projectName: string;
    managerName: string;
    reason: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[Assignment ${data.assignmentId}] Changes Requested: ${data.title}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.developerName}</strong>,</p>
      <p><strong>${data.managerName}</strong> has reviewed your submission for <strong>${data.assignmentId} - ${data.title}</strong> and requested revisions.</p>
      <div style="margin: 16px 0; padding: 14px 18px; background-color: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 4px; font-size: 13px; color: #881337;">
        <strong>Feedback & Requested Changes:</strong><br/>
        ${data.reason.replace(/\n/g, '<br/>')}
      </div>
      <p>Please address the feedback and resubmit your work once completed.</p>
    `;

    const metadata = [
      { label: 'Assignment ID', value: data.assignmentId },
      { label: 'Project', value: data.projectName },
      { label: 'Reviewed By', value: data.managerName },
      { label: 'Status', value: 'Changes Requested' },
    ];

    const html = this.getBaseLayout({
      title: `Changes Requested on ${data.assignmentId}`,
      preheader: `${data.managerName} requested changes on ${data.title}`,
      bodyHtml,
      ctaText: 'Review Feedback & Work',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Changes Requested on ${data.assignmentId}: ${data.title}\nManager: ${data.managerName}\nFeedback: ${data.reason}\nView: ${data.actionUrl}`;

    return { subject, html, text };
  }

  /**
   * Work Submitted Email Template (to manager)
   */
  public static getWorkSubmittedEmailTemplate(data: {
    managerName: string;
    developerName: string;
    assignmentId: string;
    title: string;
    projectName: string;
    completionNote?: string;
    githubPrUrl?: string;
    actionUrl: string;
  }): { subject: string; html: string; text: string } {
    const subject = `[Assignment ${data.assignmentId}] Work Submitted by ${data.developerName}`;

    const bodyHtml = `
      <p style="margin-top: 0;">Hello <strong>${data.managerName}</strong>,</p>
      <p><strong>${data.developerName}</strong> has completed and submitted work for <strong>${data.assignmentId} - ${data.title}</strong>.</p>
      ${
        data.completionNote
          ? `<div style="margin: 16px 0; padding: 12px 16px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; font-size: 13px; color: #14532d;">
              <strong>Developer Completion Note:</strong><br/>
              ${data.completionNote.replace(/\n/g, '<br/>')}
             </div>`
          : ''
      }
      ${data.githubPrUrl ? `<p>Linked PR: <a href="${data.githubPrUrl}" target="_blank">${data.githubPrUrl}</a></p>` : ''}
      <p>Please review the submitted work to accept or request modifications.</p>
    `;

    const metadata = [
      { label: 'Assignment ID', value: data.assignmentId },
      { label: 'Developer', value: data.developerName },
      { label: 'Project', value: data.projectName },
      { label: 'Status', value: 'Submitted for Review' },
    ];

    const html = this.getBaseLayout({
      title: `Work Submitted: ${data.assignmentId}`,
      preheader: `${data.developerName} submitted work for ${data.title}`,
      bodyHtml,
      ctaText: 'Review Submission',
      ctaUrl: data.actionUrl,
      metadata,
    });

    const text = `Work Submitted: ${data.assignmentId} - ${data.title}\nDeveloper: ${data.developerName}\nNote: ${data.completionNote || 'None'}\nReview: ${data.actionUrl}`;

    return { subject, html, text };
  }
}
