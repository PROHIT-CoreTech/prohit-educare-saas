import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FacultyAttendanceDocument = FacultyAttendance & Document;

@Schema({ timestamps: true })
export class FacultyAttendance {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, type: Date, index: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true, index: true })
  facultyId: Types.ObjectId;

  @Prop({ required: true, enum: ['PRESENT', 'ABSENT', 'SUBSTITUTED'], default: 'PRESENT' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: false })
  substituteFacultyId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  slots: string[];

  @Prop({ required: false, trim: true })
  notes?: string;
}

export const FacultyAttendanceSchema = SchemaFactory.createForClass(FacultyAttendance);
FacultyAttendanceSchema.index({ academyId: 1, date: 1, facultyId: 1 }, { unique: true });
