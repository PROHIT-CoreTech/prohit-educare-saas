import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface PaymentAllocation {
  feeScheduleId: Types.ObjectId;
  allocatedAmount: number;
}

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  receiptNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  paymentDate: Date;

  @Prop({ required: true, min: 0 })
  totalAmountPaid: number;

  @Prop({ required: true, enum: ['CASH', 'ONLINE', 'UPI', 'CHEQUE', 'BANK_TRANSFER'], default: 'UPI' })
  paymentMode: string;

  @Prop({ default: '' })
  transactionRef: string;

  @Prop({
    type: [
      {
        feeScheduleId: { type: Types.ObjectId, ref: 'FeeSchedule', required: true },
        allocatedAmount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  allocations: PaymentAllocation[];

  @Prop({ required: true, default: 0, min: 0 })
  advanceAdded: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdByUserId?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ academyId: 1, receiptNumber: 1 }, { unique: true });
