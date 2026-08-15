import { Request, Response } from 'express';
import { EmailLogModel } from '../models/emailLog.model';
import { EmailService } from '../services/email.service';
import { EmailTemplates } from '../services/email/emailTemplates';
import { ResponseService } from '../services/response.service';
import { HTTP_STATUS } from '../constants';

export class EmailController {
  /**
   * GET /api/v1/email/logs - Get paginated email logs
   */
  public static async getEmailLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = (page - 1) * limit;

      const { status, type, search } = req.query;

      const query: any = {};

      if (status && status !== 'all') {
        query.status = status;
      }

      if (type && type !== 'all') {
        query.type = type;
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ recipient: regex }, { subject: regex }, { type: regex }];
      }

      const total = await EmailLogModel.countDocuments(query);
      const docs = await EmailLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const logs = docs.map((d) => d.toPayload());

      ResponseService.success(
        res,
        'Email logs retrieved successfully',
        {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        }
      );
    } catch (error: any) {
      ResponseService.error(res, error.message || 'Failed to fetch email logs', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/v1/email/logs/:id - Get email log detail
   */
  public static async getEmailLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await EmailLogModel.findById(id);
      if (!log) {
        ResponseService.error(res, 'Email log not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      ResponseService.success(res, 'Email log details retrieved', log.toPayload());
    } catch (error: any) {
      ResponseService.error(res, error.message || 'Failed to fetch email log detail', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/v1/email/logs/:id/retry - Retry failed email log
   */
  public static async retryEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await EmailLogModel.findById(id);
      if (!log) {
        ResponseService.error(res, 'Email log record not found', HTTP_STATUS.NOT_FOUND);
        return;
      }

      const result = await EmailService.sendEmail({
        to: log.recipient,
        subject: `[RETRY] ${log.subject}`,
        html: `<p>Retried email dispatch for event: <strong>${log.type}</strong></p>`,
        type: log.type,
        entityType: log.entityType,
        entityId: log.entityId,
        bypassPreference: true,
      });

      if (result.success) {
        log.status = 'Sent';
        log.error = undefined;
        log.sentAt = new Date();
        await log.save();
      }

      ResponseService.success(res, 'Email retry executed', { result, log: log.toPayload() });
    } catch (error: any) {
      ResponseService.error(res, error.message || 'Failed to retry email dispatch', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/v1/email/test - Send test email to verify SMTP or Dev configuration
   */
  public static async sendTestEmail(req: Request, res: Response): Promise<void> {
    try {
      const { recipientEmail } = req.body;
      if (!recipientEmail) {
        ResponseService.error(res, 'Target recipient email address is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const user = (req as any).user;
      const senderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'System Admin';

      const result = await EmailService.sendTestEmail({
        toEmail: recipientEmail,
        senderName,
      });

      ResponseService.success(res, 'Test email dispatch attempt completed', result);
    } catch (error: any) {
      ResponseService.error(res, error.message || 'Test email dispatch failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/v1/email/preview/:template - Get rendered template HTML preview
   */
  public static async getTemplatePreview(req: Request, res: Response): Promise<void> {
    try {
      const { template } = req.params;
      let rendered: { subject: string; html: string; text: string };

      switch (template) {
        case 'task_assignment':
          rendered = EmailTemplates.getTaskAssignmentTemplate({
            recipientName: 'Alex Rivera',
            projectName: 'TaskFlow AI Core',
            projectKey: 'TFA',
            taskId: '60d5ec49f1b2c81234567890',
            taskKey: 'TFA-104',
            taskTitle: 'Implement High Availability Realtime Syncer',
            taskDescription: 'Configure cluster replication across multiple nodes with automatic failover.',
            priority: 'High',
            status: 'In Progress',
            assigneeName: 'Alex Rivera',
            reporterName: 'Sarah Chen',
            dueDate: 'Tomorrow',
            assignedBy: 'Sarah Chen',
            assignedAt: new Date().toLocaleString(),
            actionUrl: '#',
          });
          break;

        case 'organization_invitation':
          rendered = EmailTemplates.getOrganizationInvitationTemplate({
            recipientEmail: 'dev@example.com',
            organizationName: 'Acme Software Labs',
            inviterName: 'Sarah Chen',
            role: 'Developer',
            acceptUrl: '#',
          });
          break;

        case 'password_reset':
          rendered = EmailTemplates.getPasswordResetTemplate({
            recipientName: 'Alex Rivera',
            resetUrl: '#',
          });
          break;

        case 'comment_mention':
          rendered = EmailTemplates.getCommentMentionTemplate({
            recipientName: 'Alex Rivera',
            commentAuthorName: 'Sarah Chen',
            projectName: 'TaskFlow AI Core',
            taskKey: 'TFA-88',
            taskTitle: 'Release v2.0 Candidate Review',
            commentExcerpt: '@Alex Could you please double check the Redis socket adapter failover handling?',
            actionUrl: '#',
          });
          break;

        default:
          rendered = EmailTemplates.getTestEmailTemplate({
            testSender: 'System Admin',
            timestamp: new Date().toLocaleString(),
          });
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(rendered.html);
    } catch (error: any) {
      ResponseService.error(res, error.message || 'Failed to generate template preview', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
