import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import { CreatePositionDto, QueryPositionDto, UpdatePositionDto } from './dto';
import { APP_PERMISSION_KEYS, APP_PERMISSIONS } from './permissions.constants';

const POSITION_SELECT = {
  id: true,
  name: true,
  code: true,
  description: true,
  role: true,
  permissions: true,
  isSystem: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: { select: { users: true } },
} satisfies Prisma.PositionSelect;

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  getPermissions() {
    return APP_PERMISSIONS;
  }

  async findOptions() {
    return this.prisma.position.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, code: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(query: QueryPositionDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.PositionWhereInput = { deletedAt: null };

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
      this.prisma.position.findMany({
        where,
        select: POSITION_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.position.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      select: POSITION_SELECT,
    });

    if (!position) {
      throw new NotFoundException('Khong tim thay chuc vu');
    }

    return position;
  }

  async create(dto: CreatePositionDto) {
    this.ensureValidPermissions(dto.permissions || []);
    await this.ensureCodeIsAvailable(dto.code);

    return this.prisma.position.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description || null,
        role: dto.role || Role.STAFF,
        permissions: dto.permissions || [],
        isActive: dto.isActive ?? true,
      },
      select: POSITION_SELECT,
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
    });

    if (!position) {
      throw new NotFoundException('Khong tim thay chuc vu');
    }

    if (dto.permissions) {
      this.ensureValidPermissions(dto.permissions);
    }

    if (dto.code && dto.code.toUpperCase() !== position.code) {
      await this.ensureCodeIsAvailable(dto.code, id);
    }

    return this.prisma.position.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
        ...(dto.description !== undefined && { description: dto.description || null }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.permissions !== undefined && { permissions: dto.permissions }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: POSITION_SELECT,
    });
  }

  async remove(id: string) {
    const position = await this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { users: true } } },
    });

    if (!position) {
      throw new NotFoundException('Khong tim thay chuc vu');
    }

    if (position.isSystem) {
      throw new BadRequestException('Khong the xoa chuc vu he thong');
    }

    if (position._count.users > 0) {
      throw new BadRequestException('Khong the xoa chuc vu dang duoc gan cho nhan vien');
    }

    await this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Xoa chuc vu thanh cong' };
  }

  private ensureValidPermissions(permissions: string[]) {
    const validPermissions = new Set<string>(APP_PERMISSION_KEYS);
    const invalidPermissions = permissions.filter(
      (permission) => !validPermissions.has(permission),
    );

    if (invalidPermissions.length > 0) {
      throw new BadRequestException(
        `Quyen khong hop le: ${invalidPermissions.join(', ')}`,
      );
    }
  }

  private async ensureCodeIsAvailable(code: string, currentPositionId?: string) {
    const existing = await this.prisma.position.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, deletedAt: true },
    });

    if (existing && existing.id !== currentPositionId) {
      throw new ConflictException(
        existing.deletedAt
          ? 'Ma chuc vu da duoc su dung boi chuc vu da xoa'
          : 'Ma chuc vu da ton tai',
      );
    }
  }
}
