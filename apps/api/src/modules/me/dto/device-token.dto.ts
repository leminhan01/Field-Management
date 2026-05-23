import { IsString, IsIn } from 'class-validator';

export class DeviceTokenDto {
  @IsString()
  token!: string;

  @IsIn(['ios', 'android'])
  platform!: 'ios' | 'android';
}
