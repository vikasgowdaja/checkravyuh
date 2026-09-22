import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsIn(['email', 'mobile'])
  channel!: 'email' | 'mobile';

  @IsString()
  recipient!: string;

  @IsString()
  purpose!: string;

  @IsOptional()
  @Matches(/^[a-f\d]{24}$/i)
  userId?: string;
}
