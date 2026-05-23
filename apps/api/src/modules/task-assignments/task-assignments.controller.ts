import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BulkAssignTaskDto } from './dto';
import { TaskAssignmentsService } from './task-assignments.service';

@Controller('task-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskAssignmentsController {
  constructor(private taskAssignmentsService: TaskAssignmentsService) {}

  @Post('bulk')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  bulkAssign(@Body() dto: BulkAssignTaskDto, @CurrentUser('id') userId: string): Promise<unknown> {
    return this.taskAssignmentsService.bulkAssign(dto, userId);
  }
}
