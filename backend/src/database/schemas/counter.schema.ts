import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CounterDocument = Counter & Document;

@Schema({ timestamps: true })
export class Counter {
  @Prop({ required: true })
  _id: string; // e.g. receipt_65a123..._2026

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
