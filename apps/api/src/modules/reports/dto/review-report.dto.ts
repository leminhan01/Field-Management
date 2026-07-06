import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewReportDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;
}
