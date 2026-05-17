import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTaskTemplateDto, QueryTaskTemplateDto, UpdateTaskTemplateDto } from './dto';
import { TaskTemplatesService } from './task-templates.service';

@Controller('task-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskTemplatesController {
  constructor(private taskTemplatesService: TaskTemplatesService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findAll(@Query() query: QueryTaskTemplateDto, @Req() req: Request) {
    if (Object.keys(req.query).length === 0) {
      return this.taskTemplatesService.findOptions();
    }

    return this.taskTemplatesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findOne(@Param('id') id: string) {
    return this.taskTemplatesService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateTaskTemplateDto, @CurrentUser('id') userId: string) {
    return this.taskTemplatesService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateTaskTemplateDto) {
    return this.taskTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.taskTemplatesService.remove(id);
  }
}
