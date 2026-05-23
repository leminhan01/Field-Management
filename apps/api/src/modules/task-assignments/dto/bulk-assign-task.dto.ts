import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const SCHEDULE_MODES = ['SINGLE', 'RANGE', 'WEEKLY'] as const;
export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export type ScheduleMode = (typeof SCHEDULE_MODES)[number];
export type Weekday = (typeof WEEKDAYS)[number];

export class BulkAssignTaskDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Chi nhanh khong hop le' })
  branchId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Phai chon it nhat mot nhan vien' })
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Nhan vien khong hop le' })
  employeeIds!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Phai chon it nhat mot outlet' })
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Outlet khong hop le' })
  outletIds!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Mau cong viec khong hop le' })
  templateIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Nhom cong viec khong hop le' })
  taskGroupIds?: string[];

  @ApiProperty({ enum: SCHEDULE_MODES })
  @IsIn(SCHEDULE_MODES, { message: 'Kieu lap lich khong hop le' })
  scheduleMode!: ScheduleMode;

  @ApiProperty()
  @IsDateString({}, { message: 'Ngay bat dau khong hop le' })
  startDate!: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: BulkAssignTaskDto) => dto.scheduleMode !== 'SINGLE')
  @IsDateString({}, { message: 'Ngay ket thuc khong hop le' })
  endDate?: string;

  @ApiPropertyOptional({ enum: WEEKDAYS, isArray: true })
  @ValidateIf((dto: BulkAssignTaskDto) => dto.scheduleMode === 'WEEKLY')
  @IsArray()
  @ArrayNotEmpty({ message: 'Phai chon it nhat mot thu lap lai' })
  @ArrayUnique()
  @IsIn(WEEKDAYS, { each: true, message: 'Thu lap lai khong hop le' })
  weekdays?: Weekday[];

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Gio phan cong phai co dinh dang HH:mm' })
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tien to tieu de khong duoc vuot qua 200 ky tu' })
  titlePrefix?: string;
}
