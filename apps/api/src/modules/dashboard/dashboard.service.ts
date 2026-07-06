import { Injectable } from '@nestjs/common';
import { AssignmentStatus, Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import type {
  DashboardAlertDto,
  DashboardModuleDto,
  DashboardOverviewDto,
  DashboardRecentTaskDto,
  DashboardStatusDto,
} from '@fieldapp/shared';

const RECENT_TASK_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  scheduledDate: true,
  createdAt: true,
  branch: { select: { name: true } },
  assignments: {
    take: 1,
    orderBy: { createdAt: 'desc' },
    select: { assignee: { select: { name: true } } },
  },
} satisfies Prisma.TaskSelect;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(): Promise<DashboardOverviewDto> {
    const weekStart = this.getStartOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [
      totalEmployees,
      activeEmployees,
      totalBranches,
      activeBranches,
      totalOutlets,
      activeOutlets,
      totalTasks,
      tasksThisWeek,
      taskStatusGroups,
      recentTasks,
      totalSurveys,
      activeSurveys,
      pendingReports,
      unassignedTasks,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.branch.count({ where: { deletedAt: null } }),
      this.prisma.branch.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.outlet.count({ where: { deletedAt: null } }),
      this.prisma.outlet.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.task.count({ where: { deletedAt: null } }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          OR: [
            { scheduledDate: { gte: weekStart, lt: weekEnd } },
            { scheduledDate: null, createdAt: { gte: weekStart, lt: weekEnd } },
          ],
        },
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.task.findMany({
        where: { deletedAt: null },
        select: RECENT_TASK_SELECT,
        orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
      this.prisma.survey.count(),
      this.prisma.survey.count({ where: { status: 'ACTIVE' } }),
      this.prisma.report.count({ where: { reviewedAt: null } }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          status: { in: [TaskStatus.DRAFT, TaskStatus.ASSIGNED] },
          assignments: { none: {} },
        },
      }),
    ]);

    return {
      summary: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: totalEmployees - activeEmployees,
        },
        branches: {
          total: totalBranches,
          active: activeBranches,
        },
        outlets: {
          total: totalOutlets,
          active: activeOutlets,
        },
        tasks: {
          total: totalTasks,
          thisWeek: tasksThisWeek,
        },
        surveys: {
          total: totalSurveys,
          active: activeSurveys,
        },
      },
      taskStatuses: this.buildTaskStatuses(taskStatusGroups, totalTasks),
      recentTasks: recentTasks.map(this.mapRecentTask),
      alerts: this.buildAlerts(pendingReports, unassignedTasks),
      modules: this.buildModules({
        employees: totalEmployees,
        branches: totalBranches,
        outlets: totalOutlets,
        surveys: totalSurveys,
      }),
    };
  }

  private getStartOfWeek(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    return result;
  }

  private buildTaskStatuses(
    groups: Array<{ status: TaskStatus; _count: { _all: number } }>,
    total: number,
  ): DashboardStatusDto[] {
    const countMap = new Map(groups.map((item) => [item.status, item._count._all]));

    return Object.values(TaskStatus).map((status) => {
      const count = countMap.get(status) || 0;
      return {
        status,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  }

  private mapRecentTask(task: Prisma.TaskGetPayload<{ select: typeof RECENT_TASK_SELECT }>): DashboardRecentTaskDto {
    return {
      id: task.id,
      title: task.title,
      type: task.type,
      branch: task.branch.name,
      assignee: task.assignments[0]?.assignee.name || null,
      status: task.status,
      dueDate: (task.scheduledDate || task.createdAt).toISOString(),
    };
  }

  private buildAlerts(
    pendingReports: number,
    unassignedTasks: number,
  ): DashboardAlertDto[] {
    return [
      {
        key: 'pending-reports',
        title: `${pendingReports} pending reports`,
        description: 'Review photos, notes, and completion results before approval.',
        count: pendingReports,
        severity: pendingReports > 0 ? 'warning' : 'success',
      },
      {
        key: 'unassigned-tasks',
        title: `${unassignedTasks} tasks without assignees`,
        description: 'Tasks without assignments need a Team Leader or Staff owner.',
        count: unassignedTasks,
        severity: unassignedTasks > 0 ? 'warning' : 'success',
      },
    ];
  }

  private buildModules(counts: {
    employees: number;
    branches: number;
    outlets: number;
    surveys: number;
  }): DashboardModuleDto[] {
    return [
      { key: 'employees', label: 'Employees', href: '/employees', count: `${counts.employees} profiles` },
      { key: 'branches', label: 'Branches', href: '/branches', count: `${counts.branches} branches` },
      { key: 'outlets', label: 'Outlets', href: '/outlets', count: `${counts.outlets} outlets` },
      { key: 'surveys', label: 'Surveys', href: '/surveys', count: `${counts.surveys} forms` },
      { key: 'settings', label: 'Settings', href: '/settings', count: 'Regions, roles, statuses' },
    ];
  }
}
