import { Controller, Post, Get, Body, Headers, Req, HttpCode, HttpStatus, BadRequestException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @UseGuards(AcademyAuthGuard)
  @Get('my-subscription')
  async getMySubscription() {
    const academyId = this.tenantContextService.academyId.toString();
    return this.billingService.getMySubscription(academyId);
  }

  @UseGuards(AcademyAuthGuard)
  @Post('renew-subscription')
  async renewSubscription(@Body() body: { plan: string; amount: number; customerEmail?: string; customerPhone?: string }) {
    const academyId = this.tenantContextService.academyId.toString();
    return this.billingService.createCashfreeOrder(
      academyId,
      body.plan || 'PROFESSIONAL',
      body.amount || 35988,
      body.customerEmail || '',
      body.customerPhone || '',
    );
  }

  @UseGuards(AcademyAuthGuard)
  @Post('verify-renewal')
  async verifyRenewal(@Body() body: { plan: string; orderId?: string }) {
    const academyId = this.tenantContextService.academyId.toString();
    return this.billingService.confirmSubscriptionRenewal(academyId, body.plan, body.orderId);
  }

  @Post('create-cashfree-order')
  async createCashfreeOrder(
    @Body()
    body: {
      academyId: string;
      plan: string;
      amount: number;
      customerEmail: string;
      customerPhone: string;
    },
  ) {
    return this.billingService.createCashfreeOrder(
      body.academyId,
      body.plan,
      body.amount,
      body.customerEmail,
      body.customerPhone,
    );
  }

  @Post('webhook/cashfree')
  @HttpCode(HttpStatus.OK)
  async handleCashfreeWebhook(
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-timestamp') timestamp: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    if (!signature) {
      throw new BadRequestException('Missing x-webhook-signature header');
    }
    return this.billingService.processCashfreeWebhook(rawBody, signature, timestamp);
  }
}
