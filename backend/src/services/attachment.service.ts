import { Types } from 'mongoose';
import { AttachmentModel, IAttachmentPayload, AttachmentCategory } from '../models/attachment.model';
import { TaskModel } from '../models/task.model';
import { CloudinaryService, categorizeFile, validateFile } from './cloudinary.service';
import { ActivityService } from './activity.service';

export interface GetAttachmentsFilterOptions {
  category?: AttachmentCategory | 'all';
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'largest' | 'smallest' | 'alphabetical';
}

export class AttachmentService {
  /**
   * Fetch attachments for a task or organization/workspace/project with optional filters and sorting
   */
  public static async getTaskAttachments(
    taskId?: string,
    filters: GetAttachmentsFilterOptions & {
      organizationId?: string;
      workspaceId?: string;
      projectId?: string;
      uploadedBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<IAttachmentPayload[]> {
    const query: any = {};

    if (taskId) {
      if (!Types.ObjectId.isValid(taskId)) {
        throw new Error('Invalid Task ID format.');
      }
      query.task = taskId;
    }

    if (filters.organizationId) {
      query.organization = new Types.ObjectId(filters.organizationId);
    }
    if (filters.workspaceId) {
      query.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId) {
      query.project = new Types.ObjectId(filters.projectId);
    }
    if (filters.uploadedBy) {
      query.uploadedBy = new Types.ObjectId(filters.uploadedBy);
    }

    if (filters.category && filters.category !== 'all') {
      query.fileType = filters.category;
    }

    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ fileName: regex }, { originalName: regex }];
    }

    let sort: any = { createdAt: -1 };
    switch (filters.sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'largest':
        sort = { fileSize: -1 };
        break;
      case 'smallest':
        sort = { fileSize: 1 };
        break;
      case 'alphabetical':
        sort = { fileName: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const page = filters.page && filters.page > 0 ? Number(filters.page) : 1;
    const limit = filters.limit && filters.limit > 0 ? Number(filters.limit) : 100;
    const skip = (page - 1) * limit;

    const attachments = await AttachmentModel.find(query)
      .populate('uploadedBy', 'name firstName lastName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return attachments.map((att) => att.toPayload());
  }

  /**
   * Upload file attachment for a task
   */
  public static async uploadTaskAttachment(
    taskId: string,
    uploaderId: string,
    file: Express.Multer.File,
    customFileName?: string
  ): Promise<IAttachmentPayload> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid Task ID format.');
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file for upload.');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Associated task not found.');
    }

    const orgId = task.organization.toString();
    const wsId = task.workspace.toString();
    const projId = task.project.toString();

    // Folder structure: organization/workspace/project/task/
    const folderPath = `${orgId}/${wsId}/${projId}/${taskId}`;

    const originalName = file.originalname;
    const extension = originalName.includes('.')
      ? originalName.substring(originalName.lastIndexOf('.'))
      : '';
    const cleanBaseName = customFileName
      ? customFileName.trim()
      : originalName.substring(0, originalName.length - extension.length);

    const fileName = `${cleanBaseName}${extension}`;
    const fileType = categorizeFile(file.mimetype, originalName);

    // Check for duplicate uploads with same filename to handle versioning
    const existingCount = await AttachmentModel.countDocuments({
      task: taskId,
      originalName: originalName,
    });
    const version = existingCount + 1;

    // Upload to Cloudinary / storage
    const uploadRes = await CloudinaryService.uploadBuffer(
      file.buffer,
      folderPath,
      originalName,
      file.mimetype
    );

    const attachmentDoc = await AttachmentModel.create({
      task: task._id,
      project: task.project,
      workspace: task.workspace,
      organization: task.organization,
      uploadedBy: uploaderId,
      fileName: fileName,
      originalName: originalName,
      fileUrl: uploadRes.fileUrl,
      publicId: uploadRes.publicId,
      fileType: fileType,
      mimeType: file.mimetype,
      fileSize: file.size,
      version: version,
    });

    const populated = await AttachmentModel.findById(attachmentDoc._id).populate(
      'uploadedBy',
      'name firstName lastName email avatar'
    );

    ActivityService.recordActivity({
      organizationId: orgId,
      workspaceId: wsId,
      projectId: projId,
      taskId: taskId,
      userId: uploaderId,
      action: 'attachment_uploaded',
      entityType: 'Attachment',
      entityId: attachmentDoc._id.toString(),
      metadata: {
        taskKey: task.taskKey,
        taskTitle: task.title,
        fileName: fileName,
        fileSize: file.size,
      },
    });

    return populated!.toPayload();
  }

  /**
   * Rename an attachment
   */
  public static async renameAttachment(
    attachmentId: string,
    userId: string,
    newFileName: string
  ): Promise<IAttachmentPayload> {
    if (!Types.ObjectId.isValid(attachmentId)) {
      throw new Error('Invalid Attachment ID format.');
    }

    if (!newFileName || !newFileName.trim()) {
      throw new Error('New file name cannot be empty.');
    }

    const attachment = await AttachmentModel.findById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found.');
    }

    // Preserve extension if omitted
    const ext = attachment.originalName.includes('.')
      ? attachment.originalName.substring(attachment.originalName.lastIndexOf('.'))
      : '';

    let formattedName = newFileName.trim();
    if (!formattedName.toLowerCase().endsWith(ext.toLowerCase())) {
      formattedName = `${formattedName}${ext}`;
    }

    attachment.fileName = formattedName;
    await attachment.save();

    const populated = await AttachmentModel.findById(attachment._id).populate(
      'uploadedBy',
      'name firstName lastName email avatar'
    );

    return populated!.toPayload();
  }

  /**
   * Replace file attachment with a new version
   */
  public static async replaceAttachment(
    attachmentId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<IAttachmentPayload> {
    if (!Types.ObjectId.isValid(attachmentId)) {
      throw new Error('Invalid Attachment ID format.');
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid replacement file.');
    }

    const attachment = await AttachmentModel.findById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment to replace not found.');
    }

    // Delete previous asset from Cloudinary
    if (attachment.publicId) {
      await CloudinaryService.deleteAsset(attachment.publicId);
    }

    const folderPath = `${attachment.organization}/${attachment.workspace}/${attachment.project}/${attachment.task}`;
    const uploadRes = await CloudinaryService.uploadBuffer(
      file.buffer,
      folderPath,
      file.originalname,
      file.mimetype
    );

    attachment.fileUrl = uploadRes.fileUrl;
    attachment.publicId = uploadRes.publicId;
    attachment.originalName = file.originalname;
    attachment.mimeType = file.mimetype;
    attachment.fileSize = file.size;
    attachment.fileType = categorizeFile(file.mimetype, file.originalname);
    attachment.version = (attachment.version || 1) + 1;

    await attachment.save();

    const populated = await AttachmentModel.findById(attachment._id).populate(
      'uploadedBy',
      'name firstName lastName email avatar'
    );

    return populated!.toPayload();
  }

  /**
   * Delete attachment (Only uploader, project manager, admin or owner can delete)
   */
  public static async deleteAttachment(attachmentId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(attachmentId)) {
      throw new Error('Invalid Attachment ID format.');
    }

    const attachment = await AttachmentModel.findById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found.');
    }

    // Delete asset from storage
    if (attachment.publicId) {
      await CloudinaryService.deleteAsset(attachment.publicId);
    }

    const orgId = attachment.organization ? attachment.organization.toString() : '';
    const wsId = attachment.workspace ? attachment.workspace.toString() : null;
    const projId = attachment.project ? attachment.project.toString() : null;
    const taskId = attachment.task ? attachment.task.toString() : null;
    const fileName = attachment.fileName;

    await AttachmentModel.findByIdAndDelete(attachmentId);

    if (userId && orgId) {
      ActivityService.recordActivity({
        organizationId: orgId,
        workspaceId: wsId,
        projectId: projId,
        taskId: taskId,
        userId,
        action: 'attachment_deleted',
        entityType: 'Attachment',
        entityId: attachmentId,
        metadata: { fileName },
      });
    }

    return true;
  }

  /**
   * Get single attachment details for download or preview
   */
  public static async getAttachmentById(attachmentId: string): Promise<IAttachmentPayload> {
    if (!Types.ObjectId.isValid(attachmentId)) {
      throw new Error('Invalid Attachment ID format.');
    }

    const attachment = await AttachmentModel.findById(attachmentId).populate(
      'uploadedBy',
      'name firstName lastName email avatar'
    );

    if (!attachment) {
      throw new Error('Attachment not found.');
    }

    return attachment.toPayload();
  }
}
