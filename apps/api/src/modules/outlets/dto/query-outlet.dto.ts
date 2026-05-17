import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OUTLET_TYPES, type OutletTypeValue } from './outlet-type';

export class QueryOutletDto {
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

  @ApiPropertyOptional({ enum: OUTLET_TYPES })
  @IsOptional()
  @IsEnum(OUTLET_TYPES)
  type?: OutletTypeValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'Chi nhanh khong hop le' })
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: string;
}
