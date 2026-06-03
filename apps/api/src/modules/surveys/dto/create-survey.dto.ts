import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề khảo sát là bắt buộc' })
  @MinLength(2, { message: 'Tiêu đề phải có ít nhất 2 ký tự' })
  @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;

  @ApiProperty()
  @IsArray({ message: 'Câu hỏi phải là mảng' })
  @IsNotEmpty({ message: 'Phải có ít nhất 1 câu hỏi' })
  questions!: unknown[];
}
