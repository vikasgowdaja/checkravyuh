import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<OtpCode>;

@Schema({ timestamps: true })
export class OtpCode {
  @Prop({ required: true, enum: ['email', 'mobile'] })
  channel!: 'email' | 'mobile';

  @Prop({ required: true })
  recipient!: string;

  @Prop({ required: true })
  purpose!: string;

  @Prop({ required: true })
  code!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  userId?: string;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop()
  verifiedAt?: Date;
}

export const OtpCodeSchema = SchemaFactory.createForClass(OtpCode);
OtpCodeSchema.index({ recipient: 1, purpose: 1, createdAt: -1 });
