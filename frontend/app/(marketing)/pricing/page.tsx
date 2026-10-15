import React from 'react';
import Link from 'next/link';
import { 
  Check, ArrowRight, ShieldCheck, Sparkles, HelpCircle, 
  CreditCard, ArrowLeft, Zap, Building2, Users 
} from 'lucide-react';
import ComplianceNavbar from '../components/ComplianceNavbar';
import ComplianceFooter from '../components/ComplianceFooter';
import { COMPANY_INFO } from '../../../lib/company-info';

export const metadata = {
  title: 'Pricing & Plans | PROHIT Educare - Multi-Tenant SaaS ERP',
  description: 'Simple, transparent INR pricing plans for PROHIT Educare SaaS platform by PROHIT CoreTech. Starter, Professional, and Enterprise tiers.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans flex flex-col justify-between">
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
              <span>100% Transparent INR Pricing</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Simple, Transparent Plans for Every Academy Size
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-slate-600 font-medium">
              Zero hidden transaction fees. Start with a 14-day full-access trial, then subscribe annually with Cashfree Payment Gateway security.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {/* 1. Starter Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">₹999</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-mono font-semibold">Billed annually at ₹11,988</p>

                <ul className="mt-6 sm:mt-8 space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Up to 200 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Printable Student ID Card PDF</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Standard Subdomain</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Standard Email Support</li>
                </ul>
              </div>

              <Link
                href="/#pricing"
                className="mt-6 sm:mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-2xl transition border border-slate-200 text-center text-xs sm:text-sm block"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* 2. Professional Plan (Highlighted) */}
            <div className="bg-white border-2 border-orange-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Professional Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono">₹2,999</span>
                  <span className="text-slate-600 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-orange-700 text-xs mt-2 font-mono font-bold">Billed annually at ₹35,988</p>

                <ul className="mt-6 sm:mt-8 space-y-3 text-xs sm:text-sm text-slate-800 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Up to 1,000 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Digital Student ID Card PDF</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Instant WhatsApp Receipt Sharing</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Custom Primary Brand Color &amp; Logo</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Priority WhatsApp &amp; Phone Support</li>
                </ul>
              </div>

              <Link
                href="/#pricing"
                className="mt-6 sm:mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition text-center text-xs sm:text-sm block"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* 3. Enterprise Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise Network</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">₹7,999</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-medium">Multi-Branch Coaching Chains</p>

                <ul className="mt-6 sm:mt-8 space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Unlimited Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Multi-Branch Scoping &amp; Consolidated Reports</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Platform Admin Master Console</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Dedicated Account Manager &amp; 24/7 SLA</li>
                </ul>
              </div>

              <Link
                href="/contact"
                className="mt-6 sm:mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-2xl transition border border-slate-200 text-center text-xs sm:text-sm block"
              >
                Contact Enterprise Sales
              </Link>
            </div>
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
                <h4 className="font-bold text-slate-900">How does the 14-day free trial work?</h4>
                <p className="text-slate-600">
                  You get immediate access to all features on your custom subdomain upon signing up. No payment method or credit card is required. You can upgrade to a paid annual plan anytime during or after your trial.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-slate-900">What is your refund policy?</h4>
                <p className="text-slate-600">
                  Because we provide a 14-day full-access trial to evaluate all features before purchasing, paid subscriptions are <strong>strictly non-refundable</strong>. Please refer to our <Link href="/refund-policy" className="text-orange-600 font-semibold underline">Refund &amp; Cancellation Policy</Link> for details.
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
