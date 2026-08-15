import { config } from '../../../config/env.config';
import { IEmailProvider } from './emailProvider.interface';
import { DevelopmentEmailProvider } from './developmentProvider';
import { SMTPProvider } from './smtpProvider';

export class EmailProviderFactory {
  private static instance: IEmailProvider | null = null;

  public static getProvider(): IEmailProvider {
    if (!this.instance) {
      const configuredProvider = config.emailProvider;

      if (configuredProvider === 'smtp') {
        this.instance = new SMTPProvider();
      } else {
        this.instance = new DevelopmentEmailProvider();
      }
    }
    return this.instance;
  }

  public static resetProvider(): void {
    this.instance = null;
  }
}
