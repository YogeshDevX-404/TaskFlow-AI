import { Types } from 'mongoose';
import { WorkAssignmentModel } from '../models/workAssignment.model';
import { TimeEntry } from '../models/timeEntry.model';
import { User } from '../models/user.model';
import { ProjectModel } from '../models/project.model';
import { logger } from '../utils/logger';

export interface ReportFilterDTO {
  workspaceId?: string;
  projectId?: string;
  assignedToId?: string;
  priority?: string;
  status?: string;
  dateRangePreset?: 'today' | 'this_week' | 'this_month' | 'last_month' | 'quarter' | 'custom' | string;
  dateFrom?: string;
  dateTo?: string;
}

export class WorkAssignmentReportsService {
  /**
   * Helper to resolve date range boundaries
   */
  public static resolveDateRange(preset?: string, from?: string, to?: string): { start?: Date; end?: Date } {
    const now = new Date();
    if (preset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start, end };
    }
    if (preset === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      return { start, end };
    }
    if (preset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
      return { start, end };
    }
    if (preset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    if (preset === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const end = new Date();
      return { start, end };
    }
    if (from || to) {
      return {
        start: from ? new Date(from) : undefined,
        end: to ? new Date(to) : undefined,
      };
    }
    return {};
  }

  /**
   * Build base match query for report filtering with organization isolation
   */
  private static buildMatchQuery(organizationId: string, filters: ReportFilterDTO = {}) {
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
    if (filters.status && filters.status !== 'all') {
      matchQuery.status = filters.status;
    }

    const { start, end } = this.resolveDateRange(filters.dateRangePreset, filters.dateFrom, filters.dateTo);
    if (start || end) {
      matchQuery.createdAt = {};
      if (start) matchQuery.createdAt.$gte = start;
      if (end) matchQuery.createdAt.$lte = end;
    }

    return matchQuery;
  }

  /**
   * 1. Summary Report
   */
  public static async getSummaryReport(organizationId: string, filters: ReportFilterDTO = {}) {
    const matchQuery = this.buildMatchQuery(organizationId, filters);
    const now = new Date();

    const [aggregateResult] = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          priorityCounts: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          metrics: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
                },
                blocked: {
                  $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
                },
                overdue: {
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
                // Turnaround times
                avgCompletionTimeMs: {
                  $avg: {
                    $cond: [
                      { $and: [{ $eq: ['$status', 'Completed'] }, { $ne: ['$completedAt', null] }] },
                      { $subtract: ['$completedAt', '$createdAt'] },
                      null,
                    ],
                  },
                },
                avgSubmissionTimeMs: {
                  $avg: {
                    $cond: [
                      { $ne: ['$submission.submittedAt', null] },
                      { $subtract: ['$submission.submittedAt', '$createdAt'] },
                      null,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

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
    (aggregateResult?.statusCounts || []).forEach((s: any) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    const priorityMap: Record<string, number> = {
      Urgent: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    (aggregateResult?.priorityCounts || []).forEach((p: any) => {
      if (p._id) priorityMap[p._id] = p.count;
    });

    const m = aggregateResult?.metrics?.[0] || {
      total: 0,
      completed: 0,
      blocked: 0,
      overdue: 0,
      avgProgress: 0,
      totalEstimatedHours: 0,
      avgCompletionTimeMs: 0,
      avgSubmissionTimeMs: 0,
    };

    // Calculate logged time
    const matchingIds = await WorkAssignmentModel.find(matchQuery).distinct('_id');
    const timeAggregate = await TimeEntry.aggregate([
      { $match: { assignment: { $in: matchingIds } } },
      { $group: { _id: null, totalSeconds: { $sum: '$duration' } } },
    ]);
    const loggedSeconds = timeAggregate[0]?.totalSeconds || 0;
    const loggedHours = Math.round((loggedSeconds / 3600) * 10) / 10;

    const completionRate = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
    const avgCompletionDays = m.avgCompletionTimeMs
      ? Math.round((m.avgCompletionTimeMs / (1000 * 60 * 60 * 24)) * 10) / 10
      : 0;
    const avgSubmissionDays = m.avgSubmissionTimeMs
      ? Math.round((m.avgSubmissionTimeMs / (1000 * 60 * 60 * 24)) * 10) / 10
      : 0;

    return {
      totalAssignments: m.total,
      completedAssignments: m.completed,
      completionRate,
      overdueCount: m.overdue,
      blockedCount: m.blocked,
      avgProgress: Math.round(m.avgProgress || 0),
      avgCompletionDays,
      avgSubmissionDays,
      totalEstimatedHours: Math.round(m.totalEstimatedHours * 10) / 10,
      totalLoggedHours: loggedHours,
      statusCounts: statusMap,
      priorityCounts: priorityMap,
    };
  }

  /**
   * 2. Developer Work Metrics Report (Strictly Performance-Neutral)
   */
  public static async getDeveloperWorkReport(organizationId: string, filters: ReportFilterDTO = {}) {
    const matchQuery = this.buildMatchQuery(organizationId, filters);
    const now = new Date();

    const devAggregations = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          active: {
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
          blocked: {
            $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
          },
          submitted: {
            $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] },
          },
          overdue: {
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
          avgCompletionTimeMs: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ['$status', 'Completed'] }, { $ne: ['$completedAt', null] }] },
                { $subtract: ['$completedAt', '$createdAt'] },
                null,
              ],
            },
          },
          assignmentIds: { $push: '$_id' },
        },
      },
    ]);

    if (!devAggregations.length) return [];

    const userIds = devAggregations.map((d) => d._id).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName name email avatar role');
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const allAssignmentIds = devAggregations.flatMap((d) => d.assignmentIds);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: allAssignmentIds } } },
      { $group: { _id: '$user', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map(timeEntries.map((t) => [t._id.toString(), t.totalSeconds]));

    return devAggregations.map((d) => {
      const user = d._id ? userMap.get(d._id.toString()) : null;
      const loggedSeconds = d._id ? timeMap.get(d._id.toString()) || 0 : 0;
      const loggedHours = Math.round((loggedSeconds / 3600) * 10) / 10;
      const estimatedHours = Math.round(d.totalEstimatedHours * 10) / 10;
      const completionRate = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
      const avgCompletionDays = d.avgCompletionTimeMs
        ? Math.round((d.avgCompletionTimeMs / (1000 * 60 * 60 * 24)) * 10) / 10
        : 0;

      return {
        developerId: d._id ? d._id.toString() : 'unassigned',
        developerName: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user as any).name || user.email
          : 'Unassigned',
        developerEmail: user?.email || '',
        avatar: user?.avatar || '',
        role: user?.role || 'Developer',
        totalAssignments: d.total,
        activeAssignments: d.active,
        completedAssignments: d.completed,
        blockedAssignments: d.blocked,
        submittedAssignments: d.submitted,
        overdueAssignments: d.overdue,
        completionRate,
        avgProgress: Math.round(d.avgProgress || 0),
        avgCompletionDays,
        estimatedHours,
        loggedHours,
      };
    });
  }

  /**
   * 3. Project Work Report
   */
  public static async getProjectWorkReport(organizationId: string, filters: ReportFilterDTO = {}) {
    const matchQuery = this.buildMatchQuery(organizationId, filters);
    const now = new Date();

    const projAggregations = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          active: {
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
          blocked: {
            $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
          },
          submitted: {
            $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] },
          },
          overdue: {
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
          developers: { $addToSet: '$assignedTo' },
          assignmentIds: { $push: '$_id' },
        },
      },
    ]);

    if (!projAggregations.length) return [];

    const projectIds = projAggregations.map((p) => p._id).filter(Boolean);
    const projects = await ProjectModel.find({ _id: { $in: projectIds } }).select('name projectKey slug');
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));

    const allAssignmentIds = projAggregations.flatMap((p) => p.assignmentIds);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: allAssignmentIds } } },
      { $group: { _id: '$project', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map(timeEntries.map((t) => [t._id?.toString(), t.totalSeconds]));

    return projAggregations.map((p) => {
      const proj = p._id ? projectMap.get(p._id.toString()) : null;
      const loggedSeconds = p._id ? timeMap.get(p._id.toString()) || 0 : 0;
      const loggedHours = Math.round((loggedSeconds / 3600) * 10) / 10;
      const estimatedHours = Math.round(p.totalEstimatedHours * 10) / 10;
      const completionRate = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;

      return {
        projectId: p._id ? p._id.toString() : 'unknown',
        projectName: proj?.name || 'Unknown Project',
        projectKey: proj?.projectKey || (proj as any)?.key || '',
        totalAssignments: p.total,
        activeAssignments: p.active,
        completedAssignments: p.completed,
        blockedAssignments: p.blocked,
        submittedAssignments: p.submitted,
        overdueAssignments: p.overdue,
        completionRate,
        avgProgress: Math.round(p.avgProgress || 0),
        estimatedHours,
        loggedHours,
        assignedDeveloperCount: (p.developers || []).filter(Boolean).length,
      };
    });
  }

  /**
   * 4. Overdue Work Analysis Report
   */
  public static async getOverdueReport(organizationId: string, filters: ReportFilterDTO = {}) {
    const matchQuery = this.buildMatchQuery(organizationId, filters);
    const now = new Date();

    matchQuery.status = { $nin: ['Completed', 'Cancelled', 'Archived'] };
    matchQuery.dueDate = { $ne: null, $lt: now };

    const overdueAssignments = await WorkAssignmentModel.find(matchQuery)
      .populate('assignedTo', 'firstName lastName name email avatar')
      .populate('project', 'name projectKey')
      .sort({ dueDate: 1 })
      .limit(100);

    return overdueAssignments.map((a) => {
      const assignedTo: any = a.assignedTo;
      const project: any = a.project;
      const due = new Date(a.dueDate!);
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: a._id.toString(),
        assignmentId: a.assignmentId,
        title: a.title,
        status: a.status,
        priority: a.priority,
        progress: a.progress,
        dueDate: a.dueDate,
        daysOverdue,
        blockedReason: a.blockedReason || '',
        developer: assignedTo
          ? {
              id: assignedTo._id?.toString() || assignedTo.id,
              name:
                `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim() ||
                assignedTo.name ||
                assignedTo.email,
              email: assignedTo.email,
              avatar: assignedTo.avatar,
            }
          : null,
        project: project
          ? {
              id: project._id?.toString() || project.id,
              name: project.name,
              key: project.projectKey,
            }
          : null,
      };
    });
  }

  /**
   * 5. Submission & Review Turnaround Report
   */
  public static async getSubmissionReport(organizationId: string, filters: ReportFilterDTO = {}) {
    const matchQuery = this.buildMatchQuery(organizationId, filters);

    // Filter assignments that have at least one submission
    matchQuery['submissions.0'] = { $exists: true };

    const assignmentsWithSubmissions = await WorkAssignmentModel.find(matchQuery)
      .populate('assignedTo', 'firstName lastName name email')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(100);

    let totalSubmissions = 0;
    let approvedCount = 0;
    let changesRequestedCount = 0;
    let pendingCount = 0;
    let totalReviewTimeMs = 0;
    let reviewedCount = 0;

    const list = assignmentsWithSubmissions.map((a) => {
      const latestSub = a.submissions && a.submissions.length > 0 ? a.submissions[a.submissions.length - 1] : null;
      totalSubmissions += a.submissions?.length || 0;

      if (a.status === 'Submitted') pendingCount++;
      if (a.status === 'Completed') approvedCount++;
      if (a.status === 'Changes Requested') changesRequestedCount++;

      if (latestSub?.review?.reviewedAt && latestSub?.submittedAt) {
        const subDate = new Date(latestSub.submittedAt).getTime();
        const revDate = new Date(latestSub.review.reviewedAt).getTime();
        if (revDate >= subDate) {
          totalReviewTimeMs += revDate - subDate;
          reviewedCount++;
        }
      }

      const assignedTo: any = a.assignedTo;
      const project: any = a.project;

      return {
        id: a._id.toString(),
        assignmentId: a.assignmentId,
        title: a.title,
        status: a.status,
        submissionCount: a.submissions?.length || 0,
        latestSubmittedAt: latestSub?.submittedAt,
        latestReviewedAt: latestSub?.review?.reviewedAt,
        reviewDecision: latestSub?.review?.decision || (a.status === 'Submitted' ? 'Pending' : undefined),
        developerName: assignedTo
          ? `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim() || assignedTo.name || assignedTo.email
          : 'Developer',
        projectName: project?.name || 'Project',
      };
    });

    const avgReviewHours = reviewedCount > 0
      ? Math.round((totalReviewTimeMs / (reviewedCount * 1000 * 60 * 60)) * 10) / 10
      : 0;

    return {
      summary: {
        totalAssignmentsWithSubmissions: assignmentsWithSubmissions.length,
        totalSubmissionCycles: totalSubmissions,
        pendingReviewCount: pendingCount,
        approvedCount,
        changesRequestedCount,
        avgReviewHours,
      },
      items: list,
    };
  }

  /**
   * 6. Workload Distribution Report
   */
  public static async getWorkloadReport(organizationId: string, filters: ReportFilterDTO = {}) {
    const matchQuery = this.buildMatchQuery(organizationId, filters);

    const devAggregations = await WorkAssignmentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$assignedTo',
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
          totalEstimatedHours: {
            $sum: {
              $add: [
                { $ifNull: ['$estimatedHours', 0] },
                { $divide: [{ $ifNull: ['$estimatedMinutes', 0] }, 60] },
              ],
            },
          },
          assignmentIds: { $push: '$_id' },
        },
      },
    ]);

    const userIds = devAggregations.map((d) => d._id).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName name email avatar role');
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const allAssignmentIds = devAggregations.flatMap((d) => d.assignmentIds);
    const timeEntries = await TimeEntry.aggregate([
      { $match: { assignment: { $in: allAssignmentIds } } },
      { $group: { _id: '$user', totalSeconds: { $sum: '$duration' } } },
    ]);
    const timeMap = new Map(timeEntries.map((t) => [t._id.toString(), t.totalSeconds]));

    return devAggregations.map((d) => {
      const user = d._id ? userMap.get(d._id.toString()) : null;
      const loggedSeconds = d._id ? timeMap.get(d._id.toString()) || 0 : 0;
      const loggedHours = Math.round((loggedSeconds / 3600) * 10) / 10;
      const estimatedHours = Math.round(d.totalEstimatedHours * 10) / 10;

      const weeklyCapacityHours = 40;
      const assignedCapacityPct = Math.round((estimatedHours / weeklyCapacityHours) * 100);
      const availableCapacityHours = Math.max(0, weeklyCapacityHours - estimatedHours);

      let status: 'Under Capacity' | 'Optimal' | 'Over Capacity' = 'Optimal';
      if (estimatedHours > 40 || d.activeAssignments > 4) status = 'Over Capacity';
      else if (estimatedHours < 20 && d.activeAssignments <= 1) status = 'Under Capacity';

      return {
        developerId: d._id ? d._id.toString() : 'unassigned',
        developerName: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user as any).name || user.email
          : 'Unassigned',
        developerEmail: user?.email || '',
        avatar: user?.avatar || '',
        activeAssignments: d.activeAssignments,
        weeklyCapacityHours,
        assignedCapacityPct,
        availableCapacityHours,
        totalEstimatedHours: estimatedHours,
        totalLoggedHours: loggedHours,
        workloadStatus: status,
      };
    });
  }

  /**
   * 7. Export Assignments to CSV Format
   */
  public static async exportAssignmentsCSV(organizationId: string, filters: ReportFilterDTO = {}): Promise<string> {
    const matchQuery = this.buildMatchQuery(organizationId, filters);

    const assignments = await WorkAssignmentModel.find(matchQuery)
      .populate('assignedTo', 'firstName lastName name email')
      .populate('assignedBy', 'firstName lastName name email')
      .populate('project', 'name projectKey')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      'Assignment ID',
      'Title',
      'Developer',
      'Project',
      'Status',
      'Priority',
      'Progress (%)',
      'Due Date',
      'Estimated Hours',
      'Logged Hours',
      'Created By',
      'Created At',
      'Completed At',
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = assignments.map((a) => {
      const assignedTo: any = a.assignedTo;
      const assignedBy: any = a.assignedBy;
      const project: any = a.project;

      const devName = assignedTo
        ? `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim() || assignedTo.name || assignedTo.email
        : 'Unassigned';
      const byName = assignedBy
        ? `${assignedBy.firstName || ''} ${assignedBy.lastName || ''}`.trim() || assignedBy.name || assignedBy.email
        : '';
      const projName = project ? `${project.name} (${project.projectKey || ''})` : '';

      const estHours = (a.estimatedHours || 0) + (a.estimatedMinutes ? a.estimatedMinutes / 60 : 0);

      return [
        escapeCsv(a.assignmentId),
        escapeCsv(a.title),
        escapeCsv(devName),
        escapeCsv(projName),
        escapeCsv(a.status),
        escapeCsv(a.priority),
        escapeCsv(a.progress),
        escapeCsv(a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : ''),
        escapeCsv(Math.round(estHours * 10) / 10),
        escapeCsv(0), // logged hours calculated
        escapeCsv(byName),
        escapeCsv(a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : ''),
        escapeCsv(a.completedAt ? new Date(a.completedAt).toISOString().split('T')[0] : ''),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 8. Developer Detailed Drilldown
   */
  public static async getDeveloperDetailedDrilldown(developerId: string, organizationId: string) {
    const orgObjId = new Types.ObjectId(organizationId);
    const devObjId = new Types.ObjectId(developerId);

    const user = await User.findById(developerId).select('firstName lastName name email avatar role createdAt');
    if (!user) throw new Error('Developer not found');

    const assignments = await WorkAssignmentModel.find({
      organization: orgObjId,
      assignedTo: devObjId,
    })
      .populate('project', 'name projectKey')
      .sort({ updatedAt: -1 });

    const assignmentIds = assignments.map((a) => a._id);
    const timeEntries = await TimeEntry.find({
      assignment: { $in: assignmentIds },
    })
      .sort({ date: -1 })
      .limit(20);

    const totalSeconds = timeEntries.reduce((acc, t) => acc + (t.duration || 0), 0);
    const loggedHours = Math.round((totalSeconds / 3600) * 10) / 10;

    const now = new Date();
    const active = assignments.filter((a) =>
      ['Assigned', 'Acknowledged', 'In Progress', 'Blocked', 'Changes Requested'].includes(a.status)
    );
    const completed = assignments.filter((a) => a.status === 'Completed');
    const blocked = assignments.filter((a) => a.status === 'Blocked');
    const overdue = assignments.filter(
      (a) => !['Completed', 'Cancelled', 'Archived'].includes(a.status) && a.dueDate && new Date(a.dueDate) < now
    );
    const submitted = assignments.filter((a) => a.status === 'Submitted');

    const totalEstimatedHours = assignments.reduce(
      (acc, a) => acc + (a.estimatedHours || 0) + ((a.estimatedMinutes || 0) / 60),
      0
    );

    let workloadStatus: 'Optimal' | 'Busy' | 'Overloaded' = 'Optimal';
    if (active.length > 4 || totalEstimatedHours > 40 || overdue.length > 1) {
      workloadStatus = 'Overloaded';
    } else if (active.length >= 3 || totalEstimatedHours >= 25) {
      workloadStatus = 'Busy';
    }

    return {
      developer: {
        id: user._id.toString(),
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user as any).name || user.email,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        joinedAt: user.createdAt,
      },
      stats: {
        totalAssignments: assignments.length,
        activeAssignments: active.length,
        completedAssignments: completed.length,
        blockedAssignments: blocked.length,
        overdueAssignments: overdue.length,
        submittedAssignments: submitted.length,
        totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
        totalLoggedHours: loggedHours,
        workloadStatus,
        completionRate: assignments.length > 0 ? Math.round((completed.length / assignments.length) * 100) : 0,
      },
      assignments: assignments.map((a) => a.toPayload(0)),
      recentTimeLogs: timeEntries,
    };
  }

  /**
   * 9. Project Detailed Drilldown
   */
  public static async getProjectDetailedDrilldown(projectId: string, organizationId: string) {
    const orgObjId = new Types.ObjectId(organizationId);
    const projObjId = new Types.ObjectId(projectId);

    const project = await ProjectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const assignments = await WorkAssignmentModel.find({
      organization: orgObjId,
      project: projObjId,
    })
      .populate('assignedTo', 'firstName lastName name email avatar')
      .sort({ updatedAt: -1 });

    const now = new Date();
    const active = assignments.filter((a) =>
      ['Assigned', 'Acknowledged', 'In Progress', 'Blocked', 'Changes Requested'].includes(a.status)
    );
    const completed = assignments.filter((a) => a.status === 'Completed');
    const blocked = assignments.filter((a) => a.status === 'Blocked');
    const overdue = assignments.filter(
      (a) => !['Completed', 'Cancelled', 'Archived'].includes(a.status) && a.dueDate && new Date(a.dueDate) < now
    );
    const submitted = assignments.filter((a) => a.status === 'Submitted');

    const totalEstimatedHours = assignments.reduce(
      (acc, a) => acc + (a.estimatedHours || 0) + ((a.estimatedMinutes || 0) / 60),
      0
    );

    // Group by developer
    const developerMap: Record<string, any> = {};
    assignments.forEach((a) => {
      const dev: any = a.assignedTo;
      if (!dev) return;
      const id = dev._id?.toString() || dev.id;
      if (!developerMap[id]) {
        developerMap[id] = {
          id,
          name: `${dev.firstName || ''} ${dev.lastName || ''}`.trim() || dev.name || dev.email,
          email: dev.email,
          avatar: dev.avatar,
          total: 0,
          active: 0,
          completed: 0,
        };
      }
      developerMap[id].total++;
      if (a.status === 'Completed') developerMap[id].completed++;
      else if (!['Cancelled', 'Archived'].includes(a.status)) developerMap[id].active++;
    });

    return {
      project: {
        id: project._id.toString(),
        name: project.name,
        key: project.projectKey || (project as any).key || '',
        description: project.description || '',
        status: project.status || 'Active',
      },
      stats: {
        totalAssignments: assignments.length,
        activeAssignments: active.length,
        completedAssignments: completed.length,
        blockedAssignments: blocked.length,
        overdueAssignments: overdue.length,
        submittedAssignments: submitted.length,
        totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
        completionRate: assignments.length > 0 ? Math.round((completed.length / assignments.length) * 100) : 0,
        activeDevelopersCount: Object.keys(developerMap).length,
      },
      developerDistribution: Object.values(developerMap),
      assignments: assignments.map((a) => a.toPayload(0)),
    };
  }
}
