import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SurveyStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { createPaginatedResponse, getPaginationParams } from '@fieldapp/shared';
import { CreateSurveyDto, QuerySurveyDto, UpdateSurveyDto } from './dto';

const VALID_QUESTION_TYPES = [
  'SHORT_TEXT',
  'LONG_TEXT',
  'CHECKBOX',
  'MULTIPLE_CHOICE',
];

const SURVEY_SELECT = {
  id: true,
  title: true,
  description: true,
  questions: true,
  status: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: { select: { responses: true } },
} satisfies Prisma.SurveySelect;

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  // ==================== CRUD ====================

  async findAll(query: QuerySurveyDto) {
    const { skip, take, page, limit } = getPaginationParams({
      page: query.page,
      limit: query.limit,
    });

    const where: Prisma.SurveyWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        {
          title: { contains: query.search, mode: 'insensitive' },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        select: SURVEY_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.survey.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id, deletedAt: null },
      select: SURVEY_SELECT,
    });

    if (!survey) {
      throw new NotFoundException('Không tìm thấy khảo sát');
    }

    return survey;
  }

  async create(dto: CreateSurveyDto, userId: string) {
    this.validateQuestions(dto.questions);

    return this.prisma.survey.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        questions: dto.questions as Prisma.InputJsonValue,
        status: SurveyStatus.DRAFT,
        createdById: userId,
      },
      select: SURVEY_SELECT,
    });
  }

  async update(id: string, dto: UpdateSurveyDto, userId: string) {
    const survey = await this.findOneWithResponses(id);

    if (survey.status !== SurveyStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể chỉnh sửa khảo sát ở trạng thái Draft',
      );
    }

    if (survey._count.responses > 0) {
      throw new BadRequestException(
        'Không thể chỉnh sửa khảo sát đã có phản hồi',
      );
    }

    if (dto.questions) {
      this.validateQuestions(dto.questions);
    }

    return this.prisma.survey.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && {
          description: dto.description || null,
        }),
        ...(dto.questions !== undefined && {
          questions: dto.questions as Prisma.InputJsonValue,
        }),
      },
      select: SURVEY_SELECT,
    });
  }

  async remove(id: string) {
    const survey = await this.findOneWithResponses(id);

    if (survey._count.responses > 0) {
      throw new BadRequestException(
        'Không thể xóa khảo sát đã có phản hồi',
      );
    }

    await this.prisma.survey.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Xóa khảo sát thành công' };
  }

  // ==================== Status ====================

  async updateStatus(id: string, newStatus: SurveyStatus) {
    const survey = await this.findOne(id);

    // Validate status transition
    if (
      (survey.status === SurveyStatus.DRAFT && newStatus !== SurveyStatus.ACTIVE) ||
      (survey.status === SurveyStatus.ACTIVE && newStatus !== SurveyStatus.CLOSED)
    ) {
      throw new BadRequestException(
        `Không thể chuyển từ ${survey.status} sang ${newStatus}. Quyền: DRAFT → ACTIVE → CLOSED`,
      );
    }

    return this.prisma.survey.update({
      where: { id },
      data: { status: newStatus },
      select: SURVEY_SELECT,
    });
  }

  // ==================== Responses ====================

  async getResponses(
    surveyId: string,
    query: { page?: number | string; limit?: number | string },
  ) {
    const survey = await this.findOne(surveyId);

    const normalizedQuery = {
      page: typeof query.page === 'string' ? parseInt(query.page, 10) : query.page,
      limit: typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit,
    };
    const { skip, take, page, limit } = getPaginationParams(normalizedQuery);

    const [data, total] = await Promise.all([
      this.prisma.surveyResponse.findMany({
        where: { surveyId },
        select: {
          id: true,
          surveyId: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
          branchId: true,
          branch: { select: { id: true, name: true, code: true } },
          answers: true,
          submittedAt: true,
        },
        skip,
        take,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.surveyResponse.count({ where: { surveyId } }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getStats(surveyId: string) {
    const survey = await this.findOne(surveyId);
    const questions = survey.questions as Array<{
      id: string;
      type: string;
      label: string;
      options?: string[];
    }>;

    const responses = await this.prisma.surveyResponse.findMany({
      where: { surveyId },
      select: { answers: true },
    });

    const questionStats = questions.map((q) => {
      const stat: {
        questionId: string;
        questionLabel: string;
        questionType: string;
        responseCount: number;
        optionCounts?: Record<string, number>;
      } = {
        questionId: q.id,
        questionLabel: q.label,
        questionType: q.type,
        responseCount: 0,
      };

      if (q.type === 'CHECKBOX' || q.type === 'MULTIPLE_CHOICE') {
        const optionCounts: Record<string, number> = {};
        (q.options || []).forEach((opt) => {
          optionCounts[opt] = 0;
        });

        responses.forEach((r) => {
          const answers = r.answers as Record<string, string | string[]>;
          const answer = answers[q.id];
          if (answer !== undefined && answer !== null) {
            stat.responseCount++;
            if (q.type === 'CHECKBOX' && Array.isArray(answer)) {
              answer.forEach((a: string) => {
                if (optionCounts[a] !== undefined) {
                  optionCounts[a]++;
                }
              });
            } else if (typeof answer === 'string') {
              if (optionCounts[answer] !== undefined) {
                optionCounts[answer]++;
              }
            }
          }
        });

        stat.optionCounts = optionCounts;
      } else {
        responses.forEach((r) => {
          const answers = r.answers as Record<string, string | string[]>;
          if (answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '') {
            stat.responseCount++;
          }
        });
      }

      return stat;
    });

    return {
      totalResponses: responses.length,
      questionStats,
    };
  }

  // ==================== Mobile: Submit Response ====================

  async submitResponse(
    surveyId: string,
    userId: string,
    branchId: string,
    answers: Record<string, string | string[]>,
  ) {
    const survey = await this.prisma.survey.findFirst({
      where: { id: surveyId, deletedAt: null, status: SurveyStatus.ACTIVE },
    });

    if (!survey) {
      throw new NotFoundException(
        'Không tìm thấy khảo sát hoặc khảo sát không đang hoạt động',
      );
    }

    const questions = survey.questions as Array<{
      id: string;
      type: string;
      label: string;
      required: boolean;
      options?: string[];
    }>;

    // Validate required fields
    for (const q of questions) {
      if (q.required) {
        const answer = answers[q.id];
        if (
          answer === undefined ||
          answer === null ||
          answer === '' ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          throw new BadRequestException(
            `Câu hỏi "${q.label}" là bắt buộc`,
          );
        }
      }
    }

    // Validate option values for choice questions
    for (const q of questions) {
      if (
        (q.type === 'CHECKBOX' || q.type === 'MULTIPLE_CHOICE') &&
        q.options
      ) {
        const answer = answers[q.id];
        if (answer !== undefined && answer !== null) {
          const selectedOptions = Array.isArray(answer) ? answer : [answer];
          for (const opt of selectedOptions) {
            if (!q.options.includes(opt)) {
              throw new BadRequestException(
                `Đáp án "${opt}" không hợp lệ cho câu hỏi "${q.label}"`,
              );
            }
          }
        }
      }
    }

    // Upsert because of @@unique([surveyId, userId, branchId])
    return this.prisma.surveyResponse.upsert({
      where: {
        surveyId_userId_branchId: { surveyId, userId, branchId },
      },
      create: {
        surveyId,
        userId,
        branchId,
        answers: answers as Prisma.InputJsonValue,
      },
      update: {
        answers: answers as Prisma.InputJsonValue,
        submittedAt: new Date(),
      },
    });
  }

  // ==================== Mobile: Get Active Surveys ====================

  async getActiveSurveys() {
    return this.prisma.survey.findMany({
      where: { status: SurveyStatus.ACTIVE, deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        questions: true,
        status: true,
        createdAt: true,
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== Helpers ====================

  private async findOneWithResponses(id: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...SURVEY_SELECT,
        _count: { select: { responses: true } },
      },
    });

    if (!survey) {
      throw new NotFoundException('Không tìm thấy khảo sát');
    }

    return survey;
  }

  private validateQuestions(questions: unknown[]) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('Phải có ít nhất 1 câu hỏi');
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i] as Record<string, unknown>;

      if (!q.id || typeof q.id !== 'string') {
        throw new BadRequestException(
          `Câu hỏi thứ ${i + 1} thiếu id hoặc id không hợp lệ`,
        );
      }

      if (!VALID_QUESTION_TYPES.includes(q.type as string)) {
        throw new BadRequestException(
          `Câu hỏi thứ ${i + 1} có loại không hợp lệ: ${q.type}. Loại hợp lệ: ${VALID_QUESTION_TYPES.join(', ')}`,
        );
      }

      if (!q.label || typeof q.label !== 'string' || (q.label as string).trim() === '') {
        throw new BadRequestException(
          `Câu hỏi thứ ${i + 1} thiếu nội dung câu hỏi`,
        );
      }

      if (typeof q.required !== 'boolean') {
        throw new BadRequestException(
          `Câu hỏi thứ ${i + 1} thiếu thuộc tính required`,
        );
      }

      if (typeof q.order !== 'number') {
        throw new BadRequestException(
          `Câu hỏi thứ ${i + 1} thiếu thuộc tính order`,
        );
      }

      if (
        (q.type === 'CHECKBOX' || q.type === 'MULTIPLE_CHOICE') &&
        (!Array.isArray(q.options) || q.options.length === 0)
      ) {
        throw new BadRequestException(
          `Câu hỏi thứ ${i + 1} (${q.type}) phải có ít nhất 1 lựa chọn`,
        );
      }
    }
  }
}
