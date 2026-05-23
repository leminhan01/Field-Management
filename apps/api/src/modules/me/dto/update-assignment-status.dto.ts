import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssignmentStatus } from '@prisma/client';

export class UpdateAssignmentStatusDto {
  @IsEnum(AssignmentStatus)
  status!: AssignmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
