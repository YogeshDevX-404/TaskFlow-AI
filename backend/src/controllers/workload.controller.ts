import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { TaskModel as Task } from '../models/task.model';
import { ProjectModel as Project } from '../models/project.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { MemberCapacity } from '../models/memberCapacity.model';
import { User } from '../models/user.model';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS, WORKLOAD_DEFAULTS } from '../constants';
import { broadcastTaskSocketEvent } from '../socket/socketServer';

/**
 * Helper to calculate workload status string based on utilization %
 */
function calculateWorkloadStatus(utilization: number, capacity: number): string {
  if (capacity <= 0) return 'No Capacity Data';
  if (utilization < WORKLOAD_DEFAULTS.THRESHOLDS.AVAILABLE_MAX) return 'Available';
  if (utilization <= WORKLOAD_DEFAULTS.THRESHOLDS.NORMAL_MAX) return 'Normal';
  if (utilization <= WORKLOAD_DEFAULTS.THRESHOLDS.HIGH_MAX) return 'High';
  return 'Overloaded';
}

/**
 * Helper to check if user belongs to an organization
 */
async function verifyOrgMembership(userId: string, organizationId: string): Promise<any> {
  const member = await OrganizationMember.findOne({
    organization: organizationId,
    user: userId,
    status: 'active',
  });
  return member;
}

export class WorkloadController {
  /**
   * GET /api/v1/workload
   * Overall Team Workload Overview & High-Level Summary
   */
  public static async getWorkloadOverview(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { organizationId, workspaceId, projectId, startDate, endDate } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    // RBAC: Verify organization membership
    const membership = await verifyOrgMembership(currentUserId, orgId);
    if (!membership && (req.user?.role as string) !== 'owner' && req.user?.role !== 'admin') {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        'You do not have access to this organization workload',
        'FORBIDDEN'
      );
    }

    // Build base query for tasks
    const taskMatch: any = {
      organization: new Types.ObjectId(orgId),
      isArchived: { $ne: true },
    };

    if (workspaceId) taskMatch.workspace = new Types.ObjectId(workspaceId as string);
    if (projectId) taskMatch.project = new Types.ObjectId(projectId as string);

    if (startDate || endDate) {
      taskMatch.createdAt = {};
      if (startDate) taskMatch.createdAt.$gte = new Date(startDate as string);
      if (endDate) taskMatch.createdAt.$lte = new Date(endDate as string);
    }

    // Get active org members
    const orgMembers = await OrganizationMember.find({
      organization: orgId,
      status: 'active',
    }).populate('user', 'firstName lastName name email avatar role jobTitle department');

    const userIds = orgMembers.map((m) => m.user?._id || m.user);

    // Fetch custom member capacities
    const capacities = await MemberCapacity.find({
      organization: orgId,
      user: { $in: userIds },
    });

    const capacityMap = new Map<string, number>();
    capacities.forEach((c) => {
      capacityMap.set(c.user.toString(), c.weeklyCapacityHours || WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS);
    });

    // Aggregate tasks by assignee
    const taskAggregation = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$assignee',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $in: ['$status', ['Done']] }, 1, 0] },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $in: ['$status', ['In Progress', 'In Review', 'Testing']] }, 1, 0] },
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $nin: ['$status', ['Done', 'Cancelled']] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          blockedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
          },
          totalStoryPoints: { $sum: { $ifNull: ['$storyPoints', 0] } },
          totalEstimatedHours: { $sum: { $ifNull: ['$estimatedHours', 0] } },
          totalSpentHours: { $sum: { $ifNull: ['$spentHours', 0] } },
        },
      },
    ]);

    const taskMap = new Map<string, any>();
    taskAggregation.forEach((item) => {
      if (item._id) {
        taskMap.set(item._id.toString(), item);
      }
    });

    // Compute team metrics
    let totalCapacityHours = 0;
    let totalEstimatedWorkHours = 0;
    let totalLoggedWorkHours = 0;
    let overloadedCount = 0;
    let highCount = 0;
    let normalCount = 0;
    let availableCount = 0;
    let noCapacityCount = 0;

    orgMembers.forEach((member) => {
      const uId = member.user?._id ? member.user._id.toString() : member.user.toString();
      const weeklyCapacity = capacityMap.get(uId) ?? WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS;
      totalCapacityHours += weeklyCapacity;

      const memberTasks = taskMap.get(uId) || {
        totalEstimatedHours: 0,
        totalSpentHours: 0,
      };

      const estHours = memberTasks.totalEstimatedHours || 0;
      const spentHours = memberTasks.totalSpentHours || 0;

      totalEstimatedWorkHours += estHours;
      totalLoggedWorkHours += spentHours;

      const util = weeklyCapacity > 0 ? Math.round((estHours / weeklyCapacity) * 100) : 0;
      const status = calculateWorkloadStatus(util, weeklyCapacity);

      if (status === 'Overloaded') overloadedCount++;
      else if (status === 'High') highCount++;
      else if (status === 'Normal') normalCount++;
      else if (status === 'Available') availableCount++;
      else noCapacityCount++;
    });

    const teamUtilization =
      totalCapacityHours > 0
        ? Math.round((totalEstimatedWorkHours / totalCapacityHours) * 100)
        : 0;

    const availableCapacityHours = Math.max(0, totalCapacityHours - totalEstimatedWorkHours);

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Workload overview retrieved successfully', {
      teamSummary: {
        totalMembers: orgMembers.length,
        totalCapacityHours,
        allocatedCapacityHours: Math.min(totalCapacityHours, totalEstimatedWorkHours),
        availableCapacityHours,
        totalEstimatedWorkHours: Math.round(totalEstimatedWorkHours * 10) / 10,
        totalLoggedWorkHours: Math.round(totalLoggedWorkHours * 10) / 10,
        teamUtilizationPercentage: teamUtilization,
        overloadedMembersCount: overloadedCount,
        highWorkloadMembersCount: highCount,
        normalWorkloadMembersCount: normalCount,
        availableMembersCount: availableCount,
        noCapacityMembersCount: noCapacityCount,
      },
    });
  }

  /**
   * GET /api/v1/workload/team
   * Detailed Per-Member Workload Breakdown
   */
  public static async getTeamWorkload(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const {
      organizationId,
      workspaceId,
      projectId,
      search,
      role,
      workloadStatus,
      sortBy = 'utilization',
      sortOrder = 'desc',
    } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const membership = await verifyOrgMembership(currentUserId, orgId);
    if (!membership && (req.user?.role as string) !== 'owner' && req.user?.role !== 'admin') {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        'You do not have access to team workload',
        'FORBIDDEN'
      );
    }

    // Build task match
    const taskMatch: any = {
      organization: new Types.ObjectId(orgId),
      isArchived: { $ne: true },
    };
    if (workspaceId) taskMatch.workspace = new Types.ObjectId(workspaceId as string);
    if (projectId) taskMatch.project = new Types.ObjectId(projectId as string);

    // Get active org members
    const orgMembers = await OrganizationMember.find({
      organization: orgId,
      status: 'active',
    }).populate('user', 'firstName lastName name email avatar role jobTitle department');

    const userIds = orgMembers.map((m) => m.user?._id || m.user);

    // Fetch capacities
    const capacities = await MemberCapacity.find({
      organization: orgId,
      user: { $in: userIds },
    });

    const capacityMap = new Map<string, any>();
    capacities.forEach((c) => {
      capacityMap.set(c.user.toString(), c);
    });

    // Task aggregation by assignee with full status breakdown
    const taskAggregation = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$assignee',
          assignedTasksCount: { $sum: 1 },
          completedTasksCount: {
            $sum: { $cond: [{ $in: ['$status', ['Done']] }, 1, 0] },
          },
          inProgressTasksCount: {
            $sum: { $cond: [{ $in: ['$status', ['In Progress', 'In Review', 'Testing']] }, 1, 0] },
          },
          overdueTasksCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $nin: ['$status', ['Done', 'Cancelled']] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          blockedTasksCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] },
          },
          backlogCount: { $sum: { $cond: [{ $eq: ['$status', 'Backlog'] }, 1, 0] } },
          todoCount: { $sum: { $cond: [{ $eq: ['$status', 'Todo'] }, 1, 0] } },
          inProgressCount: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          inReviewCount: { $sum: { $cond: [{ $eq: ['$status', 'In Review'] }, 1, 0] } },
          testingCount: { $sum: { $cond: [{ $eq: ['$status', 'Testing'] }, 1, 0] } },
          doneCount: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
          blockedCount: { $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          storyPoints: { $sum: { $ifNull: ['$storyPoints', 0] } },
          estimatedHours: { $sum: { $ifNull: ['$estimatedHours', 0] } },
          loggedHours: { $sum: { $ifNull: ['$spentHours', 0] } },
        },
      },
    ]);

    const taskMap = new Map<string, any>();
    taskAggregation.forEach((item) => {
      if (item._id) taskMap.set(item._id.toString(), item);
    });

    let membersList = orgMembers.map((m) => {
      const uObj = typeof m.user === 'object' ? m.user : null;
      const uId = uObj ? (uObj as any)._id.toString() : m.user.toString();
      const capDoc = capacityMap.get(uId);

      const weeklyCapacity = capDoc?.weeklyCapacityHours ?? WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS;
      const dailyCapacity = capDoc?.dailyCapacityHours ?? WORKLOAD_DEFAULTS.DAILY_CAPACITY_HOURS;
      const workingDays = capDoc?.workingDays || [...WORKLOAD_DEFAULTS.WORKING_DAYS];

      const tStats = taskMap.get(uId) || {
        assignedTasksCount: 0,
        completedTasksCount: 0,
        inProgressTasksCount: 0,
        overdueTasksCount: 0,
        blockedTasksCount: 0,
        backlogCount: 0,
        todoCount: 0,
        inProgressCount: 0,
        inReviewCount: 0,
        testingCount: 0,
        doneCount: 0,
        blockedCount: 0,
        cancelledCount: 0,
        storyPoints: 0,
        estimatedHours: 0,
        loggedHours: 0,
      };

      const estHours = Math.round((tStats.estimatedHours || 0) * 10) / 10;
      const logHours = Math.round((tStats.loggedHours || 0) * 10) / 10;
      const utilizationPercentage =
        weeklyCapacity > 0 ? Math.round((estHours / weeklyCapacity) * 100) : 0;

      const status = calculateWorkloadStatus(utilizationPercentage, weeklyCapacity);

      const uObjAny = uObj as any;
      const uName = uObjAny
        ? uObjAny.name || `${uObjAny.firstName || ''} ${uObjAny.lastName || ''}`.trim()
        : 'Team Member';

      return {
        userId: uId,
        user: {
          id: uId,
          name: uName,
          email: uObjAny?.email || '',
          avatar: uObjAny?.avatar || '',
          role: m.role || uObjAny?.role || 'member',
          jobTitle: uObjAny?.jobTitle || '',
          department: uObjAny?.department || '',
        },
        assignedTasksCount: tStats.assignedTasksCount || 0,
        completedTasksCount: tStats.completedTasksCount || 0,
        inProgressTasksCount: tStats.inProgressTasksCount || 0,
        overdueTasksCount: tStats.overdueTasksCount || 0,
        blockedTasksCount: tStats.blockedTasksCount || 0,
        taskDistribution: {
          backlog: tStats.backlogCount || 0,
          todo: tStats.todoCount || 0,
          inProgress: tStats.inProgressCount || 0,
          inReview: tStats.inReviewCount || 0,
          testing: tStats.testingCount || 0,
          done: tStats.doneCount || 0,
          blocked: tStats.blockedCount || 0,
          cancelled: tStats.cancelledCount || 0,
        },
        storyPoints: tStats.storyPoints || 0,
        estimatedHours: estHours,
        loggedHours: logHours,
        remainingHours: Math.max(0, Math.round((estHours - logHours) * 10) / 10),
        capacity: {
          weeklyCapacityHours: weeklyCapacity,
          dailyCapacityHours: dailyCapacity,
          workingDays,
          timezone: capDoc?.timezone || WORKLOAD_DEFAULTS.TIMEZONE,
        },
        utilizationPercentage,
        workloadStatus: status,
      };
    });

    // Apply filtering
    if (search) {
      const q = (search as string).toLowerCase();
      membersList = membersList.filter(
        (m) =>
          m.user.name.toLowerCase().includes(q) ||
          m.user.email.toLowerCase().includes(q) ||
          m.user.jobTitle.toLowerCase().includes(q)
      );
    }

    if (role) {
      membersList = membersList.filter((m) => m.user.role === role);
    }

    if (workloadStatus) {
      membersList = membersList.filter((m) => m.workloadStatus === workloadStatus);
    }

    // Apply sorting
    membersList.sort((a, b) => {
      let valA: any = (a as any)[sortBy as string];
      let valB: any = (b as any)[sortBy as string];

      if (sortBy === 'name') {
        valA = a.user.name.toLowerCase();
        valB = b.user.name.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Team workload retrieved successfully', {
      members: membersList,
      totalMembers: membersList.length,
    });
  }

  /**
   * GET /api/v1/workload/members/:userId
   * Single Member Detailed Workload & Task List
   */
  public static async getMemberWorkload(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { userId } = req.params;
    const { organizationId } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const targetUser = await User.findById(userId).select(
      'firstName lastName name email avatar role jobTitle department'
    );
    if (!targetUser) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found', 'USER_NOT_FOUND');
    }

    // Capacity config
    const capacityDoc = await MemberCapacity.findOne({
      user: userId,
      organization: orgId,
    });

    const weeklyCapacity =
      capacityDoc?.weeklyCapacityHours ?? WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS;
    const dailyCapacity =
      capacityDoc?.dailyCapacityHours ?? WORKLOAD_DEFAULTS.DAILY_CAPACITY_HOURS;

    // Fetch assigned tasks
    const tasks = await Task.find({
      organization: orgId,
      assignee: userId,
      isArchived: { $ne: true },
    })
      .populate('project', 'name key')
      .populate('workspace', 'name')
      .sort({ dueDate: 1 });

    let estHours = 0;
    let spentHours = 0;
    let storyPoints = 0;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    let blocked = 0;

    tasks.forEach((t) => {
      estHours += t.estimatedHours || 0;
      spentHours += t.spentHours || 0;
      storyPoints += t.storyPoints || 0;

      if (t.status === 'Done') completed++;
      else if (['In Progress', 'In Review', 'Testing'].includes(t.status)) inProgress++;

      if (t.status === 'Blocked') blocked++;

      if (t.dueDate && new Date(t.dueDate) < new Date() && !['Done', 'Cancelled'].includes(t.status)) {
        overdue++;
      }
    });

    const utilizationPercentage =
      weeklyCapacity > 0 ? Math.round((estHours / weeklyCapacity) * 100) : 0;
    const workloadStatus = calculateWorkloadStatus(utilizationPercentage, weeklyCapacity);

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Member workload retrieved', {
      member: {
        id: targetUser._id,
        name:
          (targetUser as any).name ||
          `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim(),
        email: targetUser.email,
        avatar: targetUser.avatar,
        role: targetUser.role,
        jobTitle: (targetUser as any).jobTitle || '',
        department: (targetUser as any).department || '',
      },
      capacity: {
        weeklyCapacityHours: weeklyCapacity,
        dailyCapacityHours: dailyCapacity,
        workingDays: capacityDoc?.workingDays || [...WORKLOAD_DEFAULTS.WORKING_DAYS],
        timezone: capacityDoc?.timezone || WORKLOAD_DEFAULTS.TIMEZONE,
      },
      stats: {
        assignedTasksCount: tasks.length,
        completedTasksCount: completed,
        inProgressTasksCount: inProgress,
        overdueTasksCount: overdue,
        blockedTasksCount: blocked,
        storyPoints,
        estimatedHours: Math.round(estHours * 10) / 10,
        loggedHours: Math.round(spentHours * 10) / 10,
        utilizationPercentage,
        workloadStatus,
      },
      tasks: tasks.map((t) => t.toTaskPayload(currentUserId)),
    });
  }

  /**
   * GET /api/v1/workload/projects/:projectId
   * Project Workload & Project Resource Breakdown
   */
  public static async getProjectWorkload(req: Request, res: Response) {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        'Project not found',
        'PROJECT_NOT_FOUND'
      );
    }

    // Get all tasks in project
    const tasks = await Task.find({
      project: projectId,
      isArchived: { $ne: true },
    }).populate('assignee', 'firstName lastName name email avatar role');

    // Aggregate by assignee for Project Resource View
    const memberResourceMap = new Map<string, any>();

    let totalTasks = tasks.length;
    let openTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let totalStoryPoints = 0;
    let totalEstimatedHours = 0;
    let totalLoggedHours = 0;

    tasks.forEach((t) => {
      totalStoryPoints += t.storyPoints || 0;
      totalEstimatedHours += t.estimatedHours || 0;
      totalLoggedHours += t.spentHours || 0;

      if (t.status === 'Done') {
        completedTasks++;
      } else {
        openTasks++;
      }

      if (t.dueDate && new Date(t.dueDate) < new Date() && !['Done', 'Cancelled'].includes(t.status)) {
        overdueTasks++;
      }

      if (t.assignee) {
        const uObj = t.assignee as any;
        const uId = uObj._id ? uObj._id.toString() : uObj.toString();

        if (!memberResourceMap.has(uId)) {
          memberResourceMap.set(uId, {
            user: {
              id: uId,
              name: uObj.name || `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim(),
              email: uObj.email,
              avatar: uObj.avatar,
            },
            assignedTasksCount: 0,
            estimatedHours: 0,
            loggedHours: 0,
          });
        }

        const entry = memberResourceMap.get(uId);
        entry.assignedTasksCount += 1;
        entry.estimatedHours += t.estimatedHours || 0;
        entry.loggedHours += t.spentHours || 0;
      }
    });

    const resources = Array.from(memberResourceMap.values()).map((r) => {
      const est = Math.round(r.estimatedHours * 10) / 10;
      const log = Math.round(r.loggedHours * 10) / 10;
      return {
        ...r,
        estimatedHours: est,
        loggedHours: log,
        remainingHours: Math.max(0, Math.round((est - log) * 10) / 10),
      };
    });

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Project workload retrieved', {
      project: {
        id: project._id,
        name: project.name,
        key: (project as any).key || '',
      },
      summary: {
        totalTasks,
        openTasks,
        completedTasks,
        overdueTasks,
        totalStoryPoints,
        totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
        totalLoggedHours: Math.round(totalLoggedHours * 10) / 10,
        resourcesCount: resources.length,
      },
      resources,
    });
  }

  /**
   * GET /api/v1/workload/calendar
   * Workload Calendar / Timeline Data
   */
  public static async getWorkloadCalendar(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { organizationId, startDate, endDate } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate
      ? new Date(endDate as string)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      organization: orgId,
      isArchived: { $ne: true },
      $or: [
        { dueDate: { $gte: start, $lte: end } },
        { startDate: { $gte: start, $lte: end } },
      ],
    })
      .populate('assignee', 'firstName lastName name email avatar')
      .populate('project', 'name key');

    // Group tasks per assignee per date
    const calendarEntriesMap = new Map<string, any>();

    tasks.forEach((t) => {
      if (!t.assignee) return;
      const uObj = t.assignee as any;
      const uId = uObj._id ? uObj._id.toString() : uObj.toString();
      const dateKey = t.dueDate
        ? new Date(t.dueDate).toISOString().split('T')[0]
        : new Date(t.startDate || Date.now()).toISOString().split('T')[0];

      const entryKey = `${uId}_${dateKey}`;

      if (!calendarEntriesMap.has(entryKey)) {
        calendarEntriesMap.set(entryKey, {
          userId: uId,
          userName: uObj.name || `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim(),
          date: dateKey,
          assignedTasksCount: 0,
          estimatedHours: 0,
          tasks: [],
        });
      }

      const item = calendarEntriesMap.get(entryKey);
      item.assignedTasksCount += 1;
      item.estimatedHours += t.estimatedHours || 0;
      item.tasks.push({
        id: t._id,
        taskKey: t.taskKey,
        title: t.title,
        priority: t.priority,
        status: t.status,
        estimatedHours: t.estimatedHours || 0,
      });
    });

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Workload calendar data retrieved', {
      calendar: Array.from(calendarEntriesMap.values()),
    });
  }

  /**
   * GET /api/v1/workload/overloaded
   * Overloaded Members Endpoint
   */
  public static async getOverloadedMembers(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { organizationId } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const orgMembers = await OrganizationMember.find({
      organization: orgId,
      status: 'active',
    }).populate('user', 'firstName lastName name email avatar role jobTitle');

    const userIds = orgMembers.map((m) => m.user?._id || m.user);

    const capacities = await MemberCapacity.find({
      organization: orgId,
      user: { $in: userIds },
    });

    const capacityMap = new Map<string, number>();
    capacities.forEach((c) => {
      capacityMap.set(c.user.toString(), c.weeklyCapacityHours || WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS);
    });

    const taskAggregation = await Task.aggregate([
      {
        $match: {
          organization: new Types.ObjectId(orgId),
          isArchived: { $ne: true },
          status: { $nin: ['Done', 'Cancelled'] },
        },
      },
      {
        $group: {
          _id: '$assignee',
          assignedTasksCount: { $sum: 1 },
          estimatedHours: { $sum: { $ifNull: ['$estimatedHours', 0] } },
        },
      },
    ]);

    const taskMap = new Map<string, any>();
    taskAggregation.forEach((item) => {
      if (item._id) taskMap.set(item._id.toString(), item);
    });

    const overloadedList: any[] = [];

    orgMembers.forEach((m) => {
      const uObj = typeof m.user === 'object' ? m.user : null;
      const uId = uObj ? (uObj as any)._id.toString() : m.user.toString();
      const cap = capacityMap.get(uId) ?? WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS;

      const tStats = taskMap.get(uId) || { assignedTasksCount: 0, estimatedHours: 0 };
      const estHours = Math.round(tStats.estimatedHours * 10) / 10;

      const util = cap > 0 ? Math.round((estHours / cap) * 100) : 0;

      if (util > WORKLOAD_DEFAULTS.THRESHOLDS.HIGH_MAX) {
        const uObjAny = uObj as any;
        overloadedList.push({
          userId: uId,
          name: uObjAny
            ? uObjAny.name || `${uObjAny.firstName || ''} ${uObjAny.lastName || ''}`.trim()
            : 'Team Member',
          email: uObjAny?.email || '',
          avatar: uObjAny?.avatar || '',
          role: m.role || 'member',
          assignedTasksCount: tStats.assignedTasksCount,
          estimatedHours: estHours,
          weeklyCapacityHours: cap,
          excessHours: Math.round((estHours - cap) * 10) / 10,
          utilizationPercentage: util,
        });
      }
    });

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Overloaded members retrieved', {
      overloadedMembers: overloadedList,
      totalOverloaded: overloadedList.length,
    });
  }

  /**
   * GET /api/v1/workload/upcoming
   * Upcoming Work for Next 7, 14, 30 Days
   */
  public static async getUpcomingWork(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { organizationId, timeframe = '7' } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const days = parseInt(timeframe as string, 10) || 7;
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const upcomingTasks = await Task.find({
      organization: orgId,
      isArchived: { $ne: true },
      status: { $nin: ['Done', 'Cancelled'] },
      dueDate: { $gte: now, $lte: futureDate },
    })
      .populate('assignee', 'firstName lastName name email avatar')
      .populate('project', 'name key')
      .sort({ dueDate: 1 })
      .limit(100);

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Upcoming work retrieved', {
      timeframeDays: days,
      tasks: upcomingTasks.map((t) => ({
        id: t._id,
        taskKey: t.taskKey,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        estimatedHours: t.estimatedHours || 0,
        assignee: t.assignee,
        project: t.project,
      })),
      totalTasks: upcomingTasks.length,
    });
  }

  /**
   * GET /api/v1/workload/overdue
   * Overdue Work List
   */
  public static async getOverdueWork(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { organizationId } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const now = new Date();

    const overdueTasks = await Task.find({
      organization: orgId,
      isArchived: { $ne: true },
      status: { $nin: ['Done', 'Cancelled'] },
      dueDate: { $lt: now, $ne: null },
    })
      .populate('assignee', 'firstName lastName name email avatar')
      .populate('project', 'name key')
      .sort({ dueDate: 1 })
      .limit(100);

    const list = overdueTasks.map((t) => {
      const due = t.dueDate ? new Date(t.dueDate) : now;
      const daysOverdue = Math.max(
        1,
        Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: t._id,
        taskKey: t.taskKey,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        daysOverdue,
        estimatedHours: t.estimatedHours || 0,
        assignee: t.assignee,
        project: t.project,
      };
    });

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Overdue work retrieved', {
      tasks: list,
      totalOverdue: list.length,
    });
  }

  /**
   * GET /api/v1/workload/recommendations
   * Smart Rule-Based Recommendations (No AI)
   */
  public static async getWorkloadRecommendations(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { organizationId } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const orgMembers = await OrganizationMember.find({
      organization: orgId,
      status: 'active',
    }).populate('user', 'firstName lastName name email avatar role');

    const userIds = orgMembers.map((m) => m.user?._id || m.user);

    const capacities = await MemberCapacity.find({
      organization: orgId,
      user: { $in: userIds },
    });

    const capacityMap = new Map<string, number>();
    capacities.forEach((c) => {
      capacityMap.set(c.user.toString(), c.weeklyCapacityHours || WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS);
    });

    const taskAggregation = await Task.aggregate([
      {
        $match: {
          organization: new Types.ObjectId(orgId),
          isArchived: { $ne: true },
          status: { $nin: ['Done', 'Cancelled'] },
        },
      },
      {
        $group: {
          _id: '$assignee',
          assignedTasksCount: { $sum: 1 },
          estimatedHours: { $sum: { $ifNull: ['$estimatedHours', 0] } },
        },
      },
    ]);

    const taskMap = new Map<string, any>();
    taskAggregation.forEach((item) => {
      if (item._id) taskMap.set(item._id.toString(), item);
    });

    const recommendations: Array<{
      id: string;
      type: 'overload' | 'available' | 'unassigned' | 'overdue';
      severity: 'high' | 'medium' | 'info';
      title: string;
      message: string;
      memberId?: string;
      memberName?: string;
    }> = [];

    const availableMembers: string[] = [];

    orgMembers.forEach((m, idx) => {
      const uObj = typeof m.user === 'object' ? m.user : null;
      const uId = uObj ? (uObj as any)._id.toString() : m.user.toString();
      const uObjAny = uObj as any;
      const name = uObjAny
        ? uObjAny.name || `${uObjAny.firstName || ''} ${uObjAny.lastName || ''}`.trim()
        : 'Team Member';

      const cap = capacityMap.get(uId) ?? WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS;
      const stats = taskMap.get(uId) || { assignedTasksCount: 0, estimatedHours: 0 };
      const estHours = Math.round(stats.estimatedHours * 10) / 10;
      const util = cap > 0 ? Math.round((estHours / cap) * 100) : 0;

      if (util > WORKLOAD_DEFAULTS.THRESHOLDS.HIGH_MAX) {
        recommendations.push({
          id: `rec_overload_${uId}`,
          type: 'overload',
          severity: 'high',
          title: `Overloaded Member: ${name}`,
          message: `${name} is currently allocated at ${util}% capacity (${estHours}h assigned vs ${cap}h capacity). Consider reassigning tasks to balance workload.`,
          memberId: uId,
          memberName: name,
        });
      } else if (util < WORKLOAD_DEFAULTS.THRESHOLDS.AVAILABLE_MAX) {
        availableMembers.push(name);
        recommendations.push({
          id: `rec_available_${uId}`,
          type: 'available',
          severity: 'info',
          title: `Available Capacity: ${name}`,
          message: `${name} has available bandwidth (${util}% utilization, ${Math.max(0, cap - estHours)}h available). Available for new task assignments.`,
          memberId: uId,
          memberName: name,
        });
      }
    });

    // Check unassigned tasks
    const unassignedCount = await Task.countDocuments({
      organization: orgId,
      assignee: null,
      isArchived: { $ne: true },
      status: { $nin: ['Done', 'Cancelled'] },
    });

    if (unassignedCount > 0) {
      recommendations.push({
        id: 'rec_unassigned_tasks',
        type: 'unassigned',
        severity: 'medium',
        title: `${unassignedCount} Unassigned Tasks Found`,
        message: `There are ${unassignedCount} open unassigned tasks in this organization. ${
          availableMembers.length > 0
            ? `Consider assigning them to team members with available capacity (${availableMembers.slice(0, 3).join(', ')}).`
            : 'Review workload distribution before assigning.'
        }`,
      });
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Workload recommendations generated', {
      recommendations,
      totalRecommendations: recommendations.length,
    });
  }

  /**
   * GET /api/v1/members/:userId/capacity
   * Get Capacity for a Member
   */
  public static async getMemberCapacity(req: Request, res: Response) {
    const { userId } = req.params;
    const { organizationId } = req.query;

    const orgId = (organizationId as string) || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    const capacityDoc = await MemberCapacity.findOne({
      user: userId,
      organization: orgId,
    });

    if (!capacityDoc) {
      return sendSuccessResponse(res, HTTP_STATUS.OK, 'Member capacity defaults retrieved', {
        user: userId,
        organization: orgId,
        weeklyCapacityHours: WORKLOAD_DEFAULTS.WEEKLY_CAPACITY_HOURS,
        dailyCapacityHours: WORKLOAD_DEFAULTS.DAILY_CAPACITY_HOURS,
        workingDays: [...WORKLOAD_DEFAULTS.WORKING_DAYS],
        timezone: WORKLOAD_DEFAULTS.TIMEZONE,
        startOfWeek: WORKLOAD_DEFAULTS.START_OF_WEEK,
        endOfWeek: WORKLOAD_DEFAULTS.END_OF_WEEK,
        isCustomized: false,
      });
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Member capacity retrieved', {
      ...capacityDoc.toPayload(),
      isCustomized: true,
    });
  }

  /**
   * PUT /api/v1/members/:userId/capacity
   * Configure Capacity for a Member
   */
  public static async updateMemberCapacity(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { userId } = req.params;
    const {
      organizationId,
      weeklyCapacityHours,
      dailyCapacityHours,
      workingDays,
      timezone,
      startOfWeek,
      endOfWeek,
    } = req.body;

    const orgId = organizationId || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    // RBAC Check: Ensure user can update capacity
    const isSelf = currentUserId === userId;
    const isOwnerOrAdmin = (req.user?.role as string) === 'owner' || req.user?.role === 'admin';

    if (!isSelf && !isOwnerOrAdmin) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to modify another member capacity',
        'FORBIDDEN'
      );
    }

    let capacityDoc = await MemberCapacity.findOne({
      user: userId,
      organization: orgId,
    });

    if (!capacityDoc) {
      capacityDoc = new MemberCapacity({
        user: userId,
        organization: orgId,
        createdBy: currentUserId,
      });
    }

    if (weeklyCapacityHours !== undefined) {
      capacityDoc.weeklyCapacityHours = Math.max(0, Number(weeklyCapacityHours));
    }
    if (dailyCapacityHours !== undefined) {
      capacityDoc.dailyCapacityHours = Math.max(0, Number(dailyCapacityHours));
    }
    if (Array.isArray(workingDays)) {
      capacityDoc.workingDays = workingDays;
    }
    if (timezone) capacityDoc.timezone = timezone;
    if (startOfWeek) capacityDoc.startOfWeek = startOfWeek;
    if (endOfWeek) capacityDoc.endOfWeek = endOfWeek;

    capacityDoc.updatedBy = new Types.ObjectId(currentUserId);
    await capacityDoc.save();

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Member capacity updated successfully',
      capacityDoc.toPayload()
    );
  }

  /**
   * POST /api/v1/workload/reassign-bulk
   * Bulk Reassign Tasks Between Members
   */
  public static async reassignTasksBulk(req: Request, res: Response) {
    const currentUserId = req.user?.id;
    const { taskIds, targetAssigneeId, organizationId } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Please provide an array of task IDs to reassign',
        'INVALID_TASK_IDS'
      );
    }

    const orgId = organizationId || (req.user as any)?.organizationId;
    if (!orgId) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Organization ID is required',
        'MISSING_ORG_ID'
      );
    }

    // Ensure targetAssignee exists if provided
    let newAssigneeId: Types.ObjectId | null = null;
    if (targetAssigneeId) {
      const targetUser = await User.findById(targetAssigneeId);
      if (!targetUser) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          'Target assignee user not found',
          'ASSIGNEE_NOT_FOUND'
        );
      }
      newAssigneeId = new Types.ObjectId(targetAssigneeId);
    }

    // Execute bulk update
    const result = await Task.updateMany(
      {
        _id: { $in: taskIds },
        organization: orgId,
      },
      {
        $set: {
          assignee: newAssigneeId,
          updatedBy: new Types.ObjectId(currentUserId),
        },
      }
    );

    // Emit Realtime socket event for task updates
    taskIds.forEach((tId) => {
      broadcastTaskSocketEvent('task:assign', {
        taskId: tId.toString(),
        projectId: '',
        organizationId: orgId.toString(),
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: currentUserId || '',
          name: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'System',
        },
      });
    });

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      `Successfully reassigned ${result.modifiedCount} tasks`,
      {
        modifiedCount: result.modifiedCount,
        targetAssigneeId,
      }
    );
  }
}
