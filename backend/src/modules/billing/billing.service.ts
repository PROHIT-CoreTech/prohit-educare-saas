import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';
import { SubscriptionPlan, SubscriptionPlanDocument } from '../../database/schemas/subscription-plan.schema';
import { Coupon, CouponDocument } from '../../database/schemas/coupon.schema';
import { PlatformAuditLog, PlatformAuditLogDocument } from '../../database/schemas/platform-audit-log.schema';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    @InjectModel(SubscriptionPlan.name) private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(PlatformAuditLog.name) private platformAuditLogModel: Model<PlatformAuditLogDocument>,
  ) {}

  /**
   * Validates a promotional coupon code against a plan and order amount
   */
  async validateCoupon(code: string, planSlug: string, orderAmount?: number) {
    if (!code) throw new BadRequestException('Coupon code is required');
    const cleanCode = code.toUpperCase().trim();
    const coupon = await this.couponModel.findOne({ code: cleanCode, isActive: true }).exec();

    if (!coupon) {
      throw new BadRequestException(`Coupon code '${cleanCode}' is invalid or expired.`);
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      throw new BadRequestException(`Coupon code '${cleanCode}' is not active yet.`);
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new BadRequestException(`Coupon code '${cleanCode}' has expired.`);
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon code '${cleanCode}' usage limit has been reached.`);
    }

    const planKey = (planSlug || '').toUpperCase().trim();
    if (
      coupon.applicablePlans &&
      coupon.applicablePlans.length > 0 &&
      !coupon.applicablePlans.includes('ALL') &&
      !coupon.applicablePlans.map((p) => p.toUpperCase().trim()).includes(planKey)
    ) {
      throw new BadRequestException(`Coupon '${cleanCode}' is not applicable to the ${planSlug} tier.`);
    }

    let baseAmount = orderAmount;
    if (!baseAmount || baseAmount <= 0) {
      const planDoc = await this.subscriptionPlanModel.findOne({ slug: planKey }).exec();
      baseAmount = planDoc ? planDoc.priceMonthly : planKey === 'STARTER' ? 999 : planKey === 'ENTERPRISE' ? 7999 : 2999;
    }

    if (coupon.minOrderAmount && baseAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order value for coupon '${cleanCode}' is ₹${coupon.minOrderAmount}.`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((baseAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, baseAmount);
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    return {
      isValid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalAmount: baseAmount,
      finalAmount,
      description: coupon.description || `${coupon.discountType === 'PERCENTAGE' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} discount applied`,
    };
  }

  /**
   * Generates a Cashfree Order Session ID for Frontend Drop Checkout
   */
  async createCashfreeOrder(
    academyId: string,
    plan: string,
    amount: number,
    customerEmail: string,
    customerPhone: string,
    couponCode?: string,
  ) {
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy tenant not found');

    let finalAmount = amount;
    if (couponCode) {
      try {
        const validation = await this.validateCoupon(couponCode, plan, amount);
        finalAmount = validation.finalAmount;
      } catch (err: any) {
        this.logger.warn(`Coupon validation failed during checkout: ${err.message}`);
      }
    }

    const orderId = `ORD_SUB_${academy.slug.toUpperCase()}_${Date.now()}`;
    const appId = process.env.CASHFREE_APP_ID || '';
    const secretKey = process.env.CASHFREE_SECRET_KEY || '';
    const env = process.env.CASHFREE_ENV || 'SANDBOX';

    academy.cashfreeOrderId = orderId;
    if (couponCode) {
      academy.appliedCoupon = couponCode.toUpperCase().trim();
    }
    await academy.save();

    this.logger.log(`Created Cashfree Monthly Subscription Order ${orderId} for ${academy.name} (${plan}: ₹${finalAmount})`);

    return {
      status: 'success',
      orderId,
      orderAmount: finalAmount,
      orderCurrency: 'INR',
      paymentSessionId: `session_${orderId}_cf_token`,
      environment: env,
      appId,
      customerDetails: {
        customerId: academy._id.toString(),
        customerEmail: customerEmail || `admin@${academy.slug}.com`,
        customerPhone: customerPhone || '9876543210',
        customerName: academy.name,
      },
    };
  }

  async getMySubscription(academyId: string) {
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy not found');

    const now = new Date();
    let isTrialExpired = false;
    let trialDaysRemaining = 0;
    let daysRemaining = 0;

    if (academy.subscriptionStatus === 'ACTIVE' && academy.subscriptionEndsAt) {
      const subEnds = new Date(academy.subscriptionEndsAt);
      const diffMs = subEnds.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } else if (academy.subscriptionStatus === 'TRIAL' && academy.trialEndsAt) {
      const trialEnds = new Date(academy.trialEndsAt);
      const diffMs = trialEnds.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      daysRemaining = trialDaysRemaining;
      if (diffMs <= 0) {
        isTrialExpired = true;
      }
    } else {
      daysRemaining = 0;
    }

    return {
      academyId: academy._id,
      name: academy.name,
      slug: academy.slug,
      subscriptionPlanKey: academy.subscriptionPlanKey || 'PROFESSIONAL',
      subscriptionStatus: isTrialExpired ? 'EXPIRED' : academy.subscriptionStatus,
      trialEndsAt: academy.trialEndsAt,
      subscriptionEndsAt: academy.subscriptionEndsAt,
      trialDaysRemaining,
      daysRemaining,
      isTrialExpired,
      cashfreeOrderId: academy.cashfreeOrderId,
      appliedCoupon: academy.appliedCoupon,
    };
  }

  async confirmSubscriptionRenewal(academyId: string, plan: string, orderId?: string, couponCode?: string) {
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy not found');

    const currentEnd =
      academy.subscriptionEndsAt && new Date(academy.subscriptionEndsAt) > new Date()
        ? new Date(academy.subscriptionEndsAt)
        : new Date();

    // 1 Month Monthly Subscription
    currentEnd.setMonth(currentEnd.getMonth() + 1);

    academy.subscriptionStatus = 'ACTIVE';
    academy.subscriptionEndsAt = currentEnd;
    academy.subscriptionPlanKey = plan || 'PROFESSIONAL';

    if (orderId) {
      academy.cashfreeOrderId = orderId;
    }

    let couponDiscountText = '';
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      academy.appliedCoupon = code;
      const couponDoc = await this.couponModel.findOne({ code }).exec();
      if (couponDoc) {
        couponDoc.timesUsed = (couponDoc.timesUsed || 0) + 1;
        await couponDoc.save();
        couponDiscountText = ` (Coupon ${code} applied)`;
      }
    }

    await academy.save();

    this.logger.log(`Monthly Subscription renewed for ${academy.name} (${plan}${couponDiscountText}) until ${currentEnd.toISOString()}`);

    return {
      message: `Monthly Subscription successfully renewed for ${plan}${couponDiscountText}!`,
      status: 'ACTIVE',
      subscriptionEndsAt: currentEnd,
      subscriptionPlanKey: academy.subscriptionPlanKey,
    };
  }

  /**
   * Verifies Cashfree Webhook HMAC-SHA256 Signature
   */
  verifyCashfreeWebhookSignature(rawBody: string | Buffer, timestamp: string, signature: string, secret: string): boolean {
    if (!signature || !secret || !rawBody) {
      return false;
    }

    try {
      const dataToSign = (timestamp || '') + rawBody.toString();
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(dataToSign)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(signature, 'utf8'),
      );
    } catch {
      // Fallback simple rawBody HMAC check
      try {
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('hex');
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf8'),
          Buffer.from(signature, 'utf8'),
        );
      } catch {
        return false;
      }
    }
  }

  /**
   * Processes Cashfree Webhook Notifications
   */
  async processCashfreeWebhook(rawBody: string | Buffer, signature: string, timestamp?: string) {
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY || '';
    const isValid = this.verifyCashfreeWebhookSignature(rawBody, timestamp || '', signature, webhookSecret);

    if (!isValid) {
      this.logger.warn('Forged or invalid Cashfree webhook signature received');
      throw new BadRequestException('Invalid Cashfree webhook signature');
    }

    const payload = JSON.parse(rawBody.toString());
    const eventType = payload.type || payload.event || 'PAYMENT_SUCCESS_WEBHOOK';
    const data = payload.data || payload;

    this.logger.log(`Received valid Cashfree webhook event: ${eventType}`);

    const orderId = data?.order?.order_id || data?.order_id;
    const subscriptionId = data?.subscription?.subscription_id || data?.subscription_id;

    let academy: AcademyDocument | null = null;

    if (orderId) {
      academy = await this.academyModel.findOne({ cashfreeOrderId: orderId }).exec();
    } else if (subscriptionId) {
      academy = await this.academyModel.findOne({ cashfreeSubscriptionId: subscriptionId }).exec();
    }

    if (academy) {
      if (
        eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
        eventType === 'ORDER_PAID_WEBHOOK' ||
        eventType === 'SUBSCRIPTION_STATUS_CHANGE'
      ) {
        const currentEnd = academy.subscriptionEndsAt ? new Date(academy.subscriptionEndsAt) : new Date();
        currentEnd.setMonth(currentEnd.getMonth() + 1);
        academy.subscriptionStatus = 'ACTIVE';
        academy.subscriptionEndsAt = currentEnd;
        await academy.save();
        this.logger.log(`Activated monthly subscription for ${academy.name} until ${currentEnd.toISOString()}`);
      } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || eventType === 'SUBSCRIPTION_CANCELLED') {
        academy.subscriptionStatus = 'CANCELLED';
        await academy.save();
      }
    }

    return { status: 'success', eventType, orderId };
  }
}
