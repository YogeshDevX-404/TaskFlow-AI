import { Types } from 'mongoose';
import { WorkAssignmentModel } from '../models/workAssignment.model';
import { TimeEntry } from '../models/timeEntry.model';
import { ActivityModel } from '../models/activity.model';
import { User, IUserDocument } from '../models/user.model';
import { ProjectModel, IProjectDocument } from '../models/project.model';
import { logger } from '../utils/logger';

export interface DashboardSummaryFilterDTO {
  workspaceId?: string;
  projectId?: string;
  assignedToId?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  repositoryName?: string;
}

export class WorkAssignmentMonitoringService {
  /**
   * Executive Summary KPI & Status Aggregations
   */
  public static async getDashboardSummary(organizationId: string, filters: DashboardSummaryFilterDTO = {}) {
    const orgObjId = new Types.ObjectId(organizationId);
    const matchQuery: any = { organization: orgObjId };

    if (filters.workspaceId && Types.ObjectId.isValid(filters.workspaceId)) {
      matchQuery.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
      matchQuery.project = new Types.ObjectId(filters.projectId);
    }
    if (filters.assignedToId && Types.ObjectId.isValid(filters.assignedToId)) {
      matchQuery.assignedTo = new Types.ObjectId(filters.assignedToId);
    }
    if (filters.priority && filters.priority !== 'all') {
      matchQuery.priority = filters.priority;
    }
    if (filters.dateFrom || filters.dateTo) {
      matchQuery.createdAt = {};
      if (filters.dateFrom) matchQuery.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) matchQuery.createdAt.$lte = new Date(filters.dateTo);
    }

    const now = new Date();
    const dueSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Run Aggregation for Status, Priorities, Overdue, Due Soon, Estimated Hours & Average Progress
    const [statsResult] = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          priorityCounts: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ],
          overviewMetrics: [
            {
              $group: {
                _id: null,
                totalAssignments: { $sum: 1 },
                avgProgress: { $avg: '$progress' },
                totalEstimatedHours: {
                  $sum: {
                    $add: [
                      { $ifNull: ['$estimatedHours', 0] },
                      { $divide: [{ $ifNull: ['$estimatedMinutes', 0] }, 60] },
                    ],
                  },
                },
                overdueCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $not: { $in: ['$status', ['Completed', 'Cancelled', 'Archived']] } },
                          { $ne: ['$dueDate', null] },
                          { $lt: ['$dueDate', now] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                dueSoonCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $not: { $in: ['$status', ['Completed', 'Cancelled', 'Archived']] } },
                          { $ne: ['$dueDate', null] },
                          { $gte: ['$dueDate', now] },
                          { $lte: ['$dueDate', dueSoonThreshold] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    // Format status counts map
    const statusMap: Record<string, number> = {
      Assigned: 0,
      Acknowledged: 0,
      'In Progress': 0,
      Blocked: 0,
      Submitted: 0,
      'Changes Requested': 0,
      Completed: 0,
      Cancelled: 0,
      Archived: 0,
    };

    if (statsResult?.statusCounts) {
      statsResult.statusCounts.forEach((item: any) => {
        if (item._id) statusMap[item._id] = item.count;
      });
    }

    // Format priority counts map
    const priorityMap: Record<string, number> = {
      Urgent: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    if (statsResult?.priorityCounts) {
      statsResult.priorityCounts.forEach((item: any) => {
        if (item._id) priorityMap[item._id] = item.count;
      });
    }

    const overview = statsResult?.overviewMetrics?.[0] || {
      totalAssignments: 0,
      avgProgress: 0,
      totalEstimatedHours: 0,
      overdueCount: 0,
      dueSoonCount: 0,
    };

    // 2. Fetch Total Logged Time across matching assignments
    const matchingAssignmentIds = await WorkAssignmentModel.find(matchQuery).distinct('_id');
    const timeAggregate = await TimeEntry.aggregate([
      { $match: { assignment: { $in: matchingAssignmentIds } } },
      { $group: { _id: null, totalSeconds: { $sum: '$duration' } } },
    ]);

    const totalLoggedSeconds = timeAggregate[0]?.totalSeconds || 0;
    const totalLoggedHours = Math.round((totalLoggedSeconds / 3600) * 10) / 10;

    const totalActive =
      statusMap.Assigned +
      statusMap.Acknowledged +
      statusMap['In Progress'] +
      statusMap.Blocked +
      statusMap['Changes Requested'];

    const completionRate =
      overview.totalAssignments > 0
        ? Math.round((statusMap.Completed / overview.totalAssignments) * 100)
        : 0;

    return {
      totalAssignments: overview.totalAssignments,
      totalActive,
      statusCounts: statusMap,
      priorityCounts: priorityMap,
      overdueCount: overview.overdueCount,
      dueSoonCount: overview.dueSoonCount,
      reviewQueueCount: statusMap.Submitted,
      changesRequestedCount: statusMap['Changes Requested'],
      blockedCount: statusMap.Blocked,
      completedCount: statusMap.Completed,
      avgProgress: Math.round(overview.avgProgress || 0),
      totalEstimatedHours: Math.round(overview.totalEstimatedHours * 10) / 10,
      totalLoggedHours,
      totalLoggedSeconds,
      completionRate,
    };
  }

  /**
   * Developer Performance & Workload Matrix for Monitoring
   */
  public static async getDeveloperMonitoringStats(organizationId: string, filters: DashboardSummaryFilterDTO = {}) {
    const orgObjId = new Types.ObjectId(organizationId);
    const matchQuery: any = { organization: orgObjId };

    if (filters.workspaceId && Types.ObjectId.isValid(filters.workspaceId)) {
      matchQuery.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
      matchQuery.project = new Types.ObjectId(filters.projectId);
    }

    const now = new Date();

    const devAggregations = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$assignedTo',
          totalAssignments: { $sum: 1 },
          activeAssignments: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['Assigned', 'Acknowledged', 'In Progress', 'Blocked', 'Changes Requested'],
                  ],
                },
                1,
                0,
              ],
            },
          },
          completedAssignments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
            },
          },
          blockedAssignments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0],
            },
          },
          submittedAssignments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0],
            },
          },
          overdueAssignments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $not: { $in: ['$status', ['Completed', 'Cancelled', 'Archived']] } },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: '$progress' },
          totalEstimatedHours: {
            $sum: {
              $add: [
                { $ifNull: ['$estimatedHours', 0] },
                { $divide: [{ $ifNull: ['$estimatedMinutes', 0] }, 60] },
              ],
            },
          },
          assignmentIds: { $push: '$_id' },
          recentAssignments: {
            $push: {
              id: '$_id',
              assignmentId: '$assignmentId',
              title: '$title',
              status: '$status',
              priority: '$priority',
              progress: '$progress',
              dueDate: '$dueDate',
            },
          },
        },
      },
    ]);

    if (!devAggregations.length) {
      return [];
    }

    // Populate user info and logged time
    const developerUserIds = devAggregations.map((d) => d._id).filter(Boolean);
    const users = await User.find({ _id: { $in: developerUserIds } }).select(
      'firstName lastName name email avatar role'
    );
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Aggregate time entries for developers
    const allAssignmentIds = devAggregations.flatMap((d) => d.assignmentIds);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: allAssignmentIds } } },
      { $group: { _id: '$user', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map(timeEntries.map((t) => [t._id.toString(), t.totalSeconds]));

    return devAggregations
      .map((dev) => {
        const user = dev._id ? userMap.get(dev._id.toString()) : null;
        const loggedSeconds = dev._id ? timeMap.get(dev._id.toString()) || 0 : 0;
        const loggedHours = Math.round((loggedSeconds / 3600) * 10) / 10;
        const estimatedHours = Math.round(dev.totalEstimatedHours * 10) / 10;

        // Determine capacity / workload health
        let workloadStatus: 'Optimal' | 'Busy' | 'Overloaded' = 'Optimal';
        if (dev.activeAssignments > 4 || estimatedHours > 40 || dev.overdueAssignments > 1) {
          workloadStatus = 'Overloaded';
        } else if (dev.activeAssignments >= 3 || estimatedHours >= 25) {
          workloadStatus = 'Busy';
        }

        return {
          developer: user
            ? {
                id: user._id.toString(),
                name:
                  user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`.trim()
                    : (user as any).name || user.email,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
              }
            : {
                id: dev._id?.toString() || 'unassigned',
                name: 'Unassigned / Former Member',
                email: '',
                avatar: '',
                role: 'Developer',
              },
          totalAssignments: dev.totalAssignments,
          activeAssignments: dev.activeAssignments,
          completedAssignments: dev.completedAssignments,
          blockedAssignments: dev.blockedAssignments,
          submittedAssignments: dev.submittedAssignments,
          overdueAssignments: dev.overdueAssignments,
          avgProgress: Math.round(dev.avgProgress || 0),
          totalEstimatedHours: estimatedHours,
          totalLoggedHours: loggedHours,
          workloadStatus,
          recentAssignments: (dev.recentAssignments || []).slice(0, 5),
        };
      })
      .sort((a, b) => b.activeAssignments - a.activeAssignments);
  }

  /**
   * Project-Level Work Assignment Progress Breakdown
   */
  public static async getProjectMonitoringStats(organizationId: string, filters: DashboardSummaryFilterDTO = {}) {
    const orgObjId = new Types.ObjectId(organizationId);
    const matchQuery: any = { organization: orgObjId };

    if (filters.workspaceId && Types.ObjectId.isValid(filters.workspaceId)) {
      matchQuery.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
      matchQuery.project = new Types.ObjectId(filters.projectId);
    }

    const now = new Date();

    const projectAggregations = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$project',
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          inProgressAssignments: {
            $sum: {
              $cond: [
                { $in: ['$status', ['In Progress', 'Acknowledged', 'Changes Requested']] },
                1,
                0,
              ],
            },
          },
          blockedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
          },
          submittedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] },
          },
          overdueAssignments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $not: { $in: ['$status', ['Completed', 'Cancelled', 'Archived']] } },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: '$progress' },
          totalEstimatedHours: {
            $sum: {
              $add: [
                { $ifNull: ['$estimatedHours', 0] },
                { $divide: [{ $ifNull: ['$estimatedMinutes', 0] }, 60] },
              ],
            },
          },
          assignedDevelopers: { $addToSet: '$assignedTo' },
          assignmentIds: { $push: '$_id' },
        },
      },
    ]);

    if (!projectAggregations.length) {
      return [];
    }

    const projectIds = projectAggregations.map((p) => p._id).filter(Boolean);
    const projects = await ProjectModel.find({ _id: { $in: projectIds } }).select('name key slug');
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));

    // Aggregate time entries for projects
    const allAssignmentIds = projectAggregations.flatMap((p) => p.assignmentIds);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: allAssignmentIds } } },
      { $group: { _id: '$project', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map(timeEntries.map((t) => [t._id ? t._id.toString() : '', t.totalSeconds]));

    return projectAggregations.map((p) => {
      const proj = p._id ? projectMap.get(p._id.toString()) : null;
      const loggedSeconds = p._id ? timeMap.get(p._id.toString()) || 0 : 0;
      const loggedHours = Math.round((loggedSeconds / 3600) * 10) / 10;
      const estimatedHours = Math.round(p.totalEstimatedHours * 10) / 10;
      const completionRate =
        p.totalAssignments > 0 ? Math.round((p.completedAssignments / p.totalAssignments) * 100) : 0;

      return {
        project: proj
          ? {
              id: proj._id.toString(),
              name: proj.name,
              key: proj.projectKey || (proj as any).key || '',
              slug: (proj as any).slug || '',
            }
          : {
              id: p._id?.toString() || 'unknown',
              name: 'Unknown Project',
              key: '',
              slug: '',
            },
        totalAssignments: p.totalAssignments,
        completedAssignments: p.completedAssignments,
        inProgressAssignments: p.inProgressAssignments,
        blockedAssignments: p.blockedAssignments,
        submittedAssignments: p.submittedAssignments,
        overdueAssignments: p.overdueAssignments,
        avgProgress: Math.round(p.avgProgress || 0),
        completionRate,
        totalEstimatedHours: estimatedHours,
        totalLoggedHours: loggedHours,
        activeDeveloperCount: (p.assignedDevelopers || []).filter(Boolean).length,
      };
    });
  }

  /**
   * Manager Review Queue: All submitted deliverables awaiting approval or change requests
   */
  public static async getReviewQueue(organizationId: string, filters: DashboardSummaryFilterDTO = {}) {
    const orgObjId = new Types.ObjectId(organizationId);
    const query: any = {
      organization: orgObjId,
      status: 'Submitted',
    };

    if (filters.workspaceId && Types.ObjectId.isValid(filters.workspaceId)) {
      query.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
      query.project = new Types.ObjectId(filters.projectId);
    }

    const docs = await WorkAssignmentModel.find(query)
      .sort({ updatedAt: -1 })
      .populate('assignedTo', 'firstName lastName name email avatar role')
      .populate('assignedBy', 'firstName lastName name email avatar role')
      .populate('project', 'name key slug')
      .populate('workspace', 'name slug')
      .populate('task', 'title taskKey status priority')
      .populate('submissions.submittedBy', 'firstName lastName name email avatar role');

    // Batch calculate total logged time
    const docIds = docs.map((d) => d._id);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: docIds } } },
      { $group: { _id: '$assignment', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map<string, number>();
    timeEntries.forEach((t) => timeMap.set(t._id.toString(), t.totalSeconds || 0));

    return docs.map((doc) => doc.toPayload(timeMap.get(doc._id.toString()) || 0));
  }

  /**
   * Attention Needed Center: Overdue, Blocked, and Due Soon items
   */
  public static async getAttentionNeeded(organizationId: string, filters: DashboardSummaryFilterDTO = {}) {
    const orgObjId = new Types.ObjectId(organizationId);
    const now = new Date();
    const dueSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const baseQuery: any = {
      organization: orgObjId,
      status: { $nin: ['Completed', 'Cancelled', 'Archived'] },
    };

    if (filters.workspaceId && Types.ObjectId.isValid(filters.workspaceId)) {
      baseQuery.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
      baseQuery.project = new Types.ObjectId(filters.projectId);
    }

    const attentionQuery = {
      ...baseQuery,
      $or: [
        { status: 'Blocked' },
        { dueDate: { $ne: null, $lt: now } },
        { dueDate: { $ne: null, $gte: now, $lte: dueSoonThreshold } },
        { status: 'Changes Requested' },
      ],
    };

    const docs = await WorkAssignmentModel.find(attentionQuery)
      .sort({ priority: -1, dueDate: 1 })
      .populate('assignedTo', 'firstName lastName name email avatar role')
      .populate('assignedBy', 'firstName lastName name email avatar role')
      .populate('project', 'name key slug')
      .populate('workspace', 'name slug')
      .populate('task', 'title taskKey status priority');

    const docIds = docs.map((d) => d._id);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: docIds } } },
      { $group: { _id: '$assignment', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map<string, number>();
    timeEntries.forEach((t) => timeMap.set(t._id.toString(), t.totalSeconds || 0));

    return docs.map((doc) => {
      const payload = doc.toPayload(timeMap.get(doc._id.toString()) || 0);
      let urgency: 'critical' | 'high' | 'medium' = 'medium';
      let attentionReason = 'Requires Attention';

      if (doc.status === 'Blocked') {
        urgency = 'critical';
        attentionReason = `Blocked: ${doc.blockedReason || 'Reason not specified'}`;
      } else if (payload.isOverdue) {
        urgency = 'critical';
        attentionReason = `Overdue since ${doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : 'N/A'}`;
      } else if (doc.status === 'Changes Requested') {
        urgency = 'high';
        attentionReason = 'Revisions Requested by Manager';
      } else if (payload.isDueSoon) {
        urgency = 'medium';
        attentionReason = 'Due within 24 hours';
      }

      return {
        ...payload,
        urgency,
        attentionReason,
      };
    });
  }

  /**
   * Assignment Activity Stream Timeline
   */
  public static async getAssignmentTimeline(
    organizationId: string,
    filters: { workspaceId?: string; projectId?: string; limit?: number } = {}
  ) {
    const orgObjId = new Types.ObjectId(organizationId);
    const matchQuery: any = {
      organization: orgObjId,
      entityType: 'WorkAssignment',
    };

    if (filters.workspaceId && Types.ObjectId.isValid(filters.workspaceId)) {
      matchQuery.workspace = new Types.ObjectId(filters.workspaceId);
    }
    if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
      matchQuery.project = new Types.ObjectId(filters.projectId);
    }

    const limit = Math.min(100, Math.max(1, filters.limit || 30));

    const activities = await ActivityModel.find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'firstName lastName name email avatar role')
      .populate('project', 'name key')
      .populate('assignment', 'assignmentId title status progress');

    return activities;
  }
}
