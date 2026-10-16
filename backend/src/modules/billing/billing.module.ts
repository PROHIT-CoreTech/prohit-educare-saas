import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

import { SubscriptionPlan, SubscriptionPlanSchema } from '../../database/schemas/subscription-plan.schema';
import { Coupon, CouponSchema } from '../../database/schemas/coupon.schema';
import { PlatformAuditLog, PlatformAuditLogSchema } from '../../database/schemas/platform-audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Academy.name, schema: AcademySchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: PlatformAuditLog.name, schema: PlatformAuditLogSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [BillingController],
  providers: [BillingService, TenantContextService],
  exports: [BillingService],
})
export class BillingModule {}
