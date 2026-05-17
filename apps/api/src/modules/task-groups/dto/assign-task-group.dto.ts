import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTaskGroupDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Nhan vien khong hop le' })
  assigneeId!: string;

  @ApiProperty()
  @IsUUID('4', { message: 'Chi nhanh khong hop le' })
  branchId!: string;

  @ApiProperty()
  @IsDateString({}, { message: 'Thoi gian phan cong khong hop le' })
  scheduledAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tieu de khong duoc vuot qua 200 ky tu' })
  titlePrefix?: string;
}
