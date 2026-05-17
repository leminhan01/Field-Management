import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import { CreateOutletDto, QueryOutletDto, UpdateOutletDto } from './dto';
import { OUTLET_TYPES } from './dto/outlet-type';

const OUTLET_SELECT = {
  id: true,
  name: true,
  code: true,
  address: true,
  phone: true,
  type: true,
  brand: true,
  branchId: true,
  branch: { select: { id: true, name: true, code: true } },
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

interface OutletDelegate {
  findMany(args: unknown): Promise<unknown[]>;
  count(args: unknown): Promise<number>;
  findFirst(args: unknown): Promise<OutletRecord | null>;
  findUnique(args: unknown): Promise<Pick<OutletRecord, 'id' | 'deletedAt'> | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
}

interface OutletRecord {
  id: string;
  name: string;
  code: string;
  deletedAt: Date | null;
}

@Injectable()
export class OutletsService {
  constructor(private prisma: PrismaService) {}

  private get outlet() {
    return (this.prisma as unknown as { outlet: OutletDelegate }).outlet;
  }

  async findAll(query: QueryOutletDto): Promise<unknown> {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Record<string, unknown> = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { branch: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.outlet.findMany({
        where,
        select: OUTLET_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.outlet.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<unknown> {
    const outlet = await this.outlet.findFirst({
      where: { id, deletedAt: null },
      select: OUTLET_SELECT,
    });

    if (!outlet) {
      throw new NotFoundException('Khong tim thay outlet');
    }

    return outlet;
  }

  async create(dto: CreateOutletDto): Promise<unknown> {
    await this.ensureCodeIsAvailable(dto.code);
    await this.ensureBranchExists(dto.branchId);

    return this.outlet.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        address: dto.address || null,
        phone: dto.phone || null,
        type: dto.type || OUTLET_TYPES.OTHER,
        brand: dto.brand || null,
        branchId: dto.branchId,
      },
      select: OUTLET_SELECT,
    });
  }

  async update(id: string, dto: UpdateOutletDto): Promise<unknown> {
    const outlet = await this.outlet.findFirst({
      where: { id, deletedAt: null },
    });

    if (!outlet) {
      throw new NotFoundException('Khong tim thay outlet');
    }

    if (dto.code && dto.code.toUpperCase() !== outlet.code) {
      await this.ensureCodeIsAvailable(dto.code, id);
    }

    await this.ensureBranchExists(dto.branchId);

    return this.outlet.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
        ...(dto.address !== undefined && { address: dto.address || null }),
        ...(dto.phone !== undefined && { phone: dto.phone || null }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.brand !== undefined && { brand: dto.brand || null }),
        ...(dto.branchId !== undefined && { branchId: dto.branchId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: OUTLET_SELECT,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const outlet = await this.outlet.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!outlet) {
      throw new NotFoundException('Khong tim thay outlet');
    }

    await this.outlet.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Xoa outlet thanh cong' };
  }

  private async ensureCodeIsAvailable(code: string, currentOutletId?: string) {
    const existing = await this.outlet.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, deletedAt: true },
    });

    if (existing && existing.id !== currentOutletId) {
      throw new ConflictException(existing.deletedAt ? 'Ma outlet da duoc su dung boi outlet da xoa' : 'Ma outlet da ton tai');
    }
  }

  private async ensureBranchExists(branchId?: string | null) {
    if (!branchId) return;

    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, deletedAt: null },
      select: { id: true },
    });

    if (!branch) {
      throw new BadRequestException('Chi nhanh khong ton tai');
    }
  }
}
