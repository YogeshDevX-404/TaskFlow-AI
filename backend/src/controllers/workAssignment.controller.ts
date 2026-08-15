import { Request, Response } from 'express';
import { WorkAssignmentService } from '../services/workAssignment.service';
import { WorkAssignmentMonitoringService } from '../services/workAssignmentMonitoring.service';
import { WorkAssignmentReportsService } from '../services/workAssignmentReports.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { logger } from '../utils/logger';

export class WorkAssignmentController {
  private static extractOrgId(req: Request): string {
    const headerVal = req.headers['x-organization-id'] || req.headers['X-Organization-Id'] || req.headers['x-org-id'];
    if (headerVal) return Array.isArray(headerVal) ? headerVal[0] : headerVal;

    return (
      (req.query.organizationId as string) ||
      (req.query.orgId as string) ||
      req.params.organizationId ||
      (req.body && (req.body.organizationId || req.body.orgId)) ||
      ''
    );
  }

  /**
   * POST /api/v1/work-assignments
   * Create a new work assignment
   */
  public static async createAssignment(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const organizationId = WorkAssignmentController.extractOrgId(req);
      const {
        workspaceId,
        projectId,
        taskId,
        assignedToId,
        title,
        description,
        instructions,
        instructionSteps,
        expectedResult,
        referenceImages,
        acceptanceCriteria,
        priority,
        dueDate,
        estimatedHours,
        estimatedMinutes,
        attachments,
        githubRepositoryConnectionId,
        githubIssue,
        githubPullRequest,
      } = req.body;

      if (!title || !title.trim()) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Assignment title is required');
      }
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }
      if (!workspaceId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Workspace ID is required');
      }
      if (!projectId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Project ID is required');
      }
      if (!assignedToId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Assigned developer is required');
      }

      const result = await WorkAssignmentService.createAssignment(
        {
          organizationId,
          workspaceId,
          projectId,
          taskId,
          assignedToId,
          title,
          description,
          instructions,
          instructionSteps,
          expectedResult,
          referenceImages,
          acceptanceCriteria,
          priority,
          dueDate,
          estimatedHours: Number(estimatedHours) || 0,
          estimatedMinutes: Number(estimatedMinutes) || 0,
          attachments,
          githubRepositoryConnectionId,
          githubIssue,
          githubPullRequest,
        },
        currentUser
      );

      return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Work assignment created successfully', result);
    } catch (err: any) {
      logger.error('Error in createAssignment controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to create work assignment');
    }
  }

  /**
   * GET /api/v1/work-assignments
   * List assignments with filtering, sorting, pagination
   */
  public static async getAssignments(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const {
        workspaceId,
        projectId,
        assignedToId,
        assignedById,
        status,
        priority,
        isOverdue,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const filters: any = {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        assignedToId: assignedToId as string,
        assignedById: assignedById as string,
        isOverdue: isOverdue === 'true',
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 25,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      if (status) {
        filters.status = typeof status === 'string' && status.includes(',') ? status.split(',') : (status as string);
      }

      if (priority) {
        filters.priority = typeof priority === 'string' && priority.includes(',') ? priority.split(',') : (priority as string);
      }

      const result = await WorkAssignmentService.getAssignments(organizationId, filters);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'Assignments fetched successfully',
        result.items,
        {
          totalItems: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
          hasNextPage: result.pagination.page < result.pagination.totalPages,
          hasPrevPage: result.pagination.page > 1,
        }
      );
    } catch (err: any) {
      logger.error('Error in getAssignments controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch assignments');
    }
  }

  /**
   * GET /api/v1/work-assignments/my
   * Get assignments specifically assigned to current developer
   */
  public static async getMyAssignments(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { status, priority, isOverdue, search, page, limit, sortBy, sortOrder } = req.query;

      const filters: any = {
        assignedToId: currentUser.id,
        isOverdue: isOverdue === 'true',
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 25,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      if (status) {
        filters.status = typeof status === 'string' && status.includes(',') ? status.split(',') : (status as string);
      }

      if (priority) {
        filters.priority = typeof priority === 'string' && priority.includes(',') ? priority.split(',') : (priority as string);
      }

      const result = await WorkAssignmentService.getAssignments(organizationId, filters);
      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        'My assignments fetched successfully',
        result.items,
        {
          totalItems: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
          hasNextPage: result.pagination.page < result.pagination.totalPages,
          hasPrevPage: result.pagination.page > 1,
        }
      );
    } catch (err: any) {
      logger.error('Error in getMyAssignments controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch assignments');
    }
  }

  /**
   * GET /api/v1/work-assignments/developer-workload/:developerId
   * Workload inspection helper before dispatching tasks
   */
  public static async getDeveloperWorkload(req: Request, res: Response): Promise<Response> {
    try {
      const { developerId } = req.params;
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const workload = await WorkAssignmentService.getDeveloperWorkload(developerId, organizationId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Developer workload retrieved', workload);
    } catch (err: any) {
      logger.error('Error in getDeveloperWorkload controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch developer workload');
    }
  }

  /**
   * GET /api/v1/work-assignments/:id
   * Get single assignment
   */
  public static async getAssignmentById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const organizationId = WorkAssignmentController.extractOrgId(req);

      const assignment = await WorkAssignmentService.getAssignmentById(id, organizationId || undefined);
      if (!assignment) {
        return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Work assignment not found');
      }

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Assignment retrieved', assignment);
    } catch (err: any) {
      logger.error('Error in getAssignmentById controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch assignment');
    }
  }

  /**
   * PUT /api/v1/work-assignments/:id
   * Update assignment attributes
   */
  public static async updateAssignment(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateAssignment(id, organizationId, req.body, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Assignment updated successfully', result);
    } catch (err: any) {
      logger.error('Error in updateAssignment controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update assignment');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/reference-images
   * Add reference images
   */
  public static async addReferenceImages(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { images } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!Array.isArray(images) || images.length === 0) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Images array is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.addReferenceImages(id, orgId, images, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Reference images added successfully', result);
    } catch (err: any) {
      logger.error('Error in addReferenceImages controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to add reference images');
    }
  }

  /**
   * PATCH /api/v1/work-assignments/:id/reference-images/:imageId
   * Update reference image caption, description, order
   */
  public static async updateReferenceImage(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id, imageId } = req.params;
      const { caption, description, order } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateReferenceImage(id, orgId, imageId, { caption, description, order }, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Reference image updated', result);
    } catch (err: any) {
      logger.error('Error in updateReferenceImage controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update reference image');
    }
  }

  /**
   * PUT /api/v1/work-assignments/:id/reference-images/reorder
   * Reorder reference images
   */
  public static async reorderReferenceImages(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { orderedImageIds } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!Array.isArray(orderedImageIds)) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'orderedImageIds array is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.reorderReferenceImages(id, orgId, orderedImageIds, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Reference images reordered', result);
    } catch (err: any) {
      logger.error('Error in reorderReferenceImages controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to reorder reference images');
    }
  }

  /**
   * DELETE /api/v1/work-assignments/:id/reference-images/:imageId
   */
  public static async removeReferenceImage(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id, imageId } = req.params;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.removeReferenceImage(id, orgId, imageId, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Reference image removed', result);
    } catch (err: any) {
      logger.error('Error in removeReferenceImage controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to remove reference image');
    }
  }

  /**
   * PUT /api/v1/work-assignments/:id/instruction-steps
   */
  public static async updateInstructionSteps(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { steps } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateInstructionSteps(id, orgId, steps || [], currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Instruction steps updated', result);
    } catch (err: any) {
      logger.error('Error in updateInstructionSteps controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update instruction steps');
    }
  }

  /**
   * PUT /api/v1/work-assignments/:id/expected-result
   */
  public static async updateExpectedResult(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { expectedResult } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateExpectedResult(id, orgId, expectedResult, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Expected result updated', result);
    } catch (err: any) {
      logger.error('Error in updateExpectedResult controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update expected result');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/acceptance-criteria
   */
  public static async addAcceptanceCriterion(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { title, description, isRequired } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!title || !title.trim()) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Criterion title is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.addAcceptanceCriterion(id, orgId, { title, description, isRequired }, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Acceptance criterion added', result);
    } catch (err: any) {
      logger.error('Error in addAcceptanceCriterion controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to add acceptance criterion');
    }
  }

  /**
   * PATCH /api/v1/work-assignments/:id/acceptance-criteria/:criterionId
   */
  public static async updateAcceptanceCriterionStatus(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id, criterionId } = req.params;
      const { status, notes } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!status) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Criterion status is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateAcceptanceCriterionStatus(id, orgId, criterionId, status, notes, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Acceptance criterion updated', result);
    } catch (err: any) {
      logger.error('Error in updateAcceptanceCriterionStatus controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update acceptance criterion');
    }
  }

  /**
   * DELETE /api/v1/work-assignments/:id/acceptance-criteria/:criterionId
   */
  public static async removeAcceptanceCriterion(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id, criterionId } = req.params;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.removeAcceptanceCriterion(id, orgId, criterionId, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Acceptance criterion removed', result);
    } catch (err: any) {
      logger.error('Error in removeAcceptanceCriterion controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to remove acceptance criterion');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/proof-of-work
   */
  public static async addProofOfWork(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const proofData = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!proofData.title || !proofData.title.trim()) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Proof title is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.addProofOfWork(id, orgId, proofData, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Proof of work recorded', result);
    } catch (err: any) {
      logger.error('Error in addProofOfWork controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to add proof of work');
    }
  }

  /**
   * DELETE /api/v1/work-assignments/:id/proof-of-work/:proofId
   */
  public static async removeProofOfWork(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id, proofId } = req.params;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.removeProofOfWork(id, orgId, proofId, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Proof of work removed', result);
    } catch (err: any) {
      logger.error('Error in removeProofOfWork controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to remove proof of work');
    }
  }

  /**
   * PATCH /api/v1/work-assignments/:id/status
   * Update assignment status transition
   */
  public static async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { status, reason } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!status) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Status is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateStatus(id, orgId, status, reason, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, `Status updated to ${status}`, result);
    } catch (err: any) {
      logger.error('Error in updateStatus controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update status');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/progress
   * Update assignment progress percentage and notes
   */
  public static async updateProgress(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { percentage, comment, attachmentUrl, attachmentName, evidenceAttachments } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (percentage === undefined || percentage === null) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Progress percentage is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.updateProgress(
        id,
        orgId,
        Number(percentage),
        comment,
        attachmentUrl,
        attachmentName,
        evidenceAttachments,
        currentUser
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Progress updated successfully', result);
    } catch (err: any) {
      logger.error('Error in updateProgress controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update progress');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/reassign
   * Reassign work to another developer
   */
  public static async reassign(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { newDeveloperId, reason } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);

      if (!newDeveloperId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'New developer ID is required');
      }
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.reassign(id, orgId, newDeveloperId, reason, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Assignment reassigned successfully', result);
    } catch (err: any) {
      logger.error('Error in reassign controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to reassign work');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/submit
   * Developer submits work for review
   */
  public static async submitWork(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { completionNote, githubPrUrl, githubCommitSha, githubBranch, proofAttachments } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.submitWork(
        id,
        orgId,
        {
          completionNote,
          githubPrUrl,
          githubCommitSha,
          githubBranch,
          proofAttachments,
        },
        currentUser
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Work submitted for review', result);
    } catch (err: any) {
      logger.error('Error in submitWork controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to submit work');
    }
  }

  /**
   * POST /api/v1/work-assignments/:id/review
   * Manager reviews submission (approve, request changes, or reject)
   */
  public static async reviewSubmission(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const { decision, reason, completionNote, feedbackAttachments, submissionId } = req.body;
      const orgId = WorkAssignmentController.extractOrgId(req);
      if (!orgId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      if (!decision || !['approve', 'request_changes', 'reject'].includes(decision)) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Valid decision ("approve", "request_changes", or "reject") is required'
        );
      }

      if (decision !== 'approve' && (!reason || !reason.trim())) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Feedback reason is required when requesting changes or rejecting'
        );
      }

      const result = await WorkAssignmentService.reviewSubmission(
        id,
        orgId,
        { decision, reason, completionNote, feedbackAttachments, submissionId },
        currentUser
      );

      return sendSuccessResponse(
        res,
        HTTP_STATUS.OK,
        decision === 'approve' ? 'Assignment approved and completed' : 'Changes requested',
        result
      );
    } catch (err: any) {
      logger.error('Error in reviewSubmission controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to review submission');
    }
  }

  /**
   * DELETE /api/v1/work-assignments/:id
   */
  public static async deleteAssignment(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
      }

      const { id } = req.params;
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const result = await WorkAssignmentService.deleteAssignment(id, organizationId, currentUser);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Work assignment deleted', result);
    } catch (err: any) {
      logger.error('Error in deleteAssignment controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to delete assignment');
    }
  }

  /**
   * GET /api/v1/work-assignments/dashboard/summary
   * Executive KPI metrics and status distribution
   */
  public static async getDashboardSummary(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      console.log('[DEBUG] getDashboardSummary extracted organizationId:', organizationId, 'headers:', req.headers);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { workspaceId, projectId, assignedToId, priority, dateRange, dateFrom, dateTo, repositoryName } = req.query;

      let calculatedDateFrom = dateFrom as string;
      let calculatedDateTo = dateTo as string;

      if (dateRange === 'thisMonth') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        calculatedDateFrom = startOfMonth.toISOString();
        calculatedDateTo = now.toISOString();
      }

      const summary = await WorkAssignmentMonitoringService.getDashboardSummary(organizationId, {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        assignedToId: assignedToId as string,
        priority: priority as string,
        dateFrom: calculatedDateFrom,
        dateTo: calculatedDateTo,
        repositoryName: repositoryName as string,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Dashboard summary retrieved', summary);
    } catch (err: any) {
      logger.error('Error in getDashboardSummary controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get dashboard summary');
    }
  }

  /**
   * GET /api/v1/work-assignments/dashboard/developers
   * Developer monitoring stats and workload health
   */
  public static async getDeveloperMonitoringStats(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { workspaceId, projectId } = req.query;

      const devStats = await WorkAssignmentMonitoringService.getDeveloperMonitoringStats(organizationId, {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Developer monitoring stats retrieved', devStats);
    } catch (err: any) {
      logger.error('Error in getDeveloperMonitoringStats controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get developer stats');
    }
  }

  /**
   * GET /api/v1/work-assignments/dashboard/projects
   * Project progress breakdown
   */
  public static async getProjectMonitoringStats(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { workspaceId, projectId } = req.query;

      const projectStats = await WorkAssignmentMonitoringService.getProjectMonitoringStats(organizationId, {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Project monitoring stats retrieved', projectStats);
    } catch (err: any) {
      logger.error('Error in getProjectMonitoringStats controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get project stats');
    }
  }

  /**
   * GET /api/v1/work-assignments/dashboard/review-queue
   * All submitted assignments awaiting manager review
   */
  public static async getReviewQueue(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { workspaceId, projectId } = req.query;

      const queue = await WorkAssignmentMonitoringService.getReviewQueue(organizationId, {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Review queue retrieved', queue);
    } catch (err: any) {
      logger.error('Error in getReviewQueue controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get review queue');
    }
  }

  /**
   * GET /api/v1/work-assignments/dashboard/attention-needed
   * Overdue, blocked, and due soon assignments triage
   */
  public static async getAttentionNeeded(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { workspaceId, projectId } = req.query;

      const attentionList = await WorkAssignmentMonitoringService.getAttentionNeeded(organizationId, {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Attention needed items retrieved', attentionList);
    } catch (err: any) {
      logger.error('Error in getAttentionNeeded controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get attention list');
    }
  }

  /**
   * GET /api/v1/work-assignments/dashboard/timeline
   * Work assignment activity timeline
   */
  public static async getAssignmentTimeline(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');
      }

      const { workspaceId, projectId, limit } = req.query;

      const timeline = await WorkAssignmentMonitoringService.getAssignmentTimeline(organizationId, {
        workspaceId: workspaceId as string,
        projectId: projectId as string,
        limit: limit ? Number(limit) : 30,
      });

      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Assignment timeline retrieved', timeline);
    } catch (err: any) {
      logger.error('Error in getAssignmentTimeline controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get timeline');
    }
  }

  /**
   * POST /api/v1/work-assignments/bulk/reassign
   */
  public static async bulkReassign(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');

      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { assignmentIds, newDeveloperId, reason } = req.body;
      if (!assignmentIds || !Array.isArray(assignmentIds) || !assignmentIds.length) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'assignmentIds array is required');
      }
      if (!newDeveloperId) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'newDeveloperId is required');
      }

      const result = await WorkAssignmentService.bulkReassign(
        organizationId,
        assignmentIds,
        newDeveloperId,
        reason,
        currentUser
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, result.message, result);
    } catch (err: any) {
      logger.error('Error in bulkReassign controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to reassign assignments');
    }
  }

  /**
   * POST /api/v1/work-assignments/bulk/priority
   */
  public static async bulkUpdatePriority(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');

      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { assignmentIds, priority } = req.body;
      if (!assignmentIds || !Array.isArray(assignmentIds) || !assignmentIds.length) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'assignmentIds array is required');
      }
      if (!priority) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'priority is required');
      }

      const result = await WorkAssignmentService.bulkUpdatePriority(
        organizationId,
        assignmentIds,
        priority,
        currentUser
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, result.message, result);
    } catch (err: any) {
      logger.error('Error in bulkUpdatePriority controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update priority');
    }
  }

  /**
   * POST /api/v1/work-assignments/bulk/status
   */
  public static async bulkUpdateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');

      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { assignmentIds, status, reason } = req.body;
      if (!assignmentIds || !Array.isArray(assignmentIds) || !assignmentIds.length) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'assignmentIds array is required');
      }
      if (!status) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'status is required');
      }

      const result = await WorkAssignmentService.bulkUpdateStatus(
        organizationId,
        assignmentIds,
        status,
        reason,
        currentUser
      );

      return sendSuccessResponse(res, HTTP_STATUS.OK, result.message, result);
    } catch (err: any) {
      logger.error('Error in bulkUpdateStatus controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to update status');
    }
  }

  /**
   * POST /api/v1/work-assignments/bulk/archive
   */
  public static async bulkArchive(req: Request, res: Response): Promise<Response> {
    try {
      const currentUser = req.user;
      if (!currentUser) return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');

      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { assignmentIds } = req.body;
      if (!assignmentIds || !Array.isArray(assignmentIds) || !assignmentIds.length) {
        return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'assignmentIds array is required');
      }

      const result = await WorkAssignmentService.bulkArchive(organizationId, assignmentIds, currentUser);

      return sendSuccessResponse(res, HTTP_STATUS.OK, result.message, result);
    } catch (err: any) {
      logger.error('Error in bulkArchive controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to archive assignments');
    }
  }

  /**
   * GET /api/v1/work-assignments/reports/:reportType
   */
  public static async getReports(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { reportType } = req.params;
      const filters = {
        workspaceId: req.query.workspaceId as string,
        projectId: req.query.projectId as string,
        assignedToId: req.query.assignedToId as string,
        priority: req.query.priority as string,
        status: req.query.status as string,
        dateRangePreset: req.query.dateRangePreset as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      let data: any;
      switch (reportType) {
        case 'summary':
          data = await WorkAssignmentReportsService.getSummaryReport(organizationId, filters);
          break;
        case 'developers':
          data = await WorkAssignmentReportsService.getDeveloperWorkReport(organizationId, filters);
          break;
        case 'projects':
          data = await WorkAssignmentReportsService.getProjectWorkReport(organizationId, filters);
          break;
        case 'overdue':
          data = await WorkAssignmentReportsService.getOverdueReport(organizationId, filters);
          break;
        case 'submissions':
          data = await WorkAssignmentReportsService.getSubmissionReport(organizationId, filters);
          break;
        case 'workload':
          data = await WorkAssignmentReportsService.getWorkloadReport(organizationId, filters);
          break;
        default:
          return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, `Invalid report type: ${reportType}`);
      }

      return sendSuccessResponse(res, HTTP_STATUS.OK, `${reportType} report retrieved`, data);
    } catch (err: any) {
      logger.error('Error in getReports controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to generate report');
    }
  }

  /**
   * GET /api/v1/work-assignments/export
   */
  public static async exportAssignments(req: Request, res: Response) {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const filters = {
        workspaceId: req.query.workspaceId as string,
        projectId: req.query.projectId as string,
        assignedToId: req.query.assignedToId as string,
        priority: req.query.priority as string,
        status: req.query.status as string,
        dateRangePreset: req.query.dateRangePreset as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      const csvContent = await WorkAssignmentReportsService.exportAssignmentsCSV(organizationId, filters);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=work-assignments-${Date.now()}.csv`);
      return res.status(200).send(csvContent);
    } catch (err: any) {
      logger.error('Error in exportAssignments controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to export assignments');
    }
  }

  /**
   * GET /api/v1/work-assignments/developers/:developerId/details
   */
  public static async getDeveloperDetails(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { developerId } = req.params;
      if (!developerId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Developer ID is required');

      const data = await WorkAssignmentReportsService.getDeveloperDetailedDrilldown(developerId, organizationId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Developer details retrieved', data);
    } catch (err: any) {
      logger.error('Error in getDeveloperDetails controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get developer details');
    }
  }

  /**
   * GET /api/v1/work-assignments/projects/:projectId/details
   */
  public static async getProjectDetails(req: Request, res: Response): Promise<Response> {
    try {
      const organizationId = WorkAssignmentController.extractOrgId(req);
      if (!organizationId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Organization ID is required');

      const { projectId } = req.params;
      if (!projectId) return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Project ID is required');

      const data = await WorkAssignmentReportsService.getProjectDetailedDrilldown(projectId, organizationId);
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Project details retrieved', data);
    } catch (err: any) {
      logger.error('Error in getProjectDetails controller:', err);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Failed to get project details');
    }
  }
}
