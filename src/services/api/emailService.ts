import { axiosInstance } from './axiosInstance';

export interface IEmailLog {
  id: string;
  recipient: string;
  sender?: string;
  type: string;
  subject: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Skipped';
  provider: string;
  messageId?: string;
  error?: string;
  sentAt?: string;
  createdAt: string;
}

export interface GetEmailLogsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}

export class EmailApiService {
  public static async getLogs(params: GetEmailLogsParams = {}) {
    const response = await axiosInstance.get('/email/logs', { params });
    return response.data;
  }

  public static async getLogById(id: string) {
    const response = await axiosInstance.get(`/email/logs/${id}`);
    return response.data;
  }

  public static async retryEmail(id: string) {
    const response = await axiosInstance.post(`/email/logs/${id}/retry`);
    return response.data;
  }

  public static async sendTestEmail(recipientEmail: string) {
    const response = await axiosInstance.post('/email/test', { recipientEmail });
    return response.data;
  }
}
