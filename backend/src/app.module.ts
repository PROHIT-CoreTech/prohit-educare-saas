import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademiesModule } from './modules/academies/academies.module';
import { BillingModule } from './modules/billing/billing.module';
import { PlatformModule } from './modules/platform/platform.module';
import { FeeEngineModule } from './modules/fee-engine/fee-engine.module';
import { StudentsModule } from './modules/students/students.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ExamMarksModule } from './modules/exam-marks/exam-marks.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { RosterModule } from './modules/roster/roster.module';
import { FacultyAttendanceModule } from './modules/faculty-attendance/faculty-attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          configService.get<string>('MONGO_URI_DEVELOPMENT') ||
          'mongodb://localhost:27017/prohit-educare',
      }),
    }),
    AuthModule,
    AcademiesModule,
    BillingModule,
    PlatformModule,
    FeeEngineModule,
    StudentsModule,
    ClassesModule,
    ExamMarksModule,
    ReportsModule,
    FacultyModule,
    RosterModule,
    FacultyAttendanceModule,
  ],
})
export class AppModule {}
