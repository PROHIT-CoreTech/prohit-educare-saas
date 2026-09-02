import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface InstallmentBreakdown {
  installmentNo: number;
  dueDate: Date;
  amount: number;
}

export type FeeStructureDocument = FeeStructure & Document;

@Schema({ timestamps: true })
export class FeeStructure {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true })
  standard: number;

  @Prop({ required: false, enum: ['marathi', 'semi_english', 'english', 'hindi'], default: 'english' })
  medium: string;

  @Prop({ required: false, enum: ['science', 'commerce', 'arts', 'none'], default: 'none' })
  stream: string;

  @Prop({ required: false, default: '' })
  board?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true, min: 1 })
  installmentsCount: number;

  @Prop({
    type: [
      {
        installmentNo: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  installmentBreakdown: InstallmentBreakdown[];
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
