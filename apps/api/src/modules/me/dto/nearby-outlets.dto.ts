import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyOutletsDto {
  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  radius?: number;
}
