import { config } from '../config/env.config';
import { EmailProviderFactory } from './email/providers/providerFactory';
import { SendEmailOptions, SendEmailResult } from './email/providers/emailProvider.interface';
import { EmailLogModel, EmailLogStatus } from '../models/emailLog.model';
import { NotificationPreferenceModel } from '../models/notification-preference.model';
import { User } from '../models/user.model';
import { EmailTemplates } from './email/emailTemplates';

export interface SendEmailServiceOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type: string;
  recipientUserId?: string;
  entityType?: string;
  entityId?: string;
  idempotencyKey?: string;
  bypassPreference?: boolean;
}

export class EmailService {
  /**
   * Resolve client base URL for action links
   */
  public static getBaseUrl(): string {
    return config.clientUrl || 'http://localhost:5173';
  }

  /**
   * Constructs invitation URL for acceptance on frontend
   */
  public static getInvitationUrl(token: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/accept-invite?token=${token}`;
  }

  /**
   * Check user notification preferences in DB
   */
  public static async checkUserPreference(
    recipientUserId: string,
    emailType: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const pref = await NotificationPreferenceModel.findOne({ user: recipientUserId });
      if (!pref) {
        // Defaults to enabled if preference record not explicitly created yet
        return { allowed: true };
      }

      if (!pref.emailNotifications) {
        return { allowed: false, reason: 'User disabled global email notifications' };
      }

      // Specific type preference mapping
      if (
        (emailType.includes('task') || emailType === 'task_assignment' || emailType === 'task_reassignment') &&
        !pref.taskNotifications
      ) {
        return { allowed: false, reason: 'User disabled task notification emails' };
      }

      if (emailType.includes('comment') && !pref.commentNotifications) {
        return { allowed: false, reason: 'User disabled comment notification emails' };
      }

      if (emailType.includes('mention') && !pref.mentionNotifications) {
        return { allowed: false, reason: 'User disabled mention notification emails' };
      }

      if (emailType.includes('project') && !pref.projectNotifications) {
        return { allowed: false, reason: 'User disabled project notification emails' };
      }

      if (emailType.includes('sprint') && !pref.sprintNotifications) {
        return { allowed: false, reason: 'User disabled sprint notification emails' };
      }

      return { allowed: true };
    } catch (err: any) {
      console.warn(`[EmailService] Error checking user preferences: ${err.message}`);
      return { allowed: true }; // Fallback to allowed on error
    }
  }

  /**
   * Check for duplicate emails using idempotency key or recent event fingerprint
   */
  public static async isDuplicate(
    idempotencyKey?: string,
    recipientEmail?: string,
    type?: string,
    entityId?: string
  ): Promise<boolean> {
    if (idempotencyKey) {
      const existing = await EmailLogModel.findOne({
        idempotencyKey,
        status: { $in: ['Sent', 'Queued'] },
      });
      if (existing) return true;
    }

    if (recipientEmail && type && entityId) {
      // Check if sent within last 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const existingRecent = await EmailLogModel.findOne({
        recipient: recipientEmail.toLowerCase(),
        type,
        entityId,
        status: { $in: ['Sent', 'Queued'] },
        createdAt: { $gte: twoMinutesAgo },
      });
      if (existingRecent) return true;
    }

    return false;
  }

  /**
   * Core send function with logging, preference check, duplicate prevention & retries
   */
  public static async sendEmail(options: SendEmailServiceOptions): Promise<SendEmailResult> {
    const recipientEmail = options.to.toLowerCase().trim();
    const type = options.type;
    const idempotencyKey = options.idempotencyKey || `${type}_${options.entityId || 'gen'}_${Date.now()}`;

    // 1. Mandatory Security Check vs Preferences
    const isMandatory = options.bypassPreference || type === 'password_reset' || type === 'welcome';
    if (!isMandatory && options.recipientUserId) {
      const prefCheck = await this.checkUserPreference(options.recipientUserId, type);
      if (!prefCheck.allowed) {
        await EmailLogModel.create({
          recipient: recipientEmail,
          sender: config.emailFrom,
          type,
          subject: options.subject,
          status: 'Skipped',
          provider: config.emailProvider,
          idempotencyKey,
          entityType: options.entityType,
          entityId: options.entityId,
          error: prefCheck.reason || 'Skipped due to user notification preference',
          sentAt: new Date(),
        });

        console.log(`[EmailService] Skipped email to ${recipientEmail}: ${prefCheck.reason}`);
        return {
          success: true,
          provider: config.emailProvider,
          messageId: `skipped_${Date.now()}`,
        };
      }
    }

    // 2. Duplicate Prevention
    const duplicate = await this.isDuplicate(idempotencyKey, recipientEmail, type, options.entityId);
    if (duplicate) {
      console.log(`[EmailService] Duplicate email event ignored for ${recipientEmail} (${type})`);
      await EmailLogModel.create({
        recipient: recipientEmail,
        sender: config.emailFrom,
        type,
        subject: options.subject,
        status: 'Skipped',
        provider: config.emailProvider,
        idempotencyKey,
        entityType: options.entityType,
        entityId: options.entityId,
        error: 'Duplicate email event suppressed by idempotency check',
        sentAt: new Date(),
      });

      return {
        success: true,
        provider: config.emailProvider,
        messageId: `skipped_duplicate_${Date.now()}`,
      };
    }

    // 3. Dispatch through provider with retry mechanism
    const provider = EmailProviderFactory.getProvider();
    const sendOptions: SendEmailOptions = {
      to: recipientEmail,
      from: `"${config.emailFromName}" <${config.emailFrom}>`,
      subject: options.subject,
      html: options.html,
      text: options.text,
      idempotencyKey,
    };

    let result: SendEmailResult = { success: false, provider: provider.name };
    let attempt = 0;
    const maxRetries = 2;

    while (attempt <= maxRetries) {
      attempt++;
      result = await provider.sendEmail(sendOptions);
      if (result.success) break;

      if (attempt <= maxRetries) {
        console.warn(`[EmailService] Send attempt ${attempt} failed: ${result.error}. Retrying in 1s...`);
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    // 4. Log Outcome
    const status: EmailLogStatus = result.success ? 'Sent' : 'Failed';
    await EmailLogModel.create({
      recipient: recipientEmail,
      sender: config.emailFrom,
      type,
      subject: options.subject,
      status,
      provider: result.provider,
      messageId: result.messageId,
      idempotencyKey,
      entityType: options.entityType,
      entityId: options.entityId,
      error: result.error,
      sentAt: new Date(),
    });

    return result;
  }

  // ==========================================
  // SPECIFIC EVENT EMAIL HELPERS
  // ==========================================

  /**
   * Send Task Assignment Email (Highest Priority)
   */
  public static async sendTaskAssignmentEmail(params: {
    recipientUserId: string;
    recipientEmail?: string;
    recipientName?: string;
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
  }): Promise<SendEmailResult> {
    let toEmail = params.recipientEmail;
    let recipientName = params.recipientName || 'Team Member';

    if (!toEmail && params.recipientUserId) {
      const user = await User.findById(params.recipientUserId);
      if (user) {
        toEmail = user.email;
        recipientName = `${user.firstName} ${user.lastName}`.trim() || user.email;
      }
    }

    if (!toEmail) {
      throw new Error('No recipient email resolved for Task Assignment Notification');
    }

    const actionUrl = `${this.getBaseUrl()}/app/tasks/${params.taskKey}`;
    const template = EmailTemplates.getTaskAssignmentTemplate({
      recipientName,
      projectName: params.projectName,
      projectKey: params.projectKey,
      taskId: params.taskId,
      taskKey: params.taskKey,
      taskTitle: params.taskTitle,
      taskDescription: params.taskDescription,
      priority: params.priority,
      status: params.status,
      assigneeName: params.assigneeName,
      reporterName: params.reporterName,
      dueDate: params.dueDate,
      assignedBy: params.assignedBy,
      assignedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      actionUrl,
    });

    return this.sendEmail({
      to: toEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_assignment',
      recipientUserId: params.recipientUserId,
      entityType: 'Task',
      entityId: params.taskId,
    });
  }

  /**
   * Send Task Reassignment Email
   */
  public static async sendTaskReassignmentEmail(params: {
    recipientUserId: string;
    recipientEmail?: string;
    recipientName?: string;
    projectName: string;
    projectKey: string;
    taskKey: string;
    taskTitle: string;
    previousAssigneeName: string;
    newAssigneeName: string;
    assignedBy: string;
    taskId: string;
  }): Promise<SendEmailResult> {
    let toEmail = params.recipientEmail;
    let recipientName = params.recipientName || 'Team Member';

    if (!toEmail && params.recipientUserId) {
      const user = await User.findById(params.recipientUserId);
      if (user) {
        toEmail = user.email;
        recipientName = `${user.firstName} ${user.lastName}`.trim() || user.email;
      }
    }

    if (!toEmail) return { success: false, provider: config.emailProvider, error: 'No recipient email found' };

    const actionUrl = `${this.getBaseUrl()}/app/tasks/${params.taskKey}`;
    const template = EmailTemplates.getTaskReassignmentTemplate({
      recipientName,
      projectName: params.projectName,
      projectKey: params.projectKey,
      taskKey: params.taskKey,
      taskTitle: params.taskTitle,
      previousAssigneeName: params.previousAssigneeName,
      newAssigneeName: params.newAssigneeName,
      assignedBy: params.assignedBy,
      actionUrl,
    });

    return this.sendEmail({
      to: toEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_reassignment',
      recipientUserId: params.recipientUserId,
      entityType: 'Task',
      entityId: params.taskId,
    });
  }

  /**
   * Send Comment Mention Email
   */
  public static async sendCommentMentionEmail(params: {
    recipientUserId: string;
    commentAuthorName: string;
    projectName: string;
    taskKey: string;
    taskTitle: string;
    commentExcerpt: string;
    taskId: string;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.recipientUserId);
    if (!user || !user.email) {
      return { success: false, provider: config.emailProvider, error: 'Recipient user email not found' };
    }

    const actionUrl = `${this.getBaseUrl()}/app/tasks/${params.taskKey}`;
    const recipientName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getCommentMentionTemplate({
      recipientName,
      commentAuthorName: params.commentAuthorName,
      projectName: params.projectName,
      taskKey: params.taskKey,
      taskTitle: params.taskTitle,
      commentExcerpt: params.commentExcerpt,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'comment_mention',
      recipientUserId: params.recipientUserId,
      entityType: 'Task',
      entityId: params.taskId,
    });
  }

  /**
   * Send Organization Invitation Email
   */
  public static async sendInvitationEmail(params: {
    email: string;
    token: string;
    organizationName: string;
    inviterName: string;
    role: string;
  }): Promise<SendEmailResult> {
    const acceptUrl = this.getInvitationUrl(params.token);
    const template = EmailTemplates.getOrganizationInvitationTemplate({
      recipientEmail: params.email,
      organizationName: params.organizationName,
      inviterName: params.inviterName,
      role: params.role,
      acceptUrl,
    });

    return this.sendEmail({
      to: params.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'organization_invitation',
      entityType: 'Organization',
      bypassPreference: true,
    });
  }

  /**
   * Send Password Reset Email (Security Mandatory)
   */
  public static async sendPasswordResetEmail(params: {
    userEmail: string;
    userName: string;
    resetToken: string;
    recipientUserId?: string;
  }): Promise<SendEmailResult> {
    const resetUrl = `${this.getBaseUrl()}/reset-password?token=${params.resetToken}`;
    const template = EmailTemplates.getPasswordResetTemplate({
      recipientName: params.userName,
      resetUrl,
    });

    return this.sendEmail({
      to: params.userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'password_reset',
      recipientUserId: params.recipientUserId,
      entityType: 'User',
      bypassPreference: true,
    });
  }

  /**
   * Send Task Status Update Email
   */
  public static async sendTaskStatusUpdateEmail(params: {
    recipientUserId: string;
    taskKey: string;
    taskTitle: string;
    projectName: string;
    oldStatus: string;
    newStatus: string;
    updatedBy: string;
    taskId: string;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.recipientUserId);
    if (!user || !user.email) return { success: false, provider: config.emailProvider, error: 'User email not found' };

    const actionUrl = `${this.getBaseUrl()}/app/tasks/${params.taskKey}`;
    const recipientName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getTaskStatusUpdateTemplate({
      recipientName,
      taskKey: params.taskKey,
      taskTitle: params.taskTitle,
      projectName: params.projectName,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      updatedBy: params.updatedBy,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_status_update',
      recipientUserId: params.recipientUserId,
      entityType: 'Task',
      entityId: params.taskId,
    });
  }

  /**
   * Send Due Date Reminder / Overdue Email
   */
  public static async sendDueDateReminderEmail(params: {
    recipientUserId: string;
    taskKey: string;
    taskTitle: string;
    projectName: string;
    dueDate: string;
    isOverdue: boolean;
    taskId: string;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.recipientUserId);
    if (!user || !user.email) return { success: false, provider: config.emailProvider, error: 'User email not found' };

    const actionUrl = `${this.getBaseUrl()}/app/tasks/${params.taskKey}`;
    const recipientName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getDueDateReminderTemplate({
      recipientName,
      taskKey: params.taskKey,
      taskTitle: params.taskTitle,
      projectName: params.projectName,
      dueDate: params.dueDate,
      isOverdue: params.isOverdue,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: params.isOverdue ? 'task_overdue' : 'task_due_reminder',
      recipientUserId: params.recipientUserId,
      entityType: 'Task',
      entityId: params.taskId,
    });
  }

  /**
   * Send Welcome Email
   */
  public static async sendWelcomeEmail(params: {
    userEmail: string;
    userName: string;
    userId?: string;
  }): Promise<SendEmailResult> {
    const dashboardUrl = this.getBaseUrl();
    const template = EmailTemplates.getWelcomeEmailTemplate({
      userName: params.userName,
      dashboardUrl,
    });

    return this.sendEmail({
      to: params.userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'welcome',
      recipientUserId: params.userId,
      entityType: 'User',
      bypassPreference: true,
    });
  }

  /**
   * Send Admin Test Email
   */
  public static async sendTestEmail(params: {
    toEmail: string;
    senderName: string;
  }): Promise<SendEmailResult> {
    const template = EmailTemplates.getTestEmailTemplate({
      testSender: params.senderName,
      timestamp: new Date().toLocaleString(),
    });

    return this.sendEmail({
      to: params.toEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'test_email',
      bypassPreference: true,
    });
  }

  /**
   * Send Work Assignment Created Email
   */
  public static async sendWorkAssignedEmail(params: {
    developerId: string;
    assignmentId: string;
    assignmentDocId: string;
    title: string;
    projectName: string;
    repositoryName?: string;
    priority: string;
    dueDate?: string;
    assignedByName: string;
    instructions?: string;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.developerId);
    if (!user || !user.email) return { success: false, provider: config.emailProvider, error: 'Developer user/email not found' };

    const actionUrl = `${this.getBaseUrl()}/app/assignments/${params.assignmentId}`;
    const developerName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getWorkAssignedEmailTemplate({
      developerName,
      assignmentId: params.assignmentId,
      title: params.title,
      projectName: params.projectName,
      repositoryName: params.repositoryName,
      priority: params.priority,
      dueDate: params.dueDate,
      assignedByName: params.assignedByName,
      instructions: params.instructions,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_assigned',
      recipientUserId: params.developerId,
      entityType: 'WorkAssignment',
      entityId: params.assignmentDocId,
    });
  }

  /**
   * Send Work Reassigned Email
   */
  public static async sendWorkReassignedEmail(params: {
    recipientUserId: string;
    assignmentId: string;
    assignmentDocId: string;
    title: string;
    projectName: string;
    changedByName: string;
    reason?: string;
    isNewDeveloper: boolean;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.recipientUserId);
    if (!user || !user.email) return { success: false, provider: config.emailProvider, error: 'User/email not found' };

    const actionUrl = `${this.getBaseUrl()}/app/assignments/${params.assignmentId}`;
    const developerName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getWorkReassignedEmailTemplate({
      developerName,
      assignmentId: params.assignmentId,
      title: params.title,
      projectName: params.projectName,
      changedByName: params.changedByName,
      reason: params.reason,
      isNewDeveloper: params.isNewDeveloper,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_assigned',
      recipientUserId: params.recipientUserId,
      entityType: 'WorkAssignment',
      entityId: params.assignmentDocId,
    });
  }

  /**
   * Send Changes Requested Email
   */
  public static async sendChangesRequestedEmail(params: {
    developerId: string;
    assignmentId: string;
    assignmentDocId: string;
    title: string;
    projectName: string;
    managerName: string;
    reason: string;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.developerId);
    if (!user || !user.email) return { success: false, provider: config.emailProvider, error: 'Developer not found' };

    const actionUrl = `${this.getBaseUrl()}/app/assignments/${params.assignmentId}`;
    const developerName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getChangesRequestedEmailTemplate({
      developerName,
      assignmentId: params.assignmentId,
      title: params.title,
      projectName: params.projectName,
      managerName: params.managerName,
      reason: params.reason,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_assigned',
      recipientUserId: params.developerId,
      entityType: 'WorkAssignment',
      entityId: params.assignmentDocId,
    });
  }

  /**
   * Send Work Submitted Email (to manager)
   */
  public static async sendWorkSubmittedEmail(params: {
    managerId: string;
    developerName: string;
    assignmentId: string;
    assignmentDocId: string;
    title: string;
    projectName: string;
    completionNote?: string;
    githubPrUrl?: string;
  }): Promise<SendEmailResult> {
    const user = await User.findById(params.managerId);
    if (!user || !user.email) return { success: false, provider: config.emailProvider, error: 'Manager not found' };

    const actionUrl = `${this.getBaseUrl()}/app/assignments/${params.assignmentId}`;
    const managerName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    const template = EmailTemplates.getWorkSubmittedEmailTemplate({
      managerName,
      developerName: params.developerName,
      assignmentId: params.assignmentId,
      title: params.title,
      projectName: params.projectName,
      completionNote: params.completionNote,
      githubPrUrl: params.githubPrUrl,
      actionUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'task_assigned',
      recipientUserId: params.managerId,
      entityType: 'WorkAssignment',
      entityId: params.assignmentDocId,
    });
  }
}
