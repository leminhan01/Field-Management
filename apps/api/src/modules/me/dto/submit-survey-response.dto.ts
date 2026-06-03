import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSurveyResponseDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Chi nhánh không hợp lệ' })
  @IsNotEmpty({ message: 'Chi nhánh là bắt buộc' })
  branchId!: string;

  @ApiProperty()
  @IsObject({ message: 'Câu trả lời phải là object' })
  @IsNotEmpty({ message: 'Câu trả lời là bắt buộc' })
  answers!: Record<string, string | string[]>;
}
