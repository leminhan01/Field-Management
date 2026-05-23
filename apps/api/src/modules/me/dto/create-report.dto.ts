import { IsString, IsOptional, IsArray, IsInt, Min, Max, IsObject } from 'class-validator';

export class CreateReportDto {
  @IsString()
  taskId!: string;

  @IsString()
  assignmentId!: string;

  @IsObject()
  checklistData!: Record<string, boolean>;

  @IsArray()
  @IsString({ each: true })
  photos!: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
