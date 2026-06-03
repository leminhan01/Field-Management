import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SurveyStatus } from '@prisma/client';

export class UpdateSurveyStatusDto {
  @ApiProperty({ enum: SurveyStatus })
  @IsEnum(SurveyStatus)
  status!: SurveyStatus;
}
