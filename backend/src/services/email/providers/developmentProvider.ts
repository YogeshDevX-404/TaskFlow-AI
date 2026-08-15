import { IEmailProvider, SendEmailOptions, SendEmailResult } from './emailProvider.interface';

export class DevelopmentEmailProvider implements IEmailProvider {
  public readonly name = 'development';

  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const timestamp = new Date().toISOString();
    const mockMsgId = `dev_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    console.log('====================================================');
    console.log(`[EMAIL DEVELOPMENT MODE] Email Delivery Simulated`);
    console.log(`Time: ${timestamp}`);
    console.log(`To: ${options.to}`);
    console.log(`From: ${options.from || 'default-sender@taskflow.ai'}`);
    console.log(`Subject: ${options.subject}`);
    if (options.idempotencyKey) {
      console.log(`Idempotency Key: ${options.idempotencyKey}`);
    }
    console.log(`Body Snippet: ${options.text || options.html.substring(0, 150).replace(/<[^>]*>/g, '')}...`);
    console.log('====================================================');

    return {
      success: true,
      messageId: mockMsgId,
      provider: this.name,
    };
  }
}
