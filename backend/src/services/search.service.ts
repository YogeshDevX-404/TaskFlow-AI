import { Types } from 'mongoose';
import { OrganizationMember } from '../models/organizationMember.model';
import { Workspace } from '../models/workspace.model';
import { ProjectModel } from '../models/project.model';
import { TaskModel } from '../models/task.model';
import { User } from '../models/user.model';
import { Sprint } from '../models/sprint.model';
import { ReleaseModel } from '../models/release.model';
import { CommentModel } from '../models/comment.model';
import { AttachmentModel } from '../models/attachment.model';
import { ActivityModel } from '../models/activity.model';
import { NotificationModel } from '../models/notification.model';
import { Organization } from '../models/organization.model';
import { RecentSearchModel } from '../models/recentSearch.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { GitHubPullRequestModel } from '../models/githubPullRequest.model';
import { GitHubIssueMappingModel } from '../models/githubIssueMapping.model';
import { GitHubBranchModel } from '../models/githubBranch.model';
import { GitHubCommitModel } from '../models/githubCommit.model';

export interface SearchQueryParams {
  userId: string;
  query?: string;
  category?: string; // 'all' | 'tasks' | 'projects' | 'people' | 'workspaces' | 'sprints' | 'releases' | 'comments' | 'files' | 'activity' | 'notifications'
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  taskType?: string;
  labels?: string | string[];
  sprintId?: string;
  releaseId?: string;
  dateFilter?: 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'updated' | 'alphabetical' | 'priority' | 'dueDate';
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'task' | 'project' | 'people' | 'workspace' | 'sprint' | 'release' | 'comment' | 'file' | 'activity' | 'notification' | 'organization';
  category: string;
  identifier?: string;
  description?: string;
  url: string;
  status?: string;
  priority?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  context?: {
    organizationId?: string;
    organizationName?: string;
    workspaceId?: string;
    workspaceName?: string;
    projectId?: string;
    projectName?: string;
  };
  updatedAt: string;
  score?: number;
}

export class SearchService {
  /**
   * Helper: Parse search query string for inline filters like status:done priority:high
   */
  private static parseQueryString(rawQuery: string = '') {
    let text = rawQuery;
    const inlineFilters: Record<string, string> = {};

    const syntaxPatterns = [
      { key: 'status', regex: /status:(?:"([^"]+)"|(\S+))/gi },
      { key: 'priority', regex: /priority:(?:"([^"]+)"|(\S+))/gi },
      { key: 'assignee', regex: /assignee:(?:"([^"]+)"|(\S+))/gi },
      { key: 'project', regex: /project:(?:"([^"]+)"|(\S+))/gi },
      { key: 'workspace', regex: /workspace:(?:"([^"]+)"|(\S+))/gi },
      { key: 'type', regex: /type:(?:"([^"]+)"|(\S+))/gi },
      { key: 'label', regex: /(?:label|labels):(?:"([^"]+)"|(\S+))/gi },
      { key: 'sprint', regex: /sprint:(?:"([^"]+)"|(\S+))/gi },
      { key: 'release', regex: /release:(?:"([^"]+)"|(\S+))/gi },
    ];

    syntaxPatterns.forEach(({ key, regex }) => {
      let match;
      while ((match = regex.exec(rawQuery)) !== null) {
        const val = match[1] || match[2];
        if (val) {
          inlineFilters[key] = val;
        }
      }
      text = text.replace(regex, '');
    });

    return {
      cleanText: text.replace(/\s+/g, ' ').trim(),
      inlineFilters,
    };
  }

  /**
   * Calculate date range filter for MongoDB
   */
  private static getDateFilterRange(
    dateFilter?: string,
    customStart?: string,
    customEnd?: string
  ): { $gte?: Date; $lte?: Date } | null {
    if (!dateFilter && !customStart && !customEnd) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case 'today':
        return {
          $gte: startOfToday,
          $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
        };
      case 'yesterday': {
        const startYesterday = new Date(startOfToday);
        startYesterday.setDate(startYesterday.getDate() - 1);
        const endYesterday = new Date(startOfToday);
        endYesterday.setMilliseconds(-1);
        return { $gte: startYesterday, $lte: endYesterday };
      }
      case '7d': {
        const d7 = new Date(startOfToday);
        d7.setDate(d7.getDate() - 7);
        return { $gte: d7 };
      }
      case '30d': {
        const d30 = new Date(startOfToday);
        d30.setDate(d30.getDate() - 30);
        return { $gte: d30 };
      }
      case 'this_month': {
        const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { $gte: startMonth };
      }
      case 'last_month': {
        const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { $gte: startLastMonth, $lte: endLastMonth };
      }
      case 'custom': {
        const res: { $gte?: Date; $lte?: Date } = {};
        if (customStart) res.$gte = new Date(customStart);
        if (customEnd) res.$lte = new Date(customEnd);
        return Object.keys(res).length > 0 ? res : null;
      }
      default:
        return null;
    }
  }

  /**
   * Get authorized organization IDs for the current user
   */
  private static async getAuthorizedOrgIds(userId: string): Promise<Types.ObjectId[]> {
    const memberships = await OrganizationMember.find({
      user: userId,
      status: 'active',
    }).select('organization');

    return memberships.map((m) => m.organization);
  }

  /**
   * Global Enterprise Search across all entities
   */
  public static async executeSearch(params: SearchQueryParams) {
    const {
      userId,
      query = '',
      category = 'all',
      organizationId,
      workspaceId,
      projectId,
      status,
      priority,
      assigneeId,
      reporterId,
      taskType,
      labels,
      sprintId,
      releaseId,
      dateFilter,
      startDate,
      endDate,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = params;

    // 1. Get Authorized Organizations
    const userOrgIds = await this.getAuthorizedOrgIds(userId);
    if (userOrgIds.length === 0) {
      return {
        results: [],
        countsByCategory: {},
        pagination: { page, limit, total: 0, totalPages: 0 },
        queryParsed: { text: query, filters: {} },
      };
    }

    // Filter by specific organization if requested and authorized
    let targetOrgIds = userOrgIds;
    if (organizationId) {
      targetOrgIds = userOrgIds.filter(
        (id) => id.toString() === organizationId.toString()
      );
      if (targetOrgIds.length === 0) {
        return {
          results: [],
          countsByCategory: {},
          pagination: { page, limit, total: 0, totalPages: 0 },
          queryParsed: { text: query, filters: {} },
        };
      }
    }

    // 2. Parse inline syntax from query
    const { cleanText, inlineFilters } = this.parseQueryString(query);
    const searchRegex = cleanText ? new RegExp(cleanText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') : null;

    // Effective filter values
    const effStatus = status || inlineFilters.status;
    const effPriority = priority || inlineFilters.priority;
    const effTaskType = taskType || inlineFilters.type;
    const effLabel = labels || inlineFilters.label;

    const dateRange = this.getDateFilterRange(dateFilter, startDate, endDate);

    const allResults: SearchResultItem[] = [];
    const countsByCategory: Record<string, number> = {
      tasks: 0,
      projects: 0,
      people: 0,
      workspaces: 0,
      sprints: 0,
      releases: 0,
      comments: 0,
      files: 0,
      activity: 0,
      organizations: 0,
      github: 0,
    };

    // Helper to evaluate text search match
    const matchesText = (fields: (string | undefined)[]) => {
      if (!searchRegex) return true;
      return fields.some((f) => f && searchRegex.test(f));
    };

    /* ====================================================
       1. TASK SEARCH
       ==================================================== */
    if (category === 'all' || category === 'tasks') {
      const taskQuery: any = {
        organization: { $in: targetOrgIds },
        isArchived: false,
      };

      if (workspaceId) taskQuery.workspace = workspaceId;
      if (projectId) taskQuery.project = projectId;
      if (sprintId) taskQuery.sprint = sprintId;
      if (releaseId) taskQuery.release = releaseId;
      if (assigneeId) taskQuery.assignee = assigneeId;
      if (reporterId) taskQuery.reporter = reporterId;

      if (effStatus) {
        taskQuery.status = { $regex: new RegExp(`^${effStatus}$`, 'i') };
      }
      if (effPriority) {
        taskQuery.priority = { $regex: new RegExp(`^${effPriority}$`, 'i') };
      }
      if (effTaskType) {
        taskQuery.type = { $regex: new RegExp(`^${effTaskType}$`, 'i') };
      }
      if (effLabel) {
        const labelArr = Array.isArray(effLabel) ? effLabel : [effLabel];
        taskQuery.labels = { $in: labelArr.map((l) => new RegExp(l, 'i')) };
      }
      if (dateRange) {
        taskQuery.createdAt = dateRange;
      }

      if (searchRegex) {
        taskQuery.$or = [
          { title: searchRegex },
          { taskKey: searchRegex },
          { description: searchRegex },
          { labels: searchRegex },
        ];
      }

      const tasks = await TaskModel.find(taskQuery)
        .populate('project', 'name projectKey')
        .populate('workspace', 'name')
        .populate('assignee', 'firstName lastName email avatar')
        .limit(100)
        .lean();

      countsByCategory.tasks = tasks.length;

      tasks.forEach((t: any) => {
        const assigneeObj = t.assignee
          ? {
              id: t.assignee._id.toString(),
              name: `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim() || 'Unassigned',
              avatar: t.assignee.avatar,
            }
          : undefined;

        allResults.push({
          id: t._id.toString(),
          title: t.title,
          type: 'task',
          category: 'Tasks',
          identifier: t.taskKey,
          description: t.description,
          url: `/app/tasks?taskId=${t._id}`,
          status: t.status,
          priority: t.priority,
          assignee: assigneeObj,
          context: {
            organizationId: t.organization?.toString(),
            workspaceId: t.workspace?._id?.toString(),
            workspaceName: t.workspace?.name,
            projectId: t.project?._id?.toString(),
            projectName: t.project?.name,
          },
          updatedAt: t.updatedAt?.toISOString() || new Date().toISOString(),
          score: t.taskKey?.toLowerCase() === cleanText.toLowerCase() ? 100 : 80,
        });
      });
    }

    /* ====================================================
       2. PROJECT SEARCH
       ==================================================== */
    if (category === 'all' || category === 'projects') {
      const projQuery: any = {
        organization: { $in: targetOrgIds },
        isArchived: false,
      };
      if (workspaceId) projQuery.workspace = workspaceId;
      if (dateRange) projQuery.createdAt = dateRange;

      if (searchRegex) {
        projQuery.$or = [
          { name: searchRegex },
          { projectKey: searchRegex },
          { description: searchRegex },
        ];
      }

      const projects = await ProjectModel.find(projQuery)
        .populate('workspace', 'name')
        .populate('owner', 'firstName lastName avatar')
        .limit(50)
        .lean();

      countsByCategory.projects = projects.length;

      projects.forEach((p: any) => {
        allResults.push({
          id: p._id.toString(),
          title: p.name,
          type: 'project',
          category: 'Projects',
          identifier: p.projectKey,
          description: p.description,
          url: `/app/projects?projectId=${p._id}`,
          status: p.status,
          context: {
            organizationId: p.organization?.toString(),
            workspaceId: p.workspace?._id?.toString(),
            workspaceName: p.workspace?.name,
          },
          updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
          score: p.projectKey?.toLowerCase() === cleanText.toLowerCase() ? 95 : 75,
        });
      });
    }

    /* ====================================================
       3. WORKSPACE SEARCH
       ==================================================== */
    if (category === 'all' || category === 'workspaces') {
      const wsQuery: any = {
        organization: { $in: targetOrgIds },
        isArchived: false,
      };
      if (searchRegex) {
        wsQuery.$or = [
          { name: searchRegex },
          { slug: searchRegex },
          { description: searchRegex },
        ];
      }

      const workspaces = await Workspace.find(wsQuery)
        .populate('organization', 'name')
        .limit(30)
        .lean();

      countsByCategory.workspaces = workspaces.length;

      workspaces.forEach((w: any) => {
        allResults.push({
          id: w._id.toString(),
          title: w.name,
          type: 'workspace',
          category: 'Workspaces',
          identifier: w.slug,
          description: w.description,
          url: `/app/workspaces?workspaceId=${w._id}`,
          context: {
            organizationId: w.organization?._id?.toString(),
            organizationName: w.organization?.name,
          },
          updatedAt: w.updatedAt?.toISOString() || new Date().toISOString(),
          score: 70,
        });
      });
    }

    /* ====================================================
       4. PEOPLE / MEMBER SEARCH
       ==================================================== */
    if (category === 'all' || category === 'people') {
      const orgMembers = await OrganizationMember.find({
        organization: { $in: targetOrgIds },
        status: 'active',
      }).select('user role organization');

      const memberUserIds = orgMembers.map((m) => m.user);

      const userQuery: any = {
        _id: { $in: memberUserIds },
        isActive: true,
      };

      if (searchRegex) {
        userQuery.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { githubUsername: searchRegex },
        ];
      }

      const users = await User.find(userQuery).limit(30).lean();
      countsByCategory.people = users.length;

      users.forEach((u: any) => {
        const memberInfo = orgMembers.find(
          (m) => m.user.toString() === u._id.toString()
        );
        allResults.push({
          id: u._id.toString(),
          title: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          type: 'people',
          category: 'People',
          identifier: u.email,
          description: `Role: ${memberInfo?.role || 'Member'} • ${u.email}`,
          url: `/app/members?userId=${u._id}`,
          assignee: {
            id: u._id.toString(),
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            avatar: u.avatar,
          },
          updatedAt: u.updatedAt?.toISOString() || new Date().toISOString(),
          score: 85,
        });
      });
    }

    /* ====================================================
       5. SPRINT SEARCH
       ==================================================== */
    if (category === 'all' || category === 'sprints') {
      const sprintQuery: any = {
        organization: { $in: targetOrgIds },
        isArchived: false,
      };
      if (projectId) sprintQuery.project = projectId;
      if (searchRegex) {
        sprintQuery.$or = [{ name: searchRegex }, { goal: searchRegex }];
      }

      const sprints = await Sprint.find(sprintQuery)
        .populate('project', 'name projectKey')
        .limit(30)
        .lean();

      countsByCategory.sprints = sprints.length;

      sprints.forEach((s: any) => {
        allResults.push({
          id: s._id.toString(),
          title: s.name,
          type: 'sprint',
          category: 'Sprints',
          description: s.goal || `Status: ${s.status}`,
          url: `/app/sprints?sprintId=${s._id}`,
          status: s.status,
          context: {
            projectId: s.project?._id?.toString(),
            projectName: s.project?.name,
          },
          updatedAt: s.updatedAt?.toISOString() || new Date().toISOString(),
          score: 65,
        });
      });
    }

    /* ====================================================
       6. RELEASE SEARCH
       ==================================================== */
    if (category === 'all' || category === 'releases') {
      const releaseQuery: any = {
        organization: { $in: targetOrgIds },
        isArchived: false,
      };
      if (projectId) releaseQuery.project = projectId;
      if (searchRegex) {
        releaseQuery.$or = [
          { name: searchRegex },
          { version: searchRegex },
          { description: searchRegex },
        ];
      }

      const releases = await ReleaseModel.find(releaseQuery)
        .populate('project', 'name projectKey')
        .limit(30)
        .lean();

      countsByCategory.releases = releases.length;

      releases.forEach((r: any) => {
        allResults.push({
          id: r._id.toString(),
          title: r.name || `Release v${r.version}`,
          type: 'release',
          category: 'Releases',
          identifier: r.version,
          description: r.description || `Status: ${r.status}`,
          url: `/app/roadmap?releaseId=${r._id}`,
          status: r.status,
          context: {
            projectId: r.project?._id?.toString(),
            projectName: r.project?.name,
          },
          updatedAt: r.updatedAt?.toISOString() || new Date().toISOString(),
          score: 60,
        });
      });
    }

    /* ====================================================
       7. COMMENTS SEARCH
       ==================================================== */
    if (category === 'all' || category === 'comments') {
      const commentQuery: any = {
        organization: { $in: targetOrgIds },
        isDeleted: false,
      };
      if (projectId) commentQuery.project = projectId;
      if (searchRegex) {
        commentQuery.content = searchRegex;
      }

      const comments = await CommentModel.find(commentQuery)
        .populate('task', 'title taskKey')
        .populate('author', 'firstName lastName avatar')
        .limit(30)
        .lean();

      countsByCategory.comments = comments.length;

      comments.forEach((c: any) => {
        const taskDoc = c.task as any;
        const authorDoc = c.author as any;
        allResults.push({
          id: c._id.toString(),
          title: `Comment on ${taskDoc?.taskKey || 'Task'}`,
          type: 'comment',
          category: 'Comments',
          identifier: taskDoc?.taskKey,
          description: c.content?.slice(0, 150),
          url: `/app/tasks?taskId=${taskDoc?._id}`,
          assignee: authorDoc
            ? {
                id: authorDoc._id?.toString(),
                name: `${authorDoc.firstName || ''} ${authorDoc.lastName || ''}`.trim(),
                avatar: authorDoc.avatar,
              }
            : undefined,
          updatedAt: c.updatedAt?.toISOString() || new Date().toISOString(),
          score: 55,
        });
      });
    }

    /* ====================================================
       8. FILES / ATTACHMENT SEARCH
       ==================================================== */
    if (category === 'all' || category === 'files') {
      const fileQuery: any = {
        organization: { $in: targetOrgIds },
      };
      if (projectId) fileQuery.project = projectId;
      if (searchRegex) {
        fileQuery.$or = [
          { originalName: searchRegex },
          { fileName: searchRegex },
        ];
      }

      const files = await AttachmentModel.find(fileQuery)
        .populate('task', 'title taskKey')
        .populate('uploadedBy', 'firstName lastName avatar')
        .limit(30)
        .lean();

      countsByCategory.files = files.length;

      files.forEach((f: any) => {
        const taskDoc = f.task as any;
        allResults.push({
          id: f._id.toString(),
          title: f.originalName || f.fileName,
          type: 'file',
          category: 'Files',
          identifier: f.fileType?.toUpperCase(),
          description: `Attached to ${taskDoc?.taskKey || 'Task'} (${Math.round((f.fileSize || 0) / 1024)} KB)`,
          url: f.fileUrl,
          updatedAt: f.updatedAt?.toISOString() || new Date().toISOString(),
          score: 50,
        });
      });
    }

    /* ====================================================
       9. ACTIVITY SEARCH
       ==================================================== */
    if (category === 'all' || category === 'activity') {
      const activityQuery: any = {
        organization: { $in: targetOrgIds },
      };
      if (searchRegex) {
        activityQuery.$or = [
          { description: searchRegex },
          { action: searchRegex },
        ];
      }

      const activities = await ActivityModel.find(activityQuery)
        .populate('user', 'firstName lastName avatar')
        .populate('task', 'title taskKey')
        .limit(30)
        .lean();

      countsByCategory.activity = activities.length;

      activities.forEach((act: any) => {
        const uDoc = act.user as any;
        allResults.push({
          id: act._id.toString(),
          title: act.description || act.action,
          type: 'activity',
          category: 'Activity',
          description: act.action ? `Action: ${act.action}` : undefined,
          url: `/app/audit-logs`,
          assignee: uDoc
            ? {
                id: uDoc._id?.toString(),
                name: `${uDoc.firstName || ''} ${uDoc.lastName || ''}`.trim(),
                avatar: uDoc.avatar,
              }
            : undefined,
          updatedAt: act.createdAt?.toISOString() || new Date().toISOString(),
          score: 40,
        });
      });
    }

    /* ====================================================
       10. ORGANIZATIONS SEARCH
       ==================================================== */
    if (category === 'all' || category === 'organizations') {
      const orgQuery: any = {
        _id: { $in: targetOrgIds },
      };
      if (searchRegex) {
        orgQuery.$or = [
          { name: searchRegex },
          { slug: searchRegex },
          { description: searchRegex },
        ];
      }

      const orgs = await Organization.find(orgQuery).limit(10).lean();
      countsByCategory.organizations = orgs.length;

      orgs.forEach((o: any) => {
        allResults.push({
          id: o._id.toString(),
          title: o.name,
          type: 'organization',
          category: 'Organizations',
          identifier: o.slug,
          description: o.description || 'Enterprise Organization',
          url: `/app/organizations`,
          updatedAt: o.updatedAt?.toISOString() || new Date().toISOString(),
          score: 90,
        });
      });
    }

    /* ====================================================
       11. GITHUB SEARCH (REPOS, PRs, ISSUES, BRANCHES, COMMITS)
       ==================================================== */
    if (category === 'all' || category === 'github') {
      const gitQuery: any = {
        organization: { $in: targetOrgIds },
      };
      if (workspaceId) gitQuery.workspace = workspaceId;
      if (projectId) gitQuery.project = projectId;

      // Find connections first
      const repos = await GitHubRepositoryConnectionModel.find(gitQuery).limit(20).lean();

      let repoCount = 0;
      repos.forEach((r: any) => {
        if (matchesText([r.repositoryName, r.fullName, r.description])) {
          repoCount++;
          allResults.push({
            id: r._id.toString(),
            title: r.fullName,
            type: 'project',
            category: 'GitHub',
            identifier: 'Repository',
            description: r.description || `Default branch: ${r.defaultBranch}`,
            url: `/app/github-repositories?connectionId=${r._id}`,
            updatedAt: r.updatedAt?.toISOString() || new Date().toISOString(),
            score: 75,
          });
        }
      });

      // Search Issues
      const issues = await GitHubIssueMappingModel.find(gitQuery)
        .limit(20)
        .lean();

      let issueCount = 0;
      issues.forEach((issue: any) => {
        if (matchesText([issue.githubTitle, issue.githubBody, String(issue.githubIssueNumber)])) {
          issueCount++;
          allResults.push({
            id: issue._id.toString(),
            title: issue.githubTitle,
            type: 'task',
            category: 'GitHub',
            identifier: `#${issue.githubIssueNumber} (Issue)`,
            description: issue.githubBody?.slice(0, 150),
            url: `/app/tasks?taskId=${issue.task}`,
            status: issue.githubState,
            updatedAt: issue.updatedAt?.toISOString() || new Date().toISOString(),
            score: cleanText.includes(String(issue.githubIssueNumber)) ? 100 : 70,
          });
        }
      });

      // Search Pull Requests
      const prs = await GitHubPullRequestModel.find(gitQuery)
        .limit(20)
        .lean();

      let prCount = 0;
      prs.forEach((pr: any) => {
        if (matchesText([pr.title, pr.body, String(pr.githubPullRequestNumber)])) {
          prCount++;
          allResults.push({
            id: pr._id.toString(),
            title: pr.title,
            type: 'task',
            category: 'GitHub',
            identifier: `#${pr.githubPullRequestNumber} (Pull Request)`,
            description: pr.body?.slice(0, 150),
            url: `/app/assignments`,
            status: pr.state,
            updatedAt: pr.updatedAt?.toISOString() || new Date().toISOString(),
            score: cleanText.includes(String(pr.githubPullRequestNumber)) ? 100 : 70,
          });
        }
      });

      // Search Branches & Commits
      const repoIds = repos.map((r) => r._id);
      if (repoIds.length > 0) {
        const [branches, commits] = await Promise.all([
          GitHubBranchModel.find({ repositoryConnection: { $in: repoIds } }).limit(20).lean(),
          GitHubCommitModel.find({ repositoryConnection: { $in: repoIds } }).limit(20).lean(),
        ]);

        branches.forEach((b: any) => {
          if (matchesText([b.githubBranchName])) {
            allResults.push({
              id: b._id.toString(),
              title: b.githubBranchName,
              type: 'project',
              category: 'GitHub',
              identifier: 'Branch',
              description: `Branch on SHA: ${b.githubCommitSha?.slice(0, 8)}`,
              url: `/app/github-repositories?connectionId=${b.repositoryConnection}`,
              updatedAt: b.updatedAt?.toISOString() || new Date().toISOString(),
              score: 65,
            });
          }
        });

        commits.forEach((c: any) => {
          if (matchesText([c.message, c.githubCommitSha, c.authorName, c.authorEmail])) {
            allResults.push({
              id: c._id.toString(),
              title: c.message,
              type: 'project',
              category: 'GitHub',
              identifier: `Commit ${c.githubCommitSha?.slice(0, 8)}`,
              description: `Author: ${c.authorName} <${c.authorEmail || ''}>`,
              url: `/app/github-repositories?connectionId=${c.repositoryConnection}`,
              updatedAt: c.committedAt?.toISOString() || c.updatedAt?.toISOString() || new Date().toISOString(),
              score: cleanText.toLowerCase().includes(c.githubCommitSha?.toLowerCase() || '') ? 100 : 60,
            });
          }
        });
      }

      countsByCategory.github = repoCount + issueCount + prCount;
    }

    /* ====================================================
       SORTING RESULTS
       ==================================================== */
    allResults.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'priority') {
        const priorityScore = (p?: string) => {
          if (!p) return 0;
          const map: Record<string, number> = {
            urgent: 6,
            highest: 5,
            high: 4,
            medium: 3,
            low: 2,
            lowest: 1,
          };
          return map[p.toLowerCase()] || 0;
        };
        return priorityScore(b.priority) - priorityScore(a.priority);
      }
      // Default: 'relevance' (combination of match score and update date)
      const scoreA = (a.score || 50) + (new Date(a.updatedAt).getTime() / 1e12);
      const scoreB = (b.score || 50) + (new Date(b.updatedAt).getTime() / 1e12);
      return scoreB - scoreA;
    });

    // Pagination slice
    const total = allResults.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = allResults.slice(startIndex, startIndex + limit);

    return {
      results: paginatedResults,
      countsByCategory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      queryParsed: {
        text: cleanText,
        filters: inlineFilters,
      },
    };
  }

  /**
   * Fast Typeahead Search Suggestions
   */
  public static async getSuggestions(userId: string, query: string) {
    if (!query || query.trim().length < 1) {
      return { suggestions: [] };
    }

    const { cleanText } = this.parseQueryString(query);
    if (!cleanText) return { suggestions: [] };

    const searchRegex = new RegExp(cleanText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
    const userOrgIds = await this.getAuthorizedOrgIds(userId);
    if (userOrgIds.length === 0) return { suggestions: [] };

    const [tasks, projects, people, workspaces] = await Promise.all([
      TaskModel.find({
        organization: { $in: userOrgIds },
        isArchived: false,
        $or: [{ title: searchRegex }, { taskKey: searchRegex }],
      })
        .select('title taskKey _id')
        .limit(5)
        .lean(),

      ProjectModel.find({
        organization: { $in: userOrgIds },
        isArchived: false,
        $or: [{ name: searchRegex }, { projectKey: searchRegex }],
      })
        .select('name projectKey _id')
        .limit(4)
        .lean(),

      User.find({
        isActive: true,
        $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }],
      })
        .select('firstName lastName email avatar _id')
        .limit(4)
        .lean(),

      Workspace.find({
        organization: { $in: userOrgIds },
        isArchived: false,
        $or: [{ name: searchRegex }, { slug: searchRegex }],
      })
        .select('name slug _id')
        .limit(3)
        .lean(),
    ]);

    const suggestions = [
      ...tasks.map((t: any) => ({
        id: t._id.toString(),
        text: `${t.taskKey}: ${t.title}`,
        type: 'task',
        url: `/app/tasks?taskId=${t._id}`,
      })),
      ...projects.map((p: any) => ({
        id: p._id.toString(),
        text: `${p.projectKey} - ${p.name}`,
        type: 'project',
        url: `/app/projects?projectId=${p._id}`,
      })),
      ...people.map((u: any) => ({
        id: u._id.toString(),
        text: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        type: 'people',
        url: `/app/members?userId=${u._id}`,
      })),
      ...workspaces.map((w: any) => ({
        id: w._id.toString(),
        text: w.name,
        type: 'workspace',
        url: `/app/workspaces?workspaceId=${w._id}`,
      })),
    ];

    return { suggestions };
  }

  /**
   * Save or update recent search entry
   */
  public static async saveRecentSearch(
    userId: string,
    query: string,
    category = 'all',
    filters = {}
  ) {
    if (!query || query.trim().length === 0) return null;

    const trimmedQuery = query.trim();

    const recent = await RecentSearchModel.findOneAndUpdate(
      { user: userId, query: trimmedQuery },
      {
        user: userId,
        query: trimmedQuery,
        category,
        filters,
        lastSearchedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Keep only last 20 searches per user
    const userSearches = await RecentSearchModel.find({ user: userId })
      .sort({ lastSearchedAt: -1 })
      .select('_id');

    if (userSearches.length > 20) {
      const toDelete = userSearches.slice(20).map((s) => s._id);
      await RecentSearchModel.deleteMany({ _id: { $in: toDelete } });
    }

    return recent;
  }

  /**
   * Get user's recent searches
   */
  public static async getRecentSearches(userId: string) {
    const searches = await RecentSearchModel.find({ user: userId })
      .sort({ lastSearchedAt: -1 })
      .limit(10)
      .lean();

    return searches.map((s) => ({
      id: s._id.toString(),
      query: s.query,
      category: s.category || 'all',
      filters: s.filters || {},
      lastSearchedAt: s.lastSearchedAt,
    }));
  }

  /**
   * Delete one or all recent searches for user
   */
  public static async deleteRecentSearch(userId: string, searchId?: string) {
    if (searchId) {
      await RecentSearchModel.deleteOne({ _id: searchId, user: userId });
    } else {
      await RecentSearchModel.deleteMany({ user: userId });
    }
    return true;
  }
}
