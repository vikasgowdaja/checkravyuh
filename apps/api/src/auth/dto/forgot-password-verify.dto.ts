import { IsString } from 'class-validator';

export class ForgotPasswordVerifyDto {
  @IsString()
  identifier!: string;

  @IsString()
  code!: string;
}
