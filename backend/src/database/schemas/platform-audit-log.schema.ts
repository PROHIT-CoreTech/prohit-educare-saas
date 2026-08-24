import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlatformAuditLogDocument = PlatformAuditLog & Document;

@Schema({ timestamps: true })
export class PlatformAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'PlatformUser', required: true })
  platformUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Academy', required: false })
  academyId?: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  @Prop()
  ipAddress?: string;
}

export const PlatformAuditLogSchema = SchemaFactory.createForClass(PlatformAuditLog);
