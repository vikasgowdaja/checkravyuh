import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'node:crypto';
import { Model } from 'mongoose';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ForgotPasswordVerifyDto } from './dto/forgot-password-verify.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpCode, type OtpDocument } from './schemas/otp.schema';
import {
  PasswordResetToken,
  type PasswordResetTokenDocument,
} from './schemas/password-reset.schema';
import { RevokedToken, type RevokedTokenDocument } from './schemas/revoked-token.schema';

@Injectable()
export class AuthService {
  private readonly otpExpiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES ?? 10);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(OtpCode.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(PasswordResetToken.name)
    private readonly resetTokenModel: Model<PasswordResetTokenDocument>,
    @InjectModel(RevokedToken.name)
    private readonly revokedTokenModel: Model<RevokedTokenDocument>
  ) {}

  async register(dto: RegisterDto) {
    const createDto: CreateUserDto = {
      name: dto.name,
      email: dto.email,
      mobile: dto.mobile,
      password: dto.password,
    };

    const user = await this.usersService.create(createDto);

    return {
      message: 'User registered successfully.',
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailOrMobile(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatched = await this.usersService.verifyPassword(user, dto.password);

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        mobile: user.mobile,
      },
      {
        secret: process.env.JWT_SECRET ?? 'local-dev-secret',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
      }
    );

    return {
      message: 'Login successful.',
      accessToken: token,
      user: this.usersService.toPublicUser(user),
    };
  }

  async logout(dto: LogoutDto) {
    const decoded = this.jwtService.decode(dto.token) as { exp?: number } | null;

    if (!decoded?.exp) {
      throw new BadRequestException('Invalid token.');
    }

    await this.revokedTokenModel.create({
      token: dto.token,
      expiresAt: new Date(decoded.exp * 1000),
    });

    return {
      message: 'Logout successful.',
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + this.otpExpiresMinutes * 60 * 1000);

    await this.otpModel.create({
      channel: dto.channel,
      recipient: this.normalizeRecipient(dto.channel, dto.recipient),
      purpose: dto.purpose,
      code,
      userId: dto.userId,
      expiresAt,
    });

    return {
      message: `OTP sent to ${dto.channel}.`,
      channel: dto.channel,
      recipient: dto.recipient,
      expiresAt,
      otpCodeForDevOnly: code,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const recipient = this.normalizeRecipient(dto.channel, dto.recipient);

    const otp = await this.otpModel
      .findOne({
        channel: dto.channel,
        recipient,
        purpose: dto.purpose,
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!otp) {
      throw new NotFoundException('OTP not found.');
    }

    if (otp.verifiedAt) {
      throw new BadRequestException('OTP is already used.');
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired.');
    }

    otp.attempts += 1;

    if (otp.code !== dto.code) {
      await otp.save();
      throw new UnauthorizedException('Invalid OTP code.');
    }

    otp.verifiedAt = new Date();
    await otp.save();

    if (otp.userId) {
      await this.usersService.markVerification(otp.userId, dto.channel);
    }

    return {
      message: 'OTP verified successfully.',
      purpose: dto.purpose,
      recipient: dto.recipient,
    };
  }

  async forgotPasswordRequest(dto: ForgotPasswordRequestDto) {
    const user = await this.usersService.findByEmailOrMobile(dto.identifier);

    if (!user) {
      return {
        message: 'If the account exists, an OTP has been sent.',
      };
    }

    const channel = dto.identifier.includes('@') ? 'email' : 'mobile';

    const response = await this.requestOtp({
      channel,
      recipient: dto.identifier,
      purpose: 'forgot_password',
      userId: user.id,
    });

    return response;
  }

  async forgotPasswordVerify(dto: ForgotPasswordVerifyDto) {
    const channel = dto.identifier.includes('@') ? 'email' : 'mobile';

    await this.verifyOtp({
      channel,
      recipient: dto.identifier,
      purpose: 'forgot_password',
      code: dto.code,
    });

    const user = await this.usersService.findByEmailOrMobile(dto.identifier);

    if (!user) {
      throw new NotFoundException('User not found for reset request.');
    }

    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.resetTokenModel.create({
      token: resetToken,
      userId: user.id,
      expiresAt,
    });

    return {
      message: 'OTP verified. Use reset token to set a new password.',
      resetToken,
      expiresAt,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.resetTokenModel.findOne({ token: dto.resetToken }).exec();

    if (!token) {
      throw new NotFoundException('Reset token not found.');
    }

    if (token.usedAt) {
      throw new BadRequestException('Reset token already used.');
    }

    if (token.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token expired.');
    }

    await this.usersService.setPassword(token.userId, dto.newPassword);
    token.usedAt = new Date();
    await token.save();

    return {
      message: 'Password reset successful.',
    };
  }

  private normalizeRecipient(channel: 'email' | 'mobile', recipient: string) {
    return channel === 'email' ? recipient.toLowerCase() : recipient;
  }
}
