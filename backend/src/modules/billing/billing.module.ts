import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Academy.name, schema: AcademySchema }]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
