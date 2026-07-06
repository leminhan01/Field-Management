import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskType } from '@prisma/client';

const TASK_TYPES = ['REGULAR', 'SURVEY', 'PROMOTION'] as const;

export class QueryTaskDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TASK_TYPES })
  @IsOptional()
  @IsIn(TASK_TYPES, { message: 'Loai cong viec khong hop le' })
  type?: TaskType;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trang thai cong viec khong hop le' })
  status?: TaskStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Chi nhanh khong hop le' })
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Outlet khong hop le' })
  outletId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Nhan vien khong hop le' })
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'Ngay bat dau khong hop le' })
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'Ngay ket thuc khong hop le' })
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'])
  includeDeleted?: string;
}
