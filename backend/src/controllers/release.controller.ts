import { Request, Response } from 'express';
import { releaseService } from '../services/release.service';
import { roadmapService } from '../services/roadmap.service';

export const getReleases = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      projectId,
      workspaceId,
      organizationId,
      searchQuery,
      version,
      ownerId,
      isArchived,
      sort,
    } = req.query;

    const releases = await releaseService.getReleases({
      status: status as any,
      projectId: projectId as string,
      workspaceId: workspaceId as string,
      organizationId: organizationId as string,
      searchQuery: searchQuery as string,
      version: version as string,
      ownerId: ownerId as string,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
      sort: sort as any,
    });

    res.json({
      success: true,
      data: releases,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch releases',
    });
  }
};

export const getReleaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const release = await releaseService.getReleaseById(id);

    res.json({
      success: true,
      data: release,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Release not found',
    });
  }
};

export const createRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const release = await releaseService.createRelease(req.body, userId);

    res.status(201).json({
      success: true,
      data: release,
      message: 'Release created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create release',
    });
  }
};

export const updateRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const release = await releaseService.updateRelease(id, req.body, userId);

    res.json({
      success: true,
      data: release,
      message: 'Release updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update release',
    });
  }
};

export const deleteRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await releaseService.deleteRelease(id);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete release',
    });
  }
};

export const archiveRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;
    const release = await releaseService.archiveRelease(id, isArchived !== false);

    res.json({
      success: true,
      data: release,
      message: `Release ${isArchived === false ? 'restored' : 'archived'} successfully`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to archive release',
    });
  }
};

export const duplicateRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const release = await releaseService.duplicateRelease(id, userId);

    res.status(201).json({
      success: true,
      data: release,
      message: 'Release duplicated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to duplicate release',
    });
  }
};

export const addTasksToRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ success: false, message: 'taskIds must be an array' });
      return;
    }

    const release = await releaseService.addTasksToRelease(id, taskIds);
    res.json({
      success: true,
      data: release,
      message: 'Tasks added to release',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add tasks to release',
    });
  }
};

export const removeTasksFromRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ success: false, message: 'taskIds must be an array' });
      return;
    }

    const release = await releaseService.removeTasksFromRelease(id, taskIds);
    res.json({
      success: true,
      data: release,
      message: 'Tasks removed from release',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove tasks from release',
    });
  }
};

export const getRoadmapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, workspaceId, organizationId, status, version, ownerId, viewMode } = req.query;

    const data = await roadmapService.getRoadmapData({
      projectId: projectId as string,
      workspaceId: workspaceId as string,
      organizationId: organizationId as string,
      status: status as string,
      version: version as string,
      ownerId: ownerId as string,
      viewMode: viewMode as any,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch roadmap data',
    });
  }
};
