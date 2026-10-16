'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, 
  Building2, MessageSquare, ArrowLeft, ShieldCheck, Sparkles 
} from 'lucide-react';
import ComplianceNavbar from '../components/ComplianceNavbar';
import ComplianceFooter from '../components/ComplianceFooter';
import { COMPANY_INFO } from '../../../lib/company-info';
import { isValidMobile } from '../../../lib/validation';

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: '',
    academyName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.phone && !isValidMobile(form.phone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

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
              <span>Customer Support &amp; Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Contact Our Team
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-slate-600 font-medium">
              Have questions about {COMPANY_INFO.productName}, subscription plans, or need help onboarding your academy? We&apos;re here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Official Company & Registered Office Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">Operating Entity</span>
                  <h2 className="text-2xl font-black text-white mt-1">{COMPANY_INFO.name}</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Developers of {COMPANY_INFO.productName} Multi-Tenant Cloud ERP
                  </p>
                </div>

                <div className="space-y-4 pt-2 text-xs sm:text-sm text-slate-300">
                  {/* Physical Address */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Registered Physical Address</span>
                      <p className="font-semibold text-white leading-relaxed mt-0.5">
                        {COMPANY_INFO.address.line1}<br />
                        {COMPANY_INFO.address.line2}<br />
                        {COMPANY_INFO.address.city}, {COMPANY_INFO.address.state} - {COMPANY_INFO.address.pincode}<br />
                        {COMPANY_INFO.address.country}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0 mt-0.5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Support Hotline</span>
                      <a
                        href={`tel:${COMPANY_INFO.contact.phone.replace(/\s+/g, '')}`}
                        className="font-mono font-bold text-base text-orange-400 hover:text-orange-300 block mt-0.5"
                      >
                        {COMPANY_INFO.contact.displayPhone}
                      </a>
                      <span className="text-[11px] text-slate-400">Available via Phone &amp; WhatsApp</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0 mt-0.5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Official Support Email</span>
                      <a
                        href={`mailto:${COMPANY_INFO.contact.email}`}
                        className="font-bold text-white hover:text-orange-400 block mt-0.5"
                      >
                        {COMPANY_INFO.contact.email}
                      </a>
                      <span className="text-[11px] text-slate-400">Response guaranteed within 24 business hours</span>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Operating Business Hours</span>
                      <p className="font-semibold text-white mt-0.5">{COMPANY_INFO.contact.operatingHours}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center space-x-2 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Cashfree Verified SaaS Merchant Platform</span>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Contact / Demonstration Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Message Received!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you for contacting <strong>{COMPANY_INFO.name}</strong>. Our enterprise team will get in touch with you at <strong className="text-slate-900">{form.email}</strong> shortly.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: '',
                          academyName: '',
                          email: '',
                          phone: '',
                          subject: 'General Inquiry',
                          message: '',
                        });
                      }}
                      className="mt-4 inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Send an Inquiry or Request Demo</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Fill in your institute information and our product specialists will reach out to you.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Prof. Rajesh Sharma"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academy / School Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Science Academy"
                          value={form.academyName}
                          onChange={(e) => setForm({ ...form, academyName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="admin@youracademy.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Subject *</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Pricing & Monthly Subscription">Pricing &amp; Monthly Subscription</option>
                        <option value="Custom Enterprise Coaching Chain">Custom Enterprise Coaching Chain</option>
                        <option value="Technical & Implementation Support">Technical &amp; Implementation Support</option>
                        <option value="Billing & Cashfree Invoice Support">Billing &amp; Cashfree Invoice Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message / Requirements *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your student strength, streams offered, and how we can assist..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                        ⚠️ {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center space-x-2 cursor-pointer text-xs sm:text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Inquiry...' : 'Submit Inquiry to PROHIT CoreTech'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComplianceFooter />
    </div>
  );
}
