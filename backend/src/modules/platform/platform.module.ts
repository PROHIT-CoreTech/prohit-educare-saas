import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { PlatformUser, PlatformUserSchema } from '../../database/schemas/platform-user.schema';
import { PlatformAuditLog, PlatformAuditLogSchema } from '../../database/schemas/platform-audit-log.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { Student, StudentSchema } from '../../database/schemas/student.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Payment, PaymentSchema } from '../../database/schemas/payment.schema';
import { FeeSchedule, FeeScheduleSchema } from '../../database/schemas/fee-schedule.schema';
import { ClassBatch, ClassBatchSchema } from '../../database/schemas/class-batch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformUser.name, schema: PlatformUserSchema },
      { name: PlatformAuditLog.name, schema: PlatformAuditLogSchema },
      { name: Academy.name, schema: AcademySchema },
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: FeeSchedule.name, schema: FeeScheduleSchema },
      { name: ClassBatch.name, schema: ClassBatchSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
