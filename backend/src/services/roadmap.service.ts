import { releaseService } from './release.service';
import { TaskModel } from '../models/task.model';
import { Sprint } from '../models/sprint.model';
import { ProjectModel } from '../models/project.model';
import { IReleasePayload } from '../models/release.model';

export interface GetRoadmapFilter {
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  status?: string;
  version?: string;
  ownerId?: string;
  viewMode?: 'quarter' | 'month' | 'week' | 'timeline';
}

export interface IRoadmapSummary {
  totalReleases: number;
  upcomingReleases: number;
  currentReleases: number;
  completedReleases: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  openBugs: number;
  blockedWork: number;
  overallProgress: number;
}

export interface IRoadmapData {
  releases: IReleasePayload[];
  projects: any[];
  sprints: any[];
  summary: IRoadmapSummary;
}

export class RoadmapService {
  async getRoadmapData(filters: GetRoadmapFilter = {}): Promise<IRoadmapData> {
    const releases = await releaseService.getReleases({
      projectId: filters.projectId,
      workspaceId: filters.workspaceId,
      organizationId: filters.organizationId,
      status: filters.status as any,
      version: filters.version,
      ownerId: filters.ownerId,
      isArchived: false,
    });

    // Fetch projects
    const projectQuery: any = { isArchived: false };
    if (filters.projectId) projectQuery._id = filters.projectId;
    if (filters.workspaceId) projectQuery.workspace = filters.workspaceId;
    if (filters.organizationId) projectQuery.organization = filters.organizationId;

    const projects = await ProjectModel.find(projectQuery).select('name key projectKey color status');

    // Fetch active/upcoming sprints
    const sprintQuery: any = { isArchived: false };
    if (filters.projectId) sprintQuery.project = filters.projectId;
    if (filters.workspaceId) sprintQuery.workspace = filters.workspaceId;
    if (filters.organizationId) sprintQuery.organization = filters.organizationId;

    const sprints = await Sprint.find(sprintQuery).select('name status startDate endDate goal project');

    // Aggregate Summary
    let totalTasks = 0;
    let completedTasks = 0;
    let remainingTasks = 0;
    let openBugs = 0;
    let blockedWork = 0;

    let upcomingCount = 0;
    let currentCount = 0;
    let completedCount = 0;

    releases.forEach((rel) => {
      totalTasks += rel.totalTasks || 0;
      completedTasks += rel.completedTasks || 0;
      remainingTasks += rel.remainingTasks || 0;
      openBugs += rel.openBugs || 0;
      blockedWork += rel.blockedWork || 0;

      if (rel.status === 'Released' || rel.status === 'Ready') {
        completedCount++;
      } else if (rel.status === 'In Development' || rel.status === 'Testing') {
        currentCount++;
      } else {
        upcomingCount++;
      }
    });

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      releases,
      projects,
      sprints,
      summary: {
        totalReleases: releases.length,
        upcomingReleases: upcomingCount,
        currentReleases: currentCount,
        completedReleases: completedCount,
        totalTasks,
        completedTasks,
        remainingTasks,
        openBugs,
        blockedWork,
        overallProgress,
      },
    };
  }
}

export const roadmapService = new RoadmapService();
