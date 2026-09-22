import { IsIn, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsIn(['email', 'mobile'])
  channel!: 'email' | 'mobile';

  @IsString()
  recipient!: string;

  @IsString()
  purpose!: string;

  @IsString()
  code!: string;
}
