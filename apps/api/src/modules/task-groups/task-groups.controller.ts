import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignTaskGroupDto, CreateTaskGroupDto, QueryTaskGroupDto, UpdateTaskGroupDto } from './dto';
import { TaskGroupsService } from './task-groups.service';

@Controller('task-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskGroupsController {
  constructor(private taskGroupsService: TaskGroupsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findAll(@Query() query: QueryTaskGroupDto): Promise<unknown> {
    return this.taskGroupsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.taskGroupsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateTaskGroupDto, @CurrentUser('id') userId: string): Promise<unknown> {
    return this.taskGroupsService.create(dto, userId);
  }

  @Post(':id/assign')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  assign(@Param('id') id: string, @Body() dto: AssignTaskGroupDto, @CurrentUser('id') userId: string): Promise<unknown> {
    return this.taskGroupsService.assign(id, dto, userId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateTaskGroupDto): Promise<unknown> {
    return this.taskGroupsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.taskGroupsService.remove(id);
  }
}
