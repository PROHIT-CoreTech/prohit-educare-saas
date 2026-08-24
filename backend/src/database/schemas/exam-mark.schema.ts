import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamMarkDocument = ExamMark & Document;

@Schema({ timestamps: true })
export class ExamMark {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClassBatch', required: true })
  classBatchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  examName: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, min: 0 })
  marksObtained: number;

  @Prop({ required: true, min: 1 })
  totalMarks: number;

  @Prop({ default: '' })
  grade: string;

  @Prop({ required: true, type: Date, default: Date.now })
  examDate: Date;
}

export const ExamMarkSchema = SchemaFactory.createForClass(ExamMark);
ExamMarkSchema.index({ academyId: 1, classBatchId: 1, examName: 1 });
