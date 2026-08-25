'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Check, CreditCard, Calendar, Clock, AlertCircle, RefreshCw, Lock, Zap, Award, Layers } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

const SUBSCRIPTION_PLANS = [
  {
    id: 'STARTER',
    name: 'Starter Tier',
    monthlyPrice: 999,
    annualPrice: 11988,
    studentLimit: 'Up to 200 Students',
    description: 'Perfect for local coaching classes & independent single-branch academies.',
    features: [
      'Single Branch Academy Management',
      'Atomic FIFO Fee Engine',
      'Student Roster & Contact Profiles',
      'Basic Financial & Fee Reports',
      'Digital Canvas Receipt Generation',
    ],
    popular: false,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional Tier',
    monthlyPrice: 2999,
    annualPrice: 35988,
    studentLimit: 'Up to 1,000 Students',
    description: 'Ideal for growing academies needing full academic batch management & analytics.',
    features: [
      'All Starter Tier Features',
      'Academics & Batch Stream Locks (Science/Commerce/Arts)',
      'Multiple Batch Schedules (Morning/Afternoon)',
      'Advance Credit Balance Auto-Settlement',
      'Audit-Ready Financial Statements PDF',
      'Priority Platform Email Support',
    ],
    popular: true,
    color: 'from-indigo-600 to-violet-600',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Tier',
    monthlyPrice: 7999,
    annualPrice: 95988,
    studentLimit: 'Unlimited Multi-Branch Students',
    description: 'For large educational chains requiring custom domain aliases & master admin inspection.',
    features: [
      'All Professional Tier Features',
      'Unlimited Students & Multi-Branch Support',
      'Master Admin Console Integration',
      'Custom Subdomain & Primary Color Branding',
      'Dedicated Account Manager & 24/7 SLA Support',
      'Raw MongoDB Data Dump Exports',
    ],
    popular: false,
    color: 'from-violet-600 to-rose-600',
  },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('PROFESSIONAL');
  const [checkoutModal, setCheckoutModal] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string>('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/billing/my-subscription');
      setSubscription(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateRenewal = async (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[1];
    setProcessing(true);
    setPaymentSuccess('');
    try {
      const res = await apiClient.post('/billing/renew-subscription', {
        plan: plan.id,
        amount: plan.annualPrice,
      });

      setCheckoutModal({
        orderId: res.data.orderId,
        amount: res.data.orderAmount,
        plan: plan.id,
        planName: plan.name,
        environment: res.data.environment || 'SANDBOX',
        sessionId: res.data.paymentSessionId,
      });
    } catch (err: any) {
      alert('Order creation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!checkoutModal) return;
    setProcessing(true);
    try {
      const res = await apiClient.post('/billing/verify-renewal', {
        plan: checkoutModal.plan,
        orderId: checkoutModal.orderId,
      });

      setPaymentSuccess(res.data.message || 'Subscription successfully renewed!');
      fetchSubscription();
      setTimeout(() => {
        setCheckoutModal(null);
        setPaymentSuccess('');
      }, 2500);
    } catch (err: any) {
      alert('Payment activation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Academy SaaS Subscription & Billing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Subscription & Plan Management</h1>
          <p className="text-sm text-slate-400">View license status, trial period, and renew online via Cashfree Gateway</p>
        </div>

        {subscription && (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-3 px-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold uppercase">Current Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                subscription.subscriptionStatus === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : subscription.subscriptionStatus === 'TRIAL'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {subscription.subscriptionStatus}
            </span>
          </div>
        )}
      </div>

      {/* Subscription Overview Card */}
      {subscription && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Academy Tenant</span>
              <p className="text-xl font-bold text-white">{subscription.name}</p>
              <span className="text-xs text-indigo-400 font-mono block">{subscription.slug}.prohiteducare.com</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Trial / License Countdown</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <p className="text-2xl font-extrabold text-white">
                  {subscription.subscriptionStatus === 'TRIAL'
                    ? `${subscription.trialDaysRemaining} Days Left`
                    : subscription.subscriptionStatus === 'ACTIVE'
                    ? '1 Year Active'
                    : 'Expired'}
                </p>
              </div>
              <span className="text-xs text-slate-400 block">
                {subscription.subscriptionStatus === 'TRIAL'
                  ? `Trial Ends on ${formatDate(subscription.trialEndsAt)}`
                  : `Renews on ${formatDate(subscription.subscriptionEndsAt)}`}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Payment Gateway Engine</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <p className="text-lg font-bold text-emerald-400">Cashfree PG Verified</p>
              </div>
              <span className="text-xs text-slate-500 block">HMAC-SHA256 Encrypted Payments</span>
            </div>
          </div>

          {(subscription.isTrialExpired || subscription.subscriptionStatus === 'EXPIRED') && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3 text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <p className="text-xs font-medium">
                  Your 14-day free trial has expired. Select a plan below to activate your annual subscription and restore full platform privileges.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan Selection Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Select Subscription Tier</h2>
          <p className="text-xs text-slate-400">All plans are billed annually with Cashfree Payment Gateway security</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-slate-900 border rounded-3xl p-6 shadow-xl relative flex flex-col justify-between space-y-6 transition hover:border-indigo-500/50 ${
                plan.popular ? 'border-indigo-500 shadow-indigo-500/10' : 'border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{plan.studentLimit}</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                </div>

                <div className="border-t border-b border-slate-800/80 py-4">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-white">₹{plan.monthlyPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block font-mono">Billed annually at ₹{plan.annualPrice.toLocaleString('en-IN')}/yr</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleInitiateRenewal(plan.id)}
                disabled={processing}
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{subscription?.subscriptionStatus === 'EXPIRED' ? 'Activate Subscription' : 'Renew / Upgrade via Cashfree'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cashfree Payment Gateway Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl space-y-6 text-center">
            <button onClick={() => setCheckoutModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase">Cashfree Payment Gateway</span>
              <h2 className="text-xl font-bold text-white mt-1">Complete Subscription Renewal</h2>
              <p className="text-xs text-slate-400 mt-1">Order Session ID: {checkoutModal.orderId}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Selected Tier:</span>
                <span className="font-bold text-white">{checkoutModal.planName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Billing Cycle:</span>
                <span className="font-semibold text-slate-300">Annual (1 Year License)</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-800 pt-2 font-bold">
                <span className="text-white">Total Amount:</span>
                <span className="text-emerald-400">₹{checkoutModal.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 font-bold text-xs flex items-center justify-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{paymentSuccess}</span>
              </div>
            ) : (
              <button
                onClick={handleConfirmPayment}
                disabled={processing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 text-sm"
              >
                <Zap className="w-4 h-4 fill-emerald-300" />
                <span>{processing ? 'Processing Cashfree Payment...' : 'Pay ₹' + checkoutModal.amount.toLocaleString('en-IN') + ' & Activate'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
