import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassBatchDocument = ClassBatch & Document;

@Schema({ timestamps: true })
export class ClassBatch {
  @Prop({ type: Types.ObjectId, ref: 'Academy', required: true, index: true })
  academyId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 12 })
  standard: number;

  @Prop({ required: true, enum: ['english', 'marathi', 'semi_english', 'hindi'] })
  medium: string;

  @Prop({ required: false, enum: ['science', 'commerce', 'arts', 'none'], default: 'none' })
  section: string;

  @Prop({ required: true, trim: true })
  batchName: string;
}

export const ClassBatchSchema = SchemaFactory.createForClass(ClassBatch);
ClassBatchSchema.index({ academyId: 1, standard: 1, medium: 1, section: 1 }, { unique: true });

ClassBatchSchema.pre('save', function (next) {
  if (this.standard >= 11) {
    if (this.medium !== 'english') {
      return next(new Error('For standard 11 and above, medium must be locked to "english"'));
    }
    if (!this.section || this.section === 'none' || !['science', 'commerce', 'arts'].includes(this.section)) {
      return next(new Error('For standard 11 and above, section (science, commerce, or arts) is required'));
    }
  } else {
    if (!this.section) {
      this.section = 'none';
    }
  }
  next();
});
