import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MeService } from './me.service';
import { SurveysService } from '../surveys/surveys.service';
import { UploadService } from '../upload/upload.service';
import {
  QueryMyTasksDto,
  UpdateAssignmentStatusDto,
  CreateReportDto,
  CheckInDto,
  NearbyOutletsDto,
  DeviceTokenDto,
  SyncQueryDto,
  SubmitSurveyResponseDto,
} from './dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private meService: MeService,
    private uploadService: UploadService,
    private surveysService: SurveysService,
  ) {}

  @Get('tasks')
  getMyTasks(
    @CurrentUser('id') userId: string,
    @Query() query: QueryMyTasksDto,
  ) {
    return this.meService.getMyTasks(userId, query);
  }

  @Get('tasks/:id')
  getMyTaskDetail(
    @CurrentUser('id') userId: string,
    @Param('id') taskId: string,
  ) {
    return this.meService.getMyTaskDetail(userId, taskId);
  }

  @Patch('task-assignments/:id/status')
  updateAssignmentStatus(
    @CurrentUser('id') userId: string,
    @Param('id') assignmentId: string,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.meService.updateAssignmentStatus(userId, assignmentId, dto);
  }

  @Post('reports')
  createReport(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.meService.createReport(userId, dto);
  }

  @Post('reports/:id/photos')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadReportPhoto(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') reportId: string,
  ) {
    const result = await this.uploadService.uploadImage(
      file,
      `fieldapp/reports/${reportId}`,
    );
    await this.meService.addPhotoToReport(userId, reportId, result.url);
    return result;
  }

  @Post('check-in')
  checkIn(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckInDto,
  ) {
    return this.meService.checkIn(userId, dto);
  }

  @Get('check-ins')
  getCheckInHistory(
    @CurrentUser('id') userId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.meService.getCheckInHistory(userId, query);
  }

  @Get('outlets/nearby')
  getNearbyOutlets(
    @CurrentUser('id') userId: string,
    @Query() dto: NearbyOutletsDto,
  ) {
    return this.meService.getNearbyOutlets(userId, dto);
  }

  @Post('device-token')
  registerDeviceToken(
    @CurrentUser('id') userId: string,
    @Body() dto: DeviceTokenDto,
  ) {
    return this.meService.registerDeviceToken(userId, dto);
  }

  @Get('sync')
  getSyncData(
    @CurrentUser('id') userId: string,
    @Query() query: SyncQueryDto,
  ) {
    return this.meService.getSyncData(userId, query);
  }

  // ==================== Surveys ====================

  @Get('surveys')
  getMySurveys() {
    return this.surveysService.getActiveSurveys();
  }

  @Get('surveys/:id')
  getMySurveyDetail(@Param('id') surveyId: string) {
    return this.surveysService.findOne(surveyId);
  }

  @Post('surveys/:id/responses')
  submitSurveyResponse(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
    @Body() dto: SubmitSurveyResponseDto,
  ) {
    return this.surveysService.submitResponse(
      surveyId,
      userId,
      dto.branchId,
      dto.answers,
    );
  }
}
