import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BranchType } from '@prisma/client';

export class UpdateBranchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên chi nhánh là bắt buộc' })
  @MinLength(2, { message: 'Tên chi nhánh phải có ít nhất 2 ký tự' })
  @MaxLength(120, { message: 'Tên chi nhánh không được vượt quá 120 ký tự' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Mã chi nhánh là bắt buộc' })
  @MinLength(2, { message: 'Mã chi nhánh phải có ít nhất 2 ký tự' })
  @MaxLength(30, { message: 'Mã chi nhánh không được vượt quá 30 ký tự' })
  @Matches(/^[A-Z0-9_-]+$/i, { message: 'Mã chi nhánh chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới' })
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Địa chỉ không được vượt quá 255 ký tự' })
  address?: string;

  @ApiPropertyOptional({ enum: BranchType })
  @IsOptional()
  @IsEnum(BranchType, { message: 'Phân vùng chi nhánh không hợp lệ' })
  type?: BranchType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Khu vực không hợp lệ' })
  regionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Quản lý không hợp lệ' })
  managerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
