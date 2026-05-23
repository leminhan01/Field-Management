import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsString()
  outletId!: string;

  @IsOptional()
  @IsString()
  assignmentId?: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
