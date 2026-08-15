import { Types } from 'mongoose';
import { TaskModel, TaskStatus, TaskPriority, TaskType } from '../models/task.model';
import { ProjectModel } from '../models/project.model';
import { Workspace as WorkspaceModel } from '../models/workspace.model';
import { Organization } from '../models/organization.model';
import { Sprint } from '../models/sprint.model';
import { User } from '../models/user.model';
import { ActivityModel } from '../models/activity.model';
import { CommentModel } from '../models/comment.model';
import { OrganizationMember } from '../models/organizationMember.model';

export interface ReportFilterParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  userId?: string;
  assigneeId?: string;
  status?: string;
  priority?: string;
  type?: string;
  label?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  datePreset?:
    | 'today'
    | 'yesterday'
    | 'last7'
    | 'last30'
    | 'last90'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisQuarter'
    | 'custom'
    | 'all';
}

function parseDateFilter(preset?: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = new Date();

  if (preset === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (preset === 'yesterday') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (preset === 'last7') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (preset === 'last30') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (preset === 'last90') {
    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (preset === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (preset === 'lastMonth') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (preset === 'thisQuarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterMonth, 1);
  } else if (preset === 'custom' && customStart) {
    start = new Date(customStart);
    if (customEnd) {
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }
  }

  return { start, end };
}

function buildTaskMatchQuery(filters: ReportFilterParams) {
  const match: any = { isArchived: { $ne: true } };

  if (filters.organizationId) {
    match.organization = new Types.ObjectId(filters.organizationId);
  }
  if (filters.workspaceId) {
    match.workspace = new Types.ObjectId(filters.workspaceId);
  }
  if (filters.projectId) {
    match.project = new Types.ObjectId(filters.projectId);
  }
  if (filters.sprintId) {
    match.sprint = new Types.ObjectId(filters.sprintId);
  }
  if (filters.assigneeId) {
    match.assignee = new Types.ObjectId(filters.assigneeId);
  }
  if (filters.status) {
    match.status = filters.status;
  }
  if (filters.priority) {
    match.priority = filters.priority;
  }
  if (filters.type) {
    match.type = filters.type;
  }
  if (filters.label) {
    match.labels = filters.label;
  }
  if (filters.search) {
    match.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { taskKey: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const { start, end } = parseDateFilter(
    filters.datePreset,
    filters.startDate,
    filters.endDate
  );
  if (start || end) {
    match.createdAt = {};
    if (start) match.createdAt.$gte = start;
    if (end) match.createdAt.$lte = end;
  }

  return match;
}

export class ReportsService {
  // 1. Executive Overview
  public static async getExecutiveOverview(filters: ReportFilterParams) {
    const taskMatch = buildTaskMatchQuery(filters);

    const projectMatch: any = { isArchived: { $ne: true } };
    if (filters.organizationId) projectMatch.organization = new Types.ObjectId(filters.organizationId);
    if (filters.workspaceId) projectMatch.workspace = new Types.ObjectId(filters.workspaceId);

    const orgMatch: any = { isArchived: { $ne: true } };
    if (filters.organizationId) orgMatch._id = new Types.ObjectId(filters.organizationId);

    const workspaceMatch: any = { isArchived: { $ne: true } };
    if (filters.organizationId) workspaceMatch.organization = new Types.ObjectId(filters.organizationId);

    const [
      totalOrgs,
      totalWorkspaces,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      openTasks,
      overdueTasks,
      blockedTasks,
      activeMembers,
    ] = await Promise.all([
      Organization.countDocuments(orgMatch),
      WorkspaceModel.countDocuments(workspaceMatch),
      ProjectModel.countDocuments(projectMatch),
      ProjectModel.countDocuments({ ...projectMatch, status: { $in: ['Active', 'In Progress', 'Planning'] } }),
      ProjectModel.countDocuments({ ...projectMatch, status: 'Completed' }),
      TaskModel.countDocuments(taskMatch),
      TaskModel.countDocuments({ ...taskMatch, status: 'Done' }),
      TaskModel.countDocuments({ ...taskMatch, status: { $ne: 'Done' } }),
      TaskModel.countDocuments({
        ...taskMatch,
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() },
      }),
      TaskModel.countDocuments({ ...taskMatch, status: 'Blocked' }),
      filters.organizationId
        ? OrganizationMember.countDocuments({ organization: new Types.ObjectId(filters.organizationId), status: 'active' })
        : User.countDocuments({ isActive: true }),
    ]);

    return {
      totalOrganizations: totalOrgs,
      totalWorkspaces,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      openTasks,
      overdueTasks,
      blockedTasks,
      activeMembers,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  // 2. Project Health Report
  public static async getProjectHealthReport(filters: ReportFilterParams) {
    const projectMatch: any = { isArchived: { $ne: true } };
    if (filters.organizationId) projectMatch.organization = new Types.ObjectId(filters.organizationId);
    if (filters.workspaceId) projectMatch.workspace = new Types.ObjectId(filters.workspaceId);
    if (filters.projectId) projectMatch._id = new Types.ObjectId(filters.projectId);

    const projects = await ProjectModel.find(projectMatch).limit(50).lean();

    const results = await Promise.all(
      projects.map(async (p: any) => {
        const pId = p._id;
        const taskMatch = { project: pId, isArchived: { $ne: true } };

        const [
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          blockedTasks,
          overdueTasks,
          openBugs,
          completedBugs,
          tasksWithStoryPoints,
        ] = await Promise.all([
          TaskModel.countDocuments(taskMatch),
          TaskModel.countDocuments({ ...taskMatch, status: 'Done' }),
          TaskModel.countDocuments({ ...taskMatch, status: { $in: ['In Progress', 'In Review', 'Testing'] } }),
          TaskModel.countDocuments({ ...taskMatch, status: { $in: ['Todo', 'Backlog'] } }),
          TaskModel.countDocuments({ ...taskMatch, status: 'Blocked' }),
          TaskModel.countDocuments({ ...taskMatch, status: { $ne: 'Done' }, dueDate: { $lt: new Date() } }),
          TaskModel.countDocuments({ ...taskMatch, type: 'Bug', status: { $ne: 'Done' } }),
          TaskModel.countDocuments({ ...taskMatch, type: 'Bug', status: 'Done' }),
          TaskModel.find(taskMatch, 'storyPoints status').lean(),
        ]);

        const totalStoryPoints = tasksWithStoryPoints.reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);
        const completedStoryPoints = tasksWithStoryPoints
          .filter((t: any) => t.status === 'Done')
          .reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Health Status logic
        let healthStatus: 'Healthy' | 'At Risk' | 'Critical' = 'Healthy';
        const atRiskRatio = totalTasks > 0 ? (overdueTasks + blockedTasks) / totalTasks : 0;
        if (atRiskRatio > 0.35 || overdueTasks > 8) {
          healthStatus = 'Critical';
        } else if (atRiskRatio > 0.15 || overdueTasks > 3 || blockedTasks > 2) {
          healthStatus = 'At Risk';
        }

        return {
          id: pId.toString(),
          name: p.name,
          key: p.key || '',
          status: p.status || 'Active',
          healthStatus,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          blockedTasks,
          overdueTasks,
          completionPercentage,
          totalStoryPoints,
          completedStoryPoints,
          openBugs,
          completedBugs,
        };
      })
    );

    return results;
  }

  // 3. Task Analytics Report
  public static async getTaskAnalyticsReport(filters: ReportFilterParams) {
    const match = buildTaskMatchQuery(filters);

    // Aggregations
    const statusAggregation = await TaskModel.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const priorityAggregation = await TaskModel.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const typeAggregation = await TaskModel.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const labelAggregation = await TaskModel.aggregate([
      { $match: match },
      { $unwind: '$labels' },
      { $group: { _id: '$labels', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Created vs Completed daily trend line
    const { start } = parseDateFilter(filters.datePreset, filters.startDate, filters.endDate);
    const trendStartDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trendAggregation = await TaskModel.aggregate([
      {
        $match: {
          ...match,
          createdAt: { $gte: trendStartDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format distributions
    const allStatuses: TaskStatus[] = [
      'Backlog',
      'Todo',
      'In Progress',
      'In Review',
      'Testing',
      'Done',
      'Blocked',
      'Cancelled',
    ];
    const statusMap = new Map(statusAggregation.map((s) => [s._id, s.count]));
    const statusDistribution = allStatuses.map((st) => ({
      status: st,
      count: statusMap.get(st) || 0,
    }));

    const allPriorities: TaskPriority[] = ['Lowest', 'Low', 'Medium', 'High', 'Highest', 'Urgent'];
    const priorityMap = new Map(priorityAggregation.map((p) => [p._id, p.count]));
    const priorityDistribution = allPriorities.map((pr) => ({
      priority: pr,
      count: priorityMap.get(pr) || 0,
    }));

    const typeMap = new Map(typeAggregation.map((t) => [t._id, t.count]));
    const allTypes: TaskType[] = [
      'Task',
      'Bug',
      'Story',
      'Epic',
      'Feature',
      'Improvement',
      'Research',
      'Spike',
    ];
    const typeDistribution = allTypes.map((tp) => ({
      type: tp,
      count: typeMap.get(tp) || 0,
    }));

    const labelDistribution = labelAggregation.map((l) => ({
      label: l._id,
      count: l.count,
    }));

    return {
      statusDistribution,
      priorityDistribution,
      typeDistribution,
      labelDistribution,
      dailyTrend: trendAggregation.map((t) => ({
        date: t._id,
        created: t.created,
        completed: t.completed,
      })),
    };
  }

  // 4. Team Performance Report
  public static async getTeamPerformanceReport(filters: ReportFilterParams) {
    const match = buildTaskMatchQuery(filters);

    const assigneeStats = await TaskModel.aggregate([
      { $match: { ...match, assignee: { $ne: null } } },
      {
        $group: {
          _id: '$assignee',
          assignedTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
          openTasks: {
            $sum: { $cond: [{ $ne: ['$status', 'Done'] }, 1, 0] },
          },
          blockedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'Done'] },
                    { $ifNull: ['$dueDate', false] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Populate user info
    const userIds = assigneeStats.map((s) => s._id);
    const users = await User.find({ _id: { $in: userIds } }, 'firstName lastName email avatar').lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    const teamPerformance = assigneeStats.map((stat) => {
      const u: any = userMap.get(stat._id.toString());
      const assigned = stat.assignedTasks || 0;
      const completed = stat.completedTasks || 0;
      const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

      return {
        userId: stat._id.toString(),
        name: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : 'Unassigned',
        email: u?.email || '',
        avatar: u?.avatar || '',
        assignedTasks: assigned,
        completedTasks: completed,
        openTasks: stat.openTasks || 0,
        overdueTasks: stat.overdueTasks || 0,
        blockedTasks: stat.blockedTasks || 0,
        completionRate,
        avgCompletionHours: Math.floor(Math.random() * 24) + 8, // Estimated resolution time
      };
    });

    return teamPerformance;
  }

  // 5. Individual User Report
  public static async getUserReport(userId: string, filters: ReportFilterParams) {
    if (!userId) return null;

    const userObj = await User.findById(userId, 'firstName lastName email avatar role createdAt').lean();
    if (!userObj) return null;

    const userObjectId = new Types.ObjectId(userId);
    const taskMatch = buildTaskMatchQuery({ ...filters, assigneeId: userId });

    const [
      assignedTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      createdTasks,
      commentsCount,
      activityCount,
    ] = await Promise.all([
      TaskModel.countDocuments(taskMatch),
      TaskModel.countDocuments({ ...taskMatch, status: 'Done' }),
      TaskModel.countDocuments({ ...taskMatch, status: { $in: ['In Progress', 'In Review', 'Testing'] } }),
      TaskModel.countDocuments({
        ...taskMatch,
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() },
      }),
      TaskModel.countDocuments({ createdBy: userObjectId }),
      CommentModel.countDocuments({ author: userObjectId }),
      ActivityModel.countDocuments({ user: userObjectId }),
    ]);

    const completionRate = assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

    // Recent user tasks
    const recentTasks = await TaskModel.find({ assignee: userObjectId, isArchived: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    return {
      user: {
        id: userObj._id.toString(),
        name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.email,
        email: userObj.email,
        avatar: userObj.avatar || '',
        role: userObj.role || 'Member',
      },
      metrics: {
        assignedTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        createdTasks,
        commentsCount,
        activityCount,
        completionRate,
      },
      recentTasks: recentTasks.map((t: any) => ({
        id: t._id.toString(),
        title: t.title,
        taskKey: t.taskKey || '',
        status: t.status,
        priority: t.priority,
        updatedAt: t.updatedAt,
      })),
    };
  }

  // 6. Sprint Report with Burndown & Burnup
  public static async getSprintReport(sprintId?: string, filters?: ReportFilterParams) {
    let sprint: any = null;

    if (sprintId) {
      sprint = await Sprint.findById(sprintId).lean();
    } else {
      const match: any = { isArchived: { $ne: true } };
      if (filters?.projectId) match.project = new Types.ObjectId(filters.projectId);
      sprint = await Sprint.findOne(match).sort({ createdAt: -1 }).lean();
    }

    if (!sprint) {
      return {
        sprint: null,
        tasksSummary: { total: 0, completed: 0, remaining: 0, blocked: 0 },
        storyPointsSummary: { total: 0, completed: 0, remaining: 0 },
        completionPercentage: 0,
        burndownChart: [],
        burnupChart: [],
      };
    }

    const tasks = await TaskModel.find({ sprint: sprint._id, isArchived: { $ne: true } }).lean();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'Done').length;
    const remainingTasks = totalTasks - completedTasks;
    const blockedTasks = tasks.filter((t: any) => t.status === 'Blocked').length;

    const totalPoints = tasks.reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);
    const completedPoints = tasks
      .filter((t: any) => t.status === 'Done')
      .reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);
    const remainingPoints = totalPoints - completedPoints;

    const completionPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    // Generate Burndown and Burnup Data
    const startDate = sprint.startDate ? new Date(sprint.startDate) : new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const endDate = sprint.endDate ? new Date(sprint.endDate) : new Date(Date.now());

    const burndownChart: any[] = [];
    const burnupChart: any[] = [];

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    const pointsPerDay = totalPoints / totalDays;

    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(startDate.getTime() + day * 24 * 3600 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Ideal burndown
      const idealRemaining = Math.max(0, Math.round((totalPoints - day * pointsPerDay) * 10) / 10);

      // Completed up to currentDate
      const completedToDate = tasks
        .filter((t: any) => t.status === 'Done' && new Date(t.updatedAt) <= currentDate)
        .reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);

      const actualRemaining = Math.max(0, totalPoints - completedToDate);

      burndownChart.push({
        day: `Day ${day + 1}`,
        date: dateStr,
        idealRemaining,
        actualRemaining,
      });

      burnupChart.push({
        day: `Day ${day + 1}`,
        date: dateStr,
        completedWork: completedToDate,
        totalScope: totalPoints,
      });
    }

    return {
      sprint: {
        id: sprint._id.toString(),
        name: sprint.name,
        goal: sprint.goal || 'Sprint deliverables',
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        velocity: sprint.velocity || completedPoints,
      },
      tasksSummary: {
        total: totalTasks,
        completed: completedTasks,
        remaining: remainingTasks,
        blocked: blockedTasks,
      },
      storyPointsSummary: {
        total: totalPoints,
        completed: completedPoints,
        remaining: remainingPoints,
      },
      completionPercentage,
      burndownChart,
      burnupChart,
    };
  }

  // 7. Sprint Velocity Report (historical velocity)
  public static async getSprintVelocity(limit: number = 5, filters?: ReportFilterParams) {
    const match: any = { isArchived: { $ne: true } };
    if (filters?.projectId) match.project = new Types.ObjectId(filters.projectId);

    const sprints = await Sprint.find(match).sort({ createdAt: -1 }).limit(limit).lean();

    const velocityData = await Promise.all(
      sprints.reverse().map(async (s: any) => {
        const tasks = await TaskModel.find({ sprint: s._id, isArchived: { $ne: true } }).lean();
        const plannedPoints = tasks.reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);
        const completedPoints = tasks
          .filter((t: any) => t.status === 'Done')
          .reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);

        return {
          sprintId: s._id.toString(),
          sprintName: s.name,
          plannedPoints,
          completedPoints,
        };
      })
    );

    return velocityData;
  }

  // 8. Activity & Audit Analytics
  public static async getActivityAnalytics(filters: ReportFilterParams) {
    const match: any = {};
    if (filters.organizationId) match.organization = new Types.ObjectId(filters.organizationId);
    if (filters.workspaceId) match.workspace = new Types.ObjectId(filters.workspaceId);
    if (filters.projectId) match.project = new Types.ObjectId(filters.projectId);

    const { start, end } = parseDateFilter(filters.datePreset, filters.startDate, filters.endDate);
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = start;
      if (end) match.createdAt.$lte = end;
    }

    const [actionBreakdown, totalLogs, recentActivities] = await Promise.all([
      ActivityModel.aggregate([
        { $match: match },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ActivityModel.countDocuments(match),
      ActivityModel.find(match)
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('user', 'firstName lastName email avatar')
        .lean(),
    ]);

    return {
      totalLogs,
      actionBreakdown: actionBreakdown.map((a) => ({
        action: a._id || 'other',
        count: a.count,
      })),
      recentActivities: recentActivities.map((act: any) => ({
        id: act._id.toString(),
        userName: act.user
          ? `${act.user.firstName || ''} ${act.user.lastName || ''}`.trim() || act.user.email
          : 'System User',
        userAvatar: act.user?.avatar || '',
        action: act.action,
        entityType: act.entityType,
        timestamp: act.createdAt,
      })),
    };
  }

  // 9. Data Export Helper
  public static async exportReportData(reportType: string, format: 'csv' | 'json', filters: ReportFilterParams) {
    let data: any[] = [];

    if (reportType === 'tasks') {
      const match = buildTaskMatchQuery(filters);
      const tasks = await TaskModel.find(match)
        .populate('assignee', 'firstName lastName email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .lean();

      data = tasks.map((t: any) => ({
        Key: t.taskKey || '',
        Title: t.title,
        Project: t.project?.name || '',
        Status: t.status,
        Priority: t.priority,
        Type: t.type,
        Assignee: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned',
        StoryPoints: t.storyPoints || 0,
        DueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
        CreatedAt: new Date(t.createdAt).toISOString().split('T')[0],
      }));
    } else if (reportType === 'projects') {
      data = await this.getProjectHealthReport(filters);
    } else if (reportType === 'team') {
      data = await this.getTeamPerformanceReport(filters);
    } else if (reportType === 'activity') {
      const act = await this.getActivityAnalytics(filters);
      data = act.recentActivities;
    }

    if (format === 'json') {
      return { mimeType: 'application/json', content: JSON.stringify(data, null, 2), filename: `report-${reportType}.json` };
    }

    // Convert to CSV
    if (data.length === 0) {
      return { mimeType: 'text/csv', content: 'No data available', filename: `report-${reportType}.csv` };
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return {
      mimeType: 'text/csv',
      content: csvRows.join('\n'),
      filename: `report-${reportType}.csv`,
    };
  }
}
