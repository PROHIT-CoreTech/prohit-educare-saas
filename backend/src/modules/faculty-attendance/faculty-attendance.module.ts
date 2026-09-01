import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FacultyAttendanceController } from './faculty-attendance.controller';
import { FacultyAttendanceService } from './faculty-attendance.service';
import { FacultyAttendance, FacultyAttendanceSchema } from '../../database/schemas/faculty-attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FacultyAttendance.name, schema: FacultyAttendanceSchema },
    ]),
  ],
  controllers: [FacultyAttendanceController],
  providers: [FacultyAttendanceService],
  exports: [FacultyAttendanceService],
})
export class FacultyAttendanceModule {}
