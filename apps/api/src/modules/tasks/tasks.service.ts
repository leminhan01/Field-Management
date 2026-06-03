import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import { QueryTaskDto } from './dto';

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  status: true,
  templateId: true,
  template: { select: { id: true, name: true, photoRequired: true, estimatedDuration: true } },
  branchId: true,
  branch: { select: { id: true, name: true, code: true } },
  outletId: true,
  outlet: { select: { id: true, name: true, code: true } },
  deviceId: true,
  device: { select: { id: true, name: true, type: true, serial: true } },
  scheduledDate: true,
  startTime: true,
  endTime: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  assignments: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      assigneeId: true,
      assignee: { select: { id: true, name: true, email: true, role: true } },
      branchId: true,
      outletId: true,
      outlet: { select: { id: true, name: true, code: true } },
      status: true,
      scheduledAt: true,
      startedAt: true,
      completedAt: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: { select: { assignments: true, reports: true } },
} satisfies Prisma.TaskSelect;

const TASK_DETAIL_SELECT = {
  ...TASK_SELECT,
  reports: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      taskId: true,
      assignmentId: true,
      submittedById: true,
      submittedBy: { select: { id: true, name: true, email: true } },
      checklistData: true,
      photos: true,
      notes: true,
      rating: true,
      reviewedById: true,
      reviewedBy: { select: { id: true, name: true, email: true } },
      reviewedAt: true,
      reviewNotes: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.TaskSelect;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTaskDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.TaskWhereInput = {
      ...(query.includeDeleted !== 'true' && { deletedAt: null }),
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { branch: { name: { contains: query.search, mode: 'insensitive' } } },
        { outlet: { name: { contains: query.search, mode: 'insensitive' } } },
        { assignments: { some: { assignee: { name: { contains: query.search, mode: 'insensitive' } } } } },
      ];
    }

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.branchId) where.branchId = query.branchId;
    if (query.outletId) where.outletId = query.outletId;
    if (query.assigneeId) where.assignments = { some: { assigneeId: query.assigneeId } };

    if (query.dateFrom || query.dateTo) {
      const range: Prisma.DateTimeNullableFilter = {};
      if (query.dateFrom) range.gte = this.toDayStart(query.dateFrom);
      if (query.dateTo) range.lte = this.toDayEnd(query.dateTo);
      where.scheduledDate = range;
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        select: TASK_SELECT,
        skip,
        take,
        orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: TASK_DETAIL_SELECT,
    });

    if (!task) {
      throw new NotFoundException('Khong tim thay cong viec');
    }

    return task;
  }

  async remove(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, _count: { select: { reports: true } } },
    });

    if (!task) {
      throw new NotFoundException('Khong tim thay cong viec');
    }

    if (task._count.reports > 0) {
      throw new BadRequestException('Khong the xoa cong viec da co bao cao');
    }

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'REJECTED' },
    });

    return { message: 'Xoa cong viec thanh cong' };
  }

  private toDayStart(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00`);
  }

  private toDayEnd(value: string) {
    return new Date(`${value.slice(0, 10)}T23:59:59.999`);
  }
}
