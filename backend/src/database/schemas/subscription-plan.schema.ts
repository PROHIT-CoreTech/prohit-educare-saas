import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  slug: string;

  @Prop({ required: true, default: 0 })
  priceMonthly: number;

  @Prop({ required: false, default: 0 })
  priceYearly: number;

  @Prop({ required: false, default: 0 })
  originalPrice?: number; // Strike-through regular price for discounts/offers

  @Prop({ required: false, default: '' })
  offerBadge?: string; // e.g. "Save 20%", "Special Launch Offer"

  @Prop({ required: false, default: 'Up to 400 Students' })
  studentLimit?: string;

  @Prop({ required: true, default: 400 })
  maxStudents: number;

  @Prop({ required: true, default: 2 })
  maxBranches: number;

  @Prop({ required: false, default: 10 })
  maxStorageGb: number;

  @Prop({ required: false, default: '' })
  description?: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: false })
  popular: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
