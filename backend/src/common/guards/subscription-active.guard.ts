import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable()
export class SubscriptionActiveGuard implements CanActivate {
  constructor(
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const academyId = this.tenantContextService.academyId;
    const academy = await this.academyModel.findById(academyId).exec();

    if (!academy) {
      throw new ForbiddenException('Academy not found');
    }

    const now = new Date();
    if (academy.subscriptionStatus === 'ACTIVE') {
      if (academy.subscriptionEndsAt && academy.subscriptionEndsAt < now) {
        throw new ForbiddenException('Academy subscription has expired. Please renew your subscription.');
      }
      return true;
    }

    if (academy.subscriptionStatus === 'TRIAL') {
      if (academy.trialEndsAt && academy.trialEndsAt < now) {
        throw new ForbiddenException('14-day trial period has expired. Please subscribe to continue using PROHIT Educare.');
      }
      return true;
    }

    throw new ForbiddenException(`Academy subscription status is '${academy.subscriptionStatus}'. Access suspended.`);
  }
}
