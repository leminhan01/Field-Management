import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Ten nhom cong viec la bat buoc' })
  @MinLength(2, { message: 'Ten nhom cong viec phai co it nhat 2 ky tu' })
  @MaxLength(160, { message: 'Ten nhom cong viec khong duoc vuot qua 160 ky tu' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Ma nhom cong viec la bat buoc' })
  @MinLength(2, { message: 'Ma nhom cong viec phai co it nhat 2 ky tu' })
  @MaxLength(40, { message: 'Ma nhom cong viec khong duoc vuot qua 40 ky tu' })
  @Matches(/^[A-Z0-9_-]+$/i, { message: 'Ma nhom chi gom chu, so, dau gach ngang hoac gach duoi' })
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mo ta khong duoc vuot qua 500 ky tu' })
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Mau cong viec khong hop le' })
  templateIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
