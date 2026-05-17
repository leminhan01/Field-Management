import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import { AssignTaskGroupDto, CreateTaskGroupDto, QueryTaskGroupDto, UpdateTaskGroupDto } from './dto';

const TASK_GROUP_SELECT = {
  id: true,
  name: true,
  code: true,
  description: true,
  isActive: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
  templates: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      sortOrder: true,
      template: {
        select: {
          id: true,
          name: true,
          type: true,
          checklist: true,
          photoRequired: true,
          estimatedDuration: true,
          isActive: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

interface TaskGroupDelegate {
  findMany(args: unknown): Promise<unknown[]>;
  count(args: unknown): Promise<number>;
  findFirst(args: unknown): Promise<TaskGroupRecord | null>;
  findUnique(args: unknown): Promise<Pick<TaskGroupRecord, 'id' | 'deletedAt'> | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
}

interface TaskGroupTemplateDelegate {
  deleteMany(args: unknown): Promise<unknown>;
  createMany(args: unknown): Promise<unknown>;
}

interface TaskGroupRecord {
  id: string;
  code: string;
  deletedAt: Date | null;
  templates?: Array<{
    template: {
      id: string;
      name: string;
      description?: string | null;
      type: 'REGULAR' | 'DEVICE_CHECK' | 'SURVEY' | 'PROMOTION';
      estimatedDuration?: number | null;
      isActive: boolean;
    };
  }>;
}

interface Delegates {
  taskGroup: TaskGroupDelegate;
  taskGroupTemplate: TaskGroupTemplateDelegate;
}

@Injectable()
export class TaskGroupsService {
  constructor(private prisma: PrismaService) {}

  private get db(): Delegates {
    return this.prisma as unknown as Delegates;
  }

  async findAll(query: QueryTaskGroupDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Record<string, unknown> = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.db.taskGroup.findMany({
        where,
        select: TASK_GROUP_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.taskGroup.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const group = await this.db.taskGroup.findFirst({
      where: { id, deletedAt: null },
      select: TASK_GROUP_SELECT,
    });

    if (!group) {
      throw new NotFoundException('Khong tim thay nhom cong viec');
    }

    return group;
  }

  async create(dto: CreateTaskGroupDto, userId: string) {
    await this.ensureCodeIsAvailable(dto.code);
    await this.ensureTemplatesExist(dto.templateIds);

    return this.db.taskGroup.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description || null,
        createdById: userId,
        templates: {
          create: dto.templateIds.map((templateId, index) => ({
            templateId,
            sortOrder: index,
          })),
        },
      },
      select: TASK_GROUP_SELECT,
    });
  }

  async update(id: string, dto: UpdateTaskGroupDto) {
    const group = await this.db.taskGroup.findFirst({
      where: { id, deletedAt: null },
    });

    if (!group) {
      throw new NotFoundException('Khong tim thay nhom cong viec');
    }

    if (dto.code && dto.code.toUpperCase() !== group.code) {
      await this.ensureCodeIsAvailable(dto.code, id);
    }

    if (dto.templateIds !== undefined) {
      await this.ensureTemplatesExist(dto.templateIds);
    }

    await this.prisma.$transaction(async (tx) => {
      const db = tx as unknown as Delegates;

      await db.taskGroup.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
          ...(dto.description !== undefined && { description: dto.description || null }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });

      if (dto.templateIds !== undefined) {
        await db.taskGroupTemplate.deleteMany({ where: { groupId: id } });
        if (dto.templateIds.length) {
          await db.taskGroupTemplate.createMany({
            data: dto.templateIds.map((templateId, index) => ({
              groupId: id,
              templateId,
              sortOrder: index,
            })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  async assign(id: string, dto: AssignTaskGroupDto, userId: string) {
    const group = await this.db.taskGroup.findFirst({
      where: { id, deletedAt: null, isActive: true },
      select: {
        id: true,
        name: true,
        templates: {
          orderBy: { sortOrder: 'asc' },
          select: {
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
    }) as TaskGroupRecord | null;

    if (!group) {
      throw new NotFoundException('Khong tim thay nhom cong viec');
    }

    const activeTemplates = group.templates?.map((item) => item.template).filter((template) => template.isActive) || [];
    if (!activeTemplates.length) {
      throw new BadRequestException('Nhom cong viec chua co mau cong viec hoat dong');
    }

    await this.ensureAssigneeExists(dto.assigneeId);
    await this.ensureBranchExists(dto.branchId);

    const scheduledAt = new Date(dto.scheduledAt);

    return this.prisma.$transaction(async (tx) => {
      const created = [];

      for (const template of activeTemplates) {
        const task = await tx.task.create({
          data: {
            title: dto.titlePrefix ? `${dto.titlePrefix} - ${template.name}` : template.name,
            description: template.description || null,
            type: template.type,
            templateId: template.id,
            branchId: dto.branchId,
            scheduledDate: scheduledAt,
            createdById: userId,
            assignments: {
              create: {
                assigneeId: dto.assigneeId,
                branchId: dto.branchId,
                scheduledAt,
              },
            },
          },
          select: { id: true, title: true, templateId: true },
        });
        created.push(task);
      }

      return { groupId: id, assignedTasks: created };
    });
  }

  async remove(id: string) {
    const group = await this.db.taskGroup.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException('Khong tim thay nhom cong viec');
    }

    await this.db.taskGroup.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Xoa nhom cong viec thanh cong' };
  }

  private async ensureCodeIsAvailable(code: string, currentGroupId?: string) {
    const existing = await this.db.taskGroup.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, deletedAt: true },
    });

    if (existing && existing.id !== currentGroupId) {
      throw new ConflictException(existing.deletedAt ? 'Ma nhom da duoc su dung boi nhom da xoa' : 'Ma nhom da ton tai');
    }
  }

  private async ensureTemplatesExist(templateIds: string[]) {
    if (!templateIds.length) {
      throw new BadRequestException('Nhom cong viec phai co it nhat mot mau cong viec');
    }

    const templates = await this.prisma.taskTemplate.findMany({
      where: { id: { in: templateIds }, deletedAt: null },
      select: { id: true },
    });

    if (templates.length !== templateIds.length) {
      throw new BadRequestException('Mot hoac nhieu mau cong viec khong ton tai');
    }
  }

  private async ensureAssigneeExists(assigneeId: string) {
    const assignee = await this.prisma.user.findFirst({
      where: { id: assigneeId, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (!assignee) {
      throw new BadRequestException('Nhan vien khong ton tai hoac da ngung hoat dong');
    }
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
}
