import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' })
  discountType: 'PERCENTAGE' | 'FLAT';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0 })
  minOrderAmount: number;

  @Prop({ required: false })
  maxDiscountAmount?: number;

  @Prop({ type: [String], default: ['ALL'] })
  applicablePlans: string[];

  @Prop({ default: Date.now })
  validFrom: Date;

  @Prop({ required: false })
  validUntil?: Date;

  @Prop({ required: false })
  usageLimit?: number;

  @Prop({ default: 0 })
  timesUsed: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: '' })
  description?: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
