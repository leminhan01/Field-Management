import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';

export class CreateTaskTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ten mau cong viec la bat buoc' })
  @MinLength(2, { message: 'Ten mau cong viec phai co it nhat 2 ky tu' })
  @MaxLength(160, { message: 'Ten mau cong viec khong duoc vuot qua 160 ky tu' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mo ta khong duoc vuot qua 500 ky tu' })
  description?: string;

  @ApiProperty({ enum: TaskType })
  @IsEnum(TaskType, { message: 'Loai cong viec khong hop le' })
  type!: TaskType;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  checklist!: string[];

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
}
