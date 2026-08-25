import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FacultyDocument = Faculty & Document;

@Schema({ timestamps: true })
export class Faculty {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: false, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: false, trim: true })
  qualification?: string;

  @Prop({ type: [Number], default: [] })
  assignedStandards: number[];

  @Prop({ required: true, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
