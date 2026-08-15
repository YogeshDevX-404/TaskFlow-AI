import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../../config/env.config';
import { IEmailProvider, SendEmailOptions, SendEmailResult } from './emailProvider.interface';
import { DevelopmentEmailProvider } from './developmentProvider';

export class SMTPProvider implements IEmailProvider {
  public readonly name = 'smtp';
  private transporter: Transporter | null = null;
  private fallbackProvider = new DevelopmentEmailProvider();

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (config.smtpHost && config.smtpUser && config.smtpPassword) {
      try {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPassword,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } catch (err: any) {
        console.warn(`[SMTPProvider] Failed to initialize Nodemailer transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      console.log(`[SMTPProvider] SMTP credentials incomplete. Falling back to development log mode.`);
    }
  }

  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.transporter) {
      console.log(`[SMTPProvider] No active SMTP transporter. Routing through DevelopmentEmailProvider.`);
      return this.fallbackProvider.sendEmail(options);
    }

    try {
      const fromAddress = options.from || `"${config.emailFromName}" <${config.emailFrom}>`;
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
      };
    } catch (error: any) {
      console.error(`[SMTPProvider] Error sending email via SMTP:`, error.message);
      return {
        success: false,
        provider: this.name,
        error: error.message || 'Failed to dispatch email via SMTP transporter',
      };
    }
  }
}
