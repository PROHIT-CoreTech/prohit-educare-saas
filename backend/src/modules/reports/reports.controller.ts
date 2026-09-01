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

  @Get('paginated-payments')
  getPaginatedPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('standard') standard?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPaginatedPayments({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      standard,
      startDate,
      endDate,
    });
  }

  @Get('trend-analytics')
  getTrendAnalytics(
    @Query('resolution') resolution?: 'Daily' | 'Monthly' | 'Yearly' | '3-Year' | '5-Year',
    @Query('standard') standard?: string,
  ) {
    return this.reportsService.getTrendAnalytics(resolution || 'Monthly', standard);
  }

  @Get('profit-and-loss')
  getProfitAndLoss(@Query('interval') interval?: 'Monthly' | 'Quarterly' | 'Yearly') {
    return this.reportsService.getProfitAndLoss(interval || 'Monthly');
  }
}
