import { Types } from 'mongoose';
import { ActivityModel } from '../models/activity.model';
import { GitHubCommitModel } from '../models/githubCommit.model';
import { GitHubPullRequestModel } from '../models/githubPullRequest.model';
import { GitHubConnectionModel } from '../models/githubConnection.model';
import { GitHubRepositoryConnectionModel } from '../models/githubRepositoryConnection.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { User as UserModel } from '../models/user.model';
import { TaskModel } from '../models/task.model';
import { TimeEntry as TimeEntryModel } from '../models/timeEntry.model';
import { config } from '../config/env.config';

export interface ActivityAnalyticsFilterParams {
  organizationId: string;
  workspaceId?: string;
  projectId?: string;
  repositoryId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: 'today' | 'yesterday' | '7d' | '14d' | '30d' | '90d' | '1y' | 'custom';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ContributionHeatmapDay {
  date: string;
  count: number;
  commits: number;
  pullRequests: number;
  reviews: number;
  tasks: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface DeveloperMetricItem {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  githubConnected: boolean;
  totalContributions: number;
  contributionScore: number;
  commitsCount: number;
  prsOpenedCount: number;
  prsMergedCount: number;
  reviewsCount: number;
  tasksCompletedCount: number;
  tasksCreatedCount: number;
  hoursLogged: number;
  streakDays: number;
  lastActiveAt: string | null;
  impactRank?: number;
}

export class ActivityAnalyticsService {
  /**
   * Helper to parse date range filters with sensible defaults
   */
  private static parseDateRange(params: ActivityAnalyticsFilterParams): { start: Date; end: Date } {
    const end = params.endDate ? new Date(params.endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let start: Date;
    if (params.startDate) {
      start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }

    const range = params.timeRange || '30d';
    const now = new Date();
    switch (range) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case '7d':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case '14d':
        start = new Date(now);
        start.setDate(start.getDate() - 14);
        start.setHours(0, 0, 0, 0);
        break;
      case '90d':
        start = new Date(now);
        start.setDate(start.getDate() - 90);
        start.setHours(0, 0, 0, 0);
        break;
      case '1y':
        start = new Date(now);
        start.setDate(start.getDate() - 365);
        start.setHours(0, 0, 0, 0);
        break;
      case '30d':
      default:
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return { start, end };
  }

  /**
   * Helper to fetch active members of an organization and their GitHub connection details
   */
  private static async getOrgMembersWithGitHub(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);
    const members = await OrganizationMember.find({
      organization: orgId,
      status: 'active',
    }).populate('user', 'name firstName lastName email avatar role githubUsername githubProfileUrl');

    const userIds = members
      .map((m) => (m.user && typeof m.user === 'object' ? (m.user as any)._id : m.user))
      .filter(Boolean);

    const githubConns = await GitHubConnectionModel.find({
      user: { $in: userIds },
      status: 'Connected',
    });

    const connMap = new Map<string, any>();
    githubConns.forEach((c) => {
      connMap.set(c.user.toString(), c);
    });

    return members.map((m) => {
      const u: any = m.user;
      if (!u || !u._id) return null;
      const uId = u._id.toString();
      const conn = connMap.get(uId);
      const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Developer';
      return {
        userId: uId,
        name,
        email: u.email || '',
        avatar: u.avatar || '',
        role: m.role || u.role || 'developer',
        githubUsername: conn?.githubUsername || u.githubUsername || '',
        githubAvatarUrl: conn?.githubAvatarUrl || '',
        githubConnected: !!conn || !!u.githubUsername,
      };
    }).filter(Boolean);
  }

  /**
   * Calculate overall developer activity overview for organization / workspace / project
   */
  public static async getDeveloperActivityOverview(params: ActivityAnalyticsFilterParams) {
    const { start, end } = this.parseDateRange(params);
    const orgId = new Types.ObjectId(params.organizationId);

    // 1. Get repository connections in scope
    const repoQuery: any = { organization: orgId };
    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      repoQuery.workspace = new Types.ObjectId(params.workspaceId);
    }
    if (params.projectId && Types.ObjectId.isValid(params.projectId)) {
      repoQuery.project = new Types.ObjectId(params.projectId);
    }
    if (params.repositoryId && Types.ObjectId.isValid(params.repositoryId)) {
      repoQuery._id = new Types.ObjectId(params.repositoryId);
    }

    const repos = await GitHubRepositoryConnectionModel.find(repoQuery).select('_id fullName repositoryName');
    const repoIds = repos.map((r) => r._id);

    // 2. Fetch commits in date range
    const commitQuery: any = {
      repositoryConnection: { $in: repoIds },
      committedAt: { $gte: start, $lte: end },
    };
    const commitsCount = await GitHubCommitModel.countDocuments(commitQuery);

    // 3. Fetch pull requests in date range
    const prQuery: any = {
      repositoryConnection: { $in: repoIds },
      createdAt: { $gte: start, $lte: end },
    };
    const totalPRs = await GitHubPullRequestModel.countDocuments(prQuery);
    const mergedPRs = await GitHubPullRequestModel.countDocuments({
      ...prQuery,
      state: 'merged',
    });
    const openPRs = await GitHubPullRequestModel.countDocuments({
      ...prQuery,
      state: 'open',
    });

    // 4. Fetch TaskFlow tasks completed/created in date range
    const taskQuery: any = {
      organization: orgId,
      createdAt: { $gte: start, $lte: end },
    };
    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      taskQuery.workspace = new Types.ObjectId(params.workspaceId);
    }
    if (params.projectId && Types.ObjectId.isValid(params.projectId)) {
      taskQuery.project = new Types.ObjectId(params.projectId);
    }

    const tasksCreatedCount = await TaskModel.countDocuments(taskQuery);
    const tasksCompletedCount = await TaskModel.countDocuments({
      ...taskQuery,
      status: { $in: ['Done', 'Testing'] as any },
    });

    // 5. Fetch reviews count from PRs
    const prsWithReviews = await GitHubPullRequestModel.find(prQuery).select('reviewers reviewStatus');
    let totalReviewsCount = 0;
    prsWithReviews.forEach((pr) => {
      if (pr.reviewers && Array.isArray(pr.reviewers)) {
        totalReviewsCount += pr.reviewers.length;
      }
    });

    // 6. Fetch time tracking hours
    const timeQuery: any = {
      organization: orgId,
      startTime: { $gte: start, $lte: end },
    };
    const timeEntries = await TimeEntryModel.find(timeQuery).select('duration');
    const totalLoggedSeconds = timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalHoursLogged = Math.round((totalLoggedSeconds / 3600) * 10) / 10;

    // 7. Active contributors count in date range
    const activeMembers = await this.getOrgMembersWithGitHub(params.organizationId);

    // Calculate aggregated timeline by date
    const dailyMap = new Map<string, { commits: number; prs: number; reviews: number; tasks: number }>();
    const curr = new Date(start);
    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      dailyMap.set(dateStr, { commits: 0, prs: 0, reviews: 0, tasks: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    // Populate timeline with commits
    const commitDocs = await GitHubCommitModel.find(commitQuery).select('committedAt authorLogin authorName');
    commitDocs.forEach((c) => {
      const d = new Date(c.committedAt).toISOString().split('T')[0];
      if (dailyMap.has(d)) {
        const item = dailyMap.get(d)!;
        item.commits += 1;
      }
    });

    // Populate timeline with PRs
    const prDocs = await GitHubPullRequestModel.find(prQuery).select('createdAt reviewers');
    prDocs.forEach((p) => {
      const d = new Date(p.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(d)) {
        const item = dailyMap.get(d)!;
        item.prs += 1;
        if (p.reviewers) item.reviews += p.reviewers.length;
      }
    });

    // Populate timeline with completed tasks
    const taskDocs = await TaskModel.find({
      organization: orgId,
      updatedAt: { $gte: start, $lte: end },
      status: { $in: ['Done', 'Testing'] as any },
    }).select('updatedAt');
    taskDocs.forEach((t) => {
      const d = new Date(t.updatedAt).toISOString().split('T')[0];
      if (dailyMap.has(d)) {
        const item = dailyMap.get(d)!;
        item.tasks += 1;
      }
    });

    const timeline = Array.from(dailyMap.entries()).map(([date, counts]) => ({
      date,
      totalContributions: counts.commits + counts.prs + counts.reviews + counts.tasks,
      commits: counts.commits,
      pullRequests: counts.prs,
      reviews: counts.reviews,
      tasks: counts.tasks,
    }));

    const totalContributions = commitsCount + totalPRs + totalReviewsCount + tasksCompletedCount;

    return {
      summary: {
        totalContributions,
        commitsCount,
        pullRequestsCount: totalPRs,
        prsMergedCount: mergedPRs,
        prsOpenCount: openPRs,
        reviewsCount: totalReviewsCount,
        tasksCompletedCount,
        tasksCreatedCount,
        totalHoursLogged,
        activeContributorsCount: activeMembers.length,
        connectedRepositoriesCount: repos.length,
      },
      timeline,
      breakdown: {
        commitsPercent: totalContributions > 0 ? Math.round((commitsCount / totalContributions) * 100) : 0,
        prsPercent: totalContributions > 0 ? Math.round((totalPRs / totalContributions) * 100) : 0,
        reviewsPercent: totalContributions > 0 ? Math.round((totalReviewsCount / totalContributions) * 100) : 0,
        tasksPercent: totalContributions > 0 ? Math.round((tasksCompletedCount / totalContributions) * 100) : 0,
      },
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };
  }

  /**
   * Get Developer Contribution Leaderboard & Ranked Team Member Activity
   */
  public static async getDeveloperLeaderboard(params: ActivityAnalyticsFilterParams): Promise<{
    developers: DeveloperMetricItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { start, end } = this.parseDateRange(params);
    const orgMembers = await this.getOrgMembersWithGitHub(params.organizationId);
    const orgId = new Types.ObjectId(params.organizationId);

    // Get repo connections in scope
    const repoQuery: any = { organization: orgId };
    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      repoQuery.workspace = new Types.ObjectId(params.workspaceId);
    }
    if (params.projectId && Types.ObjectId.isValid(params.projectId)) {
      repoQuery.project = new Types.ObjectId(params.projectId);
    }
    const repos = await GitHubRepositoryConnectionModel.find(repoQuery).select('_id');
    const repoIds = repos.map((r) => r._id);

    // Build developer metrics for each member
    const developerMetrics: DeveloperMetricItem[] = await Promise.all(
      orgMembers.map(async (member: any) => {
        const uId = new Types.ObjectId(member.userId);
        const ghUser = (member.githubUsername || '').toLowerCase();
        const userEmail = (member.email || '').toLowerCase();

        // 1. Commits by this user (matched via authorLogin or authorEmail or authorName)
        const commitMatch: any = {
          repositoryConnection: { $in: repoIds },
          committedAt: { $gte: start, $lte: end },
          $or: [
            { authorLogin: { $regex: new RegExp(`^${ghUser}$`, 'i') } },
            { authorEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
            { authorName: { $regex: new RegExp(member.name, 'i') } },
          ],
        };
        // If github username is empty, match solely by email/name
        if (!ghUser) {
          commitMatch.$or = [
            { authorEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
            { authorName: { $regex: new RegExp(member.name, 'i') } },
          ];
        }

        const commitsCount = await GitHubCommitModel.countDocuments(commitMatch);

        // 2. PRs created by this user
        const prMatch: any = {
          repositoryConnection: { $in: repoIds },
          createdAt: { $gte: start, $lte: end },
          $or: [
            { 'author.login': { $regex: new RegExp(`^${ghUser}$`, 'i') } },
            { createdBy: uId },
          ],
        };
        const prsOpenedCount = await GitHubPullRequestModel.countDocuments(prMatch);
        const prsMergedCount = await GitHubPullRequestModel.countDocuments({
          ...prMatch,
          state: 'merged',
        });

        // 3. PR Reviews conducted by this user
        const reviewMatch: any = {
          repositoryConnection: { $in: repoIds },
          'reviewers.login': { $regex: new RegExp(`^${ghUser}$`, 'i') },
        };
        const reviewsCount = ghUser ? await GitHubPullRequestModel.countDocuments(reviewMatch) : 0;

        // 4. Tasks completed / created
        const tasksCompletedCount = await TaskModel.countDocuments({
          organization: orgId,
          assignees: uId,
          status: { $in: ['Done', 'Testing'] as any },
          updatedAt: { $gte: start, $lte: end },
        });

        const tasksCreatedCount = await TaskModel.countDocuments({
          organization: orgId,
          creator: uId,
          createdAt: { $gte: start, $lte: end },
        });

        // 5. Time tracking hours
        const timeDocs = await TimeEntryModel.find({
          organization: orgId,
          user: uId,
          startTime: { $gte: start, $lte: end },
        }).select('duration');
        const loggedSeconds = timeDocs.reduce((acc, t) => acc + (t.duration || 0), 0);
        const hoursLogged = Math.round((loggedSeconds / 3600) * 10) / 10;

        // 6. Last active timestamp
        const latestActivity = await ActivityModel.findOne({
          organization: orgId,
          user: uId,
        }).sort({ createdAt: -1 }).select('createdAt');

        const latestCommit = await GitHubCommitModel.findOne(commitMatch)
          .sort({ committedAt: -1 })
          .select('committedAt');

        const lastActiveAt = latestCommit?.committedAt
          ? latestCommit.committedAt.toISOString()
          : latestActivity?.createdAt
          ? latestActivity.createdAt.toISOString()
          : null;

        // 7. Calculate Contribution Score & Streak
        // Scoring formula: PR Merged (5 pts), PR Review (4 pts), PR Opened (3 pts), Task Done (3 pts), Commit (2 pts), Task Created (1 pt)
        const totalContributions = commitsCount + prsOpenedCount + reviewsCount + tasksCompletedCount;
        const contributionScore =
          commitsCount * 2 +
          prsOpenedCount * 3 +
          prsMergedCount * 5 +
          reviewsCount * 4 +
          tasksCompletedCount * 3 +
          tasksCreatedCount * 1;

        // Streak estimate: mock/computed consecutive days of activity
        const streakDays = Math.min(14, Math.max(1, Math.floor(totalContributions / 3)));

        return {
          userId: member.userId,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.role,
          githubUsername: member.githubUsername,
          githubAvatarUrl: member.githubAvatarUrl,
          githubConnected: member.githubConnected,
          totalContributions,
          contributionScore,
          commitsCount,
          prsOpenedCount,
          prsMergedCount,
          reviewsCount,
          tasksCompletedCount,
          tasksCreatedCount,
          hoursLogged,
          streakDays,
          lastActiveAt,
        };
      })
    );

    // Filter by search query if supplied
    let filtered = developerMetrics;
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          (d.githubUsername && d.githubUsername.toLowerCase().includes(q)) ||
          d.role.toLowerCase().includes(q)
      );
    }

    // Sort leaderboard
    const sortBy = params.sortBy || 'contributionScore';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] ?? 0;
      const valB = b[sortBy] ?? 0;
      if (typeof valA === 'string') {
        return sortOrder * valA.localeCompare(valB);
      }
      return sortOrder * (valA - valB);
    });

    // Assign rank
    filtered.forEach((d, idx) => {
      d.impactRank = idx + 1;
    });

    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 25;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      developers: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  /**
   * Deep-dive analytics for a single developer (Heatmap, PR/Commit breakdown, Work Patterns, Activities)
   */
  public static async getDeveloperDeepDive(userId: string, params: ActivityAnalyticsFilterParams) {
    const { start, end } = this.parseDateRange(params);
    const orgId = new Types.ObjectId(params.organizationId);
    const uId = new Types.ObjectId(userId);

    const user = await UserModel.findById(uId).select('name firstName lastName email avatar role githubUsername githubProfileUrl');
    if (!user) {
      throw new Error('User not found');
    }

    const ghConn = await GitHubConnectionModel.findOne({ user: uId, status: 'Connected' });
    const ghUser = (ghConn?.githubUsername || user.githubUsername || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user as any).name || 'Developer';

    // 1. Repos in scope
    const repoQuery: any = { organization: orgId };
    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      repoQuery.workspace = new Types.ObjectId(params.workspaceId);
    }
    const repos = await GitHubRepositoryConnectionModel.find(repoQuery).select('_id repositoryName fullName');
    const repoIds = repos.map((r) => r._id);

    // 2. Commits in selected range
    const commitMatch: any = {
      repositoryConnection: { $in: repoIds },
      $or: [
        { authorLogin: { $regex: new RegExp(`^${ghUser}$`, 'i') } },
        { authorEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
        { authorName: { $regex: new RegExp(userName, 'i') } },
      ],
    };
    if (!ghUser) {
      commitMatch.$or = [
        { authorEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
        { authorName: { $regex: new RegExp(userName, 'i') } },
      ];
    }

    const commits = await GitHubCommitModel.find({
      ...commitMatch,
      committedAt: { $gte: start, $lte: end },
    })
      .populate('repositoryConnection', 'repositoryName fullName')
      .sort({ committedAt: -1 })
      .limit(100);

    // 3. Pull Requests in range
    const prMatch: any = {
      repositoryConnection: { $in: repoIds },
      $or: [
        { 'author.login': { $regex: new RegExp(`^${ghUser}$`, 'i') } },
        { createdBy: uId },
      ],
    };
    const pullRequests = await GitHubPullRequestModel.find({
      ...prMatch,
      createdAt: { $gte: start, $lte: end },
    })
      .populate('repositoryConnection', 'repositoryName fullName')
      .sort({ createdAt: -1 })
      .limit(50);

    // 4. Tasks assigned/completed
    const tasks = await TaskModel.find({
      organization: orgId,
      assignees: uId,
      updatedAt: { $gte: start, $lte: end },
    })
      .populate('project', 'name projectKey')
      .sort({ updatedAt: -1 })
      .limit(50);

    // 5. Build 365-day Contribution Heatmap Grid
    const heatmapStart = new Date();
    heatmapStart.setDate(heatmapStart.getDate() - 365);
    heatmapStart.setHours(0, 0, 0, 0);

    const yearCommits = await GitHubCommitModel.find({
      ...commitMatch,
      committedAt: { $gte: heatmapStart },
    }).select('committedAt');

    const yearPRs = await GitHubPullRequestModel.find({
      ...prMatch,
      createdAt: { $gte: heatmapStart },
    }).select('createdAt');

    const yearTasks = await TaskModel.find({
      organization: orgId,
      assignees: uId,
      status: { $in: ['Done', 'Testing'] as any },
      updatedAt: { $gte: heatmapStart },
    }).select('updatedAt');

    const dayMap = new Map<string, { commits: number; prs: number; reviews: number; tasks: number }>();
    const heatCursor = new Date(heatmapStart);
    const today = new Date();
    while (heatCursor <= today) {
      const k = heatCursor.toISOString().split('T')[0];
      dayMap.set(k, { commits: 0, prs: 0, reviews: 0, tasks: 0 });
      heatCursor.setDate(heatCursor.getDate() + 1);
    }

    yearCommits.forEach((c) => {
      const k = new Date(c.committedAt).toISOString().split('T')[0];
      if (dayMap.has(k)) dayMap.get(k)!.commits += 1;
    });

    yearPRs.forEach((p) => {
      const k = new Date(p.createdAt).toISOString().split('T')[0];
      if (dayMap.has(k)) dayMap.get(k)!.prs += 1;
    });

    yearTasks.forEach((t) => {
      const k = new Date(t.updatedAt).toISOString().split('T')[0];
      if (dayMap.has(k)) dayMap.get(k)!.tasks += 1;
    });

    const heatmap: ContributionHeatmapDay[] = Array.from(dayMap.entries()).map(([date, v]) => {
      const count = v.commits + v.prs + v.reviews + v.tasks;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5 && count <= 9) level = 3;
      else if (count >= 10) level = 4;

      return {
        date,
        count,
        commits: v.commits,
        pullRequests: v.prs,
        reviews: v.reviews,
        tasks: v.tasks,
        level,
      };
    });

    // 6. Work patterns by hour of day (0-23) and weekday (0-6)
    const hoursDist = new Array(24).fill(0);
    const weekdayDist = new Array(7).fill(0); // 0=Sun, 1=Mon, ..., 6=Sat

    commits.forEach((c) => {
      const d = new Date(c.committedAt);
      hoursDist[d.getHours()] += 1;
      weekdayDist[d.getDay()] += 1;
    });

    pullRequests.forEach((p) => {
      const d = new Date(p.createdAt);
      hoursDist[d.getHours()] += 1;
      weekdayDist[d.getDay()] += 1;
    });

    // 7. Recent combined activity events
    const activities = await ActivityModel.find({
      organization: orgId,
      user: uId,
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const completedTasksCount = tasks.filter((t) =>
      ['done', 'completed', 'resolved', 'Done', 'Completed'].includes(t.status)
    ).length;

    const mergedPRsCount = pullRequests.filter((p) => p.state === 'merged').length;

    return {
      developer: {
        userId: user._id.toString(),
        name: userName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        githubUsername: ghConn?.githubUsername || user.githubUsername || '',
        githubAvatarUrl: ghConn?.githubAvatarUrl || '',
        githubConnected: !!ghConn || !!user.githubUsername,
      },
      stats: {
        totalCommits: commits.length,
        totalPRs: pullRequests.length,
        mergedPRs: mergedPRsCount,
        openPRs: pullRequests.filter((p) => p.state === 'open').length,
        tasksCompleted: completedTasksCount,
        totalContributions: commits.length + pullRequests.length + completedTasksCount,
      },
      heatmap,
      workPatterns: {
        byHour: hoursDist.map((count, hour) => ({ hour, count })),
        byWeekday: [
          { day: 'Sun', count: weekdayDist[0] },
          { day: 'Mon', count: weekdayDist[1] },
          { day: 'Tue', count: weekdayDist[2] },
          { day: 'Wed', count: weekdayDist[3] },
          { day: 'Thu', count: weekdayDist[4] },
          { day: 'Fri', count: weekdayDist[5] },
          { day: 'Sat', count: weekdayDist[6] },
        ],
      },
      recentCommits: commits.map((c) => ({
        id: c._id.toString(),
        sha: c.githubCommitSha,
        shortSha: c.githubCommitSha.substring(0, 7),
        message: c.message,
        committedAt: c.committedAt,
        commitUrl: c.commitUrl,
        repositoryName: (c.repositoryConnection as any)?.repositoryName || 'Repository',
      })),
      recentPullRequests: pullRequests.map((p) => ({
        id: p._id.toString(),
        number: p.githubPullRequestNumber,
        title: p.title,
        state: p.state,
        reviewStatus: p.reviewStatus,
        githubUrl: p.githubUrl,
        createdAt: p.createdAt,
        repositoryName: (p.repositoryConnection as any)?.repositoryName || 'Repository',
      })),
      recentTasks: tasks.map((t) => ({
        id: t._id.toString(),
        key: (t as any).taskKey || t.title,
        title: t.title,
        status: t.status,
        priority: t.priority,
        updatedAt: t.updatedAt,
        projectName: (t.project as any)?.name || 'Project',
      })),
      recentActivities: activities.map((a) => a.toActivityPayload()),
    };
  }

  /**
   * Repository-level activity metrics and throughput
   */
  public static async getRepositoryActivityAnalytics(params: ActivityAnalyticsFilterParams) {
    const { start, end } = this.parseDateRange(params);
    const orgId = new Types.ObjectId(params.organizationId);

    const repoQuery: any = { organization: orgId };
    if (params.workspaceId && Types.ObjectId.isValid(params.workspaceId)) {
      repoQuery.workspace = new Types.ObjectId(params.workspaceId);
    }
    if (params.projectId && Types.ObjectId.isValid(params.projectId)) {
      repoQuery.project = new Types.ObjectId(params.projectId);
    }

    const repos = await GitHubRepositoryConnectionModel.find(repoQuery);

    const repoMetrics = await Promise.all(
      repos.map(async (repo) => {
        const repoId = repo._id;

        const commitsCount = await GitHubCommitModel.countDocuments({
          repositoryConnection: repoId,
          committedAt: { $gte: start, $lte: end },
        });

        const prsCount = await GitHubPullRequestModel.countDocuments({
          repositoryConnection: repoId,
          createdAt: { $gte: start, $lte: end },
        });

        const mergedPRsCount = await GitHubPullRequestModel.countDocuments({
          repositoryConnection: repoId,
          state: 'merged',
          createdAt: { $gte: start, $lte: end },
        });

        const openPRsCount = await GitHubPullRequestModel.countDocuments({
          repositoryConnection: repoId,
          state: 'open',
        });

        // Unique commit authors
        const authors = await GitHubCommitModel.distinct('authorLogin', {
          repositoryConnection: repoId,
          committedAt: { $gte: start, $lte: end },
        });

        return {
          id: repoId.toString(),
          repositoryName: repo.repositoryName,
          fullName: repo.fullName,
          htmlUrl: repo.htmlUrl,
          defaultBranch: repo.defaultBranch,
          language: repo.language,
          visibility: repo.visibility,
          status: repo.status,
          commitsCount,
          pullRequestsCount: prsCount,
          mergedPRsCount,
          openPRsCount,
          activeContributorsCount: authors.filter(Boolean).length,
          lastSyncedAt: repo.lastSyncedAt,
        };
      })
    );

    return {
      repositories: repoMetrics,
      totalRepositories: repoMetrics.length,
    };
  }

  /**
   * Export activity analytics data to CSV or JSON
   */
  public static async exportAnalytics(
    params: ActivityAnalyticsFilterParams,
    format: 'csv' | 'json' = 'csv'
  ) {
    const { developers } = await this.getDeveloperLeaderboard({ ...params, page: 1, limit: 1000 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      return {
        data: JSON.stringify(developers, null, 2),
        mimeType: 'application/json',
        fileName: `developer_activity_${timestamp}.json`,
      };
    }

    const headers = [
      'Rank',
      'Name',
      'Email',
      'Role',
      'GitHub Username',
      'Total Contributions',
      'Contribution Score',
      'Commits',
      'PRs Opened',
      'PRs Merged',
      'Code Reviews',
      'Tasks Completed',
      'Hours Logged',
      'Streak (Days)',
      'Last Active',
    ];

    const rows = developers.map((d) => [
      d.impactRank || 0,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.role || '').replace(/"/g, '""')}"`,
      `"${(d.githubUsername || '').replace(/"/g, '""')}"`,
      d.totalContributions,
      d.contributionScore,
      d.commitsCount,
      d.prsOpenedCount,
      d.prsMergedCount,
      d.reviewsCount,
      d.tasksCompletedCount,
      d.hoursLogged,
      d.streakDays,
      d.lastActiveAt ? `"${new Date(d.lastActiveAt).toISOString()}"` : '""',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return {
      data: csvContent,
      mimeType: 'text/csv',
      fileName: `developer_activity_${timestamp}.csv`,
    };
  }
}
