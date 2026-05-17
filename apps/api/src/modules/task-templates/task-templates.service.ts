import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import { CreateTaskTemplateDto, QueryTaskTemplateDto, UpdateTaskTemplateDto } from './dto';

const TASK_TEMPLATE_SELECT = {
  id: true,
  name: true,
  description: true,
  type: true,
  checklist: true,
  photoRequired: true,
  estimatedDuration: true,
  isActive: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: { select: { tasks: true, groupItems: true } },
} satisfies Prisma.TaskTemplateSelect;

@Injectable()
export class TaskTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findOptions() {
    return this.prisma.taskTemplate.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, type: true, estimatedDuration: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(query: QueryTaskTemplateDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.TaskTemplateWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [data, total] = await Promise.all([
      this.prisma.taskTemplate.findMany({
        where,
        select: TASK_TEMPLATE_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.taskTemplate.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const template = await this.prisma.taskTemplate.findFirst({
      where: { id, deletedAt: null },
      select: TASK_TEMPLATE_SELECT,
    });

    if (!template) {
      throw new NotFoundException('Khong tim thay mau cong viec');
    }

    return template;
  }

  async create(dto: CreateTaskTemplateDto, userId: string) {
    this.ensureChecklist(dto.checklist);

    return this.prisma.taskTemplate.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        checklist: dto.checklist,
        photoRequired: dto.photoRequired || false,
        estimatedDuration: dto.estimatedDuration || null,
        createdById: userId,
      },
      select: TASK_TEMPLATE_SELECT,
    });
  }

  async update(id: string, dto: UpdateTaskTemplateDto) {
    const template = await this.prisma.taskTemplate.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!template) {
      throw new NotFoundException('Khong tim thay mau cong viec');
    }

    if (dto.checklist !== undefined) this.ensureChecklist(dto.checklist);

    return this.prisma.taskTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description || null }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.checklist !== undefined && { checklist: dto.checklist }),
        ...(dto.photoRequired !== undefined && { photoRequired: dto.photoRequired }),
        ...(dto.estimatedDuration !== undefined && { estimatedDuration: dto.estimatedDuration || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: TASK_TEMPLATE_SELECT,
    });
  }

  async remove(id: string) {
    const template = await this.prisma.taskTemplate.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { tasks: true, groupItems: true } } },
    });

    if (!template) {
      throw new NotFoundException('Khong tim thay mau cong viec');
    }

    if (template._count.tasks > 0 || template._count.groupItems > 0) {
      throw new BadRequestException('Khong the xoa mau dang duoc su dung trong cong viec hoac nhom cong viec');
    }

    await this.prisma.taskTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Xoa mau cong viec thanh cong' };
  }

  private ensureChecklist(checklist: string[]) {
    const validItems = checklist.map((item) => item.trim()).filter(Boolean);
    if (!validItems.length) {
      throw new BadRequestException('Checklist phai co it nhat mot hang muc');
    }
  }
}
