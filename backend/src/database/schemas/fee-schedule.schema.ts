import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeeScheduleDocument = FeeSchedule & Document;

@Schema({ timestamps: true })
export class FeeSchedule {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FeeStructure', required: false })
  feeStructureId?: Types.ObjectId;

  @Prop({ required: true })
  installmentNo: number;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: 0, min: 0 })
  paidAmount: number;

  @Prop({ required: true, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'], default: 'PENDING' })
  status: string;
}

export const FeeScheduleSchema = SchemaFactory.createForClass(FeeSchedule);
FeeScheduleSchema.index({ academyId: 1, studentId: 1, dueDate: 1 });
