import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, AssignmentStatus, TaskType } from '@prisma/client';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import {
  QueryMyTasksDto,
  UpdateAssignmentStatusDto,
  CreateReportDto,
  CheckInDto,
  NearbyOutletsDto,
  DeviceTokenDto,
  SyncQueryDto,
} from './dto';

const MY_TASK_ASSIGNMENT_SELECT = {
  id: true,
  taskId: true,
  task: {
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      templateId: true,
      template: {
        select: {
          id: true,
          name: true,
          checklist: true,
          photoRequired: true,
          estimatedDuration: true,
        },
      },
      branchId: true,
      branch: { select: { id: true, name: true, code: true } },
      outletId: true,
      outlet: {
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      },
      scheduledDate: true,
      startTime: true,
      endTime: true,
    },
  },
  status: true,
  scheduledAt: true,
  startedAt: true,
  completedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskAssignmentSelect;

@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}

  // ==================== Tasks ====================

  async getMyTasks(userId: string, query: QueryMyTasksDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const taskFilter: Prisma.TaskWhereInput = { deletedAt: null };
    if (query.type) taskFilter.type = query.type as TaskType;
    if (query.search) {
      taskFilter.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { outlet: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const where: Prisma.TaskAssignmentWhereInput = {
      assigneeId: userId,
      task: taskFilter,
    };

    if (query.status) where.status = query.status as AssignmentStatus;

    if (query.dateFrom || query.dateTo) {
      const scheduledAt: Prisma.DateTimeFilter = {};
      if (query.dateFrom) scheduledAt.gte = this.toDayStart(query.dateFrom);
      if (query.dateTo) scheduledAt.lte = this.toDayEnd(query.dateTo);
      where.scheduledAt = scheduledAt;
    }

    const [data, total] = await Promise.all([
      this.prisma.taskAssignment.findMany({
        where,
        select: MY_TASK_ASSIGNMENT_SELECT,
        skip,
        take,
        orderBy: [{ scheduledAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.taskAssignment.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getMyTaskDetail(userId: string, taskId: string) {
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: { assigneeId: userId, taskId, task: { deletedAt: null } },
      select: MY_TASK_ASSIGNMENT_SELECT,
    });

    if (!assignment) {
      throw new NotFoundException('Khong tim thay cong viec');
    }

    const reports = await this.prisma.report.findMany({
      where: { taskId, submittedById: userId },
      select: {
        id: true,
        checklistData: true,
        photos: true,
        notes: true,
        rating: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { ...assignment, reports };
  }

  // ==================== Assignment Status ====================

  async updateAssignmentStatus(
    userId: string,
    assignmentId: string,
    dto: UpdateAssignmentStatusDto,
  ) {
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: { id: assignmentId, assigneeId: userId },
      include: { task: { include: { assignments: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Khong tim thay phan cong');
    }

    const updateData: Prisma.TaskAssignmentUpdateInput = {
      status: dto.status,
    };

    if (dto.status === AssignmentStatus.IN_PROGRESS) {
      updateData.startedAt = new Date();
    } else if (dto.status === AssignmentStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    if (dto.notes) {
      updateData.notes = dto.notes;
    }

    await this.prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    // Propagate status to parent Task
    const task = assignment.task;
    if (
      dto.status === AssignmentStatus.IN_PROGRESS &&
      task.status === 'ASSIGNED'
    ) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    if (dto.status === AssignmentStatus.COMPLETED) {
      const allCompleted = task.assignments.every(
        (a) =>
          a.status === AssignmentStatus.COMPLETED || a.id === assignmentId,
      );
      if (allCompleted) {
        await this.prisma.task.update({
          where: { id: task.id },
          data: { status: 'COMPLETED' },
        });
      }
    }

    return { message: 'Cap nhat trang thai thanh cong' };
  }

  // ==================== Reports ====================

  async createReport(userId: string, dto: CreateReportDto) {
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: { id: dto.assignmentId, assigneeId: userId, taskId: dto.taskId },
    });

    if (!assignment) {
      throw new NotFoundException('Khong tim thay phan cong');
    }

    const report = await this.prisma.report.create({
      data: {
        taskId: dto.taskId,
        assignmentId: dto.assignmentId,
        submittedById: userId,
        checklistData: dto.checklistData,
        photos: dto.photos,
        notes: dto.notes,
        rating: dto.rating,
      },
    });

    return report;
  }

  // ==================== Check-in ====================

  async checkIn(userId: string, dto: CheckInDto) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: dto.outletId, isActive: true, deletedAt: null },
    });

    if (!outlet) {
      throw new NotFoundException('Khong tim thay cua hang');
    }

    if (outlet.latitude == null || outlet.longitude == null) {
      throw new BadRequestException('Cua hang chua co toa do GPS');
    }

    const distance = this.haversineDistance(
      dto.latitude,
      dto.longitude,
      outlet.latitude,
      outlet.longitude,
    );

    const maxDistance = 200;
    if (distance > maxDistance) {
      throw new BadRequestException(
        `Ban dang o cach cua hang ${Math.round(distance)}m, vuot qua gioi han ${maxDistance}m`,
      );
    }

    if (dto.assignmentId) {
      const assignment = await this.prisma.taskAssignment.findFirst({
        where: { id: dto.assignmentId, assigneeId: userId },
      });
      if (!assignment) {
        throw new NotFoundException('Khong tim thay phan cong');
      }
    }

    const checkIn = await this.prisma.checkIn.create({
      data: {
        userId,
        outletId: dto.outletId,
        assignmentId: dto.assignmentId || null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photoUrl: dto.photoUrl || null,
        distance,
      },
      include: {
        outlet: { select: { id: true, name: true, address: true } },
      },
    });

    return checkIn;
  }

  async getCheckInHistory(
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.checkIn.findMany({
        where: { userId },
        include: {
          outlet: { select: { id: true, name: true, address: true } },
          assignment: {
            select: {
              id: true,
              task: { select: { id: true, title: true } },
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checkIn.count({ where: { userId } }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  // ==================== Nearby Outlets ====================

  async getNearbyOutlets(userId: string, dto: NearbyOutletsDto) {
    const radius = dto.radius || 5000;
    const latDelta = radius / 111000;
    const lonDelta =
      radius / (111000 * Math.cos((dto.latitude * Math.PI) / 180));

    const candidates = await this.prisma.outlet.findMany({
      where: {
        latitude: {
          not: null,
          gte: dto.latitude - latDelta,
          lte: dto.latitude + latDelta,
        },
        longitude: {
          not: null,
          gte: dto.longitude - lonDelta,
          lte: dto.longitude + lonDelta,
        },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        latitude: true,
        longitude: true,
        type: true,
        brand: true,
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    return candidates
      .map((outlet) => ({
        ...outlet,
        distance: this.haversineDistance(
          dto.latitude,
          dto.longitude,
          outlet.latitude!,
          outlet.longitude!,
        ),
      }))
      .filter((o) => o.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  // ==================== Device Token ====================

  async registerDeviceToken(userId: string, dto: DeviceTokenDto) {
    return this.prisma.deviceToken.upsert({
      where: {
        userId_token: { userId, token: dto.token },
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
      },
      update: {
        platform: dto.platform,
      },
    });
  }

  // ==================== Report Photos ====================

  async addPhotoToReport(userId: string, reportId: string, photoUrl: string) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, submittedById: userId },
    });

    if (!report) {
      throw new NotFoundException('Khong tim thay bao cao');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: { photos: { push: photoUrl } },
    });

    return { url: photoUrl };
  }

  // ==================== Sync ====================

  async getSyncData(userId: string, query: SyncQueryDto) {
    const lastSync = query.lastSyncTimestamp
      ? new Date(query.lastSyncTimestamp)
      : new Date(0);

    const [tasks, assignments, templates, outlets] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          assignments: { some: { assigneeId: userId } },
          updatedAt: { gte: lastSync },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          templateId: true,
          template: {
            select: {
              id: true,
              name: true,
              checklist: true,
              photoRequired: true,
              estimatedDuration: true,
            },
          },
          branchId: true,
          outletId: true,
          scheduledDate: true,
          startTime: true,
          endTime: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.taskAssignment.findMany({
        where: {
          assigneeId: userId,
          updatedAt: { gte: lastSync },
        },
        select: {
          id: true,
          taskId: true,
          status: true,
          scheduledAt: true,
          startedAt: true,
          completedAt: true,
          notes: true,
          outletId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.taskTemplate.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          updatedAt: { gte: lastSync },
        },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          checklist: true,
          photoRequired: true,
          estimatedDuration: true,
        },
      }),
      this.prisma.outlet.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          updatedAt: { gte: lastSync },
        },
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          latitude: true,
          longitude: true,
          branchId: true,
        },
      }),
    ]);

    return {
      tasks,
      assignments,
      templates,
      outlets,
      serverTimestamp: new Date().toISOString(),
    };
  }

  // ==================== Utilities ====================

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toDayStart(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00`);
  }

  private toDayEnd(value: string) {
    return new Date(`${value.slice(0, 10)}T23:59:59.999`);
  }
}
