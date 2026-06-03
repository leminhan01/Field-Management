import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import {
  CreateSurveyDto,
  QuerySurveyDto,
  UpdateSurveyDto,
  UpdateSurveyStatusDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SurveysController {
  constructor(private surveysService: SurveysService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findAll(@Query() query: QuerySurveyDto) {
    return this.surveysService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  create(
    @Body() dto: CreateSurveyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.surveysService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSurveyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.surveysService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSurveyStatusDto,
  ) {
    return this.surveysService.updateStatus(id, dto.status);
  }

  @Get(':id/responses')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  getResponses(
    @Param('id') surveyId: string,
    @Query() query: { page?: number | string; limit?: number | string },
  ) {
    return this.surveysService.getResponses(surveyId, query);
  }

  @Get(':id/stats')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  getStats(@Param('id') surveyId: string) {
    return this.surveysService.getStats(surveyId);
  }
}
