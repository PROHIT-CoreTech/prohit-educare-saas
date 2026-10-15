import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ComplianceNavbar from '../components/ComplianceNavbar';
import ComplianceFooter from '../components/ComplianceFooter';
import { COMPANY_INFO } from '../../../lib/company-info';

export const metadata = {
  title: 'Privacy Policy | PROHIT Educare - Multi-Tenant SaaS ERP',
  description: 'Privacy Policy detailing data collection, payment processing, and multi-tenant security for PROHIT Educare by PROHIT CoreTech.',
};

export default function PrivacyPolicyPage() {
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
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Protection &amp; Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Last Updated: <span className="font-semibold text-slate-800">{lastUpdated}</span> | Operating Entity: <strong className="text-slate-900">{COMPANY_INFO.name}</strong>
            </p>
          </div>

          {/* Intro Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-3">
              <p>
                At <strong>{COMPANY_INFO.name}</strong>, developer and operator of <strong>{COMPANY_INFO.productName}</strong> (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we respect your privacy and are committed to safeguarding the personal data of our institutional subscribers, academy directors, faculty, parents, and students.
              </p>
              <p>
                This Privacy Policy explains how information is collected, utilized, stored, and safeguarded when you access our multi-tenant SaaS application hosted on <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">{COMPANY_INFO.website.domain}</code> and its tenant subdomains.
              </p>
            </section>

            {/* Section 1: Information We Collect */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">1</span>
                <span>Information We Collect</span>
              </h2>
              <p>We collect information in the following categories:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">A. Academy Administrator Data</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                    <li>Super Admin Full Name and designation.</li>
                    <li>Official contact email and phone number.</li>
                    <li>Academy name, custom subdomain slug, and postal address.</li>
                    <li>Director digital signature and academy logo graphic.</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">B. Student &amp; Academic Records</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                    <li>Student full name, roll number, class/stream, and batch.</li>
                    <li>Parent / Guardian name and contact details.</li>
                    <li>Student passport photograph (for ID card generation).</li>
                    <li>Installment fee plans, dues, and payment transaction logs.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Payment Security & Cashfree Compliance */}
            <section className="space-y-3 bg-orange-50/50 border border-orange-200 p-5 rounded-2xl">
              <h2 className="text-base sm:text-lg font-black text-orange-950 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-orange-600" />
                <span>Payment Information Security &amp; Cashfree Gateway</span>
              </h2>
              <p className="text-slate-700">
                Online subscription payments for {COMPANY_INFO.productName} are processed directly via <strong>Cashfree Payments India Pvt. Ltd.</strong> (or authorized payment aggregators):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>
                  <strong>Zero Storage of Sensitive Financial Data:</strong> {COMPANY_INFO.name} <strong>NEVER stores, logs, or views</strong> credit/debit card numbers, CVVs, expiry dates, or UPI MPINs on our servers.
                </li>
                <li>
                  <strong>PCI-DSS Compliant Encryption:</strong> All transactions are handled in secure, encrypted checkout environments managed by Cashfree compliant with Payment Card Industry Data Security Standards (PCI-DSS Level 1).
                </li>
                <li>
                  <strong>Webhook Signature Verification:</strong> All payment status webhooks received from Cashfree are cryptographically validated using HMAC-SHA256 signatures to prevent fraudulent transaction spoofing.
                </li>
              </ul>
            </section>

            {/* Section 3: How We Use Information */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">2</span>
                <span>How We Use Collected Information</span>
              </h2>
              <p>Data gathered through the platform is utilized strictly for:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Provisioning and maintaining your dedicated academy subdomain and multi-tenant database.</li>
                <li>Executing atomic FIFO fee ledger allocations, balance calculations, and printable receipt generation.</li>
                <li>Rendering printable student identity cards with barcode/QR verification.</li>
                <li>Sending transactional billing notifications, subscription status alerts, and WhatsApp receipt dispatches.</li>
                <li>Maintaining platform reliability, audit trails, and cybersecurity defenses.</li>
              </ul>
            </section>

            {/* Section 4: Multi-Tenant Data Isolation */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">3</span>
                <span>Multi-Tenant Data Isolation &amp; Encryption</span>
              </h2>
              <p>
                {COMPANY_INFO.productName} enforces strict architectural boundaries to guarantee that each educational institute&apos;s data is isolated. All queries enforce mandatory tenant scoping filters. All communications are encrypted in transit using industry-standard TLS 1.3 / HTTPS encryption.
              </p>
            </section>

            {/* Section 5: Data Retention & Disclosure */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center font-mono">4</span>
                <span>Third-Party Disclosure &amp; Data Sharing</span>
              </h2>
              <p>
                <strong>We do not sell, rent, or trade your institutional or student data to advertisers or third-party brokers.</strong> Data is shared only with trusted infrastructure providers (such as cloud hosting and Cashfree payment gateway) strictly as required to fulfill our software services, or when compelled by applicable Indian law or law enforcement authorities.
              </p>
            </section>

            {/* Section 6: Contact Information */}
            <section className="pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Privacy Officer &amp; Contact Desk</h3>
              <p className="text-slate-600">
                If you have questions, feedback, or requests regarding this Privacy Policy or your data rights, please contact our Privacy Officer:
              </p>
              <div className="mt-3 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1 font-medium">
                <p><strong className="text-slate-900">Entity:</strong> {COMPANY_INFO.name}</p>
                <p><strong className="text-slate-900">Registered Office:</strong> {COMPANY_INFO.address.full}</p>
                <p><strong className="text-slate-900">Email:</strong> <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-orange-600 underline">{COMPANY_INFO.contact.email}</a></p>
                <p><strong className="text-slate-900">Phone:</strong> <a href={`tel:${COMPANY_INFO.contact.phone.replace(/\s+/g, '')}`} className="text-orange-600 font-mono underline">{COMPANY_INFO.contact.displayPhone}</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <ComplianceFooter />
    </div>
  );
}
