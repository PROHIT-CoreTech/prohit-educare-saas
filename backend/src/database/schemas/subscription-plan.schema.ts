import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, default: 0 })
  priceMonthly: number;

  @Prop({ required: true, default: 0 })
  priceYearly: number;

  @Prop({ required: true, default: 500 })
  maxStudents: number;

  @Prop({ required: true, default: 10 })
  maxStorageGb: number;

  @Prop({ type: [String], default: [] })
  features: string[];
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
