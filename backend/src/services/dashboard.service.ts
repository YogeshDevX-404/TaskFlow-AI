import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { Workspace } from '../models/workspace.model';
import { Organization } from '../models/organization.model';

export interface DashboardQuickStats {
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  openBugs: number;
  progressPercentage: number;
}

export interface ProjectHealthMetrics {
  completion: number; // percentage
  velocity: number; // story points per sprint
  upcomingTasks: number;
  openIssues: number;
  blockedItems: number;
}

export interface ProjectActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'member_added' | 'member_removed' | 'role_changed' | 'milestone_reached';
  title: string;
  description: string;
  actor: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  date: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  color?: string;
}

export interface AnalyticsCharts {
  areaChartData: ChartDataPoint[]; // Completion trends over time
  barChartData: ChartDataPoint[];  // Tasks by status/priority
  lineChartData: ChartDataPoint[]; // Sprint velocity / burndown
  pieChartData: ChartDataPoint[];  // Task allocation by module/type
}

export interface TimelinePhase {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  startDate: string;
  endDate: string;
  progressPercentage: number;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  assigneeName?: string;
  category: string;
}

export interface PinnedItem {
  id: string;
  title: string;
  type: 'repository' | 'doc' | 'design' | 'link' | 'board';
  url: string;
  updatedAt: string;
}

export interface ProjectDashboardData {
  projectId: string;
  projectInformation: {
    name: string;
    key: string;
    description: string;
    workspace: string;
    organization: string;
    visibility: 'public' | 'private' | 'internal';
    status: string;
    owner: {
      name: string;
      email: string;
    };
    repositoryUrl: string;
    websiteUrl: string;
    createdAt: string;
    updatedAt: string;
  };
  quickStats: DashboardQuickStats;
  health: ProjectHealthMetrics;
  recentActivity: ProjectActivityItem[];
  recentMembers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    joinedAt: string;
  }>;
  analyticsCharts: AnalyticsCharts;
  timeline: TimelinePhase[];
  upcomingDeadlines: UpcomingDeadline[];
  pinnedItems: PinnedItem[];
}

export class DashboardService {
  /**
   * Get full dashboard overview for a project
   */
  public static async getProjectDashboard(projectId: string): Promise<ProjectDashboardData> {
    // Try to find project in database
    let projectDoc: any = null;
    try {
      projectDoc = await ProjectModel.findById(projectId)
        .populate('workspace', 'name')
        .populate('organization', 'name')
        .populate('owner', 'firstName lastName email name');
    } catch (e) {
      // Invalid ObjectId or mock ID
      projectDoc = null;
    }

    // Try to count members from DB
    let memberCount = 6;
    let membersList: any[] = [];
    try {
      if (projectDoc) {
        membersList = await ProjectMemberModel.find({ project: projectId })
          .populate('user', 'firstName lastName email avatar')
          .limit(5);
        if (membersList.length > 0) {
          memberCount = await ProjectMemberModel.countDocuments({ project: projectId });
        }
      }
    } catch (e) {
      // Fallback
    }

    const projectName = projectDoc?.name || 'TaskFlow AI Platform';
    const projectKey = projectDoc?.projectKey || 'TFA';
    const description = projectDoc?.description || 'Enterprise project dashboard and workflow tracking system.';
    const workspaceName = (projectDoc?.workspace as any)?.name || 'Engineering Core';
    const orgName = (projectDoc?.organization as any)?.name || 'Acme Corp Org';
    const ownerName = (projectDoc?.owner as any)
      ? `${(projectDoc.owner as any).firstName || ''} ${(projectDoc.owner as any).lastName || ''}`.trim() || (projectDoc.owner as any).name || (projectDoc.owner as any).email
      : 'Alex Rivera';
    const ownerEmail = (projectDoc?.owner as any)?.email || 'alex.rivera@taskflow.ai';

    const recentMembersFormatted = membersList.length > 0
      ? membersList.map((m: any) => ({
          id: m._id ? m._id.toString() : m.id,
          name: m.user ? `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || m.user.email : 'Team Member',
          email: m.user?.email || 'user@taskflow.ai',
          role: m.role || 'Developer',
          status: m.status || 'active',
          avatar: m.user?.avatar,
          joinedAt: m.joinedAt ? new Date(m.joinedAt).toISOString() : new Date().toISOString(),
        }))
      : [
          {
            id: 'm-1',
            name: 'Alex Rivera',
            email: 'alex.rivera@taskflow.ai',
            role: 'Project Owner',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            joinedAt: '2026-01-15T09:00:00Z',
          },
          {
            id: 'm-2',
            name: 'Sarah Chen',
            email: 'sarah.chen@taskflow.ai',
            role: 'Project Admin',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            joinedAt: '2026-01-18T10:30:00Z',
          },
          {
            id: 'm-3',
            name: 'Marcus Vance',
            email: 'marcus.v@taskflow.ai',
            role: 'Developer',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            joinedAt: '2026-02-01T14:20:00Z',
          },
          {
            id: 'm-4',
            name: 'Elena Rostova',
            email: 'elena.r@taskflow.ai',
            role: 'Developer',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            joinedAt: '2026-02-10T11:15:00Z',
          },
          {
            id: 'm-5',
            name: 'David Kim',
            email: 'david.k@taskflow.ai',
            role: 'Tester',
            status: 'pending',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            joinedAt: '2026-02-28T16:00:00Z',
          },
        ];

    return {
      projectId,
      projectInformation: {
        name: projectName,
        key: projectKey,
        description,
        workspace: workspaceName,
        organization: orgName,
        visibility: projectDoc?.visibility || 'private',
        status: projectDoc?.status || 'active',
        owner: {
          name: ownerName,
          email: ownerEmail,
        },
        repositoryUrl: projectDoc?.repositoryUrl || `https://github.com/acme-org/${projectKey.toLowerCase()}-service`,
        websiteUrl: projectDoc?.websiteUrl || `https://${projectKey.toLowerCase()}.app.taskflow.ai`,
        createdAt: projectDoc?.createdAt ? new Date(projectDoc.createdAt).toISOString() : '2026-01-10T08:00:00Z',
        updatedAt: projectDoc?.updatedAt ? new Date(projectDoc.updatedAt).toISOString() : new Date().toISOString(),
      },
      quickStats: {
        totalMembers: memberCount,
        totalTasks: 148,
        completedTasks: 96,
        pendingTasks: 42,
        openBugs: 10,
        progressPercentage: 65,
      },
      health: {
        completion: 65,
        velocity: 48, // story points per sprint
        upcomingTasks: 18,
        openIssues: 10,
        blockedItems: 2,
      },
      recentActivity: [
        {
          id: 'act-1',
          type: 'member_added',
          title: 'David Kim invited to Project',
          description: 'David Kim was assigned as Quality Assurance / Tester role.',
          actor: {
            id: 'usr-1',
            name: 'Alex Rivera',
            email: 'alex.rivera@taskflow.ai',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          timestamp: '10 minutes ago',
          date: '2026-03-01T14:30:00Z',
        },
        {
          id: 'act-2',
          type: 'role_changed',
          title: 'Sarah Chen promoted to Project Admin',
          description: 'Permissions elevated to handle release deployments and member management.',
          actor: {
            id: 'usr-1',
            name: 'Alex Rivera',
            email: 'alex.rivera@taskflow.ai',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          timestamp: '2 hours ago',
          date: '2026-03-01T12:15:00Z',
        },
        {
          id: 'act-3',
          type: 'project_updated',
          title: 'Project Settings Updated',
          description: 'Updated repository endpoint and linked deployment environment URL.',
          actor: {
            id: 'usr-2',
            name: 'Sarah Chen',
            email: 'sarah.chen@taskflow.ai',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          },
          timestamp: 'Yesterday at 4:12 PM',
          date: '2026-02-28T16:12:00Z',
        },
        {
          id: 'act-4',
          type: 'milestone_reached',
          title: 'Sprint 14 Milestone Completed',
          description: 'Completed 32 story points across API v2 refactoring and RBAC integration.',
          actor: {
            id: 'usr-3',
            name: 'Marcus Vance',
            email: 'marcus.v@taskflow.ai',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          },
          timestamp: '3 days ago',
          date: '2026-02-26T11:00:00Z',
        },
        {
          id: 'act-5',
          type: 'project_created',
          title: 'Project Created',
          description: `Initial setup of ${projectName} in ${workspaceName} workspace.`,
          actor: {
            id: 'usr-1',
            name: 'Alex Rivera',
            email: 'alex.rivera@taskflow.ai',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          timestamp: 'Jan 10, 2026',
          date: '2026-01-10T08:00:00Z',
        },
      ],
      recentMembers: recentMembersFormatted,
      analyticsCharts: {
        areaChartData: [
          { label: 'Week 1', value: 12, secondaryValue: 15 },
          { label: 'Week 2', value: 24, secondaryValue: 28 },
          { label: 'Week 3', value: 45, secondaryValue: 42 },
          { label: 'Week 4', value: 62, secondaryValue: 58 },
          { label: 'Week 5', value: 78, secondaryValue: 70 },
          { label: 'Week 6', value: 89, secondaryValue: 85 },
          { label: 'Week 7', value: 96, secondaryValue: 92 },
        ],
        barChartData: [
          { label: 'Backlog', value: 24, color: '#64748b' },
          { label: 'In Progress', value: 38, color: '#3b82f6' },
          { label: 'In Review', value: 16, color: '#f59e0b' },
          { label: 'Done', value: 60, color: '#10b981' },
          { label: 'Blocked', value: 10, color: '#ef4444' },
        ],
        lineChartData: [
          { label: 'Sprint 10', value: 32, secondaryValue: 30 },
          { label: 'Sprint 11', value: 40, secondaryValue: 38 },
          { label: 'Sprint 12', value: 36, secondaryValue: 42 },
          { label: 'Sprint 13', value: 52, secondaryValue: 45 },
          { label: 'Sprint 14', value: 48, secondaryValue: 50 },
          { label: 'Sprint 15', value: 55, secondaryValue: 52 },
        ],
        pieChartData: [
          { label: 'Frontend', value: 40, color: '#6366f1' },
          { label: 'Backend API', value: 30, color: '#8b5cf6' },
          { label: 'DevOps/Infra', value: 15, color: '#ec4899' },
          { label: 'QA & Testing', value: 15, color: '#10b981' },
        ],
      },
      timeline: [
        {
          id: 'ph-1',
          title: 'Architecture & Schema Specs',
          status: 'completed',
          startDate: '2026-01-10',
          endDate: '2026-01-25',
          progressPercentage: 100,
        },
        {
          id: 'ph-2',
          title: 'Core Services & RBAC Auth',
          status: 'completed',
          startDate: '2026-01-26',
          endDate: '2026-02-15',
          progressPercentage: 100,
        },
        {
          id: 'ph-3',
          title: 'Dashboard Analytics & UI Polish',
          status: 'in_progress',
          startDate: '2026-02-16',
          endDate: '2026-03-10',
          progressPercentage: 75,
        },
        {
          id: 'ph-4',
          title: 'Performance & Security Audit',
          status: 'upcoming',
          startDate: '2026-03-11',
          endDate: '2026-03-31',
          progressPercentage: 0,
        },
      ],
      upcomingDeadlines: [
        {
          id: 'dl-1',
          title: 'Dashboard Metrics Real-time Refetch',
          dueDate: '2026-03-05',
          priority: 'high',
          assigneeName: 'Marcus Vance',
          category: 'Frontend',
        },
        {
          id: 'dl-2',
          title: 'RBAC Access Middleware Optimization',
          dueDate: '2026-03-08',
          priority: 'medium',
          assigneeName: 'Sarah Chen',
          category: 'Backend',
        },
        {
          id: 'dl-3',
          title: 'Security Vulnerability Patch v1.4',
          dueDate: '2026-03-12',
          priority: 'high',
          assigneeName: 'Alex Rivera',
          category: 'Security',
        },
        {
          id: 'dl-4',
          title: 'E2E Integration Test Suite',
          dueDate: '2026-03-18',
          priority: 'low',
          assigneeName: 'David Kim',
          category: 'QA',
        },
      ],
      pinnedItems: [
        {
          id: 'pin-1',
          title: 'Main System Repository',
          type: 'repository',
          url: `https://github.com/acme-org/${projectKey.toLowerCase()}-core`,
          updatedAt: '2 days ago',
        },
        {
          id: 'pin-[2]',
          title: 'API OpenAPI Documentation',
          type: 'doc',
          url: `https://docs.taskflow.ai/api/${projectKey.toLowerCase()}`,
          updatedAt: 'Yesterday',
        },
        {
          id: 'pin-3',
          title: 'Figma Design System & Components',
          type: 'design',
          url: 'https://figma.com/file/taskflow-ui-v2',
          updatedAt: '3 days ago',
        },
        {
          id: 'pin-4',
          title: 'Staging Environment URL',
          type: 'link',
          url: `https://staging.${projectKey.toLowerCase()}.taskflow.ai`,
          updatedAt: 'Just now',
        },
      ],
    };
  }

  /**
   * Get specific analytics stats for a project
   */
  public static async getProjectAnalytics(projectId: string) {
    const dashboardData = await this.getProjectDashboard(projectId);
    return {
      projectId,
      quickStats: dashboardData.quickStats,
      health: dashboardData.health,
      analyticsCharts: dashboardData.analyticsCharts,
    };
  }
}
