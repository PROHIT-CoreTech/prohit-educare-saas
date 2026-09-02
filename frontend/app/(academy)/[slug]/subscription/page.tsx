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
  },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('PROFESSIONAL');
  const [checkoutModal, setCheckoutModal] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string>('');
  const [showOfflineNoticeModal, setShowOfflineNoticeModal] = useState<boolean>(false);

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
    setShowOfflineNoticeModal(true);
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
    <div className="space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Academy SaaS Subscription & Billing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Subscription & Plan Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">View license status, trial period, and renew online via Cashfree Gateway</p>
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trial / License Countdown</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {subscription.subscriptionStatus === 'TRIAL'
                    ? `${subscription.trialDaysRemaining} Days Left`
                    : subscription.subscriptionStatus === 'ACTIVE'
                    ? '1 Year Active'
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Gateway Engine</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <p className="text-lg font-extrabold text-emerald-700">Cashfree PG Verified</p>
              </div>
              <span className="text-xs text-slate-500 font-medium block">HMAC-SHA256 Encrypted Payments</span>
            </div>
          </div>

          {(subscription.isTrialExpired || subscription.subscriptionStatus === 'EXPIRED') && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <p className="text-xs font-bold">
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
          <h2 className="text-xl font-extrabold text-slate-900">Select Subscription Tier</h2>
          <p className="text-xs text-slate-500 font-medium">All plans are billed annually with Cashfree Payment Gateway security</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm relative flex flex-col justify-between space-y-6 transition ${
                plan.popular ? 'border-2 border-orange-500 shadow-md bg-orange-50/20' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 right-6 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{plan.studentLimit}</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{plan.description}</p>
                </div>

                <div className="border-t border-b border-slate-200 py-4">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-slate-900 font-mono">₹{plan.monthlyPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block font-mono font-semibold">Billed annually at ₹{plan.annualPrice.toLocaleString('en-IN')}/yr</span>
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
                onClick={() => handleInitiateRenewal(plan.id)}
                disabled={processing}
                className={`w-full font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm cursor-pointer ${
                  plan.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{subscription?.subscriptionStatus === 'EXPIRED' ? 'Activate Subscription' : 'Renew / Activate License (Offline Mode)'}</span>
              </button>
            </div>
          ))}
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
              <h3 className="text-lg font-black text-slate-900">Online Gateway Disabled (Offline Sales Mode)</h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Online payment gateway renewal is currently disabled for offline sales mode. Please contact Product Owner or your Account Manager to renew or upgrade your academy license.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-600 font-mono space-y-1 text-left">
              <p><span className="font-bold text-slate-800">Product Support:</span> PROHIT CoreTech</p>
              <p><span className="font-bold text-slate-800">Phone:</span> +91 9821979149</p>
              <p><span className="font-bold text-slate-800">Email:</span> support@prohitcoretech.com</p>
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
