import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { COMPANY_INFO } from '../../../lib/company-info';

export default function ComplianceFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700 text-sm">
      {/* Prominent Compliance Text Hyperlinks Strip (Terms | Privacy | Refunds) */}
      <div className="bg-white border-b border-slate-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 sm:space-x-14 text-base sm:text-lg font-bold text-slate-700">
            <Link
              href="/terms"
              className="text-slate-700 hover:text-orange-600 hover:underline underline-offset-4 transition"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-slate-700 hover:text-orange-600 hover:underline underline-offset-4 transition"
            >
              Privacy
            </Link>
            <Link
              href="/refund-policy"
              className="text-slate-700 hover:text-orange-600 hover:underline underline-offset-4 transition"
            >
              Refunds
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Information Grid */}
      <div className="bg-slate-950 text-slate-300 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Col 1 & 2: Brand & Operating Entity Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20 text-lg tracking-tight shrink-0">
                  PE
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-white block leading-tight">
                    {COMPANY_INFO.productName}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest block text-orange-400 font-extrabold">
                    by {COMPANY_INFO.name}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                Enterprise Multi-Tenant SaaS ERP engineered for coaching institutes, private academies, and schools. Complete with atomic FIFO fee collection, instant student ID card issuance, and multi-tenant security.
              </p>

              <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-3 py-2 w-fit">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Cashfree PG Verified • 256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* Col 3: Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product &amp; Pricing</h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link href="/pricing" className="hover:text-orange-400 transition">
                    Pricing &amp; Plans
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="hover:text-orange-400 transition">
                    Features &amp; Modules
                  </Link>
                </li>
                <li>
                  <Link href="/platform-admin" className="hover:text-orange-400 transition">
                    Platform Admin Console
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-orange-400 transition">
                    Request Custom Demo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Mandatory Compliance Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Compliance &amp; Legal</h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link href="/terms" className="hover:text-orange-400 transition font-semibold text-slate-300">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-orange-400 transition font-semibold text-slate-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-orange-400 transition font-semibold text-slate-300">
                    Refund &amp; Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-orange-400 transition">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Registered Office & Contact (Cashfree Compliance Mandatory) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Registered Office &amp; Support</h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-slate-200 block">{COMPANY_INFO.name}</strong>
                    {COMPANY_INFO.address.line1}, {COMPANY_INFO.address.line2}, {COMPANY_INFO.address.city}, {COMPANY_INFO.address.state} - {COMPANY_INFO.address.pincode}, {COMPANY_INFO.address.country}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                  <a href={`tel:${COMPANY_INFO.contact.phone.replace(/\s+/g, '')}`} className="hover:text-white font-mono text-slate-300">
                    {COMPANY_INFO.contact.displayPhone}
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  <a href={`mailto:${COMPANY_INFO.contact.email}`} className="hover:text-white text-slate-300">
                    {COMPANY_INFO.contact.email}
                  </a>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{COMPANY_INFO.contact.operatingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Disclaimer & Copyright */}
      <div className="border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-slate-400 text-xs font-medium">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white transition">Refunds</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
