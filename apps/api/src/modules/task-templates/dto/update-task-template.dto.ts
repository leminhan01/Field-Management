import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';

const TASK_TYPES = ['REGULAR', 'SURVEY', 'PROMOTION'] as const;

export class UpdateTaskTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Ten mau cong viec la bat buoc' })
  @MinLength(2, { message: 'Ten mau cong viec phai co it nhat 2 ky tu' })
  @MaxLength(160, { message: 'Ten mau cong viec khong duoc vuot qua 160 ky tu' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mo ta khong duoc vuot qua 500 ky tu' })
  description?: string;

  @ApiPropertyOptional({ enum: TASK_TYPES })
  @IsOptional()
  @IsIn(TASK_TYPES, { message: 'Loai cong viec khong hop le' })
  type?: TaskType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklist?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  photoRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  estimatedDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
