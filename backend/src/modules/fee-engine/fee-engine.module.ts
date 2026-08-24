import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { FeeEngineController } from './fee-engine.controller';
import { FeeEngineService } from './fee-engine.service';
import { FeeStructure, FeeStructureSchema } from '../../database/schemas/fee-structure.schema';
import { FeeSchedule, FeeScheduleSchema } from '../../database/schemas/fee-schedule.schema';
import { Student, StudentSchema } from '../../database/schemas/student.schema';
import { Payment, PaymentSchema } from '../../database/schemas/payment.schema';
import { Counter, CounterSchema } from '../../database/schemas/counter.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: FeeSchedule.name, schema: FeeScheduleSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Counter.name, schema: CounterSchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [FeeEngineController],
  providers: [FeeEngineService, TenantContextService],
  exports: [FeeEngineService],
})
export class FeeEngineModule {}
