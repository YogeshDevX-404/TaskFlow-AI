import { Types } from 'mongoose';
import {
  WorkAssignmentModel,
  IWorkAssignmentDocument,
  AssignmentStatus,
  AssignmentPriority,
  IReferenceImage,
  IInstructionStep,
  IExpectedResult,
  IAcceptanceCriterion,
  IProofOfWork,
} from '../models/workAssignment.model';
import {
  ProofCategory,
  AcceptanceCriterionStatus,
  SubmissionStatus,
} from '../config/assignmentConfig';
import { TimeEntry } from '../models/timeEntry.model';
import { NotificationService } from './notification.service';
import { ActivityService } from './activity.service';
import { EmailService } from './email.service';
import { broadcastAssignmentSocketEvent } from '../socket/socketServer';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { logger } from '../utils/logger';

export interface CreateAssignmentDTO {
  organizationId: string;
  workspaceId: string;
  projectId: string;
  taskId?: string;
  assignedToId: string;
  title: string;
  description?: string;
  instructions?: string;
  instructionSteps?: IInstructionStep[];
  expectedResult?: IExpectedResult;
  referenceImages?: IReferenceImage[];
  acceptanceCriteria?: Array<Omit<IAcceptanceCriterion, 'updatedBy' | 'updatedAt'>>;
  priority?: AssignmentPriority;
  dueDate?: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
  attachments?: Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    publicId?: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: string;
  }>;
  githubRepositoryConnectionId?: string;
  githubIssue?: {
    issueNumber: number;
    title: string;
    state: string;
    url: string;
    repositoryName?: string;
  };
  githubPullRequest?: {
    prNumber: number;
    title: string;
    state: string;
    url: string;
    branch?: string;
    repositoryName?: string;
  };
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  instructions?: string;
  instructionSteps?: IInstructionStep[];
  expectedResult?: IExpectedResult;
  referenceImages?: IReferenceImage[];
  acceptanceCriteria?: IAcceptanceCriterion[];
  priority?: AssignmentPriority;
  dueDate?: string | null;
  estimatedHours?: number;
  estimatedMinutes?: number;
  attachments?: any[];
  taskId?: string | null;
  githubRepositoryConnectionId?: string | null;
  githubIssue?: any;
  githubPullRequest?: any;
}

export class WorkAssignmentService {
  /**
   * Generate next sequential human-readable assignment ID
   */
  private static async generateAssignmentId(organizationId: string): Promise<string> {
    const count = await WorkAssignmentModel.countDocuments({ organization: organizationId });
    const nextSeq = count + 1;
    return `WA-${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Get developer workload overview before/during assignment
   */
  public static async getDeveloperWorkload(
    developerId: string,
    organizationId: string
  ): Promise<{
    activeAssignmentsCount: number;
    totalEstimatedHours: number;
    totalLoggedHours: number;
    overdueAssignmentsCount: number;
    capacityWarning?: string;
  }> {
    const activeAssignments = await WorkAssignmentModel.find({
      organization: organizationId,
      assignedTo: developerId,
      status: { $in: ['Assigned', 'Acknowledged', 'In Progress', 'Blocked', 'Changes Requested'] },
    });

    const now = new Date();
    let totalEstimatedHours = 0;
    let overdueAssignmentsCount = 0;

    activeAssignments.forEach((a) => {
      totalEstimatedHours += (a.estimatedHours || 0) + (a.estimatedMinutes || 0) / 60;
      if (a.dueDate && new Date(a.dueDate) < now) {
        overdueAssignmentsCount++;
      }
    });

    // Calculate logged hours from TimeEntry
    const assignmentIds = activeAssignments.map((a) => a._id);
    const timeEntries = await TimeEntry.find({
      assignment: { $in: assignmentIds },
    });

    const totalLoggedSeconds = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalLoggedHours = Math.round((totalLoggedSeconds / 3600) * 10) / 10;

    let capacityWarning: string | undefined;
    if (activeAssignments.length >= 5) {
      capacityWarning = `Developer already has ${activeAssignments.length} active assignments.`;
    } else if (totalEstimatedHours >= 40) {
      capacityWarning = `Developer has ${Math.round(totalEstimatedHours)}h of estimated workload pending.`;
    }

    return {
      activeAssignmentsCount: activeAssignments.length,
      totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
      totalLoggedHours,
      overdueAssignmentsCount,
      capacityWarning,
    };
  }

  /**
   * Create a new work assignment with workload analysis & multi-channel notification
   */
  public static async createAssignment(data: CreateAssignmentDTO, currentUser: any) {
    const organizationId = data.organizationId;
    const assignmentId = await this.generateAssignmentId(organizationId);

    const project = await ProjectModel.findById(data.projectId);

    const formattedCriteria = (data.acceptanceCriteria || []).map((crit, idx) => ({
      id: crit.id || `crit_${Date.now()}_${idx}`,
      title: crit.title,
      description: crit.description || '',
      isRequired: crit.isRequired !== false,
      status: (crit.status || 'Not Completed') as AcceptanceCriterionStatus,
      notes: crit.notes || '',
      updatedBy: null,
      updatedAt: null,
    }));

    const formattedImages = (data.referenceImages || []).map((img, idx) => ({
      ...img,
      order: img.order !== undefined ? img.order : idx,
      uploadedBy: currentUser._id || currentUser.id,
      uploadedAt: new Date(),
    }));

    const newAssignment = new WorkAssignmentModel({
      assignmentId,
      organization: organizationId,
      workspace: data.workspaceId,
      project: data.projectId,
      task: data.taskId || null,
      assignedTo: data.assignedToId,
      assignedBy: currentUser._id || currentUser.id,
      githubRepositoryConnection: data.githubRepositoryConnectionId || null,
      githubIssue: data.githubIssue || undefined,
      githubPullRequest: data.githubPullRequest || undefined,
      title: data.title.trim(),
      description: data.description || '',
      instructions: data.instructions || '',
      instructionSteps: data.instructionSteps || [],
      expectedResult: data.expectedResult || {
        description: '',
        uiPreviewDetails: '',
        apiExpectedResponse: '',
        behavioralNotes: '',
        successConditions: [],
      },
      referenceImages: formattedImages,
      acceptanceCriteria: formattedCriteria,
      proofOfWork: [],
      submissions: [],
      priority: data.priority || 'Medium',
      status: 'Assigned',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      estimatedHours: data.estimatedHours || 0,
      estimatedMinutes: data.estimatedMinutes || 0,
      attachments: data.attachments || [],
      progress: 0,
      progressHistory: [],
      reassignmentHistory: [],
      statusHistory: [
        {
          fromStatus: 'Assigned',
          toStatus: 'Assigned',
          changedBy: currentUser._id || currentUser.id,
          reason: 'Initial assignment creation',
          timestamp: new Date(),
        },
      ],
    });

    await newAssignment.save();

    // Fetch populated version for socket/response
    const populated = await this.getAssignmentById(newAssignment._id.toString(), organizationId);

    // 1. Audit Log Activity
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: data.workspaceId,
        project: data.projectId,
        assignment: newAssignment._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'assignment_created',
        entityType: 'WorkAssignment',
        entityId: newAssignment._id.toString(),
        details: {
          assignmentId,
          title: data.title,
          assignedTo: data.assignedToId,
          priority: data.priority || 'Medium',
          dueDate: data.dueDate,
          referenceImagesCount: formattedImages.length,
          criteriaCount: formattedCriteria.length,
        },
      });
    } catch (err) {
      logger.error('Failed to log assignment created activity:', err);
    }

    // 2. In-App Notification to Developer
    if (data.assignedToId !== (currentUser._id || currentUser.id).toString()) {
      try {
        await NotificationService.createNotification({
          recipient: data.assignedToId,
          actor: currentUser._id || currentUser.id,
          type: 'Assignment Created',
          title: `New Assignment: ${assignmentId}`,
          message: `${currentUser.firstName || currentUser.name || 'Manager'} assigned you "${data.title}" in ${project ? project.name : 'Project'}.`,
          entityType: 'WorkAssignment',
          entityId: newAssignment._id.toString(),
          data: {
            assignmentId,
            projectId: data.projectId,
            workspaceId: data.workspaceId,
            organizationId,
          },
          actionUrl: `/app/assignments/${assignmentId}`,
        });
      } catch (err) {
        logger.error('Failed to create assignment in-app notification:', err);
      }

      // 3. Email Notification to Developer
      try {
        await EmailService.sendWorkAssignedEmail({
          developerId: data.assignedToId,
          assignmentId,
          assignmentDocId: newAssignment._id.toString(),
          title: data.title,
          projectName: project ? project.name : 'Project',
          repositoryName: data.githubIssue?.repositoryName || data.githubPullRequest?.repositoryName,
          priority: data.priority || 'Medium',
          dueDate: data.dueDate ? new Date(data.dueDate).toLocaleDateString() : undefined,
          assignedByName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'Manager',
          instructions: data.instructions,
        });
      } catch (err) {
        logger.error('Failed to send assignment email:', err);
      }
    }

    // 4. Realtime Socket Broadcast
    broadcastAssignmentSocketEvent('assignment:created', populated);

    return populated;
  }

  /**
   * List assignments with rich filters, sorting, and pagination
   */
  public static async getAssignments(
    organizationId: string,
    filters: {
      workspaceId?: string;
      projectId?: string;
      assignedToId?: string;
      assignedById?: string;
      status?: string | string[];
      priority?: string | string[];
      isOverdue?: boolean;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const query: any = { organization: organizationId };

    if (filters.workspaceId) query.workspace = filters.workspaceId;
    if (filters.projectId) query.project = filters.projectId;
    if (filters.assignedToId) query.assignedTo = filters.assignedToId;
    if (filters.assignedById) query.assignedBy = filters.assignedById;

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        query.priority = { $in: filters.priority };
      } else {
        query.priority = filters.priority;
      }
    }

    if (filters.isOverdue) {
      query.status = { $nin: ['Completed', 'Cancelled', 'Archived'] };
      query.dueDate = { $lt: new Date() };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { assignmentId: searchRegex },
        { description: searchRegex },
        { instructions: searchRegex },
      ];
    }

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 25));
    const skip = (page - 1) * limit;

    const sortField = filters.sortBy || 'createdAt';
    const sortDir = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortDir };

    const [total, documents] = await Promise.all([
      WorkAssignmentModel.countDocuments(query),
      WorkAssignmentModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'firstName lastName name email avatar role')
        .populate('assignedBy', 'firstName lastName name email avatar role')
        .populate('project', 'name key slug')
        .populate('workspace', 'name slug')
        .populate('organization', 'name slug')
        .populate('task', 'title taskKey status priority')
        .populate('githubRepositoryConnection'),
    ]);

    // Batch calculate total logged time for these assignments
    const docIds = documents.map((d) => d._id);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: docIds } } },
      { $group: { _id: '$assignment', totalSeconds: { $sum: '$duration' } } },
    ]);

    const timeMap = new Map<string, number>();
    timeEntries.forEach((t) => {
      timeMap.set(t._id.toString(), t.totalSeconds || 0);
    });

    const items = documents.map((doc) => doc.toPayload(timeMap.get(doc._id.toString()) || 0));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single assignment by Mongo ID or human-readable Assignment ID (WA-xxxx)
   */
  public static async getAssignmentById(idOrAssignmentId: string, organizationId?: string) {
    let query: any = {};
    if (Types.ObjectId.isValid(idOrAssignmentId)) {
      query._id = idOrAssignmentId;
    } else {
      query.assignmentId = idOrAssignmentId;
    }
    if (organizationId) {
      query.organization = organizationId;
    }

    const doc = await WorkAssignmentModel.findOne(query)
      .populate('assignedTo', 'firstName lastName name email avatar role')
      .populate('assignedBy', 'firstName lastName name email avatar role')
      .populate('project', 'name key slug')
      .populate('workspace', 'name slug')
      .populate('organization', 'name slug')
      .populate('task', 'title taskKey status priority')
      .populate('githubRepositoryConnection')
      .populate('review.reviewedBy', 'firstName lastName name email avatar')
      .populate('submissions.submittedBy', 'firstName lastName name email avatar role')
      .populate('submissions.review.reviewedBy', 'firstName lastName name email avatar role')
      .populate('proofOfWork.uploadedBy', 'firstName lastName name email avatar role')
      .populate('referenceImages.uploadedBy', 'firstName lastName name email avatar role')
      .populate('acceptanceCriteria.updatedBy', 'firstName lastName name email avatar role')
      .populate('reassignmentHistory.previousDeveloper', 'firstName lastName name email avatar')
      .populate('reassignmentHistory.newDeveloper', 'firstName lastName name email avatar')
      .populate('reassignmentHistory.changedBy', 'firstName lastName name email avatar')
      .populate('progressHistory.updatedBy', 'firstName lastName name email avatar')
      .populate('statusHistory.changedBy', 'firstName lastName name email avatar');

    if (!doc) return null;

    const timeEntries = await TimeEntry.find({ assignment: doc._id });
    const totalLoggedSeconds = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

    return doc.toPayload(totalLoggedSeconds);
  }

  /**
   * Update assignment details (title, description, instructions, priority, due date, etc.)
   */
  public static async updateAssignment(
    id: string,
    organizationId: string,
    updateData: UpdateAssignmentDTO,
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    if (updateData.title !== undefined) doc.title = updateData.title.trim();
    if (updateData.description !== undefined) doc.description = updateData.description;
    if (updateData.instructions !== undefined) doc.instructions = updateData.instructions;
    if (updateData.instructionSteps !== undefined) doc.instructionSteps = updateData.instructionSteps;
    if (updateData.expectedResult !== undefined) doc.expectedResult = updateData.expectedResult;
    if (updateData.referenceImages !== undefined) doc.referenceImages = updateData.referenceImages;
    if (updateData.acceptanceCriteria !== undefined) doc.acceptanceCriteria = updateData.acceptanceCriteria;
    if (updateData.priority !== undefined) doc.priority = updateData.priority;
    if (updateData.dueDate !== undefined) doc.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    if (updateData.estimatedHours !== undefined) doc.estimatedHours = updateData.estimatedHours;
    if (updateData.estimatedMinutes !== undefined) doc.estimatedMinutes = updateData.estimatedMinutes;
    if (updateData.attachments !== undefined) doc.attachments = updateData.attachments;
    if (updateData.taskId !== undefined) doc.task = updateData.taskId ? new Types.ObjectId(updateData.taskId) : null;
    if (updateData.githubRepositoryConnectionId !== undefined) {
      doc.githubRepositoryConnection = updateData.githubRepositoryConnectionId
        ? new Types.ObjectId(updateData.githubRepositoryConnectionId)
        : null;
    }
    if (updateData.githubIssue !== undefined) doc.githubIssue = updateData.githubIssue;
    if (updateData.githubPullRequest !== undefined) doc.githubPullRequest = updateData.githubPullRequest;

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'assignment_updated',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          updatedFields: Object.keys(updateData),
        },
      });
    } catch (err) {
      logger.error('Failed to log assignment updated activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:updated', populated);

    return populated;
  }

  /**
   * Reference Images: Add multiple reference images
   */
  public static async addReferenceImages(
    id: string,
    organizationId: string,
    images: Array<{
      id: string;
      fileName: string;
      originalName: string;
      fileUrl: string;
      publicId?: string;
      fileType?: string;
      mimeType?: string;
      fileSize?: number;
      caption?: string;
      description?: string;
      order?: number;
    }>,
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const currentOrder = doc.referenceImages.length;
    const formatted = images.map((img, idx) => ({
      id: img.id || `img_${Date.now()}_${idx}`,
      fileName: img.fileName,
      originalName: img.originalName || img.fileName,
      fileUrl: img.fileUrl,
      publicId: img.publicId,
      fileType: img.fileType || 'image',
      mimeType: img.mimeType || 'image/png',
      fileSize: img.fileSize || 0,
      caption: img.caption || '',
      description: img.description || '',
      order: img.order !== undefined ? img.order : currentOrder + idx,
      uploadedBy: currentUser._id || currentUser.id,
      uploadedAt: new Date(),
    }));

    doc.referenceImages.push(...formatted);
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'reference_image_added',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          addedCount: formatted.length,
        },
      });
    } catch (err) {
      logger.error('Failed to log reference image added activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:reference_image_added', populated);
    return populated;
  }

  /**
   * Reference Images: Update caption, description or order
   */
  public static async updateReferenceImage(
    id: string,
    organizationId: string,
    imageId: string,
    updates: { caption?: string; description?: string; order?: number },
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const target = doc.referenceImages.find((img) => img.id === imageId);
    if (!target) throw new Error('Reference image not found');

    if (updates.caption !== undefined) target.caption = updates.caption;
    if (updates.description !== undefined) target.description = updates.description;
    if (updates.order !== undefined) target.order = updates.order;

    await doc.save();
    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:reference_image_updated', populated);
    return populated;
  }

  /**
   * Reference Images: Reorder list of images
   */
  public static async reorderReferenceImages(
    id: string,
    organizationId: string,
    orderedImageIds: string[],
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const imageMap = new Map(doc.referenceImages.map((img) => [img.id, img]));
    const reordered: any[] = [];

    orderedImageIds.forEach((imgId, idx) => {
      const img = imageMap.get(imgId);
      if (img) {
        img.order = idx;
        reordered.push(img);
        imageMap.delete(imgId);
      }
    });

    // Add any remaining unmentioned images
    imageMap.forEach((img) => {
      img.order = reordered.length;
      reordered.push(img);
    });

    doc.referenceImages = reordered as any;
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:reference_image_updated', populated);
    return populated;
  }

  /**
   * Reference Images: Remove a reference image
   */
  public static async removeReferenceImage(
    id: string,
    organizationId: string,
    imageId: string,
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    doc.referenceImages = doc.referenceImages.filter((img) => img.id !== imageId);
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'reference_image_removed',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          removedImageId: imageId,
        },
      });
    } catch (err) {
      logger.error('Failed to log reference image removed activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:reference_image_removed', populated);
    return populated;
  }

  /**
   * Instruction Steps: Update steps
   */
  public static async updateInstructionSteps(
    id: string,
    organizationId: string,
    steps: IInstructionStep[],
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    doc.instructionSteps = steps;
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:updated', populated);
    return populated;
  }

  /**
   * Expected Result: Update expected results
   */
  public static async updateExpectedResult(
    id: string,
    organizationId: string,
    expectedResult: IExpectedResult,
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    doc.expectedResult = expectedResult;
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:updated', populated);
    return populated;
  }

  /**
   * Acceptance Criteria: Add a criterion
   */
  public static async addAcceptanceCriterion(
    id: string,
    organizationId: string,
    criterion: { title: string; description?: string; isRequired?: boolean },
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const newCriterion: any = {
      id: `crit_${Date.now()}`,
      title: criterion.title.trim(),
      description: criterion.description || '',
      isRequired: criterion.isRequired !== false,
      status: 'Not Completed',
      notes: '',
      updatedBy: null,
      updatedAt: null,
    };

    doc.acceptanceCriteria.push(newCriterion);
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:acceptance_criteria_updated', populated);
    return populated;
  }

  /**
   * Acceptance Criteria: Update criterion status & notes (developer or manager)
   */
  public static async updateAcceptanceCriterionStatus(
    id: string,
    organizationId: string,
    criterionId: string,
    status: AcceptanceCriterionStatus,
    notes?: string,
    currentUser?: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const target = doc.acceptanceCriteria.find((c) => c.id === criterionId);
    if (!target) throw new Error('Acceptance criterion not found');

    target.status = status;
    if (notes !== undefined) target.notes = notes;
    target.updatedBy = currentUser._id || currentUser.id;
    target.updatedAt = new Date();

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'acceptance_criteria_status_changed',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          criterionTitle: target.title,
          newStatus: status,
          notes,
        },
      });
    } catch (err) {
      logger.error('Failed to log criterion status change activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:acceptance_criteria_updated', populated);
    return populated;
  }

  /**
   * Acceptance Criteria: Remove criterion
   */
  public static async removeAcceptanceCriterion(
    id: string,
    organizationId: string,
    criterionId: string,
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    doc.acceptanceCriteria = doc.acceptanceCriteria.filter((c) => c.id !== criterionId);
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:acceptance_criteria_updated', populated);
    return populated;
  }

  /**
   * Proof of Work: Add proof / evidence item (screenshots, files, before/after, github refs)
   */
  public static async addProofOfWork(
    id: string,
    organizationId: string,
    proofData: {
      title: string;
      description?: string;
      category?: ProofCategory;
      fileUrl?: string;
      fileName?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
      githubUrl?: string;
      githubCommitSha?: string;
      githubPrUrl?: string;
      isBeforeAfter?: boolean;
      beforeAfterType?: 'before' | 'after';
      pairedProofId?: string;
    },
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const newProof: any = {
      id: `proof_${Date.now()}`,
      title: proofData.title.trim(),
      description: proofData.description || '',
      category: proofData.category || 'Progress Evidence',
      fileUrl: proofData.fileUrl || '',
      fileName: proofData.fileName || '',
      originalName: proofData.originalName || proofData.fileName || '',
      fileSize: proofData.fileSize || 0,
      mimeType: proofData.mimeType || '',
      githubUrl: proofData.githubUrl || '',
      githubCommitSha: proofData.githubCommitSha || '',
      githubPrUrl: proofData.githubPrUrl || '',
      isBeforeAfter: !!proofData.isBeforeAfter,
      beforeAfterType: proofData.beforeAfterType || null,
      pairedProofId: proofData.pairedProofId || null,
      uploadedBy: currentUser._id || currentUser.id,
      uploadedAt: new Date(),
    };

    doc.proofOfWork.push(newProof);
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'proof_of_work_added',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          proofTitle: proofData.title,
          category: proofData.category,
        },
      });
    } catch (err) {
      logger.error('Failed to log proof added activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:proof_added', populated);
    return populated;
  }

  /**
   * Proof of Work: Remove proof item
   */
  public static async removeProofOfWork(
    id: string,
    organizationId: string,
    proofId: string,
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    doc.proofOfWork = doc.proofOfWork.filter((p) => p.id !== proofId);
    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);
    broadcastAssignmentSocketEvent('assignment:proof_removed', populated);
    return populated;
  }

  /**
   * Update status (lifecycle transitions: Acknowledged, In Progress, Blocked, Submitted, Changes Requested, Completed, Cancelled, Archived)
   */
  public static async updateStatus(
    id: string,
    organizationId: string,
    newStatus: AssignmentStatus,
    reason: string = '',
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId })
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('project');

    if (!doc) throw new Error('Work Assignment not found');

    const previousStatus = doc.status;
    if (previousStatus === newStatus) return doc.toPayload();

    const now = new Date();
    doc.status = newStatus;

    if (newStatus === 'Acknowledged' && !doc.acknowledgedAt) {
      doc.acknowledgedAt = now;
    } else if (newStatus === 'In Progress' && !doc.startedAt) {
      doc.startedAt = now;
    } else if (newStatus === 'Blocked') {
      doc.blockedReason = reason;
    } else if (newStatus === 'Completed') {
      doc.completedAt = now;
      doc.completedBy = currentUser._id || currentUser.id;
      doc.progress = 100;
    } else if (newStatus === 'Cancelled') {
      doc.cancelledAt = now;
      doc.cancelledBy = currentUser._id || currentUser.id;
      doc.cancellationReason = reason;
    } else if (newStatus === 'Archived') {
      doc.archivedAt = now;
      doc.archivedBy = currentUser._id || currentUser.id;
    }

    doc.statusHistory.push({
      fromStatus: previousStatus,
      toStatus: newStatus,
      changedBy: currentUser._id || currentUser.id,
      reason,
      timestamp: now,
    });

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project._id ? doc.project._id.toString() : doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: newStatus === 'Completed' ? 'assignment_completed' : 'assignment_updated',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          fromStatus: previousStatus,
          toStatus: newStatus,
          reason,
        },
      });
    } catch (err) {
      logger.error('Failed to log assignment status activity:', err);
    }

    // In-App Notification based on status
    const targetUserId =
      (currentUser._id || currentUser.id).toString() === (doc.assignedTo as any)._id?.toString()
        ? (doc.assignedBy as any)._id?.toString()
        : (doc.assignedTo as any)._id?.toString();

    if (targetUserId) {
      try {
        await NotificationService.createNotification({
          recipient: targetUserId,
          actor: currentUser._id || currentUser.id,
          type: newStatus === 'Completed' ? 'Assignment Completed' : newStatus === 'Blocked' ? 'Assignment Blocked' : 'Task Updated',
          title: `Status: ${doc.assignmentId} → ${newStatus}`,
          message: `${currentUser.firstName || currentUser.name || 'User'} updated ${doc.assignmentId} to ${newStatus}${reason ? `: ${reason}` : ''}.`,
          entityType: 'WorkAssignment',
          entityId: doc._id.toString(),
          data: {
            assignmentId: doc.assignmentId,
            newStatus,
            previousStatus,
          },
          actionUrl: `/app/assignments/${doc.assignmentId}`,
        });
      } catch (err) {
        logger.error('Failed to create status change notification:', err);
      }
    }

    broadcastAssignmentSocketEvent('assignment:status_changed', populated);

    return populated;
  }

  /**
   * Update Progress (0-100%) with optional comment, attachments and proof evidence
   */
  public static async updateProgress(
    id: string,
    organizationId: string,
    percentage: number,
    comment: string = '',
    attachmentUrl?: string,
    attachmentName?: string,
    evidenceAttachments?: IProofOfWork[],
    currentUser?: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const cleanPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
    doc.progress = cleanPercentage;

    doc.progressHistory.push({
      percentage: cleanPercentage,
      comment: comment || '',
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      evidenceAttachments: evidenceAttachments || [],
      updatedBy: currentUser._id || currentUser.id,
      updatedAt: new Date(),
    });

    if (cleanPercentage > 0 && doc.status === 'Assigned') {
      doc.status = 'In Progress';
      if (!doc.startedAt) doc.startedAt = new Date();
    }

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'assignment_progress_updated',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          progress: cleanPercentage,
          comment,
        },
      });
    } catch (err) {
      logger.error('Failed to log assignment progress activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:progress_updated', populated);

    return populated;
  }

  /**
   * Reassign Work to another developer with history tracking and notifications
   */
  public static async reassign(
    id: string,
    organizationId: string,
    newDeveloperId: string,
    reason: string = '',
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId })
      .populate('assignedTo')
      .populate('project');

    if (!doc) throw new Error('Work Assignment not found');

    const previousDeveloperId = (doc.assignedTo as any)._id?.toString() || doc.assignedTo.toString();
    if (previousDeveloperId === newDeveloperId) {
      return doc.toPayload();
    }

    const newDeveloper = await User.findById(newDeveloperId);
    if (!newDeveloper) throw new Error('New developer not found');

    doc.assignedTo = new Types.ObjectId(newDeveloperId);
    doc.reassignmentHistory.push({
      previousDeveloper: new Types.ObjectId(previousDeveloperId),
      newDeveloper: new Types.ObjectId(newDeveloperId),
      changedBy: currentUser._id || currentUser.id,
      reason,
      timestamp: new Date(),
    });

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project._id ? doc.project._id.toString() : doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'assignment_reassigned',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          previousDeveloper: previousDeveloperId,
          newDeveloper: newDeveloperId,
          reason,
        },
      });
    } catch (err) {
      logger.error('Failed to log assignment reassign activity:', err);
    }

    // In-App & Email Notifications
    const managerName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'Manager';
    const projectName = (doc.project as any)?.name || 'Project';

    // 1. Notify new developer
    try {
      await NotificationService.createNotification({
        recipient: newDeveloperId,
        actor: currentUser._id || currentUser.id,
        type: 'Assignment Reassigned',
        title: `Work Reassigned to You: ${doc.assignmentId}`,
        message: `${managerName} assigned you "${doc.title}".`,
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        data: { assignmentId: doc.assignmentId, reason },
        actionUrl: `/app/assignments/${doc.assignmentId}`,
      });

      await EmailService.sendWorkReassignedEmail({
        recipientUserId: newDeveloperId,
        assignmentId: doc.assignmentId,
        assignmentDocId: doc._id.toString(),
        title: doc.title,
        projectName,
        changedByName: managerName,
        reason,
        isNewDeveloper: true,
      });
    } catch (err) {
      logger.error('Failed to notify new developer:', err);
    }

    // 2. Notify previous developer
    try {
      const newDevDisplayName = newDeveloper.firstName ? `${newDeveloper.firstName} ${newDeveloper.lastName}`.trim() : 'another team member';
      await NotificationService.createNotification({
        recipient: previousDeveloperId,
        actor: currentUser._id || currentUser.id,
        type: 'Assignment Reassigned',
        title: `Assignment Reassigned: ${doc.assignmentId}`,
        message: `${doc.assignmentId} was reassigned to ${newDevDisplayName}.`,
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        data: { assignmentId: doc.assignmentId, reason },
        actionUrl: `/app/assignments/${doc.assignmentId}`,
      });

      await EmailService.sendWorkReassignedEmail({
        recipientUserId: previousDeveloperId,
        assignmentId: doc.assignmentId,
        assignmentDocId: doc._id.toString(),
        title: doc.title,
        projectName,
        changedByName: managerName,
        reason,
        isNewDeveloper: false,
      });
    } catch (err) {
      logger.error('Failed to notify previous developer:', err);
    }

    broadcastAssignmentSocketEvent('assignment:reassigned', populated);

    return populated;
  }

  /**
   * Submit completed work for review (Developer submission) with versioning & criteria snapshot
   */
  public static async submitWork(
    id: string,
    organizationId: string,
    submissionData: {
      completionNote: string;
      githubPrUrl?: string;
      githubCommitSha?: string;
      githubBranch?: string;
      proofAttachments?: any[];
    },
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId })
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('project');

    if (!doc) throw new Error('Work Assignment not found');

    const previousStatus = doc.status;
    const nextVersion = (doc.submissions?.length || 0) + 1;
    const now = new Date();

    // Create snapshot of criteria statuses
    const criteriaSnapshot = (doc.acceptanceCriteria || []).map((c) => ({
      criterionId: c.id,
      title: c.title,
      status: c.status,
      notes: c.notes || '',
    }));

    const newSubmissionVersion: any = {
      id: `sub_${Date.now()}_v${nextVersion}`,
      version: nextVersion,
      submittedBy: currentUser._id || currentUser.id,
      submittedAt: now,
      completionNote: submissionData.completionNote || '',
      githubPrUrl: submissionData.githubPrUrl || '',
      githubCommitSha: submissionData.githubCommitSha || '',
      githubBranch: submissionData.githubBranch || '',
      proofAttachments: submissionData.proofAttachments || [],
      criteriaSnapshot,
      status: 'Submitted',
      review: undefined,
    };

    doc.submissions.push(newSubmissionVersion);

    // Update top-level legacy fields for backwards compatibility
    doc.status = 'Submitted';
    doc.progress = 100;
    doc.submission = {
      completionNote: submissionData.completionNote || '',
      submittedAt: now,
      githubPrUrl: submissionData.githubPrUrl || '',
      githubCommitSha: submissionData.githubCommitSha || '',
      proofAttachments: submissionData.proofAttachments || [],
    };

    doc.statusHistory.push({
      fromStatus: previousStatus,
      toStatus: 'Submitted',
      changedBy: currentUser._id || currentUser.id,
      reason: `Submitted deliverable version ${nextVersion}: ${submissionData.completionNote || 'Developer submitted work for review'}`,
      timestamp: now,
    });

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project._id ? doc.project._id.toString() : doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: 'assignment_submitted',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          version: nextVersion,
          completionNote: submissionData.completionNote,
          githubPrUrl: submissionData.githubPrUrl,
        },
      });
    } catch (err) {
      logger.error('Failed to log submission activity:', err);
    }

    // In-App Notification & Email to Manager (assignedBy)
    const managerId = (doc.assignedBy as any)._id?.toString() || doc.assignedBy.toString();
    const developerName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'Developer';
    const projectName = (doc.project as any)?.name || 'Project';

    try {
      await NotificationService.createNotification({
        recipient: managerId,
        actor: currentUser._id || currentUser.id,
        type: 'Assignment Submitted',
        title: `Work Submitted (v${nextVersion}): ${doc.assignmentId}`,
        message: `${developerName} submitted version ${nextVersion} for "${doc.title}" review.`,
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        data: {
          assignmentId: doc.assignmentId,
          githubPrUrl: submissionData.githubPrUrl,
          version: nextVersion,
        },
        actionUrl: `/app/assignments/${doc.assignmentId}`,
      });

      await EmailService.sendWorkSubmittedEmail({
        managerId,
        developerName,
        assignmentId: doc.assignmentId,
        assignmentDocId: doc._id.toString(),
        title: doc.title,
        projectName,
        completionNote: submissionData.completionNote,
        githubPrUrl: submissionData.githubPrUrl,
      });
    } catch (err) {
      logger.error('Failed to notify manager on work submission:', err);
    }

    broadcastAssignmentSocketEvent('assignment:submitted', populated);

    return populated;
  }

  /**
   * Review submission (Manager approval, changes requested, or reject)
   */
  public static async reviewSubmission(
    id: string,
    organizationId: string,
    reviewData: {
      decision: 'approve' | 'request_changes' | 'reject';
      reason?: string;
      completionNote?: string;
      feedbackAttachments?: any[];
      submissionId?: string;
    },
    currentUser: any
  ) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId })
      .populate('assignedTo')
      .populate('project');

    if (!doc) throw new Error('Work Assignment not found');

    const previousStatus = doc.status;
    const now = new Date();
    const isApprove = reviewData.decision === 'approve';

    if (isApprove) {
      doc.status = 'Completed';
      doc.completedAt = now;
      doc.completedBy = currentUser._id || currentUser.id;
      doc.progress = 100;
    } else {
      doc.status = 'Changes Requested';
    }

    // Update target submission version
    let targetSub = doc.submissions && doc.submissions.length > 0
      ? (reviewData.submissionId
          ? doc.submissions.find((s) => s.id === reviewData.submissionId)
          : doc.submissions[doc.submissions.length - 1])
      : null;

    if (targetSub) {
      targetSub.status = isApprove ? 'Approved' : reviewData.decision === 'reject' ? 'Rejected' : 'Changes Requested';
      targetSub.review = {
        reviewedBy: currentUser._id || currentUser.id,
        reviewedAt: now,
        decision: reviewData.decision,
        reason: reviewData.reason || '',
        feedbackAttachments: reviewData.feedbackAttachments || [],
        completionNote: reviewData.completionNote || '',
      };
    }

    // Legacy review field
    doc.review = {
      reviewedBy: currentUser._id || currentUser.id,
      reviewedAt: now,
      changesRequestedReason: !isApprove ? reviewData.reason || '' : undefined,
      completionNote: isApprove ? reviewData.completionNote || '' : undefined,
    };

    doc.statusHistory.push({
      fromStatus: previousStatus,
      toStatus: doc.status,
      changedBy: currentUser._id || currentUser.id,
      reason: isApprove ? reviewData.completionNote || 'Approved' : reviewData.reason || 'Changes Requested',
      timestamp: now,
    });

    await doc.save();

    const populated = await this.getAssignmentById(doc._id.toString(), organizationId);

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: doc.workspace.toString(),
        project: doc.project._id ? doc.project._id.toString() : doc.project.toString(),
        assignment: doc._id.toString(),
        user: currentUser._id || currentUser.id,
        action: isApprove ? 'assignment_completed' : 'assignment_changes_requested',
        entityType: 'WorkAssignment',
        entityId: doc._id.toString(),
        details: {
          assignmentId: doc.assignmentId,
          decision: reviewData.decision,
          reason: reviewData.reason,
        },
      });
    } catch (err) {
      logger.error('Failed to log review activity:', err);
    }

    // In-App Notification & Email to Developer
    const developerId = (doc.assignedTo as any)._id?.toString() || doc.assignedTo.toString();
    const managerName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'Manager';
    const projectName = (doc.project as any)?.name || 'Project';

    try {
      if (isApprove) {
        await NotificationService.createNotification({
          recipient: developerId,
          actor: currentUser._id || currentUser.id,
          type: 'Assignment Completed',
          title: `Assignment Approved: ${doc.assignmentId}`,
          message: `${managerName} accepted and completed "${doc.title}". Great work!`,
          entityType: 'WorkAssignment',
          entityId: doc._id.toString(),
          data: { assignmentId: doc.assignmentId },
          actionUrl: `/app/assignments/${doc.assignmentId}`,
        });
      } else {
        await NotificationService.createNotification({
          recipient: developerId,
          actor: currentUser._id || currentUser.id,
          type: 'Changes Requested',
          title: `Changes Requested: ${doc.assignmentId}`,
          message: `${managerName} requested modifications on "${doc.title}": ${reviewData.reason || 'See review notes'}.`,
          entityType: 'WorkAssignment',
          entityId: doc._id.toString(),
          data: { assignmentId: doc.assignmentId, reason: reviewData.reason },
          actionUrl: `/app/assignments/${doc.assignmentId}`,
        });

        await EmailService.sendChangesRequestedEmail({
          developerId,
          assignmentId: doc.assignmentId,
          assignmentDocId: doc._id.toString(),
          title: doc.title,
          projectName,
          managerName,
          reason: reviewData.reason || 'Revisions required before approval.',
        });
      }
    } catch (err) {
      logger.error('Failed to notify developer on review decision:', err);
    }

    broadcastAssignmentSocketEvent(
      isApprove ? 'assignment:completed' : 'assignment:changes_requested',
      populated
    );

    return populated;
  }

  /**
   * Delete work assignment
   */
  public static async deleteAssignment(id: string, organizationId: string, currentUser: any) {
    const doc = await WorkAssignmentModel.findOne({ _id: id, organization: organizationId });
    if (!doc) throw new Error('Work Assignment not found');

    const assignmentId = doc.assignmentId;
    const projectId = doc.project.toString();
    const workspaceId = doc.workspace.toString();

    await WorkAssignmentModel.deleteOne({ _id: id });

    // Clean up related time entries or unlink
    await TimeEntry.updateMany({ assignment: id }, { $unset: { assignment: 1 } });

    // Audit Log
    try {
      await ActivityService.logActivity({
        organization: organizationId,
        workspace: workspaceId,
        project: projectId,
        user: currentUser._id || currentUser.id,
        action: 'task_deleted',
        entityType: 'WorkAssignment',
        entityId: id,
        details: { assignmentId, title: doc.title },
      });
    } catch (err) {
      logger.error('Failed to log assignment delete activity:', err);
    }

    broadcastAssignmentSocketEvent('assignment:deleted', {
      id,
      assignmentId,
      projectId,
      workspaceId,
      organizationId,
    });

    return { success: true, message: `Assignment ${assignmentId} removed successfully` };
  }

  /**
   * Bulk Reassign multiple assignments to a new developer
   */
  public static async bulkReassign(
    organizationId: string,
    assignmentIds: string[],
    newDeveloperId: string,
    reason: string = '',
    currentUser: any
  ) {
    if (!assignmentIds || !assignmentIds.length) {
      throw new Error('No assignments selected for reassignment');
    }

    const newDev = await User.findById(newDeveloperId);
    if (!newDev) throw new Error('Target developer not found');

    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    const managerName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'Manager';
    const newDevName = `${newDev.firstName || ''} ${newDev.lastName || ''}`.trim() || newDev.email;

    for (const id of assignmentIds) {
      try {
        const query: any = { organization: organizationId };
        if (Types.ObjectId.isValid(id)) {
          query._id = new Types.ObjectId(id);
        } else {
          query.assignmentId = id;
        }

        const doc = await WorkAssignmentModel.findOne(query).populate('project', 'name');
        if (!doc) {
          failed.push({ id, reason: 'Assignment not found in organization' });
          continue;
        }

        const previousDevId = doc.assignedTo?.toString();

        // Push reassignment history
        doc.reassignmentHistory.push({
          previousDeveloper: new Types.ObjectId(previousDevId),
          newDeveloper: new Types.ObjectId(newDeveloperId),
          changedBy: new Types.ObjectId(currentUser._id || currentUser.id),
          reason: reason || 'Bulk reassignment by manager',
          timestamp: new Date(),
        });

        doc.assignedTo = new Types.ObjectId(newDeveloperId) as any;
        if (doc.status === 'Acknowledged') {
          doc.status = 'Assigned';
        }
        await doc.save();

        successful.push(doc.assignmentId || id);

        // Activity log
        try {
          await ActivityService.logActivity({
            organization: organizationId,
            workspace: doc.workspace.toString(),
            project: doc.project.toString(),
            user: currentUser._id || currentUser.id,
            action: 'task_assigned',
            entityType: 'WorkAssignment',
            entityId: doc._id.toString(),
            details: {
              assignmentId: doc.assignmentId,
              title: doc.title,
              reassignedFrom: previousDevId,
              reassignedTo: newDeveloperId,
              reason,
            },
          });
        } catch (err) {
          logger.error('Failed to log bulk reassign activity:', err);
        }

        // Send notification to new developer
        try {
          await NotificationService.createNotification({
            recipient: newDeveloperId,
            actor: currentUser._id || currentUser.id,
            type: 'Task Assigned',
            title: `Work Reassigned: ${doc.assignmentId}`,
            message: `${managerName} assigned you "${doc.title}": ${reason || 'Reassigned from teammate'}.`,
            entityType: 'WorkAssignment',
            entityId: doc._id.toString(),
            data: { assignmentId: doc.assignmentId },
            actionUrl: `/app/assignments/${doc.assignmentId}`,
          });

          // Email notification
          await EmailService.sendWorkReassignedEmail({
            recipientUserId: newDeveloperId,
            assignmentId: doc.assignmentId,
            assignmentDocId: doc._id.toString(),
            title: doc.title,
            projectName: (doc.project as any)?.name || 'Project',
            changedByName: managerName,
            reason: reason || 'Reassigned via manager triage',
            isNewDeveloper: true,
          });
        } catch (err) {
          logger.error('Failed to notify new developer on bulk reassignment:', err);
        }
      } catch (err: any) {
        failed.push({ id, reason: err.message || 'Reassignment error' });
      }
    }

    broadcastAssignmentSocketEvent('assignment:bulk_updated', {
      organizationId,
      action: 'reassign',
      successful,
      newDeveloperId,
    });

    return {
      successful,
      failed,
      message: `Successfully reassigned ${successful.length} assignments${failed.length ? `, ${failed.length} failed` : ''}`,
    };
  }

  /**
   * Bulk Update Priority
   */
  public static async bulkUpdatePriority(
    organizationId: string,
    assignmentIds: string[],
    priority: AssignmentPriority,
    currentUser: any
  ) {
    if (!['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      throw new Error('Invalid priority value');
    }

    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of assignmentIds) {
      try {
        const query: any = { organization: organizationId };
        if (Types.ObjectId.isValid(id)) query._id = new Types.ObjectId(id);
        else query.assignmentId = id;

        const doc = await WorkAssignmentModel.findOne(query);
        if (!doc) {
          failed.push({ id, reason: 'Assignment not found' });
          continue;
        }

        const oldPriority = doc.priority;
        doc.priority = priority;
        await doc.save();

        successful.push(doc.assignmentId || id);

        try {
          await ActivityService.logActivity({
            organization: organizationId,
            workspace: doc.workspace.toString(),
            project: doc.project.toString(),
            user: currentUser._id || currentUser.id,
            action: 'task_updated',
            entityType: 'WorkAssignment',
            entityId: doc._id.toString(),
            details: {
              assignmentId: doc.assignmentId,
              title: doc.title,
              oldPriority,
              newPriority: priority,
            },
          });
        } catch (err) {
          logger.error('Failed to log bulk priority activity:', err);
        }
      } catch (err: any) {
        failed.push({ id, reason: err.message || 'Priority update error' });
      }
    }

    broadcastAssignmentSocketEvent('assignment:bulk_updated', {
      organizationId,
      action: 'priority_change',
      successful,
      priority,
    });

    return {
      successful,
      failed,
      message: `Updated priority to ${priority} on ${successful.length} assignments${failed.length ? `, ${failed.length} failed` : ''}`,
    };
  }

  /**
   * Bulk Update Status (Validates state machine transitions)
   */
  public static async bulkUpdateStatus(
    organizationId: string,
    assignmentIds: string[],
    targetStatus: AssignmentStatus,
    reason: string = '',
    currentUser: any
  ) {
    const validStatuses = [
      'Assigned',
      'Acknowledged',
      'In Progress',
      'Blocked',
      'Submitted',
      'Changes Requested',
      'Completed',
      'Cancelled',
      'Archived',
    ];
    if (!validStatuses.includes(targetStatus)) {
      throw new Error(`Invalid status: ${targetStatus}`);
    }

    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of assignmentIds) {
      try {
        const query: any = { organization: organizationId };
        if (Types.ObjectId.isValid(id)) query._id = new Types.ObjectId(id);
        else query.assignmentId = id;

        const doc = await WorkAssignmentModel.findOne(query);
        if (!doc) {
          failed.push({ id, reason: 'Assignment not found' });
          continue;
        }

        const fromStatus = doc.status;

        // Apply state machine validations
        if (fromStatus === targetStatus) {
          successful.push(doc.assignmentId || id);
          continue;
        }

        // Terminal state protections
        if (['Completed', 'Cancelled', 'Archived'].includes(fromStatus) && !['Cancelled', 'Archived'].includes(targetStatus)) {
          failed.push({
            id: doc.assignmentId || id,
            reason: `Cannot transition from terminal state ${fromStatus} to ${targetStatus}`,
          });
          continue;
        }

        doc.statusHistory.push({
          fromStatus,
          toStatus: targetStatus,
          changedBy: new Types.ObjectId(currentUser._id || currentUser.id),
          reason: reason || 'Bulk status change by manager',
          timestamp: new Date(),
        });

        doc.status = targetStatus;
        if (targetStatus === 'In Progress' && !doc.startedAt) {
          doc.startedAt = new Date();
        } else if (targetStatus === 'Completed') {
          doc.completedAt = new Date();
          doc.completedBy = new Types.ObjectId(currentUser._id || currentUser.id) as any;
          doc.progress = 100;
        } else if (targetStatus === 'Cancelled') {
          doc.cancelledAt = new Date();
          doc.cancelledBy = new Types.ObjectId(currentUser._id || currentUser.id) as any;
          doc.cancellationReason = reason;
        } else if (targetStatus === 'Archived') {
          doc.archivedAt = new Date();
          doc.archivedBy = new Types.ObjectId(currentUser._id || currentUser.id) as any;
        }

        await doc.save();
        successful.push(doc.assignmentId || id);

        try {
          await ActivityService.logActivity({
            organization: organizationId,
            workspace: doc.workspace.toString(),
            project: doc.project.toString(),
            user: currentUser._id || currentUser.id,
            action: 'task_status_changed',
            entityType: 'WorkAssignment',
            entityId: doc._id.toString(),
            details: {
              assignmentId: doc.assignmentId,
              title: doc.title,
              fromStatus,
              toStatus: targetStatus,
              reason,
            },
          });
        } catch (err) {
          logger.error('Failed to log bulk status activity:', err);
        }
      } catch (err: any) {
        failed.push({ id, reason: err.message || 'Status update error' });
      }
    }

    broadcastAssignmentSocketEvent('assignment:bulk_updated', {
      organizationId,
      action: 'status_change',
      successful,
      targetStatus,
    });

    return {
      successful,
      failed,
      message: `Updated status to ${targetStatus} on ${successful.length} assignments${failed.length ? `, ${failed.length} failed` : ''}`,
    };
  }

  /**
   * Bulk Archive Assignments
   */
  public static async bulkArchive(organizationId: string, assignmentIds: string[], currentUser: any) {
    return this.bulkUpdateStatus(organizationId, assignmentIds, 'Archived', 'Bulk archived by manager', currentUser);
  }
}
