import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OUTLET_TYPES, type OutletTypeValue } from './outlet-type';

export class CreateOutletDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ten outlet la bat buoc' })
  @MinLength(2, { message: 'Ten outlet phai co it nhat 2 ky tu' })
  @MaxLength(120, { message: 'Ten outlet khong duoc vuot qua 120 ky tu' })
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ma outlet la bat buoc' })
  @MinLength(2, { message: 'Ma outlet phai co it nhat 2 ky tu' })
  @MaxLength(30, { message: 'Ma outlet khong duoc vuot qua 30 ky tu' })
  @Matches(/^[A-Z0-9_-]+$/i, { message: 'Ma outlet chi gom chu, so, dau gach ngang hoac gach duoi' })
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Dia chi khong duoc vuot qua 255 ky tu' })
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'So dien thoai khong duoc vuot qua 30 ky tu' })
  phone?: string;

  @ApiPropertyOptional({ enum: OUTLET_TYPES })
  @IsOptional()
  @IsEnum(OUTLET_TYPES, { message: 'Loai outlet khong hop le' })
  type?: OutletTypeValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'Thuong hieu khong duoc vuot qua 80 ky tu' })
  brand?: string;

  @ApiProperty()
  @IsUUID('4', { message: 'Chi nhanh khong hop le' })
  branchId!: string;
}
