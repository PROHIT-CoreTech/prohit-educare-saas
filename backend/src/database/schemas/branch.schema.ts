import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  code: string;

  @Prop({ default: '' })
  address?: string;

  @Prop({ default: '' })
  phone?: string;

  @Prop({ default: '' })
  email?: string;

  @Prop({ default: false })
  isMain: boolean;

  @Prop({ required: true, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
