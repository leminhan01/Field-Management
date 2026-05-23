import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { EmployeesService } from './employees.service';
import { UploadService } from '../upload/upload.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(
    private employeesService: EmployeesService,
    private uploadService: UploadService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findAll(
    @Query() query: QueryEmployeeDto,
    @CurrentUser() user: { id: string; role: string; branchId?: string | null },
  ) {
    return this.employeesService.findAll(query, user);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  async exportExcel(
    @Query() query: QueryEmployeeDto,
    @CurrentUser() user: { id: string; role: string; branchId?: string | null },
    @Res({ passthrough: false }) res: Response,
  ) {
    const buffer = await this.employeesService.exportToExcel(query, user);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
    res.end(buffer);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TEAM_LEADER)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string; branchId?: string | null },
  ) {
    return this.employeesService.findOne(id, user);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.employeesService.create(dto, user);
  }

  @Post('import')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  importExcel(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.employeesService.importFromExcel(file.buffer, user);
  }

  @Post(':id/avatar')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string; role: string; branchId?: string | null },
  ) {
    const { url } = await this.uploadService.uploadImage(file, 'fieldapp/avatars');
    return this.employeesService.updateAvatar(id, url, user);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: { id: string; role: string; branchId?: string | null },
  ) {
    return this.employeesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string; branchId?: string | null },
  ) {
    return this.employeesService.remove(id, user);
  }
}
