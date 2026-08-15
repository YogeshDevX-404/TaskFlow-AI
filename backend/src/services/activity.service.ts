import { Types } from 'mongoose';
import { ActivityModel, IActivityPayload, ActivityAction, EntityType } from '../models/activity.model';

export interface RecordActivityDTO {
  organizationId?: string;
  organization?: string;
  workspaceId?: string | null;
  workspace?: string | null;
  projectId?: string | null;
  project?: string | null;
  taskId?: string | null;
  task?: string | null;
  assignmentId?: string | null;
  assignment?: string | null;
  userId?: string;
  user?: string;
  action: ActivityAction | string;
  entityType: EntityType | string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  details?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface GetActivitiesQueryParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
  userId?: string;
  action?: string;
  actionType?: string;
  entityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export class ActivityService {
  /**
   * Safely record an audit activity log entry
   */
  public static async recordActivity(data: RecordActivityDTO): Promise<IActivityPayload | null> {
    try {
      const orgId = data.organizationId || data.organization;
      const uId = data.userId || data.user;
      const wsId = data.workspaceId || data.workspace;
      const pId = data.projectId || data.project;
      const tId = data.taskId || data.task;
      const aId = data.assignmentId || data.assignment;

      if (!orgId || !Types.ObjectId.isValid(orgId.toString())) {
        return null;
      }
      if (!uId || !Types.ObjectId.isValid(uId.toString())) {
        return null;
      }

      const activity = new ActivityModel({
        organization: new Types.ObjectId(orgId.toString()),
        workspace: wsId && Types.ObjectId.isValid(wsId.toString()) ? new Types.ObjectId(wsId.toString()) : null,
        project: pId && Types.ObjectId.isValid(pId.toString()) ? new Types.ObjectId(pId.toString()) : null,
        task: tId && Types.ObjectId.isValid(tId.toString()) ? new Types.ObjectId(tId.toString()) : null,
        assignment: aId && Types.ObjectId.isValid(aId.toString()) ? new Types.ObjectId(aId.toString()) : null,
        user: new Types.ObjectId(uId.toString()),
        action: data.action,
        entityType: data.entityType,
        entityId: Types.ObjectId.isValid(data.entityId) ? new Types.ObjectId(data.entityId) : data.entityId,
        oldValue: data.oldValue ?? null,
        newValue: data.newValue ?? null,
        metadata: data.metadata || data.details || {},
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      });

      await activity.save();

      const populated = await ActivityModel.findById(activity._id)
        .populate('user', 'name firstName lastName email avatar role')
        .populate('task', 'title taskKey')
        .populate('assignment', 'title assignmentId')
        .populate('project', 'name projectKey')
        .populate('workspace', 'name slug')
        .populate('organization', 'name slug');

      return populated ? populated.toActivityPayload() : activity.toActivityPayload();
    } catch (error) {
      // Do not break caller operations if audit logging fails
      console.error('[ActivityService] Failed to record activity log:', error);
      return null;
    }
  }

  public static async logActivity(data: RecordActivityDTO): Promise<IActivityPayload | null> {
    return ActivityService.recordActivity(data);
  }

  /**
   * Query filtered activities with pagination and date grouping support
   */
  public static async getActivities(params: GetActivitiesQueryParams): Promise<{
    activities: IActivityPayload[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (params.organizationId && Types.ObjectId.isValid(params.organizationId)) {
      query.organization = new Types.ObjectId(params.organizationId);
    }

    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      query.workspace = new Types.ObjectId(params.workspaceId);
    }

    if (params.projectId && Types.ObjectId.isValid(params.projectId)) {
      query.project = new Types.ObjectId(params.projectId);
    }

    if (params.taskId && Types.ObjectId.isValid(params.taskId)) {
      query.task = new Types.ObjectId(params.taskId);
    }

    if (params.userId && Types.ObjectId.isValid(params.userId)) {
      query.user = new Types.ObjectId(params.userId);
    }

    const requestedAction = params.action || params.actionType;
    if (requestedAction && requestedAction !== 'all') {
      query.action = requestedAction;
    }

    if (params.entityType && params.entityType !== 'all') {
      query.entityType = params.entityType;
    }

    // Date range filter
    if (params.startDate || params.endDate) {
      query.createdAt = {};
      if (params.startDate) {
        query.createdAt.$gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Text search in metadata, action, entityType
    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      query.$or = [
        { action: searchRegex },
        { entityType: searchRegex },
        { 'metadata.taskTitle': searchRegex },
        { 'metadata.taskKey': searchRegex },
        { 'metadata.projectName': searchRegex },
        { 'metadata.workspaceName': searchRegex },
        { 'metadata.commentContent': searchRegex },
        { 'metadata.fileName': searchRegex },
        { 'metadata.userEmail': searchRegex },
        { 'metadata.userName': searchRegex },
        { 'metadata.description': searchRegex },
      ];
    }

    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 50;
    const skip = (page - 1) * limit;

    const sortOrder = params.sortBy === 'oldest' ? 1 : -1;

    const total = await ActivityModel.countDocuments(query);
    const docs = await ActivityModel.find(query)
      .populate('user', 'name firstName lastName email avatar role')
      .populate('task', 'title taskKey')
      .populate('project', 'name projectKey')
      .populate('workspace', 'name slug')
      .populate('organization', 'name slug')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit);

    const activities = docs.map((doc) => doc.toActivityPayload());

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Export audit activities to CSV, JSON or PDF formatted data
   */
  public static async exportActivities(
    params: GetActivitiesQueryParams,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ): Promise<{ data: string | any; mimeType: string; fileName: string }> {
    // Retrieve up to 2000 activities for export
    const { activities } = await ActivityService.getActivities({ ...params, page: 1, limit: 2000 });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      return {
        data: JSON.stringify(activities, null, 2),
        mimeType: 'application/json',
        fileName: `audit_logs_${timestamp}.json`,
      };
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'Timestamp',
        'User Name',
        'User Email',
        'Action',
        'Entity Type',
        'Entity ID',
        'Organization',
        'Workspace',
        'Project',
        'Task Key',
        'Task Title',
        'Old Value',
        'New Value',
        'IP Address',
      ];

      const rows = activities.map((a) => {
        const userName = typeof a.user === 'object' ? a.user?.name || '' : '';
        const userEmail = typeof a.user === 'object' ? a.user?.email || '' : '';
        const orgName = typeof a.organization === 'object' ? a.organization?.name || '' : '';
        const wsName = typeof a.workspace === 'object' ? a.workspace?.name || '' : '';
        const projName = typeof a.project === 'object' ? a.project?.name || '' : '';
        const taskKey = a.metadata?.taskKey || (typeof a.task === 'object' ? a.task?.key : '');
        const taskTitle = a.metadata?.taskTitle || (typeof a.task === 'object' ? a.task?.name : '');

        const sanitize = (val: any) => {
          if (val === null || val === undefined) return '""';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        };

        return [
          sanitize(a.id),
          sanitize(new Date(a.createdAt).toISOString()),
          sanitize(userName),
          sanitize(userEmail),
          sanitize(a.action),
          sanitize(a.entityType),
          sanitize(a.entityId),
          sanitize(orgName),
          sanitize(wsName),
          sanitize(projName),
          sanitize(taskKey),
          sanitize(taskTitle),
          sanitize(a.oldValue),
          sanitize(a.newValue),
          sanitize(a.ipAddress),
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      return {
        data: csvContent,
        mimeType: 'text/csv',
        fileName: `audit_logs_${timestamp}.csv`,
      };
    }

    // PDF Export Placeholder structured payload
    const pdfPayload = {
      title: 'Enterprise Audit Activity Log Report',
      generatedAt: new Date().toISOString(),
      recordCount: activities.length,
      records: activities.map((a) => ({
        id: a.id,
        date: new Date(a.createdAt).toLocaleString(),
        user: typeof a.user === 'object' ? `${a.user?.name} (${a.user?.email})` : 'User',
        action: a.action,
        entity: `${a.entityType}:${a.entityId}`,
        details: a.metadata,
      })),
    };

    return {
      data: JSON.stringify(pdfPayload, null, 2),
      mimeType: 'application/json',
      fileName: `audit_logs_${timestamp}_pdf_spec.json`,
    };
  }
}
