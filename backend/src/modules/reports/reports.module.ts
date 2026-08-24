import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { FeeSchedule, FeeScheduleSchema } from '../../database/schemas/fee-schedule.schema';
import { Payment, PaymentSchema } from '../../database/schemas/payment.schema';
import { Student, StudentSchema } from '../../database/schemas/student.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeSchedule.name, schema: FeeScheduleSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, TenantContextService],
  exports: [ReportsService],
})
export class ReportsModule {}
