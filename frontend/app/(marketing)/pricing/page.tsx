'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, ArrowRight, ShieldCheck, Sparkles, HelpCircle, 
  CreditCard, ArrowLeft, Zap, Building2, Users, Tag 
} from 'lucide-react';
import ComplianceNavbar from '../components/ComplianceNavbar';
import ComplianceFooter from '../components/ComplianceFooter';
import PromoAnnouncementBanner from '../components/PromoAnnouncementBanner';
import { PricingPlan, DEFAULT_PLANS, fetchPublicPlans } from '../../../lib/pricing-plans';

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicPlans()
      .then((data) => {
        if (data && data.length > 0) {
          setPlans(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans flex flex-col justify-between">
      <PromoAnnouncementBanner />
      <ComplianceNavbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="inline-flex items-center space-x-1.5 bg-orange-100 text-orange-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>100% Transparent Monthly INR Pricing</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Flexible Monthly Plans for Every Academy Size
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-slate-600 font-medium">
              Zero annual lock-in. Start with a 14-day full-access trial, then subscribe monthly with Cashfree Payment Gateway security. Cancel anytime.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {plans.map((plan) => {
              const isPopular = plan.popular;
              const hasDiscount = plan.originalPrice && plan.originalPrice > plan.priceMonthly;

              return (
                <div
                  key={plan.slug || plan.name}
                  className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition relative shadow-sm ${
                    isPopular
                      ? 'border-2 border-orange-500 shadow-xl bg-gradient-to-b from-orange-50/20 to-white'
                      : 'border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                      {plan.offerBadge || 'Most Popular'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {plan.studentLimit || (plan.maxStudents > 0 ? `Up to ${plan.maxStudents} Students` : 'Unlimited Students')}
                      </span>
                      {hasDiscount && !isPopular && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {plan.offerBadge || 'Special Offer'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-slate-500 font-medium mt-1">{plan.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {hasDiscount && (
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-400 line-through font-mono font-semibold">
                            ₹{plan.originalPrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                            {plan.offerBadge || 'Discounted'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline mt-1">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">
                          ₹{plan.priceMonthly.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-500 text-sm ml-2 font-medium">/ month</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1.5 font-medium">
                        Billed monthly • Cancel anytime
                      </p>
                    </div>

                    <ul className="mt-6 sm:mt-8 space-y-3 text-xs sm:text-sm text-slate-700 font-medium border-t border-slate-100 pt-5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/?plan=${plan.slug}#pricing`}
                    className={`mt-6 sm:mt-8 w-full font-bold py-3.5 rounded-2xl transition text-center text-xs sm:text-sm block cursor-pointer ${
                      isPopular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                    }`}
                  >
                    Subscribe to {plan.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Payment Gateway Trust Badge */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Secured Online Checkout via Cashfree</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  We accept UPI (Google Pay, PhonePe, Paytm), Net Banking (50+ Indian banks), and all major Credit/Debit cards. Zero sensitive payment information is stored on our servers.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>PCI-DSS Level 1 Verified</span>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-center">Frequently Asked Billing Questions</h2>
            
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-slate-900">How does the monthly subscription work?</h4>
                <p className="text-slate-600">
                  All subscriptions are billed on a flexible monthly basis with zero annual lock-in. You can renew your subscription month-to-month, apply valid coupon codes for promotional discounts, and pause or cancel anytime from your academy portal.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-slate-900">How does the 14-day free trial work?</h4>
                <p className="text-slate-600">
                  You get immediate access to all features on your custom subdomain upon signing up. No payment method or credit card is required. You can upgrade to a paid monthly plan anytime during or after your trial.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-slate-900">Can I apply promo coupons or discount offers?</h4>
                <p className="text-slate-600">
                  Yes! During monthly renewal or checkout, enter your promo coupon code (e.g. WELCOME20) into the coupon box. The discount is calculated and subtracted instantly before routing to the secure Cashfree checkout.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-slate-900">Are prices inclusive of applicable taxes?</h4>
                <p className="text-slate-600">
                  All prices listed are in Indian Rupees (INR). Applicable GST invoices with full input tax credit (ITC) details are generated automatically upon successful Cashfree payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComplianceFooter />
    </div>
  );
}
