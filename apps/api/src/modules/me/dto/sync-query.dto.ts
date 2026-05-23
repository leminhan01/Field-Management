import { IsOptional, IsString, IsDateString } from 'class-validator';

export class SyncQueryDto {
  @IsOptional()
  @IsDateString()
  lastSyncTimestamp?: string;
}
