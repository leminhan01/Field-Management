import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ten nhom cong viec la bat buoc' })
  @MinLength(2, { message: 'Ten nhom cong viec phai co it nhat 2 ky tu' })
  @MaxLength(160, { message: 'Ten nhom cong viec khong duoc vuot qua 160 ky tu' })
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Ma nhom cong viec la bat buoc' })
  @MinLength(2, { message: 'Ma nhom cong viec phai co it nhat 2 ky tu' })
  @MaxLength(40, { message: 'Ma nhom cong viec khong duoc vuot qua 40 ky tu' })
  @Matches(/^[A-Z0-9_-]+$/i, { message: 'Ma nhom chi gom chu, so, dau gach ngang hoac gach duoi' })
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Mo ta khong duoc vuot qua 500 ky tu' })
  description?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Mau cong viec khong hop le' })
  templateIds!: string[];
}
