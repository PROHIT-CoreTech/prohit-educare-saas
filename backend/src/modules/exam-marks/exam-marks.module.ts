import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ExamMarksController } from './exam-marks.controller';
import { ExamMarksService } from './exam-marks.service';
import { ExamMark, ExamMarkSchema } from '../../database/schemas/exam-mark.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExamMark.name, schema: ExamMarkSchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [ExamMarksController],
  providers: [ExamMarksService, TenantContextService],
  exports: [ExamMarksService],
})
export class ExamMarksModule {}
