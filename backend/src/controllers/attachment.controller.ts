import { Request, Response } from 'express';
import multer from 'multer';
import { AttachmentService, GetAttachmentsFilterOptions } from '../services/attachment.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { MAX_FILE_SIZE } from '../services/cloudinary.service';

// Multer memory storage configuration for file buffer upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // 100 MB limit
  },
});

export const uploadSingleMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.array('files', 10);

export class AttachmentController {
  /**
   * GET /api/v1/attachments
   * GET /api/v1/tasks/:taskId/attachments
   */
  public static async getTaskAttachments(req: Request, res: Response): Promise<Response> {
    try {
      const taskId = req.params.taskId || req.query.taskId as string;
      const {
        category,
        search,
        sortBy,
        organizationId,
        workspaceId,
        projectId,
        uploadedBy,
        page,
        limit,
      } = req.query;

      const orgId = (organizationId as string) || (req.user as any)?.organizationId;

      const filters: any = {
        category: category as any,
        search: search as string,
        sortBy: sortBy as any,
        organizationId: orgId,
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        uploadedBy: uploadedBy as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      const attachments = await AttachmentService.getTaskAttachments(taskId, filters);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Attachments retrieved successfully.',
        attachments
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to fetch task attachments'
      );
    }
  }

  /**
   * POST /api/v1/tasks/:taskId/attachments
   * Handles single or multiple files
   */
  public static async uploadTaskAttachments(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId } = req.params;
      const uploaderId = req.user?.id;
      const { customFileName } = req.body;

      if (!uploaderId) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required to upload attachments.'
        );
      }

      // Check if files exist in request
      const reqFiles = req.files as Express.Multer.File[];
      const singleFile = req.file;

      if (!singleFile && (!reqFiles || reqFiles.length === 0)) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'No file was uploaded.'
        );
      }

      const filesToProcess = singleFile ? [singleFile] : reqFiles;
      const results = [];

      for (const file of filesToProcess) {
        const uploaded = await AttachmentService.uploadTaskAttachment(
          taskId,
          uploaderId,
          file,
          customFileName
        );
        results.push(uploaded);
      }

      return sendSuccessResponse(
        res,
        HTTP_STATUS.CREATED,
        `${results.length} attachment(s) uploaded successfully.`,
        singleFile ? results[0] : results
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to upload attachment'
      );
    }
  }

  /**
   * PUT /api/v1/attachments/:id
   * Rename attachment or replace file content
   */
  public static async updateAttachment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { fileName, action } = req.body;

      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      // If action is replace and file is attached
      if (action === 'replace' && req.file) {
        const replaced = await AttachmentService.replaceAttachment(id, userId, req.file);
        return sendSuccessResponse(
          res,
          HTTP_STATUS.OK,
          'Attachment replaced with new version successfully.',
          replaced
        );
      }

      // Default action: rename
      if (fileName) {
        const renamed = await AttachmentService.renameAttachment(id, userId, fileName);
        return sendSuccessResponse(
          res,
          HTTP_STATUS.OK,
          'Attachment renamed successfully.',
          renamed
        );
      }

      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'No valid update fields provided.'
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to update attachment'
      );
    }
  }

  /**
   * DELETE /api/v1/attachments/:id
   */
  public static async deleteAttachment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required.');
      }

      await AttachmentService.deleteAttachment(id, userId);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Attachment deleted successfully.',
        { id }
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        error.message || 'Failed to delete attachment'
      );
    }
  }

  /**
   * GET /api/v1/attachments/:id
   */
  public static async getAttachmentById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const attachment = await AttachmentService.getAttachmentById(id);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Attachment details fetched successfully.',
        attachment
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Attachment not found'
      );
    }
  }

  /**
   * GET /api/v1/attachments/:id/download
   */
  public static async downloadAttachment(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const attachment = await AttachmentService.getAttachmentById(id);

      // Redirect to the direct Cloudinary or stored file URL with attachment disposition
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(attachment.fileName)}"`
      );

      // Return attachment json payload containing direct fileUrl & metadata
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Download URL generated.',
        attachment
      );
    } catch (error: any) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        error.message || 'Attachment not found for download'
      );
    }
  }
}
