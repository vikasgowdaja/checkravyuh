import { IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsString()
  identifier!: string;
}
