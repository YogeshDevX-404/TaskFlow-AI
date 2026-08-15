import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  Attachment,
  AttachmentFilterOptions,
} from '../../types/attachment';
import { AxiosRequestConfig } from 'axios';

export class AttachmentApiService extends BaseApiService {
  /**
   * GET /api/v1/tasks/:taskId/attachments
   */
  public static async getTaskAttachments(
    taskId: string,
    filters?: AttachmentFilterOptions
  ): Promise<ApiResponseData<Attachment[]>> {
    return this.get<Attachment[]>(`/tasks/${taskId}/attachments`, { params: filters });
  }

  /**
   * POST /api/v1/tasks/:taskId/attachments
   */
  public static async uploadTaskAttachments(
    taskId: string,
    formData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponseData<Attachment | Attachment[]>> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    };

    return this.post<Attachment | Attachment[]>(`/tasks/${taskId}/attachments`, formData, config);
  }

  /**
   * PUT /api/v1/attachments/:id (Rename or Replace file)
   */
  public static async updateAttachment(
    attachmentId: string,
    data: FormData | { fileName: string }
  ): Promise<ApiResponseData<Attachment>> {
    const config: AxiosRequestConfig = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return this.put<Attachment>(`/attachments/${attachmentId}`, data, config);
  }

  /**
   * DELETE /api/v1/attachments/:id
   */
  public static async deleteAttachment(attachmentId: string): Promise<ApiResponseData<{ id: string }>> {
    return this.delete<{ id: string }>(`/attachments/${attachmentId}`);
  }

  /**
   * GET /api/v1/attachments/:id/download
   */
  public static async getDownloadUrl(attachmentId: string): Promise<ApiResponseData<Attachment>> {
    return this.get<Attachment>(`/attachments/${attachmentId}/download`);
  }
}
