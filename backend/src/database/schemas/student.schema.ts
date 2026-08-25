import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  studentCode: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  parentName: string;

  @Prop({ required: true, trim: true })
  parentPhone: string;

  @Prop({ required: false, lowercase: true, trim: true })
  parentEmail?: string;

  @Prop({ type: Types.ObjectId, ref: 'ClassBatch', required: true })
  classBatchId: Types.ObjectId;

  @Prop({ required: true })
  standard: number;

  @Prop({ required: false, enum: ['marathi', 'semi_english', 'english', 'hindi'], default: 'english' })
  medium?: string;

  @Prop({ required: false, enum: ['science', 'commerce', 'arts', 'none'], default: 'none' })
  stream?: string;

  @Prop({ required: false })
  dateOfBirth?: Date;

  @Prop({ required: true, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;

  @Prop({ required: true, default: 0, min: 0 })
  advanceBalance: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ academyId: 1, studentCode: 1 }, { unique: true });
