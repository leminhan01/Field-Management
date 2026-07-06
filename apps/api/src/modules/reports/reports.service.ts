import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignmentStatus, Prisma, TaskStatus } from '@prisma/client';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { PrismaService } from '../../common/prisma.service';
import { QueryReportDto, ReviewReportDto } from './dto';

const REPORT_SELECT = {
  id: true,
  taskId: true,
  task: {
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      branch: { select: { id: true, name: true, code: true } },
      outlet: { select: { id: true, name: true, code: true } },
    },
  },
  assignmentId: true,
  assignment: {
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      outlet: { select: { id: true, name: true, code: true } },
    },
  },
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
} satisfies Prisma.ReportSelect;

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryReportDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where = this.buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        select: REPORT_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: REPORT_SELECT,
    });

    if (!report) {
      throw new NotFoundException('Khong tim thay bao cao');
    }

    return report;
  }

  async review(id: string, dto: ReviewReportDto, userId: string) {
    const currentReport = await this.findOne(id);
    const taskStatus = dto.status === 'APPROVED' ? TaskStatus.APPROVED : TaskStatus.REJECTED;
    const assignmentStatus = dto.status === 'APPROVED' ? AssignmentStatus.APPROVED : AssignmentStatus.REJECTED;

    const [, , report] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: currentReport.taskId },
        data: { status: taskStatus },
      }),
      this.prisma.taskAssignment.update({
        where: { id: currentReport.assignmentId },
        data: { status: assignmentStatus },
      }),
      this.prisma.report.update({
        where: { id },
        data: {
          reviewedById: userId,
          reviewedAt: new Date(),
          reviewNotes: dto.reviewNotes || null,
        },
        select: REPORT_SELECT,
      }),
    ]);

    return report;
  }

  private buildWhere(query: QueryReportDto): Prisma.ReportWhereInput {
    const and: Prisma.ReportWhereInput[] = [
      { task: { deletedAt: null } },
    ];

    if (query.search) {
      and.push({
        OR: [
          { task: { title: { contains: query.search, mode: 'insensitive' } } },
          { task: { branch: { name: { contains: query.search, mode: 'insensitive' } } } },
          { task: { outlet: { name: { contains: query.search, mode: 'insensitive' } } } },
          { submittedBy: { name: { contains: query.search, mode: 'insensitive' } } },
          { submittedBy: { email: { contains: query.search, mode: 'insensitive' } } },
          { notes: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    if (query.status === 'PENDING') {
      and.push({ reviewedAt: null });
    } else if (query.status === 'APPROVED') {
      and.push({ reviewedAt: { not: null } });
      and.push({ task: { status: TaskStatus.APPROVED } });
    } else if (query.status === 'REJECTED') {
      and.push({ reviewedAt: { not: null } });
      and.push({ task: { status: TaskStatus.REJECTED } });
    }

    if (query.branchId) {
      and.push({ task: { branchId: query.branchId } });
    }

    if (query.assigneeId) {
      and.push({ submittedById: query.assigneeId });
    }

    return { AND: and };
  }
}
