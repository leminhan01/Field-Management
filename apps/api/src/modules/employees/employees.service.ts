import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '@fieldapp/shared';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatar: true,
  role: true,
  positionId: true,
  position: { select: { id: true, name: true, code: true, permissions: true } },
  isActive: true,
  branchId: true,
  branch: { select: { id: true, name: true, code: true } },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEmployeeDto, currentUser: { id: string; role: string; branchId?: string | null }) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: any = { deletedAt: null };

    if (currentUser.role === Role.MANAGER) {
      where.branchId = currentUser.branchId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.branchId && currentUser.role !== Role.MANAGER) {
      where.branchId = query.branchId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, currentUser: { id: string; role: string; branchId?: string | null }) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (currentUser.role === Role.MANAGER && user.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Bạn không có quyền xem nhân viên này');
    }

    return user;
  }

  async create(dto: CreateEmployeeDto, _currentUser: { id: string; role: string }) {
    await this.ensureBranchExists(dto.branchId);
    const position = await this.ensurePositionExists(dto.positionId);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        phone: dto.phone,
        role: dto.role || position?.role || Role.STAFF,
        positionId: dto.positionId || null,
        branchId: dto.branchId,
      },
      select: USER_SELECT,
    });

    return user;
  }

  async update(id: string, dto: UpdateEmployeeDto, currentUser: { id: string; role: string; branchId?: string | null }) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (currentUser.role === Role.MANAGER && user.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Bạn không có quyền sửa nhân viên này');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && !existing.deletedAt) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    await this.ensureBranchExists(dto.branchId);
    const position = await this.ensurePositionExists(dto.positionId);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.name && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...((dto.role || position) && { role: dto.role || position?.role }),
        ...(dto.branchId !== undefined && { branchId: dto.branchId }),
        ...(dto.positionId !== undefined && { positionId: dto.positionId || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: USER_SELECT,
    });

    return updated;
  }

  async remove(id: string, currentUser: { id: string; role: string; branchId?: string | null }) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (currentUser.role === Role.MANAGER && user.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Bạn không có quyền xóa nhân viên này');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Xóa nhân viên thành công' };
  }

  async importFromExcel(buffer: Buffer, _currentUser: { id: string; role: string }) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    const result = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; message: string }>,
    };

    const toCreate: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = row['email']?.trim();
      const name = row['name']?.trim();

      if (!email || !name) {
        result.errors.push({ row: i + 2, message: 'Thiếu email hoặc tên' });
        result.skipped++;
        continue;
      }

      const existing = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existing && !existing.deletedAt) {
        result.errors.push({ row: i + 2, message: 'Email đã tồn tại' });
        result.skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash('FieldApp@123', 10);

      toCreate.push({
        email,
        name,
        phone: row['phone']?.trim() || null,
        password: hashedPassword,
        role: Object.values(Role).includes(row['role'] as Role)
          ? (row['role'] as Role)
          : Role.STAFF,
        branchId: row['branchId']?.trim() || null,
      });

      result.imported++;
    }

    if (toCreate.length > 0) {
      await this.prisma.user.createMany({ data: toCreate, skipDuplicates: true });
    }

    return result;
  }

  async exportToExcel(query: QueryEmployeeDto, currentUser: { id: string; role: string; branchId?: string | null }) {
    const result = await this.findAll(
      { ...query, page: 1, limit: 10000 },
      currentUser,
    );

    const rows = result.data.map((u: any, idx: number) => ({
      STT: idx + 1,
      'Họ tên': u.name,
      Email: u.email,
      'Điện thoại': u.phone || '',
      'Vai trò': u.role,
      'Chi nhánh': u.branch?.name || '',
      'Trạng thái': u.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
      'Ngày tạo': new Date(u.createdAt).toLocaleDateString('vi-VN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async updateAvatar(
    id: string,
    avatarUrl: string,
    currentUser: { id: string; role: string; branchId?: string | null },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (currentUser.role === Role.MANAGER && user.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Bạn không có quyền sửa nhân viên này');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: USER_SELECT,
    });

    return updated;
  }

  private async ensureBranchExists(branchId?: string | null) {
    if (!branchId) return;

    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, deletedAt: null },
      select: { id: true },
    });

    if (!branch) {
      throw new BadRequestException('Chi nhánh không tồn tại hoặc đã bị xóa');
    }
  }

  private async ensurePositionExists(positionId?: string | null) {
    if (!positionId) return null;

    const position = await this.prisma.position.findFirst({
      where: { id: positionId, deletedAt: null, isActive: true },
      select: { id: true, role: true },
    });

    if (!position) {
      throw new BadRequestException('Chuc vu khong ton tai hoac da bi khoa');
    }

    return position;
  }
}
