import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../services/tenant-context.service';
import { hasExamMarksAccess } from '../utils/subscription-plan.util';

@Injectable()
export class ExamTierGuard implements CanActivate {
  constructor(
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const academyId = this.tenantContextService.academyId;
    const academy = await this.academyModel.findById(academyId).exec();

    if (!academy) {
      throw new ForbiddenException('Academy tenant not found');
    }

    const planKey = (academy as any)?.subscriptionPlanKey || (academy.subscriptionStatus === 'TRIAL' ? 'TRIAL' : 'STARTER');

    if (!hasExamMarksAccess(planKey, academy.subscriptionStatus)) {
      throw new ForbiddenException(
        'Student Test Results & Academic Examination feature is available exclusively on Professional Tier and Enterprise Tier. Upgrade your subscription plan to unlock this feature.',
      );
    }

    return true;
  }
}
