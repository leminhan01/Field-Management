import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QueryTaskDto } from './dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findAll(@Query() query: QueryTaskDto): Promise<unknown> {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.tasksService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.tasksService.remove(id);
  }
}
