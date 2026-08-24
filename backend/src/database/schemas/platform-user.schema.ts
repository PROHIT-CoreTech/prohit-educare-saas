import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformUserDocument = PlatformUser & Document;

@Schema({ timestamps: true })
export class PlatformUser {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['SUPER_ADMIN', 'SUPPORT'], default: 'SUPER_ADMIN' })
  role: string;
}

export const PlatformUserSchema = SchemaFactory.createForClass(PlatformUser);
