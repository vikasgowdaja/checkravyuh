import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type RevokedTokenDocument = HydratedDocument<RevokedToken>;

@Schema({ timestamps: true })
export class RevokedToken {
  @Prop({ required: true, unique: true })
  token!: string;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);
