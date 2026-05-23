import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BulkAssignTaskDto, Weekday } from './dto';

interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
  type: 'REGULAR' | 'DEVICE_CHECK' | 'SURVEY' | 'PROMOTION';
  estimatedDuration: number | null;
}

interface GroupRecord {
  id: string;
  templates: Array<{
    sortOrder: number;
    template: TemplateRecord & { isActive: boolean };
  }>;
}

interface CreatedTask {
  id: string;
  title: string;
  templateId: string | null;
  outletId?: string | null;
  scheduledDate: Date | null;
  assignments: Array<{ id: string; assigneeId: string; outletId?: string | null; scheduledAt: Date }>;
}

interface TaskDelegate {
  create(args: unknown): Promise<CreatedTask>;
}

const WEEKDAY_INDEX: Record<Weekday, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

@Injectable()
export class TaskAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async bulkAssign(dto: BulkAssignTaskDto, userId: string) {
    if (!dto.templateIds?.length && !dto.taskGroupIds?.length) {
      throw new BadRequestException('Phai chon it nhat mot mau cong viec hoac nhom cong viec');
    }

    await this.ensureBranchExists(dto.branchId);
    await this.ensureEmployeesExist(dto.employeeIds);
    await this.ensureOutletsBelongToBranch(dto.branchId, dto.outletIds);

    const templates = await this.resolveTemplates(dto.templateIds || [], dto.taskGroupIds || []);
    const scheduledDates = this.resolveScheduledDates(dto);
    const totalAssignments = templates.length * dto.outletIds.length * dto.employeeIds.length * scheduledDates.length;

    if (totalAssignments > 5000) {
      throw new BadRequestException('So phan cong vuot qua gioi han 5000. Hay thu hep nhan vien, outlet, mau cong viec hoac khoang ngay.');
    }

    const titlePrefix = dto.titlePrefix?.trim();

    const result = await this.prisma.$transaction(async (tx) => {
      const taskDelegate = (tx as unknown as { task: TaskDelegate }).task;
      const tasks: CreatedTask[] = [];

      for (const scheduledAt of scheduledDates) {
        for (const outletId of dto.outletIds) {
          for (const template of templates) {
            const task = await taskDelegate.create({
              data: {
                title: titlePrefix ? `${titlePrefix} - ${template.name}` : template.name,
                description: template.description,
                type: template.type,
                status: 'ASSIGNED',
                templateId: template.id,
                branchId: dto.branchId,
                outletId,
                scheduledDate: scheduledAt,
                startTime: scheduledAt,
                endTime: this.resolveEndTime(scheduledAt, template.estimatedDuration),
                createdById: userId,
                assignments: {
                  create: dto.employeeIds.map((assigneeId) => ({
                    assigneeId,
                    branchId: dto.branchId,
                    outletId,
                    scheduledAt,
                  })),
                },
              },
              select: {
                id: true,
                title: true,
                templateId: true,
                outletId: true,
                scheduledDate: true,
                assignments: {
                  select: {
                    id: true,
                    assigneeId: true,
                    outletId: true,
                    scheduledAt: true,
                  },
                },
              },
            });

            tasks.push(task);
          }
        }
      }

      return tasks;
    });

    return {
      taskCount: result.length,
      assignmentCount: totalAssignments,
      dateCount: scheduledDates.length,
      outletCount: dto.outletIds.length,
      employeeCount: dto.employeeIds.length,
      templateCount: templates.length,
      tasks: result,
    };
  }

  private async resolveTemplates(templateIds: string[], taskGroupIds: string[]) {
    const directTemplates = templateIds.length
      ? await this.prisma.taskTemplate.findMany({
          where: { id: { in: templateIds }, deletedAt: null, isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            estimatedDuration: true,
          },
        })
      : [];

    if (directTemplates.length !== templateIds.length) {
      throw new BadRequestException('Mot hoac nhieu mau cong viec khong ton tai hoac da ngung hoat dong');
    }

    const groups = taskGroupIds.length
      ? await this.prisma.taskGroup.findMany({
          where: { id: { in: taskGroupIds }, deletedAt: null, isActive: true },
          select: {
            id: true,
            templates: {
              orderBy: { sortOrder: 'asc' },
              select: {
                sortOrder: true,
                template: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    estimatedDuration: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        })
      : [];

    if (groups.length !== taskGroupIds.length) {
      throw new BadRequestException('Mot hoac nhieu nhom cong viec khong ton tai hoac da ngung hoat dong');
    }

    const byId = new Map<string, TemplateRecord>();

    for (const template of directTemplates) {
      byId.set(template.id, template);
    }

    for (const group of groups as GroupRecord[]) {
      for (const item of group.templates) {
        if (item.template.isActive) {
          const { isActive: _isActive, ...template } = item.template;
          byId.set(template.id, template);
        }
      }
    }

    if (!byId.size) {
      throw new BadRequestException('Khong co mau cong viec hoat dong de phan cong');
    }

    return Array.from(byId.values());
  }

  private resolveScheduledDates(dto: BulkAssignTaskDto) {
    const time = dto.startTime || '08:00';
    const start = this.toDateAtTime(dto.startDate, time);
    const end = dto.endDate ? this.toDateAtTime(dto.endDate, time) : start;

    if (end < start) {
      throw new BadRequestException('Ngay ket thuc phai lon hon hoac bang ngay bat dau');
    }

    if (dto.scheduleMode === 'SINGLE') {
      return [start];
    }

    const dates: Date[] = [];
    const allowedWeekdays = dto.scheduleMode === 'WEEKLY'
      ? new Set((dto.weekdays || []).map((weekday) => WEEKDAY_INDEX[weekday]))
      : null;

    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (!allowedWeekdays || allowedWeekdays.has(cursor.getDay())) {
        dates.push(new Date(cursor));
      }
    }

    if (!dates.length) {
      throw new BadRequestException('Khong co ngay phu hop voi lich da chon');
    }

    return dates;
  }

  private toDateAtTime(date: string, time: string) {
    const normalizedDate = date.slice(0, 10);
    return new Date(`${normalizedDate}T${time}:00`);
  }

  private resolveEndTime(start: Date, estimatedDuration: number | null) {
    if (!estimatedDuration) return null;
    return new Date(start.getTime() + estimatedDuration * 60 * 1000);
  }

  private async ensureBranchExists(branchId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (!branch) {
      throw new BadRequestException('Chi nhanh khong ton tai hoac da ngung hoat dong');
    }
  }

  private async ensureEmployeesExist(employeeIds: string[]) {
    const employees = await this.prisma.user.findMany({
      where: { id: { in: employeeIds }, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (employees.length !== employeeIds.length) {
      throw new BadRequestException('Mot hoac nhieu nhan vien khong ton tai hoac da ngung hoat dong');
    }
  }

  private async ensureOutletsBelongToBranch(branchId: string, outletIds: string[]) {
    const outlets = await this.prisma.outlet.findMany({
      where: { id: { in: outletIds }, branchId, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (outlets.length !== outletIds.length) {
      throw new BadRequestException('Mot hoac nhieu outlet khong thuoc chi nhanh da chon hoac da ngung hoat dong');
    }
  }
}
