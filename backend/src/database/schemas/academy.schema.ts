import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AcademyDocument = Academy & Document;

@Schema({ timestamps: true })
export class Academy {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: '#f97316' })
  primaryColor: string;

  @Prop({ default: '' })
  directorName?: string;

  @Prop({ default: '' })
  directorSignatureUrl?: string;

  @Prop({ default: '' })
  phone?: string;

  @Prop({ default: '' })
  email?: string;

  @Prop({ default: '' })
  address?: string;

  @Prop({ default: 'High School' })
  institutionType?: string;

  @Prop({ type: [String], default: ['High School'] })
  institutionTypes?: string[];

  @Prop({ default: 'SSC / State Board' })
  educationBoard?: string;

  @Prop({ type: [String], default: ['SSC / State Board'] })
  educationBoards?: string[];

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: false })
  planId?: Types.ObjectId;

  @Prop({ required: true, enum: ['TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED'], default: 'TRIAL' })
  subscriptionStatus: string;

  @Prop({ required: true })
  trialEndsAt: Date;

  @Prop({ required: false })
  subscriptionEndsAt?: Date;

  @Prop({ required: false })
  cashfreeCustomerId?: string;

  @Prop({ required: false })
  cashfreeSubscriptionId?: string;

  @Prop({ required: false })
  cashfreeOrderId?: string;

  @Prop({ required: false })
  razorpayCustomerId?: string;

  @Prop({ required: false })
  razorpaySubscriptionId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AcademySchema = SchemaFactory.createForClass(Academy);
