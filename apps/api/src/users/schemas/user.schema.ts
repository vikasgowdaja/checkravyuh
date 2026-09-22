import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, lowercase: true, unique: true, sparse: true })
  email?: string;

  @Prop({ trim: true, unique: true, sparse: true })
  mobile?: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop({ default: false })
  isMobileVerified!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
