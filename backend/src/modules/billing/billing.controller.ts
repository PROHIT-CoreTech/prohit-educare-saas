import { Controller, Post, Body, Headers, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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
