import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, type UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    if (!dto.email && !dto.mobile) {
      throw new BadRequestException('Either email or mobile is required.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.userModel.create({
        name: dto.name,
        email: dto.email?.toLowerCase(),
        mobile: dto.mobile,
        passwordHash,
      });

      return this.toPublicUser(user);
    } catch (error) {
      this.handleDuplicateError(error);
      throw error;
    }
  }

  async findAll() {
    const users = await this.userModel.find().sort({ createdAt: -1 }).exec();
    return users.map((entry) => this.toPublicUser(entry));
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toPublicUser(user);
  }

  async findByEmailOrMobile(identifier: string) {
    return this.userModel
      .findOne({
        $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }],
      })
      .exec();
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.email !== undefined) {
      user.email = dto.email.toLowerCase();
      user.isEmailVerified = false;
    }

    if (dto.mobile !== undefined) {
      user.mobile = dto.mobile;
      user.isMobileVerified = false;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    try {
      await user.save();
      return this.toPublicUser(user);
    } catch (error) {
      this.handleDuplicateError(error);
      throw error;
    }
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      id,
      deleted: true,
    };
  }

  async verifyPassword(user: UserDocument, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  }

  async setPassword(userId: string, nextPassword: string) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.passwordHash = await bcrypt.hash(nextPassword, 10);
    await user.save();

    return this.toPublicUser(user);
  }

  async markVerification(userId: string, channel: 'email' | 'mobile') {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (channel === 'email') {
      user.isEmailVerified = true;
    } else {
      user.isMobileVerified = true;
    }

    await user.save();

    return this.toPublicUser(user);
  }

  toPublicUser(user: UserDocument) {
    return {
      id: user.id,
      name: user.name,
      email: user.email ?? null,
      mobile: user.mobile ?? null,
      isEmailVerified: user.isEmailVerified,
      isMobileVerified: user.isMobileVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private handleDuplicateError(error: unknown) {
    const code = (error as { code?: number })?.code;

    if (code === 11000) {
      throw new ConflictException('Email or mobile already exists.');
    }
  }
}
