export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface IEmailProvider {
  readonly name: string;
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}
