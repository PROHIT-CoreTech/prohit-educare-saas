import React from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, ArrowLeft, Mail, Phone } from 'lucide-react';
import ComplianceNavbar from '../components/ComplianceNavbar';
import ComplianceFooter from '../components/ComplianceFooter';
import { COMPANY_INFO } from '../../../lib/company-info';

export const metadata = {
  title: 'Refund & Cancellation Policy | PROHIT Educare - Multi-Tenant SaaS ERP',
  description: 'Official Refund, Return, and Cancellation policy for PROHIT Educare SaaS subscriptions operated by PROHIT CoreTech.',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'October 15, 2026';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans flex flex-col justify-between">
      <ComplianceNavbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="mb-10 text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Commercial Terms</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Last Updated: <span className="font-semibold text-slate-800">{lastUpdated}</span> | Operating Entity: <strong className="text-slate-900">{COMPANY_INFO.name}</strong>
            </p>
          </div>

          {/* Highlight Banner: Non-Refundable Subscriptions */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 mb-10 text-xs sm:text-sm text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center space-x-2 font-black text-amber-900 text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Non-Refundable Subscription Notice</span>
            </div>
            <p className="leading-relaxed">
              All subscription plans for <strong>{COMPANY_INFO.productName}</strong> (Starter Academy, Professional Academy, and Enterprise Network) are <strong>strictly non-refundable and non-transferable</strong> once purchased and activated. Because we provide an unrestricted <strong>14-Day Full-Featured Free Trial</strong>, institutions are given complete opportunity to verify all features, workflows, and compatibility prior to committing to an annual plan.
            </p>
          </div>

          {/* Policy Body */}
          <div className="space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            {/* Clause 1: 14-Day Free Trial */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">1</span>
                <span>14-Day Full-Access Free Trial (Test Before You Buy)</span>
              </h2>
              <p>
                To ensure complete transparency and customer satisfaction, {COMPANY_INFO.name} provides a <strong>14-day zero-risk trial</strong> upon signup:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>No credit card, debit card, or upfront payment authorization is required to start your trial.</li>
                <li>You receive full access to all ERP modules: student roster management, FIFO fee engine, digital ID cards, fee receipt PDFs, and portal branding.</li>
                <li>If the software does not suit your institute’s needs, you may simply discontinue use without incurring any charges.</li>
              </ul>
            </section>

            {/* Clause 2: Paid Subscriptions Non-Refundable */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">2</span>
                <span>Annual Paid Subscriptions</span>
              </h2>
              <p>
                Once an annual subscription is confirmed and processed via our payment gateway (Cashfree) or direct bank transfer:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Subscription fees are immediately allocated toward cloud server infrastructure, database storage, tenant isolation, and maintenance costs.</li>
                <li><strong>No full or pro-rated partial refunds</strong> are provided for mid-term cancellations or unused time within the annual term.</li>
                <li>Subscriptions cannot be transferred to a third party or credited towards another institution.</li>
              </ul>
            </section>

            {/* Clause 3: Subscription Cancellation Policy */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">3</span>
                <span>Subscription Cancellation Procedure</span>
              </h2>
              <p>
                You have the right to cancel future renewals of your subscription at any time:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Cancellation Request:</strong> You may request renewal cancellation by emailing{' '}
                  <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-orange-600 font-semibold underline">
                    {COMPANY_INFO.contact.email}
                  </a>{' '}
                  at least 7 days before your annual renewal date.
                </li>
                <li>
                  <strong>Access Continuity:</strong> Upon cancellation, your tenant portal and data access will remain fully functional until the final day of your currently active paid billing cycle.
                </li>
                <li>
                  <strong>Data Export:</strong> Institutes are responsible for exporting their student rosters and fee transaction statements before the expiration date.
                </li>
              </ul>
            </section>

            {/* Clause 4: Duplicate Billing / Payment Error Resolution */}
            <section className="space-y-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Exception: Duplicate or Erroneous Transactions</span>
              </h2>
              <p className="text-slate-600">
                While subscriptions are non-refundable, we strictly safeguard our clients against technical payment anomalies:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Duplicate Charges:</strong> In the event that your bank account or card is charged more than once for the same subscription renewal due to network latency or gateway timeouts, the duplicate charge will be fully refunded.
                </li>
                <li>
                  <strong>Reporting Window:</strong> To report a duplicate payment, email us at{' '}
                  <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-orange-600 font-semibold underline">
                    {COMPANY_INFO.contact.email}
                  </a>{' '}
                  within 5 business days with proof of deduction and Cashfree Order/Payment IDs.
                </li>
                <li>
                  <strong>Refund Turnaround:</strong> Verified duplicate charges are processed through Cashfree Payments back to the original source account within <strong>5 to 7 business days</strong>.
                </li>
              </ul>
            </section>

            {/* Clause 5: Contact Desk */}
            <section className="pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Billing &amp; Refund Assistance</h3>
              <p className="text-slate-600">
                For any questions regarding billing statements, payment receipts, or renewal inquiries, reach out to our accounts team:
              </p>
              <div className="mt-3 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1.5">
                <p><strong className="text-slate-900">Operating Entity:</strong> {COMPANY_INFO.name}</p>
                <p><strong className="text-slate-900">Official Support Email:</strong> <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-orange-600 underline font-semibold">{COMPANY_INFO.contact.email}</a></p>
                <p><strong className="text-slate-900">Support Telephone:</strong> <a href={`tel:${COMPANY_INFO.contact.phone.replace(/\s+/g, '')}`} className="text-orange-600 font-mono underline font-semibold">{COMPANY_INFO.contact.displayPhone}</a></p>
                <p><strong className="text-slate-900">Registered Office:</strong> {COMPANY_INFO.address.full}</p>
                <p><strong className="text-slate-900">Desk Timings:</strong> {COMPANY_INFO.contact.operatingHours}</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <ComplianceFooter />
    </div>
  );
}
