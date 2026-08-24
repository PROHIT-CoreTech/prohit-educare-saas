import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial-overview')
  getFinancialOverview() {
    return this.reportsService.getFinancialOverview();
  }

  @Get('recent-payments')
  getRecentPayments(@Query('limit') limit?: string) {
    return this.reportsService.getRecentPayments(limit ? parseInt(limit, 10) : 20);
  }
}
