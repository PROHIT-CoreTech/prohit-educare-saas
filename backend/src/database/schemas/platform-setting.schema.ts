import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PlatformSettingDocument = PlatformSetting & Document;

@Schema({ timestamps: true })
export class PlatformSetting {
  @Prop({ required: true, unique: true, trim: true })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;
}

export const PlatformSettingSchema = SchemaFactory.createForClass(PlatformSetting);
