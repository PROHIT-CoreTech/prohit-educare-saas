import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AcademyAuditLogDocument = AcademyAuditLog & Document;

@Schema({ timestamps: true })
export class AcademyAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  @Prop()
  ipAddress?: string;
}

export const AcademyAuditLogSchema = SchemaFactory.createForClass(AcademyAuditLog);
