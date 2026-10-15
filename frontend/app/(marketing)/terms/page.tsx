import React from 'react';
import Link from 'next/link';
import { Shield, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import ComplianceNavbar from '../components/ComplianceNavbar';
import ComplianceFooter from '../components/ComplianceFooter';
import { COMPANY_INFO } from '../../../lib/company-info';

export const metadata = {
  title: 'Terms & Conditions | PROHIT Educare - Multi-Tenant SaaS ERP',
  description: 'Terms and Conditions of service for PROHIT Educare SaaS platform operated by PROHIT CoreTech.',
};

export default function TermsPage() {
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
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              <span>Legal Document</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Last Updated: <span className="font-semibold text-slate-800">{lastUpdated}</span> | Governing Entity: <strong className="text-slate-900">{COMPANY_INFO.name}</strong>
            </p>
          </div>

          {/* Legal Notice Card */}
          <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-5 sm:p-6 mb-10 text-xs sm:text-sm text-slate-700 space-y-2">
            <p className="font-bold text-orange-950 text-sm">Agreement to Terms</p>
            <p className="leading-relaxed">
              These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an educational entity, coaching institute, or school (&quot;Client&quot;, &quot;Academy&quot;, or &quot;You&quot;), and <strong className="text-slate-900">{COMPANY_INFO.name}</strong> (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;), concerning your access to and use of the <strong>{COMPANY_INFO.productName}</strong> software-as-a-service application hosted at <code className="bg-white px-1.5 py-0.5 rounded border border-orange-200 font-mono text-orange-900">{COMPANY_INFO.website.domain}</code> and its respective subdomains.
            </p>
          </div>

          {/* Clauses Content */}
          <div className="space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            {/* Clause 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">1</span>
                <span>Description of SaaS Services</span>
              </h2>
              <p>
                {COMPANY_INFO.productName} is a cloud-hosted, multi-tenant Education ERP and Academy Management Platform providing coaching institutes, colleges, and private academies with automated First-In-First-Out (FIFO) installment fee processing, student admission records management, digital and printable identity card generation, automated timetable management, and multi-branch administrative reporting.
              </p>
            </section>

            {/* Clause 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">2</span>
                <span>Account Registration, Security &amp; Tenant Subdomains</span>
              </h2>
              <p>
                To utilize the services, you must register an academy tenant account and choose a custom subdomain slug (e.g., <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-900">youracademy.educare.prohitcoretech.com</code>). You agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Provide accurate, current, and complete registration information including verified contact email and phone number.</li>
                <li>Maintain the confidentiality of your administrator credentials and API keys.</li>
                <li>Accept full responsibility for all activities, student roster uploads, and fee records generated under your tenant subdomain.</li>
                <li>Promptly notify us at <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-orange-600 font-semibold underline">{COMPANY_INFO.contact.email}</a> if you detect any unauthorized access or security breach.</li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">3</span>
                <span>Subscription Plans, Pricing &amp; Billing Cycles</span>
              </h2>
              <p>
                Access to {COMPANY_INFO.productName} is offered under tiered annual subscription plans billed in Indian National Rupees (INR / ₹) as published on our <Link href="/pricing" className="text-orange-600 font-semibold hover:underline">Pricing Page</Link>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>14-Day Free Trial:</strong> New tenants receive a 14-day fully featured free trial without requiring credit card or payment authorization.</li>
                <li><strong>Paid Subscriptions:</strong> After the trial period, continuous access requires purchasing an annual license for your chosen tier (Starter Academy, Professional Academy, or Enterprise Network).</li>
                <li><strong>Price Modifications:</strong> {COMPANY_INFO.name} reserves the right to revise subscription fees upon 30 days prior written notice before annual renewal.</li>
              </ul>
            </section>

            {/* Clause 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">4</span>
                <span>Payment Processing &amp; Cashfree Gateway Integration</span>
              </h2>
              <p>
                All online SaaS subscription transactions are processed securely via <strong>Cashfree Payments India Pvt. Ltd.</strong> or authorized banking partners. By executing an online payment:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>You authorize {COMPANY_INFO.name} and Cashfree to process payment via Net Banking, UPI, Credit Card, Debit Card, or Bank Transfer for the specified subscription tier.</li>
                <li>{COMPANY_INFO.name} does NOT store, handle, or log your credit card numbers, CVVs, or bank net-banking passwords. All payment tokenization and card processing complies with PCI-DSS standards.</li>
              </ul>
            </section>

            {/* Clause 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">5</span>
                <span>Non-Refundable Subscription Policy</span>
              </h2>
              <p>
                As detailed in our <Link href="/refund-policy" className="text-orange-600 font-semibold hover:underline">Refund &amp; Cancellation Policy</Link>, all paid subscriptions for {COMPANY_INFO.productName} are <strong>strictly non-refundable and non-transferable</strong> once activated. Institutes are encouraged to thoroughly test all modules during the 14-day free trial period prior to placing an order.
              </p>
            </section>

            {/* Clause 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">6</span>
                <span>Customer Data Ownership &amp; Multi-Tenant Isolation</span>
              </h2>
              <p>
                You retain complete, exclusive ownership of all student rosters, attendance logs, marks, fees records, student photos, and academy branding files uploaded to your account. {COMPANY_INFO.name} acts solely as a data processor. We maintain strict logical multi-tenant database isolation preventing cross-tenant data leakage.
              </p>
            </section>

            {/* Clause 7 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">7</span>
                <span>Limitation of Liability</span>
              </h2>
              <p>
                To the maximum extent permitted by applicable Indian law, {COMPANY_INFO.name} and its directors, employees, or partners shall not be liable for any indirect, punitive, incidental, or consequential damages resulting from downtime, internet interruptions, or loss of business data. Our total liability under any claim shall not exceed the subscription fees paid by you to {COMPANY_INFO.name} in the preceding 12 months.
              </p>
            </section>

            {/* Clause 8 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">8</span>
                <span>Governing Law &amp; Dispute Resolution</span>
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any legal dispute, arbitration, or proceeding arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Pune, Maharashtra, India</strong>.
              </p>
            </section>

            {/* Contact Clause */}
            <section className="pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Questions or Legal Inquiries</h3>
              <p className="text-slate-600">
                Please contact our legal and compliance desk at{' '}
                <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-orange-600 font-semibold hover:underline">
                  {COMPANY_INFO.contact.email}
                </a>{' '}
                or reach us by phone at{' '}
                <a href={`tel:${COMPANY_INFO.contact.phone.replace(/\s+/g, '')}`} className="text-orange-600 font-semibold font-mono hover:underline">
                  {COMPANY_INFO.contact.displayPhone}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <ComplianceFooter />
    </div>
  );
}
