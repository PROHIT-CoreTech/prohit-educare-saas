'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Check,
  CreditCard,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Lock,
  Zap,
  Award,
  Layers,
  Tag,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import { PricingPlan, DEFAULT_PLANS, fetchPublicPlans } from '../../../../lib/pricing-plans';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('PROFESSIONAL');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponValidating, setCouponValidating] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string>('');
  const [showOfflineNoticeModal, setShowOfflineNoticeModal] = useState<boolean>(false);
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] = useState<PricingPlan | null>(null);

  useEffect(() => {
    fetchSubscription();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await fetchPublicPlans();
      if (data && data.length > 0) {
        setPlans(data);
      }
    } catch (err) {
      console.error('Failed to load dynamic plans, using defaults', err);
    }
  };

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/billing/my-subscription');
      setSubscription(res.data);
      if (res.data?.subscriptionPlanKey) {
        setSelectedPlanId(res.data.subscriptionPlanKey);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (planKey?: string) => {
    const targetPlanKey = planKey || selectedPlanId;
    const plan = plans.find((p) => (p.slug || p.key) === targetPlanKey) || plans[1] || plans[0];
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponValidating(true);
    setCouponError('');
    try {
      const res = await apiClient.post('/billing/validate-coupon', {
        code,
        plan: plan.slug || plan.key,
        amount: plan.priceMonthly,
      });

      if (res.data?.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discountType: res.data.discountType,
          discountValue: res.data.discountValue,
          discountAmount: res.data.discountAmount,
          finalAmount: res.data.finalAmount,
        });
        setCouponError('');
      } else {
        setCouponError(res.data?.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleInitiateRenewal = (plan: PricingPlan) => {
    setSelectedPlanForRenewal(plan);
    setShowOfflineNoticeModal(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Academy SaaS Subscription &amp; Billing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Monthly Subscription &amp; Plan Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Flexible monthly plans, discount coupons, and payment gateway activation
          </p>
        </div>

        {subscription && (
          <div className="flex items-center space-x-3 bg-white border border-slate-200 p-3 px-5 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase">Current Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                subscription.subscriptionStatus === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : subscription.subscriptionStatus === 'TRIAL'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {subscription.subscriptionStatus}
            </span>
          </div>
        )}
      </div>

      {/* Subscription Overview Card */}
      {subscription && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academy Tenant</span>
              <p className="text-xl font-black text-slate-900">{subscription.name}</p>
              <span className="text-xs text-orange-600 font-mono font-bold block">{subscription.slug}.prohiteducare.com</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trial / Monthly Countdown</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {subscription.subscriptionStatus === 'TRIAL'
                    ? `${subscription.trialDaysRemaining} Days Left`
                    : subscription.subscriptionStatus === 'ACTIVE'
                    ? 'Active'
                    : 'Expired'}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {subscription.subscriptionStatus === 'TRIAL'
                  ? `Trial Ends on ${formatDate(subscription.trialEndsAt)}`
                  : `Renews on ${formatDate(subscription.subscriptionEndsAt)}`}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Model</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <p className="text-lg font-extrabold text-emerald-700">Monthly Recurring</p>
              </div>
              <span className="text-xs text-slate-500 font-medium block">Zero Lock-in &bull; Cancel Anytime</span>
            </div>
          </div>

          {(subscription.isTrialExpired || subscription.subscriptionStatus === 'EXPIRED') && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <p className="text-xs font-bold">
                  Your 14-day free trial has expired. Select a monthly plan below to restore full platform privileges.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Promotional Coupon Apply Bar */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Have a promotional discount coupon?</h4>
            <p className="text-xs text-slate-600 font-medium">
              Apply coupon codes (e.g. <span className="font-mono font-bold text-orange-600">WELCOME20</span>) for instant monthly subscription discounts.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {appliedCoupon ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Applied: <strong className="font-mono">{appliedCoupon.code}</strong> ({appliedCoupon.discountType === 'PERCENT' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
              </span>
              <button
                onClick={handleRemoveCoupon}
                className="text-xs text-rose-600 hover:text-rose-800 underline ml-2 cursor-pointer font-bold"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono font-bold uppercase focus:outline-hidden focus:border-orange-500 w-full sm:w-44 text-slate-900"
              />
              <button
                onClick={() => handleApplyCoupon()}
                disabled={couponValidating}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm transition cursor-pointer flex-shrink-0 disabled:opacity-50"
              >
                {couponValidating ? 'Checking...' : 'Apply Code'}
              </button>
            </div>
          )}
        </div>
      </div>
      {couponError && (
        <div className="text-xs font-bold text-rose-600 flex items-center space-x-1.5 px-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{couponError}</span>
        </div>
      )}

      {/* Plan Selection Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Select Monthly Subscription Tier</h2>
          <p className="text-xs text-slate-500 font-medium">
            Dynamic monthly pricing managed via Platform Admin Console. Billed monthly with zero lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const hasDiscount = plan.originalPrice && plan.originalPrice > plan.priceMonthly;
            const effectiveMonthly = appliedCoupon
              ? appliedCoupon.discountType === 'PERCENT'
                ? Math.round(plan.priceMonthly * (1 - appliedCoupon.discountValue / 100))
                : Math.max(0, plan.priceMonthly - appliedCoupon.discountValue)
              : plan.priceMonthly;

            return (
              <div
                key={plan.slug || plan.key || plan.name}
                className={`bg-white border rounded-3xl p-6 shadow-sm relative flex flex-col justify-between space-y-6 transition ${
                  plan.popular ? 'border-2 border-orange-500 shadow-md bg-orange-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  {plan.popular ? (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  ) : <span />}

                  {plan.offerBadge && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {plan.offerBadge}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{plan.studentLimit}</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{plan.description}</p>
                  </div>

                  <div className="border-t border-b border-slate-200 py-4">
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through font-mono font-semibold block mb-0.5">
                        ₹{plan.originalPrice?.toLocaleString('en-IN')} / month
                      </span>
                    )}

                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ₹{effectiveMonthly.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>

                    {appliedCoupon ? (
                      <span className="text-xs text-emerald-600 font-bold block mt-1 font-mono">
                        Coupon &quot;{appliedCoupon.code}&quot; applied (-₹{(plan.priceMonthly - effectiveMonthly).toLocaleString('en-IN')})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 mt-1 block font-mono font-semibold">
                        Monthly auto-renewal &bull; Cancel anytime
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleInitiateRenewal(plan)}
                  disabled={processing}
                  className={`w-full font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm cursor-pointer ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {subscription?.subscriptionStatus === 'EXPIRED' ? 'Activate Monthly Subscription' : 'Renew / Subscribe (Offline Mode)'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline Sales Mode Notice Modal */}
      {showOfflineNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-5 text-center">
            <button
              onClick={() => setShowOfflineNoticeModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
            >
              ✕
            </button>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Monthly Renewal for {selectedPlanForRenewal?.name || 'Selected Tier'}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Online payment gateway renewal is in offline sales mode. Please share your coupon code &amp; academy ID with your PROHIT Account Manager to renew or upgrade your monthly subscription instantly.
              </p>
            </div>

            {selectedPlanForRenewal && (
              <div className="bg-orange-50/50 border border-orange-200 p-3 rounded-2xl text-xs text-left space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Selected Plan:</span>
                  <span className="font-bold text-slate-900">{selectedPlanForRenewal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Rate:</span>
                  <span className="font-mono font-bold text-orange-600">
                    ₹{selectedPlanForRenewal.priceMonthly.toLocaleString('en-IN')} / month
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 pt-1 border-t border-orange-200/60">
                    <span className="font-semibold">Discount Applied ({appliedCoupon.code}):</span>
                    <span className="font-mono font-black">
                      ₹{appliedCoupon.discountType === 'PERCENT'
                        ? Math.round(selectedPlanForRenewal.priceMonthly * (1 - appliedCoupon.discountValue / 100)).toLocaleString('en-IN')
                        : Math.max(0, selectedPlanForRenewal.priceMonthly - appliedCoupon.discountValue).toLocaleString('en-IN')} / month
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-600 font-mono space-y-1 text-left">
              <p><span className="font-bold text-slate-800">Product Support:</span> PROHIT CoreTech</p>
              <p><span className="font-bold text-slate-800">Phone:</span> +91 97739 69033</p>
              <p><span className="font-bold text-slate-800">Email:</span> info@prohitcoretech.com</p>
            </div>
            <button
              onClick={() => setShowOfflineNoticeModal(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md transition text-xs cursor-pointer"
            >
              Understand &amp; Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
