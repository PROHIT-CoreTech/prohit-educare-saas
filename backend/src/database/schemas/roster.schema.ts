import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RosterDocument = Roster & Document;

@Schema({ _id: false })
export class DaySchedule {
  @Prop({ required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] })
  day: string;

  @Prop({ type: [String], default: [] })
  slots: string[];
}

@Schema({ timestamps: true })
export class Roster {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true, index: true })
  facultyId: Types.ObjectId;

  @Prop({
    type: [
      {
        day: { type: String, required: true },
        slots: { type: [String], default: [] },
      },
    ],
    default: [],
  })
  weeklySchedule: DaySchedule[];
}

export const RosterSchema = SchemaFactory.createForClass(Roster);
RosterSchema.index({ academyId: 1, facultyId: 1 }, { unique: true });
