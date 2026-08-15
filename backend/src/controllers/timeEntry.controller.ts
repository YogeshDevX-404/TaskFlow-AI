import { Request, Response } from 'express';
import { TimeEntry } from '../models/timeEntry.model';
import { TaskModel as Task } from '../models/task.model';
import { ProjectModel as Project } from '../models/project.model';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { Types } from 'mongoose';

/**
 * Helper to recalculate total spent hours for a task
 */
async function updateTaskSpentHours(taskId: string | Types.ObjectId | undefined) {
  if (!taskId) return;
  try {
    const aggregate = await TimeEntry.aggregate([
      {
        $match: {
          task: new Types.ObjectId(taskId.toString()),
          status: 'stopped',
        },
      },
      {
        $group: {
          _id: '$task',
          totalSeconds: { $sum: '$duration' },
        },
      },
    ]);

    const totalSeconds = aggregate[0]?.totalSeconds || 0;
    const spentHours = Math.round((totalSeconds / 3600) * 100) / 100;

    await Task.findByIdAndUpdate(taskId, { spentHours });
  } catch (error) {
    console.error('Error updating task spent hours:', error);
  }
}

export class TimeEntryController {
  /**
   * GET /api/v1/time-entries
   */
  public static async getTimeEntries(req: Request, res: Response) {
    const userId = req.user?.id;
    const {
      userId: filterUserId,
      projectId,
      taskId,
      workspaceId,
      organizationId,
      startDate,
      endDate,
      isBillable,
      source,
      search,
      page = 1,
      limit = 50,
      sort = '-startTime',
    } = req.query;

    const query: any = {};

    // Filter rules
    if (filterUserId) {
      query.user = new Types.ObjectId(filterUserId as string);
    }
    if (projectId) {
      query.project = new Types.ObjectId(projectId as string);
    }
    if (taskId) {
      query.task = new Types.ObjectId(taskId as string);
    }
    if (workspaceId) {
      query.workspace = new Types.ObjectId(workspaceId as string);
    }
    if (organizationId) {
      query.organization = new Types.ObjectId(organizationId as string);
    }
    if (isBillable !== undefined) {
      query.isBillable = isBillable === 'true';
    }
    if (source) {
      query.source = source;
    }

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate as string);
      }
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      TimeEntry.find(query)
        .populate('user', 'name email avatar role')
        .populate('task', 'title taskKey status priority estimatedHours spentHours')
        .populate('project', 'name key')
        .populate('workspace', 'name')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      TimeEntry.countDocuments(query),
    ]);

    // Aggregate summary stats
    const summaryAgg = await TimeEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          billableDuration: {
            $sum: { $cond: [{ $eq: ['$isBillable', true] }, '$duration', 0] },
          },
          nonBillableDuration: {
            $sum: { $cond: [{ $eq: ['$isBillable', false] }, '$duration', 0] },
          },
          totalBillableAmount: {
            $sum: {
              $cond: [
                { $eq: ['$isBillable', true] },
                { $multiply: [{ $divide: ['$duration', 3600] }, '$billableRate'] },
                0,
              ],
            },
          },
        },
      },
    ]);

    const summary = summaryAgg[0] || {
      totalDuration: 0,
      billableDuration: 0,
      nonBillableDuration: 0,
      totalBillableAmount: 0,
    };

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Time entries retrieved successfully', {
      entries,
      summary: {
        totalDuration: summary.totalDuration,
        billableDuration: summary.billableDuration,
        nonBillableDuration: summary.nonBillableDuration,
        totalBillableAmount: Math.round((summary.totalBillableAmount || 0) * 100) / 100,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  /**
   * GET /api/v1/time-entries/active
   */
  public static async getActiveTimer(req: Request, res: Response) {
    const userId = req.user?.id;

    const activeTimer = await TimeEntry.findOne({
      user: userId,
      status: { $in: ['running', 'paused'] },
    })
      .populate('user', 'name email avatar')
      .populate('task', 'title taskKey status priority estimatedHours spentHours')
      .populate('project', 'name key')
      .populate('workspace', 'name');

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Active timer retrieved', activeTimer);
  }

  /**
   * POST /api/v1/time-entries/start
   */
  public static async startTimer(req: Request, res: Response) {
    const userId = req.user?.id;
    const { taskId, projectId, workspaceId, organizationId, description, isBillable, billableRate } = req.body;

    // Check for existing active timer
    const existingActive = await TimeEntry.findOne({
      user: userId,
      status: { $in: ['running', 'paused'] },
    })
      .populate('task', 'title taskKey')
      .populate('project', 'name key');

    if (existingActive) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'You already have an active running timer. Stop or cancel it before starting a new one.',
        error: {
          code: 'ACTIVE_TIMER_EXISTS',
          activeTimerConflict: true,
          activeTimer: existingActive,
        },
      });
    }

    let finalProjectId = projectId;
    let finalWorkspaceId = workspaceId;
    let finalOrgId = organizationId;

    if (taskId) {
      const taskDoc = await Task.findById(taskId);
      if (taskDoc) {
        finalProjectId = finalProjectId || taskDoc.project;
        finalWorkspaceId = finalWorkspaceId || taskDoc.workspace;
        finalOrgId = finalOrgId || taskDoc.organization;
      }
    }

    const newTimer = await TimeEntry.create({
      user: userId,
      task: taskId || null,
      project: finalProjectId || null,
      workspace: finalWorkspaceId || null,
      organization: finalOrgId || null,
      description: description || '',
      startTime: new Date(),
      duration: 0,
      accumulatedTime: 0,
      isBillable: isBillable !== undefined ? Boolean(isBillable) : true,
      billableRate: Number(billableRate) || 0,
      source: 'Timer',
      status: 'running',
    });

    const populatedTimer = await TimeEntry.findById(newTimer._id)
      .populate('user', 'name email avatar')
      .populate('task', 'title taskKey status priority estimatedHours spentHours')
      .populate('project', 'name key');

    return sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      'Timer started successfully',
      populatedTimer
    );
  }

  /**
   * POST /api/v1/time-entries/:id/pause
   */
  public static async pauseTimer(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;

    const timer = await TimeEntry.findOne({
      _id: id,
      user: userId,
      status: 'running',
    });

    if (!timer) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        'Running timer not found or already paused/stopped',
        'TIMER_NOT_FOUND'
      );
    }

    const now = new Date();
    const elapsedSinceStart = Math.floor((now.getTime() - new Date(timer.startTime).getTime()) / 1000);
    const newAccumulated = timer.accumulatedTime + elapsedSinceStart;

    timer.accumulatedTime = newAccumulated;
    timer.duration = newAccumulated;
    timer.status = 'paused';
    timer.pausedAt = now;
    await timer.save();

    const populated = await TimeEntry.findById(timer._id)
      .populate('task', 'title taskKey')
      .populate('project', 'name key');

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Timer paused', populated);
  }

  /**
   * POST /api/v1/time-entries/:id/resume
   */
  public static async resumeTimer(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;

    const timer = await TimeEntry.findOne({
      _id: id,
      user: userId,
      status: 'paused',
    });

    if (!timer) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        'Paused timer not found',
        'TIMER_NOT_FOUND'
      );
    }

    timer.startTime = new Date();
    timer.pausedAt = null;
    timer.status = 'running';
    await timer.save();

    const populated = await TimeEntry.findById(timer._id)
      .populate('task', 'title taskKey')
      .populate('project', 'name key');

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Timer resumed', populated);
  }

  /**
   * POST /api/v1/time-entries/:id/stop
   */
  public static async stopTimer(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { description } = req.body;

    const timer = await TimeEntry.findOne({
      _id: id,
      user: userId,
      status: { $in: ['running', 'paused'] },
    });

    if (!timer) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        'Active timer not found',
        'TIMER_NOT_FOUND'
      );
    }

    const now = new Date();
    let totalSeconds = timer.accumulatedTime;

    if (timer.status === 'running') {
      const elapsedSinceStart = Math.floor((now.getTime() - new Date(timer.startTime).getTime()) / 1000);
      totalSeconds += elapsedSinceStart;
    }

    timer.duration = Math.max(1, totalSeconds);
    timer.endTime = now;
    timer.status = 'stopped';
    if (description !== undefined) {
      timer.description = description;
    }
    await timer.save();

    // Update task spent hours
    if (timer.task) {
      await updateTaskSpentHours(timer.task);
    }

    const populated = await TimeEntry.findById(timer._id)
      .populate('user', 'name email avatar')
      .populate('task', 'title taskKey status priority estimatedHours spentHours')
      .populate('project', 'name key');

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Timer stopped and time recorded', populated);
  }

  /**
   * POST /api/v1/time-entries/:id/cancel
   */
  public static async cancelTimer(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;

    const timer = await TimeEntry.findOneAndDelete({
      _id: id,
      user: userId,
      status: { $in: ['running', 'paused'] },
    });

    if (!timer) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        'Active timer not found',
        'TIMER_NOT_FOUND'
      );
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Timer cancelled', null);
  }

  /**
   * POST /api/v1/time-entries (Manual Work Log)
   */
  public static async createWorkLog(req: Request, res: Response) {
    const userId = req.user?.id;
    const {
      taskId,
      projectId,
      workspaceId,
      organizationId,
      description,
      startTime,
      endTime,
      duration, // in minutes or seconds
      isBillable,
      billableRate,
      date,
    } = req.body;

    // Validate inputs
    let calculatedDuration = 0; // seconds
    let finalStartTime: Date;
    let finalEndTime: Date | null = null;

    if (startTime && endTime) {
      finalStartTime = new Date(startTime);
      finalEndTime = new Date(endTime);

      if (isNaN(finalStartTime.getTime()) || isNaN(finalEndTime.getTime())) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Invalid start or end date format',
          'INVALID_DATE'
        );
      }

      if (finalEndTime <= finalStartTime) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'End time must be strictly after start time',
          'INVALID_TIME_RANGE'
        );
      }

      calculatedDuration = Math.floor((finalEndTime.getTime() - finalStartTime.getTime()) / 1000);
    } else if (duration !== undefined && duration !== null) {
      const parsedDuration = Number(duration);
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'Duration must be a positive number greater than 0',
          'INVALID_DURATION'
        );
      }
      // If duration <= 500, assume hours/minutes or seconds
      // Let's assume duration is passed in minutes if <= 1440, else seconds
      calculatedDuration = parsedDuration > 1440 ? parsedDuration : Math.round(parsedDuration * 60);

      finalStartTime = date ? new Date(date) : new Date();
      finalEndTime = new Date(finalStartTime.getTime() + calculatedDuration * 1000);
    } else {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Provide either start/end times or duration',
        'MISSING_TIME_DATA'
      );
    }

    // Check future date restriction if desired
    if (finalStartTime.getTime() > Date.now() + 60000) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Cannot log work entries in the future',
        'FUTURE_DATE_NOT_ALLOWED'
      );
    }

    let finalProjectId = projectId;
    let finalWorkspaceId = workspaceId;
    let finalOrgId = organizationId;

    if (taskId) {
      const taskDoc = await Task.findById(taskId);
      if (taskDoc) {
        finalProjectId = finalProjectId || taskDoc.project;
        finalWorkspaceId = finalWorkspaceId || taskDoc.workspace;
        finalOrgId = finalOrgId || taskDoc.organization;
      }
    }

    const timeEntry = await TimeEntry.create({
      user: userId,
      task: taskId || null,
      project: finalProjectId || null,
      workspace: finalWorkspaceId || null,
      organization: finalOrgId || null,
      description: description || '',
      startTime: finalStartTime,
      endTime: finalEndTime,
      duration: calculatedDuration,
      isBillable: isBillable !== undefined ? Boolean(isBillable) : true,
      billableRate: Number(billableRate) || 0,
      source: 'Manual',
      status: 'stopped',
    });

    if (taskId) {
      await updateTaskSpentHours(taskId);
    }

    const populated = await TimeEntry.findById(timeEntry._id)
      .populate('user', 'name email avatar')
      .populate('task', 'title taskKey status priority estimatedHours spentHours')
      .populate('project', 'name key');

    return sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Work log created successfully', populated);
  }

  /**
   * GET /api/v1/time-entries/:id
   */
  public static async getSingleTimeEntry(req: Request, res: Response) {
    const { id } = req.params;

    const entry = await TimeEntry.findById(id)
      .populate('user', 'name email avatar role')
      .populate('task', 'title taskKey status priority estimatedHours spentHours')
      .populate('project', 'name key')
      .populate('workspace', 'name');

    if (!entry) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Time entry not found', 'NOT_FOUND');
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Time entry retrieved', entry);
  }

  /**
   * PUT /api/v1/time-entries/:id
   */
  public static async updateTimeEntry(req: Request, res: Response) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;
    const { description, startTime, endTime, duration, isBillable, billableRate, taskId, projectId } = req.body;

    const entry = await TimeEntry.findById(id);
    if (!entry) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Time entry not found', 'NOT_FOUND');
    }

    // Permission check: owner of entry or admin/manager role
    if (entry.user.toString() !== userId && userRole !== 'admin' && userRole !== 'manager') {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to modify this work log',
        'FORBIDDEN'
      );
    }

    const oldTaskId = entry.task;

    if (description !== undefined) entry.description = description;
    if (isBillable !== undefined) entry.isBillable = Boolean(isBillable);
    if (billableRate !== undefined) entry.billableRate = Number(billableRate) || 0;
    if (taskId !== undefined) entry.task = taskId || null;
    if (projectId !== undefined) entry.project = projectId || null;

    if (startTime && endTime) {
      const s = new Date(startTime);
      const e = new Date(endTime);
      if (e <= s) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          'End time must be after start time',
          'INVALID_TIME_RANGE'
        );
      }
      entry.startTime = s;
      entry.endTime = e;
      entry.duration = Math.floor((e.getTime() - s.getTime()) / 1000);
    } else if (duration !== undefined) {
      const pDuration = Number(duration);
      entry.duration = pDuration > 1440 ? pDuration : Math.round(pDuration * 60);
      if (entry.startTime) {
        entry.endTime = new Date(new Date(entry.startTime).getTime() + entry.duration * 1000);
      }
    }

    await entry.save();

    // Recalculate spent hours for affected tasks
    if (oldTaskId) await updateTaskSpentHours(oldTaskId);
    if (entry.task && entry.task.toString() !== oldTaskId?.toString()) {
      await updateTaskSpentHours(entry.task);
    }

    const updated = await TimeEntry.findById(entry._id)
      .populate('user', 'name email avatar')
      .populate('task', 'title taskKey status priority estimatedHours spentHours')
      .populate('project', 'name key');

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Time entry updated successfully', updated);
  }

  /**
   * DELETE /api/v1/time-entries/:id
   */
  public static async deleteTimeEntry(req: Request, res: Response) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    const entry = await TimeEntry.findById(id);
    if (!entry) {
      return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Time entry not found', 'NOT_FOUND');
    }

    if (entry.user.toString() !== userId && userRole !== 'admin' && userRole !== 'manager') {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        'You do not have permission to delete this work log',
        'FORBIDDEN'
      );
    }

    const taskId = entry.task;
    await TimeEntry.findByIdAndDelete(id);

    if (taskId) {
      await updateTaskSpentHours(taskId);
    }

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Time entry deleted successfully', null);
  }

  /**
   * GET /api/v1/time-entries/reports
   */
  public static async getTimeReports(req: Request, res: Response) {
    const { projectId, taskId, userId, sprintId, workspaceId, organizationId, startDate, endDate } = req.query;

    const match: any = { status: 'stopped' };

    if (projectId) match.project = new Types.ObjectId(projectId as string);
    if (taskId) match.task = new Types.ObjectId(taskId as string);
    if (userId) match.user = new Types.ObjectId(userId as string);
    if (workspaceId) match.workspace = new Types.ObjectId(workspaceId as string);
    if (organizationId) match.organization = new Types.ObjectId(organizationId as string);

    if (startDate || endDate) {
      match.startTime = {};
      if (startDate) match.startTime.$gte = new Date(startDate as string);
      if (endDate) match.startTime.$lte = new Date(endDate as string);
    }

    // High level totals
    const overviewAgg = await TimeEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: '$duration' },
          billableSeconds: {
            $sum: { $cond: [{ $eq: ['$isBillable', true] }, '$duration', 0] },
          },
          nonBillableSeconds: {
            $sum: { $cond: [{ $eq: ['$isBillable', false] }, '$duration', 0] },
          },
          totalEntries: { $sum: 1 },
          totalBillableAmount: {
            $sum: {
              $cond: [
                { $eq: ['$isBillable', true] },
                { $multiply: [{ $divide: ['$duration', 3600] }, '$billableRate'] },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Group by Member
    const memberAgg = await TimeEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$user',
          totalSeconds: { $sum: '$duration' },
          billableSeconds: {
            $sum: { $cond: [{ $eq: ['$isBillable', true] }, '$duration', 0] },
          },
          entryCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        $project: {
          userId: '$_id',
          name: '$userDoc.name',
          email: '$userDoc.email',
          avatar: '$userDoc.avatar',
          totalHours: { $round: [{ $divide: ['$totalSeconds', 3600] }, 2] },
          billableHours: { $round: [{ $divide: ['$billableSeconds', 3600] }, 2] },
          entryCount: 1,
        },
      },
      { $sort: { totalHours: -1 } },
    ]);

    // Group by Task
    const taskAgg = await TimeEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$task',
          totalSeconds: { $sum: '$duration' },
          billableSeconds: {
            $sum: { $cond: [{ $eq: ['$isBillable', true] }, '$duration', 0] },
          },
          entryCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: '_id',
          as: 'taskDoc',
        },
      },
      { $unwind: { path: '$taskDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          taskId: '$_id',
          title: { $ifNull: ['$taskDoc.title', 'General Unassigned Work'] },
          taskKey: { $ifNull: ['$taskDoc.taskKey', 'N/A'] },
          estimatedHours: { $ifNull: ['$taskDoc.estimatedHours', 0] },
          actualHours: { $round: [{ $divide: ['$totalSeconds', 3600] }, 2] },
          billableHours: { $round: [{ $divide: ['$billableSeconds', 3600] }, 2] },
          remainingHours: {
            $max: [
              0,
              {
                $subtract: [
                  { $ifNull: ['$taskDoc.estimatedHours', 0] },
                  { $divide: ['$totalSeconds', 3600] },
                ],
              },
            ],
          },
          entryCount: 1,
        },
      },
      { $sort: { actualHours: -1 } },
      { $limit: 20 },
    ]);

    // Daily Trend
    const dailyTrend = await TimeEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          totalSeconds: { $sum: '$duration' },
          billableSeconds: {
            $sum: { $cond: [{ $eq: ['$isBillable', true] }, '$duration', 0] },
          },
        },
      },
      {
        $project: {
          date: '$_id',
          totalHours: { $round: [{ $divide: ['$totalSeconds', 3600] }, 2] },
          billableHours: { $round: [{ $divide: ['$billableSeconds', 3600] }, 2] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    const overview = overviewAgg[0] || {
      totalSeconds: 0,
      billableSeconds: 0,
      nonBillableSeconds: 0,
      totalEntries: 0,
      totalBillableAmount: 0,
    };

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Time reports generated', {
      overview: {
        totalHours: Math.round((overview.totalSeconds / 3600) * 100) / 100,
        billableHours: Math.round((overview.billableSeconds / 3600) * 100) / 100,
        nonBillableHours: Math.round((overview.nonBillableSeconds / 3600) * 100) / 100,
        totalEntries: overview.totalEntries,
        totalBillableAmount: Math.round(overview.totalBillableAmount * 100) / 100,
      },
      byMember: memberAgg,
      byTask: taskAgg,
      dailyTrend,
    });
  }

  /**
   * GET /api/v1/time-entries/timesheet
   */
  public static async getTimesheet(req: Request, res: Response) {
    const { userId, projectId, startDate, endDate } = req.query;

    const query: any = { status: 'stopped' };
    if (userId) query.user = new Types.ObjectId(userId as string);
    if (projectId) query.project = new Types.ObjectId(projectId as string);

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate as string);
      if (endDate) query.startTime.$lte = new Date(endDate as string);
    }

    const entries = await TimeEntry.find(query)
      .populate('user', 'name email avatar')
      .populate('task', 'title taskKey status')
      .populate('project', 'name key')
      .sort({ startTime: -1 });

    return sendSuccessResponse(res, HTTP_STATUS.OK, 'Timesheet data retrieved', entries);
  }

  /**
   * GET /api/v1/time-entries/export
   */
  public static async exportTimeEntries(req: Request, res: Response) {
    const { format = 'csv', startDate, endDate, projectId, userId } = req.query;

    const query: any = { status: 'stopped' };
    if (userId) query.user = new Types.ObjectId(userId as string);
    if (projectId) query.project = new Types.ObjectId(projectId as string);

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate as string);
      if (endDate) query.startTime.$lte = new Date(endDate as string);
    }

    const entries = await TimeEntry.find(query)
      .populate('user', 'name email')
      .populate('task', 'title taskKey')
      .populate('project', 'name key')
      .sort({ startTime: -1 });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="timesheet-export.json"');
      return res.status(200).send(JSON.stringify(entries, null, 2));
    }

    // CSV format
    let csv = 'ID,Date,User,Project,Task Key,Task Title,Description,Duration (Hours),Billable,Billable Rate\n';
    entries.forEach((e: any) => {
      const dateStr = new Date(e.startTime).toISOString().split('T')[0];
      const userName = e.user?.name ? `"${e.user.name.replace(/"/g, '""')}"` : 'N/A';
      const projName = e.project?.name ? `"${e.project.name.replace(/"/g, '""')}"` : 'N/A';
      const taskKey = e.task?.taskKey || 'N/A';
      const taskTitle = e.task?.title ? `"${e.task.title.replace(/"/g, '""')}"` : 'N/A';
      const desc = e.description ? `"${e.description.replace(/"/g, '""')}"` : '';
      const hours = (e.duration / 3600).toFixed(2);
      const billable = e.isBillable ? 'Yes' : 'No';
      const rate = e.billableRate || 0;

      csv += `${e._id},${dateStr},${userName},${projName},${taskKey},${taskTitle},${desc},${hours},${billable},${rate}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="timesheet-export.csv"');
    return res.status(200).send(csv);
  }
}
