import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BranchType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { CreateBranchDto, QueryBranchDto, UpdateBranchDto } from './dto';

const BRANCH_SELECT = {
  id: true,
  name: true,
  code: true,
  address: true,
  type: true,
  regionId: true,
  region: { select: { id: true, name: true, code: true } },
  managerId: true,
  manager: { select: { id: true, name: true, email: true } },
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: { select: { employees: true, tasks: true } },
} satisfies Prisma.BranchSelect;

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findOptions() {
    return this.prisma.branch.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(query: QueryBranchDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.BranchWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { region: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.regionId) {
      where.regionId = query.regionId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        select: BRANCH_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      select: BRANCH_SELECT,
    });

    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }

    return branch;
  }

  async create(dto: CreateBranchDto) {
    await this.ensureCodeIsAvailable(dto.code);
    await this.ensureRegionExists(dto.regionId);
    await this.ensureManagerExists(dto.managerId);

    return this.prisma.branch.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        address: dto.address || null,
        type: dto.type || BranchType.OTHER,
        regionId: dto.regionId || null,
        managerId: dto.managerId || null,
      },
      select: BRANCH_SELECT,
    });
  }

  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
    });

    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }

    if (dto.code && dto.code.toUpperCase() !== branch.code) {
      await this.ensureCodeIsAvailable(dto.code, id);
    }

    await this.ensureRegionExists(dto.regionId);
    await this.ensureManagerExists(dto.managerId, id);

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
        ...(dto.address !== undefined && { address: dto.address || null }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.regionId !== undefined && { regionId: dto.regionId || null }),
        ...(dto.managerId !== undefined && { managerId: dto.managerId || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: BRANCH_SELECT,
    });
  }

  async remove(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { employees: true, tasks: true } } },
    });

    if (!branch) {
      throw new NotFoundException('Không tìm thấy chi nhánh');
    }

    if (branch._count.employees > 0 || branch._count.tasks > 0) {
      throw new BadRequestException('Không thể xóa chi nhánh đang có nhân viên hoặc công việc liên quan');
    }

    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Xóa chi nhánh thành công' };
  }

  private async ensureCodeIsAvailable(code: string, currentBranchId?: string) {
    const existing = await this.prisma.branch.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, deletedAt: true },
    });

    if (existing && existing.id !== currentBranchId) {
      throw new ConflictException(existing.deletedAt ? 'Mã chi nhánh đã được sử dụng bởi chi nhánh đã xóa' : 'Mã chi nhánh đã tồn tại');
    }
  }

  private async ensureRegionExists(regionId?: string | null) {
    if (!regionId) return;

    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
      select: { id: true },
    });

    if (!region) {
      throw new BadRequestException('Khu vực không tồn tại');
    }
  }

  private async ensureManagerExists(managerId?: string | null, currentBranchId?: string) {
    if (!managerId) return;

    const manager = await this.prisma.user.findFirst({
      where: {
        id: managerId,
        deletedAt: null,
        role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER] },
      },
      select: { id: true },
    });

    if (!manager) {
      throw new BadRequestException('Quản lý không tồn tại hoặc không hợp lệ');
    }

    const managedBranch = await this.prisma.branch.findFirst({
      where: {
        managerId,
        deletedAt: null,
        ...(currentBranchId && { id: { not: currentBranchId } }),
      },
      select: { id: true },
    });

    if (managedBranch) {
      throw new ConflictException('Quản lý này đã được gán cho chi nhánh khác');
    }
  }
}
