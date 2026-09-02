'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, CreditCard, Sparkles, CheckCircle2, XCircle, ArrowRight, 
  BookOpen, Users, BarChart3, Check, ShieldAlert, Eye, EyeOff, Upload, 
  Printer, Calendar, Clock, Layers, Award, FileText, Share2, Laptop, 
  ChevronRight, Star, GraduationCap, Building2, CheckCircle
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function MarketingPage() {
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<{ checked: boolean; available: boolean; reason?: string }>({
    checked: false,
    available: false,
  });
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'idcard' | 'fees' | 'timetable' | 'dashboard'>('idcard');

  const [signupForm, setSignupForm] = useState({
    name: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    logoUrl: '',
    institutionType: 'High School',
    educationBoard: 'SSC / State Board',
  });
  const [signupMessage, setSignupMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      setSlugStatus({ checked: false, available: false });
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingCheck(true);
      try {
        const res = await apiClient.get(`/academies/check-slug/${slug.toLowerCase().trim()}`);
        setSlugStatus({ checked: true, available: res.data.available, reason: res.data.reason });
      } catch (err: any) {
        setSlugStatus({ checked: true, available: false, reason: 'Error checking availability' });
      } finally {
        setLoadingCheck(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSignupMessage('');
    try {
      const res = await apiClient.post('/academies/signup', signupForm);
      if (res.data.token) {
        localStorage.setItem('prohit_auth_token', res.data.token);
        setSignupMessage('Success! Redirecting to your academy dashboard...');
        setTimeout(() => {
          const targetHost = window.location.hostname.includes('localhost')
            ? `http://${res.data.academy.slug}.localhost:3000/dashboard`
            : `https://${res.data.academy.slug}.educare.prohitcoretech.com/dashboard`;
          window.location.href = targetHost;
        }, 200);
      }
    } catch (err: any) {
      setSignupMessage(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      {/* Light Radial Glow Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_center,rgba(249,115,22,0.06),transparent_65%)] pointer-events-none z-0" />

      {/* Header Navigation - Mobile Responsive */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20 text-base sm:text-xl tracking-tighter shrink-0">
              PE
            </div>
            <div>
              <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 block leading-tight">
                PROHIT Educare
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest block text-orange-600 font-extrabold -mt-0.5">
                by PROHIT CoreTech
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm font-semibold">
            {/* Product Admin Console Link */}
            <a
              href="/platform-admin"
              className="text-slate-600 hover:text-rose-600 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center space-x-1.5 transition hover:bg-rose-50 border border-slate-200/80 shrink-0"
              title="Platform Administrator Console"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              <span className="hidden md:inline font-bold text-slate-700">Product Admin</span>
            </a>

            {/* Start Free Trial CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition duration-200 flex items-center space-x-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - MOBILE RESPONSIVE */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-1.5 bg-orange-100/80 border border-orange-200 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-orange-900 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-6 shadow-xs max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse shrink-0" />
            <span className="truncate">Next-Gen Enterprise SaaS for Coaching Institutes</span>
          </div>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.15]">
            Scale Your Academy with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Zero Financial Confusion
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium px-2">
            Automated FIFO fee collection, atomic receipt generation, standard 1st-15th stream support, dynamic brand customization, and printable digital student ID cards.
          </p>

          {/* Subdomain Checker Widget - Mobile Responsive */}
          <div className="mt-8 sm:mt-12 max-w-2xl mx-auto bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl">
            <label className="block text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest text-left mb-2 px-1">
              Claim Your Custom Subdomain
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 w-full overflow-hidden">
                <input
                  type="text"
                  placeholder="custom subdomain"
                  value={slug}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(val);
                    setSignupForm({ ...signupForm, slug: val });
                  }}
                  className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full font-bold text-sm sm:text-base min-w-0"
                />
                <span className="text-slate-500 text-[11px] sm:text-sm font-mono pl-1 font-semibold shrink-0 truncate">
                  .educare.prohitcoretech.com
                </span>
              </div>

              <button
                onClick={() => {
                  if (slugStatus.available) setShowModal(true);
                }}
                disabled={!slugStatus.available}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl sm:rounded-2xl transition shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
              >
                Claim Now
              </button>
            </div>

            {/* Availability Indicator */}
            {slug && (
              <div className="mt-2.5 px-1 flex items-center space-x-1.5 text-xs text-left font-medium">
                {loadingCheck ? (
                  <span className="text-slate-500 font-mono">Checking availability...</span>
                ) : slugStatus.checked ? (
                  slugStatus.available ? (
                    <span className="text-emerald-700 flex items-center font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                      {slug}.educare.prohitcoretech.com is available!
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center font-bold">
                      <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600 shrink-0" />
                      {slugStatus.reason || 'Subdomain unavailable'}
                    </span>
                  )
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SAMPLE SCREENSHOTS SHOWCASE SECTION - MOBILE RESPONSIVE */}
      <section className="py-14 sm:py-20 relative z-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-orange-50 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-widest mb-3 border border-orange-200">
              <Laptop className="w-3.5 h-3.5 text-orange-500" />
              <span>Live Tenant Screen Previews</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Experience the Tenant Portal Interface</h2>
            <p className="text-xs sm:text-base text-slate-500 mt-1.5 font-medium">Explore interactive preview mockups of actual academy administration screens.</p>
          </div>

          {/* Navigation Tabs for Screens */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8">
            <button
              onClick={() => setActiveTab('idcard')}
              className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'idcard' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Digital ID Cards</span>
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'fees' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>FIFO Fee Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'timetable' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Timetable Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* SCREEN DISPLAY CONTAINER */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6 pb-3 border-b border-slate-200 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-500 pl-1 truncate">
                chopra.educare.prohitcoretech.com/{activeTab === 'idcard' ? 'students' : activeTab === 'fees' ? 'fees' : activeTab === 'timetable' ? 'academics' : 'dashboard'}
              </span>
            </div>

            {/* TAB 1: DIGITAL ID CARD PREVIEW */}
            {activeTab === 'idcard' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Student Master Directory & ID Card Studio</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Manage student roster, photo uploads, blood group records, and single-click PDF ID card exports.</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-200">
                      Standard 1st - 15th Supported
                    </span>
                  </div>
                </div>

                {/* ID Card Mockup Preview - Mobile Scrollable */}
                <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 justify-items-center shadow-xs overflow-x-auto">
                  {/* FRONT CARD MOCKUP */}
                  <div className="w-[320px] sm:w-[340px] h-[210px] sm:h-[220px] bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-lg flex flex-col justify-between text-slate-800 shrink-0">
                    <div className="bg-orange-500 text-white p-2 px-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-yellow-300" />
                        <div>
                          <h4 className="font-black text-[10px] uppercase text-yellow-300">CHOPRA ACADEMY</h4>
                          <p className="text-[7px] text-orange-100 font-medium">Dahisar, Mumbai</p>
                        </div>
                      </div>
                      <span className="text-[6.5px] bg-orange-600 px-1.5 py-0.5 rounded uppercase font-extrabold">VERIFIED</span>
                    </div>

                    <div className="bg-orange-600 text-white text-center py-0.5 font-black text-[9px] uppercase tracking-widest">
                      STUDENT ID CARD
                    </div>

                    <div className="p-2.5 sm:p-3 flex items-start justify-between flex-1 gap-2 bg-gradient-to-b from-orange-50/30 to-white">
                      <div className="space-y-1 text-[8.5px] sm:text-[9px]">
                        <p className="font-black text-slate-900 text-[10px] sm:text-[10.5px]">NAME: ROHIT BARGE</p>
                        <p className="font-bold text-slate-600">ROLL NO: <span className="font-mono text-orange-600 font-extrabold">STU-2026-00003</span></p>
                        <p className="font-bold text-slate-600">COURSE: <span className="text-slate-900 font-extrabold">Std 12th (SCIENCE)</span></p>
                        <p className="font-bold text-slate-600">BATCH: <span className="text-slate-800 font-bold">Morning Batch</span></p>
                        <p className="font-bold text-slate-600">VALID UPTO: <span className="font-mono text-rose-600 font-bold">31-MAR-2027</span></p>
                      </div>
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-[58px] sm:w-[62px] h-[68px] sm:h-[72px] rounded-lg bg-slate-100 border-2 border-orange-500 overflow-hidden flex items-center justify-center">
                          <Users className="w-7 h-7 text-slate-400" />
                        </div>
                        <span className="text-[6px] font-serif italic text-slate-800 mt-0.5">Sandeep Chopra</span>
                        <span className="text-[5px] uppercase font-sans text-slate-500">PRINCIPAL'S SIGNATURE</span>
                      </div>
                    </div>

                    <div className="bg-orange-950 text-white p-1 px-3 flex items-center justify-between text-[7px] font-bold">
                      <span className="bg-orange-800 px-1.5 py-0.5 rounded text-[6px] uppercase">ISSUED BY ACADEMY</span>
                      <span className="font-mono">+91 9821979149</span>
                    </div>
                  </div>

                  {/* BACK CARD MOCKUP */}
                  <div className="w-[320px] sm:w-[340px] h-[210px] sm:h-[220px] bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-lg flex flex-col justify-between text-slate-800 shrink-0">
                    <div className="bg-orange-500 text-white p-1.5 sm:p-2 text-center">
                      <h4 className="font-black text-[9.5px] sm:text-[10px] uppercase text-yellow-300">EMERGENCY CONTACT INFORMATION</h4>
                      <p className="text-[6.5px] sm:text-[7px] text-orange-100 font-bold uppercase">IMPORTANT DETAILS</p>
                    </div>

                    <div className="p-2.5 sm:p-3 space-y-1 text-[8px] sm:text-[8.5px] leading-tight flex-1 bg-gradient-to-b from-orange-50/20 to-white">
                      <p className="border-b border-slate-100 pb-0.5"><strong className="text-slate-900">BLOOD GROUP:</strong> <span className="font-mono font-black text-rose-600 bg-rose-50 px-1 rounded">B+</span></p>
                      <p className="border-b border-slate-100 pb-0.5"><strong className="text-slate-900">EMERGENCY CONTACT:</strong> Subhash Barge</p>
                      <p className="border-b border-slate-100 pb-0.5"><strong className="text-slate-900">EMERGENCY PHONE:</strong> 9021979149</p>
                      <p className="border-b border-slate-100 pb-0.5 truncate"><strong className="text-slate-900">ADDRESS:</strong> Dahisar, Mumbai 400068</p>
                      
                      <div className="bg-orange-50 p-1 rounded-lg border border-orange-200 text-[6.5px] sm:text-[7px]">
                        <strong className="text-orange-900 block">INSTRUCTIONS:</strong>
                        <ol className="list-decimal list-inside text-slate-600 space-y-0.5">
                          <li>This card is non-transferable.</li>
                          <li>Report loss immediately to academy office.</li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-orange-950 text-orange-200 p-1 px-3 text-center text-[6.5px] font-bold">
                      PROHIT EDUCARE ERP • DIGITAL ACADEMY IDENTIFICATION
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FIFO FEE ENGINE PREVIEW */}
            {activeTab === 'fees' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Monthly Fee Settled</span>
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">₹4,85,000</p>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ 18% vs last month</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Outstanding</span>
                    <p className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1">₹42,500</p>
                    <span className="text-[10px] text-slate-500 font-bold">Distributed across 12 installments</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Advance Balance Ledger</span>
                    <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-1">₹18,000</p>
                    <span className="text-[10px] text-amber-600 font-bold">Auto-applied to next month FIFO</span>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Recent Fee Receipts & FIFO Ledger Distribution</h4>
                    <span className="text-[10px] sm:text-xs font-mono text-orange-600 font-bold">Latest 10 Transactions</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 uppercase font-bold text-[10px] text-slate-500">
                        <tr>
                          <th className="p-2.5 sm:p-3">Receipt No</th>
                          <th className="p-2.5 sm:p-3">Student Name</th>
                          <th className="p-2.5 sm:p-3">Amount Paid</th>
                          <th className="p-2.5 sm:p-3">FIFO Settlement</th>
                          <th className="p-2.5 sm:p-3">Payment Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-2.5 sm:p-3 font-mono text-orange-600 font-bold">REC-2026-0042</td>
                          <td className="p-2.5 sm:p-3 font-bold text-slate-900">Rohit Barge (Std 12th Sci)</td>
                          <td className="p-2.5 sm:p-3 font-mono font-bold text-emerald-600">₹12,000</td>
                          <td className="p-2.5 sm:p-3 text-slate-600">Inst 1 (₹8,000) + Inst 2 (₹4,000)</td>
                          <td className="p-2.5 sm:p-3"><span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">UPI / GPay</span></td>
                        </tr>
                        <tr>
                          <td className="p-2.5 sm:p-3 font-mono text-orange-600 font-bold">REC-2026-0041</td>
                          <td className="p-2.5 sm:p-3 font-bold text-slate-900">Mahesh Zambre (Std 11th Gen)</td>
                          <td className="p-2.5 sm:p-3 font-mono font-bold text-emerald-600">₹15,000</td>
                          <td className="p-2.5 sm:p-3 text-slate-600">Full Single Payment Settle</td>
                          <td className="p-2.5 sm:p-3"><span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">Cash Ledger</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACADEMICS & TIMETABLE PREVIEW */}
            {activeTab === 'timetable' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Lecture Roaster & Shift Batch Management</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">Weekly schedule with standard selection, shift badges, and CSV roster data extraction.</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-200">
                      Download CSV Template
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                  <table className="w-full text-xs text-slate-700 min-w-[500px]">
                    <thead className="bg-slate-100 uppercase font-bold text-[10px] text-slate-500">
                      <tr>
                        <th className="p-2.5 sm:p-3">Time Slot</th>
                        <th className="p-2.5 sm:p-3">Monday</th>
                        <th className="p-2.5 sm:p-3">Tuesday</th>
                        <th className="p-2.5 sm:p-3">Wednesday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 sm:p-3 font-mono font-bold text-orange-600">08:00 AM - 09:30 AM</td>
                        <td className="p-2.5 sm:p-3"><span className="bg-orange-50 border border-orange-200 text-orange-800 p-2 rounded-xl block font-bold">Physics • Prof. Sharma<br/><span className="text-[10px] text-slate-500">Std 12th (Morning Batch)</span></span></td>
                        <td className="p-2.5 sm:p-3"><span className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl block font-bold">Chemistry • Prof. Verma<br/><span className="text-[10px] text-slate-500">Std 12th (Morning Batch)</span></span></td>
                        <td className="p-2.5 sm:p-3"><span className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl block font-bold">Maths • Prof. Kulkarni<br/><span className="text-[10px] text-slate-500">Std 12th (Morning Batch)</span></span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: EXECUTIVE DASHBOARD PREVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">Enrolled Students</span>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">428</p>
                    <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold">Active in 8 batches</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">Faculty Members</span>
                    <p className="text-2xl sm:text-3xl font-black text-amber-600 font-mono mt-1">16</p>
                    <span className="text-[9px] sm:text-[10px] text-amber-600 font-bold">Auto Faculty ID</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">Monthly Collection</span>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono mt-1">₹8,45,000</p>
                    <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold">FIFO settled</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">Subscription</span>
                    <p className="text-lg sm:text-xl font-black text-orange-600 uppercase mt-1">ACTIVE PRO</p>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">Expires Mar 2027</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-base">Multi-Tenant Platform Architecture</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-xl">
                      Each academy operates on its own dedicated subdomain with automated tenant context resolution, custom branding, and isolated MongoDB schemas.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md shadow-orange-500/20 shrink-0 cursor-pointer text-center"
                  >
                    Launch Academy Tenant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS GRID */}
      <section className="py-16 sm:py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Engineered for High-Growth Coaching Academies</h2>
            <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-lg font-medium">Comprehensive tools designed to eliminate financial friction, manual errors, and record confusion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-orange-300 transition shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mb-5 sm:mb-6">
                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 sm:mb-3">Atomic FIFO Fee Engine</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Payments automatically settle overdue & pending installments in strict FIFO order inside MongoDB session transactions. Overpayments convert into advance credits seamlessly.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-orange-300 transition shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-5 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 sm:mb-3">Strict Tenant Isolation</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Request-scoped TenantContextService and TenantScopedRepository enforce zero cross-tenant data leakage. All access is verified strictly from JWT tokens.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-orange-300 transition shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-5 sm:mb-6">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 sm:mb-3">Digital Student ID Cards & Receipts</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Generate high-resolution printable ID cards (Front & Back) and HTML5 Canvas fee receipt cards for 2-click sharing on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - MOBILE RESPONSIVE */}
      <section className="py-16 sm:py-24 relative bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Simple, Transparent Indian Rupee Pricing</h2>
            <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-lg font-medium">No hidden transaction fees. Pick a plan that fits your academy size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Starter Plan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
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
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Digital Student ID Card PDF</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Standard Subdomain</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 sm:mt-8 w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl sm:rounded-2xl transition border border-slate-200 cursor-pointer text-xs sm:text-sm shadow-xs"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-orange-50/40 border-2 border-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl">
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
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Custom Primary Brand Color</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 sm:mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/20 transition cursor-pointer text-xs sm:text-sm"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise Network</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">₹7,999</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-medium">Multi-Branch Coaching Chains</p>

                <ul className="mt-6 sm:mt-8 space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Unlimited Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Multi-Branch Scoping & Reports</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Platform Admin Console Access</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" /> Priority 24/7 SLA Support</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 sm:mt-8 w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl sm:rounded-2xl transition border border-slate-200 cursor-pointer text-xs sm:text-sm shadow-xs"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNUP TRIAL MODAL - MOBILE RESPONSIVE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Create Your Academy Tenant</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Launch your branded SaaS portal with a 14-day free trial. No credit card required.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chopra Academy"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-orange-500 focus:outline-none font-medium text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subdomain Slug *</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 overflow-hidden">
                  <input
                    type="text"
                    required
                    placeholder="chopra"
                    value={signupForm.slug}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full bg-transparent text-slate-900 focus:outline-none font-bold text-xs sm:text-sm min-w-0"
                  />
                  <span className="text-slate-500 text-[10px] sm:text-xs font-mono font-semibold shrink-0">.educare.prohitcoretech.com</span>
                </div>
              </div>

              {/* Institution Type & Board Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Type *</label>
                  <select
                    required
                    value={signupForm.institutionType}
                    onChange={(e) => setSignupForm({ ...signupForm, institutionType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none font-semibold text-xs sm:text-sm"
                  >
                    <option value="Primary School">Primary School (1st - 5th)</option>
                    <option value="Mid Primary">Mid Primary (6th - 8th)</option>
                    <option value="High School">High School (9th - 10th)</option>
                    <option value="Jr. College (Science)">Jr. College (Science)</option>
                    <option value="Jr. College (Commerce)">Jr. College (Commerce)</option>
                    <option value="Jr. College (Arts)">Jr. College (Arts)</option>
                    <option value="Under Graduate (UG)">Under Graduate (UG)</option>
                    <option value="Other / Coaching">Other / Coaching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Board Selection *</label>
                  <select
                    required
                    value={signupForm.educationBoard}
                    onChange={(e) => setSignupForm({ ...signupForm, educationBoard: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none font-semibold text-xs sm:text-sm"
                  >
                    <option value="SSC / State Board">SSC / State Board</option>
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE / ICSC">ICSE / ICSC</option>
                    <option value="IB / International">IB / International</option>
                    <option value="HSC State Board">HSC State Board (Jr. College)</option>
                    <option value="University Board">University Board (UG)</option>
                    <option value="Other / N/A">Other / N/A</option>
                  </select>
                </div>
              </div>

              {/* Academy Logo Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Academy Logo (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / JPG / Base64</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Logo URL (e.g. https://...)"
                      value={signupForm.logoUrl}
                      onChange={(e) => setSignupForm({ ...signupForm, logoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none font-medium min-w-0"
                    />
                    <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition flex items-center space-x-1 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSignupForm({ ...signupForm, logoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {signupForm.logoUrl && (
                    <div className="flex items-center space-x-3 p-2 bg-orange-50 border border-orange-200 rounded-xl">
                      <img
                        src={signupForm.logoUrl}
                        alt="Academy Logo Preview"
                        className="w-8 h-8 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <div className="text-xs">
                        <span className="font-bold text-orange-800 block">Academy Logo Attached</span>
                        <span className="text-[10px] text-slate-500 font-mono">Displayed on receipts & ID cards</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Sandeep Chopra"
                  value={signupForm.adminName}
                  onChange={(e) => setSignupForm({ ...signupForm, adminName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-orange-500 focus:outline-none font-medium text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@chopraacademy.com"
                  value={signupForm.adminEmail}
                  onChange={(e) => setSignupForm({ ...signupForm, adminEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-orange-500 focus:outline-none font-medium text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter password"
                    value={signupForm.adminPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, adminPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:border-orange-500 focus:outline-none pr-10 font-medium text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {signupMessage && (
                <div
                  className={`text-xs p-3 rounded-xl font-bold ${
                    signupMessage.startsWith('Success')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {signupMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition text-xs sm:text-sm cursor-pointer"
              >
                {submitting ? 'Creating Academy Tenant...' : 'Launch Academy SaaS Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
