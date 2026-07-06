import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QueryReportDto, ReviewReportDto } from './dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findAll(@Query() query: QueryReportDto): Promise<unknown> {
    return this.reportsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/review')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  review(
    @Param('id') id: string,
    @Body() dto: ReviewReportDto,
    @CurrentUser('id') userId: string,
  ): Promise<unknown> {
    return this.reportsService.review(id, dto, userId);
  }
}
