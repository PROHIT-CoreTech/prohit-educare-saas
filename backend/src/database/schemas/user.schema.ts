import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT'], default: 'ADMIN' })
  role: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ academyId: 1, email: 1 }, { unique: true });
