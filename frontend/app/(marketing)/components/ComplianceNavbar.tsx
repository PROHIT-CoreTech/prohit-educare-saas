'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { COMPANY_INFO } from '../../../lib/company-info';

export default function ComplianceNavbar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20 text-base sm:text-xl tracking-tighter shrink-0 group-hover:scale-105 transition-transform">
            PE
          </div>
          <div>
            <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 block leading-tight">
              {COMPANY_INFO.productName}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest block text-orange-600 font-extrabold -mt-0.5">
              by {COMPANY_INFO.name}
            </span>
          </div>
        </Link>

        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs sm:text-sm font-bold text-slate-600">
          <Link href="/#features" className="hover:text-orange-600 transition">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-orange-600 transition">
            Pricing
          </Link>
          <Link href="/contact" className="hover:text-orange-600 transition">
            Contact Us
          </Link>
          <Link href="/terms" className="hover:text-orange-600 transition">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-orange-600 transition">
            Privacy
          </Link>
          <Link href="/refund-policy" className="hover:text-orange-600 transition">
            Refunds
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm font-semibold">
          <Link
            href="/platform-admin"
            className="text-slate-600 hover:text-rose-600 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center space-x-1.5 transition hover:bg-rose-50 border border-slate-200/80 shrink-0"
            title="Platform Administrator Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
            <span className="hidden md:inline font-bold text-slate-700">Product Admin</span>
          </Link>

          <Link
            href="/#pricing"
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition duration-200 flex items-center space-x-1.5 shrink-0 whitespace-nowrap"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
