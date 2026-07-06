import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';

const TASK_TYPES = ['REGULAR', 'SURVEY', 'PROMOTION'] as const;

export class QueryTaskTemplateDto {
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
  @IsIn(TASK_TYPES)
  type?: TaskType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: string;
}
