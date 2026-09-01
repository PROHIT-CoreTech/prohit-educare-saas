import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { FacultyAttendanceController } from './faculty-attendance.controller';
import { FacultyAttendanceService } from './faculty-attendance.service';
import { FacultyAttendance, FacultyAttendanceSchema } from '../../database/schemas/faculty-attendance.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FacultyAttendance.name, schema: FacultyAttendanceSchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [FacultyAttendanceController],
  providers: [FacultyAttendanceService, TenantContextService],
  exports: [FacultyAttendanceService],
})
export class FacultyAttendanceModule {}
