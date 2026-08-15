import { axiosInstance } from './axiosInstance';
import {
  WorkAssignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  AssignmentFilterParams,
  DeveloperWorkloadStats,
  AssignmentStatus,
  IReferenceImage,
  IInstructionStep,
  IExpectedResult,
  IAcceptanceCriterion,
  IProofOfWork,
  IAssignmentDashboardSummary,
  IDeveloperMonitoringStats,
  IProjectMonitoringStats,
  IAttentionNeededAssignment,
  IMonitoringFilterParams,
} from '../../types/workAssignment';
import { AcceptanceCriterionStatus } from '../../config/assignmentConfig';

export interface GetAssignmentsResponse {
  items: WorkAssignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class WorkAssignmentService {
  /**
   * Create a new work assignment
   */
  public static async createAssignment(data: CreateAssignmentInput): Promise<WorkAssignment> {
    const response = await axiosInstance.post('/work-assignments', data);
    return response.data.data;
  }

  /**
   * List assignments with filters & pagination
   */
  public static async getAssignments(params: AssignmentFilterParams = {}): Promise<GetAssignmentsResponse> {
    const response = await axiosInstance.get('/work-assignments', { params });
    return response.data.data;
  }

  /**
   * Get assignments assigned to current developer
   */
  public static async getMyAssignments(params: AssignmentFilterParams = {}): Promise<GetAssignmentsResponse> {
    const response = await axiosInstance.get('/work-assignments/my', { params });
    return response.data.data;
  }

  /**
   * Get developer workload metrics
   */
  public static async getDeveloperWorkload(
    developerId: string,
    organizationId?: string
  ): Promise<DeveloperWorkloadStats> {
    const response = await axiosInstance.get(`/work-assignments/developer-workload/${developerId}`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Get single assignment by ID or key (e.g. WA-1001)
   */
  public static async getAssignmentById(idOrKey: string, organizationId?: string): Promise<WorkAssignment> {
    const response = await axiosInstance.get(`/work-assignments/${idOrKey}`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Update assignment details
   */
  public static async updateAssignment(id: string, data: UpdateAssignmentInput): Promise<WorkAssignment> {
    const response = await axiosInstance.put(`/work-assignments/${id}`, data);
    return response.data.data;
  }

  /**
   * Reference Images: Add reference images
   */
  public static async addReferenceImages(
    id: string,
    images: Array<Partial<IReferenceImage>>,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/reference-images`, {
      images,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Reference Images: Update reference image caption, description or order
   */
  public static async updateReferenceImage(
    id: string,
    imageId: string,
    updates: { caption?: string; description?: string; order?: number },
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.patch(`/work-assignments/${id}/reference-images/${imageId}`, {
      ...updates,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Reference Images: Reorder reference images
   */
  public static async reorderReferenceImages(
    id: string,
    orderedImageIds: string[],
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.put(`/work-assignments/${id}/reference-images/reorder`, {
      orderedImageIds,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Reference Images: Remove reference image
   */
  public static async removeReferenceImage(
    id: string,
    imageId: string,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.delete(`/work-assignments/${id}/reference-images/${imageId}`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Instruction Steps: Update steps
   */
  public static async updateInstructionSteps(
    id: string,
    steps: IInstructionStep[],
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.put(`/work-assignments/${id}/instruction-steps`, {
      steps,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Expected Result: Update expected result specification
   */
  public static async updateExpectedResult(
    id: string,
    expectedResult: IExpectedResult,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.put(`/work-assignments/${id}/expected-result`, {
      expectedResult,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Acceptance Criteria: Add criterion
   */
  public static async addAcceptanceCriterion(
    id: string,
    criterion: { title: string; description?: string; isRequired?: boolean },
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/acceptance-criteria`, {
      ...criterion,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Acceptance Criteria: Update criterion status & notes
   */
  public static async updateAcceptanceCriterionStatus(
    id: string,
    criterionId: string,
    status: AcceptanceCriterionStatus,
    notes?: string,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.patch(`/work-assignments/${id}/acceptance-criteria/${criterionId}`, {
      status,
      notes,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Acceptance Criteria: Remove criterion
   */
  public static async removeAcceptanceCriterion(
    id: string,
    criterionId: string,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.delete(`/work-assignments/${id}/acceptance-criteria/${criterionId}`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Proof of Work: Add proof item
   */
  public static async addProofOfWork(
    id: string,
    proofData: Partial<IProofOfWork>,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/proof-of-work`, {
      ...proofData,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Proof of Work: Remove proof item
   */
  public static async removeProofOfWork(
    id: string,
    proofId: string,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.delete(`/work-assignments/${id}/proof-of-work/${proofId}`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Update assignment status
   */
  public static async updateStatus(
    id: string,
    status: AssignmentStatus,
    reason?: string,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.patch(`/work-assignments/${id}/status`, {
      status,
      reason,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Update progress percentage and note
   */
  public static async updateProgress(
    id: string,
    percentage: number,
    comment?: string,
    attachmentUrl?: string,
    attachmentName?: string,
    evidenceAttachments?: IProofOfWork[],
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/progress`, {
      percentage,
      comment,
      attachmentUrl,
      attachmentName,
      evidenceAttachments,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Reassign work to another developer
   */
  public static async reassign(
    id: string,
    newDeveloperId: string,
    reason?: string,
    organizationId?: string
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/reassign`, {
      newDeveloperId,
      reason,
      organizationId,
    });
    return response.data.data;
  }

  /**
   * Submit completed work for manager review
   */
  public static async submitWork(
    id: string,
    data: {
      completionNote: string;
      githubPrUrl?: string;
      githubCommitSha?: string;
      githubBranch?: string;
      proofAttachments?: any[];
      organizationId?: string;
    }
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/submit`, data);
    return response.data.data;
  }

  /**
   * Manager review submission (approve, request changes, or reject)
   */
  public static async reviewSubmission(
    id: string,
    data: {
      decision: 'approve' | 'request_changes' | 'reject';
      reason?: string;
      completionNote?: string;
      feedbackAttachments?: any[];
      submissionId?: string;
      organizationId?: string;
    }
  ): Promise<WorkAssignment> {
    const response = await axiosInstance.post(`/work-assignments/${id}/review`, data);
    return response.data.data;
  }

  /**
   * Delete assignment
   */
  public static async deleteAssignment(id: string, organizationId?: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/work-assignments/${id}`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Get comments on assignment
   */
  public static async getComments(assignmentId: string): Promise<any[]> {
    const response = await axiosInstance.get(`/work-assignments/${assignmentId}/comments`);
    return response.data.data;
  }

  /**
   * Post comment on assignment
   */
  public static async postComment(assignmentId: string, content: string, parentCommentId?: string): Promise<any> {
    const response = await axiosInstance.post(`/work-assignments/${assignmentId}/comments`, {
      content,
      parentCommentId,
    });
    return response.data.data;
  }

  /**
   * Get Monitoring Executive Dashboard Summary
   */
  public static async getDashboardSummary(params: IMonitoringFilterParams = {}, organizationId?: string): Promise<IAssignmentDashboardSummary> {
    const response = await axiosInstance.get('/work-assignments/dashboard/summary', {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Get Developer Monitoring & Capacity Matrix Stats
   */
  public static async getDeveloperMonitoringStats(params: IMonitoringFilterParams = {}, organizationId?: string): Promise<IDeveloperMonitoringStats[]> {
    const response = await axiosInstance.get('/work-assignments/dashboard/developers', {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Get Project-Level Work Assignment Progress
   */
  public static async getProjectMonitoringStats(params: IMonitoringFilterParams = {}, organizationId?: string): Promise<IProjectMonitoringStats[]> {
    const response = await axiosInstance.get('/work-assignments/dashboard/projects', {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Get Manager Review Queue
   */
  public static async getReviewQueue(params: IMonitoringFilterParams = {}, organizationId?: string): Promise<WorkAssignment[]> {
    const response = await axiosInstance.get('/work-assignments/dashboard/review-queue', {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Get Attention Needed (Overdue, Blocked, Due Soon)
   */
  public static async getAttentionNeeded(params: IMonitoringFilterParams = {}, organizationId?: string): Promise<IAttentionNeededAssignment[]> {
    const response = await axiosInstance.get('/work-assignments/dashboard/attention-needed', {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Get Assignment Activity Timeline
   */
  public static async getAssignmentTimeline(params: { workspaceId?: string; projectId?: string; limit?: number } = {}, organizationId?: string): Promise<any[]> {
    const response = await axiosInstance.get('/work-assignments/dashboard/timeline', {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Bulk Reassign
   */
  public static async bulkReassign(data: { assignmentIds: string[]; newDeveloperId: string; reason?: string }, organizationId?: string) {
    const response = await axiosInstance.post('/work-assignments/bulk/reassign', { ...data, organizationId });
    return response.data.data;
  }

  /**
   * Bulk Update Priority
   */
  public static async bulkUpdatePriority(data: { assignmentIds: string[]; priority: string }, organizationId?: string) {
    const response = await axiosInstance.post('/work-assignments/bulk/priority', { ...data, organizationId });
    return response.data.data;
  }

  /**
   * Bulk Update Status
   */
  public static async bulkUpdateStatus(data: { assignmentIds: string[]; status: string; reason?: string }, organizationId?: string) {
    const response = await axiosInstance.post('/work-assignments/bulk/status', { ...data, organizationId });
    return response.data.data;
  }

  /**
   * Bulk Archive
   */
  public static async bulkArchive(data: { assignmentIds: string[] }, organizationId?: string) {
    const response = await axiosInstance.post('/work-assignments/bulk/archive', { ...data, organizationId });
    return response.data.data;
  }

  /**
   * Get Reports
   */
  public static async getReport(reportType: string, params: IMonitoringFilterParams = {}, organizationId?: string) {
    const response = await axiosInstance.get(`/work-assignments/reports/${reportType}`, {
      params: { ...params, organizationId },
    });
    return response.data.data;
  }

  /**
   * Export CSV
   */
  public static async exportAssignments(params: IMonitoringFilterParams = {}, organizationId?: string) {
    const response = await axiosInstance.get('/work-assignments/export', {
      params: { ...params, organizationId },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get Developer Detailed Drilldown
   */
  public static async getDeveloperDetails(developerId: string, organizationId?: string) {
    const response = await axiosInstance.get(`/work-assignments/developers/${developerId}/details`, {
      params: { organizationId },
    });
    return response.data.data;
  }

  /**
   * Get Project Detailed Drilldown
   */
  public static async getProjectDetails(projectId: string, organizationId?: string) {
    const response = await axiosInstance.get(`/work-assignments/projects/${projectId}/details`, {
      params: { organizationId },
    });
    return response.data.data;
  }
}
