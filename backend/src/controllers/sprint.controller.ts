import { Request, Response } from 'express';
import { sprintService } from '../services/sprint.service';

export const getSprints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, projectId, workspaceId, organizationId, searchQuery, ownerId, isArchived, sort } = req.query;

    const sprints = await sprintService.getSprints({
      status: status as any,
      projectId: projectId as string,
      workspaceId: workspaceId as string,
      organizationId: organizationId as string,
      searchQuery: searchQuery as string,
      ownerId: ownerId as string,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
      sort: sort as any,
    });

    res.json({
      success: true,
      data: sprints,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sprints',
    });
  }
};

export const getSprintById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sprint = await sprintService.getSprintById(id);

    res.json({
      success: true,
      data: sprint,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Sprint not found',
    });
  }
};

export const createSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const sprint = await sprintService.createSprint(req.body, userId);

    res.status(201).json({
      success: true,
      data: sprint,
      message: 'Sprint created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create sprint',
    });
  }
};

export const updateSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const sprint = await sprintService.updateSprint(id, req.body, userId);

    res.json({
      success: true,
      data: sprint,
      message: 'Sprint updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update sprint',
    });
  }
};

export const deleteSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sprintService.deleteSprint(id);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete sprint',
    });
  }
};

export const archiveSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;
    const sprint = await sprintService.archiveSprint(id, isArchived !== false);

    res.json({
      success: true,
      data: sprint,
      message: `Sprint ${isArchived === false ? 'restored' : 'archived'} successfully`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to archive sprint',
    });
  }
};

export const duplicateSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const sprint = await sprintService.duplicateSprint(id, userId);

    res.status(201).json({
      success: true,
      data: sprint,
      message: 'Sprint duplicated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to duplicate sprint',
    });
  }
};

export const startSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const sprint = await sprintService.startSprint(id, userId);

    res.json({
      success: true,
      data: sprint,
      message: 'Sprint started successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start sprint',
    });
  }
};

export const completeSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const sprint = await sprintService.completeSprint(id, req.body, userId);

    res.json({
      success: true,
      data: sprint,
      message: 'Sprint completed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete sprint',
    });
  }
};

export const cancelSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const sprint = await sprintService.cancelSprint(id, userId);

    res.json({
      success: true,
      data: sprint,
      message: 'Sprint cancelled successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel sprint',
    });
  }
};

export const addTasksToSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ success: false, message: 'taskIds must be an array' });
      return;
    }

    const sprint = await sprintService.addTasksToSprint(id, taskIds);
    res.json({
      success: true,
      data: sprint,
      message: 'Tasks added to sprint',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add tasks to sprint',
    });
  }
};

export const removeTasksFromSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ success: false, message: 'taskIds must be an array' });
      return;
    }

    const sprint = await sprintService.removeTasksFromSprint(id, taskIds);
    res.json({
      success: true,
      data: sprint,
      message: 'Tasks removed from sprint',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove tasks from sprint',
    });
  }
};

export const getSprintBurndown = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await sprintService.getBurndown(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSprintBurnup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await sprintService.getBurnup(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSprintRetrospective = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await sprintService.getRetrospective(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSprintRetrospective = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const data = await sprintService.updateRetrospective(id, req.body, userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSprintActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await sprintService.getSprintActivity(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjectSprintsVelocity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const data = await sprintService.getProjectVelocity(projectId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

