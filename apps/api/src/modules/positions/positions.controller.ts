import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreatePositionDto, QueryPositionDto, UpdatePositionDto } from './dto';
import { PositionsService } from './positions.service';

@ApiTags('positions')
@ApiBearerAuth('access-token')
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  @Get('permissions')
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions('positions.read', 'positions.manage')
  getPermissions() {
    return this.positionsService.getPermissions();
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions('positions.read', 'positions.manage')
  findAll(@Query() query: QueryPositionDto, @Req() req: Request) {
    if (Object.keys(req.query).length === 0) {
      return this.positionsService.findOptions();
    }

    return this.positionsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions('positions.read', 'positions.manage')
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @Permissions('positions.manage')
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @Permissions('positions.manage')
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions('positions.manage')
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
