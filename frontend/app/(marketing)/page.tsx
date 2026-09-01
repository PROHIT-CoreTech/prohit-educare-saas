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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Background Glow Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_center,rgba(249,115,22,0.15),transparent_60%)] pointer-events-none z-0" />

      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/25 text-xl tracking-tighter">
              PE
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block">
                PROHIT Educare
              </span>
              <span className="text-[10px] uppercase tracking-widest block text-orange-400 font-extrabold -mt-1">
                by PROHIT CoreTech
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm font-semibold">
            {/* Product Admin Console Link */}
            <a
              href="/platform-admin"
              className="text-slate-300 hover:text-rose-400 px-3.5 py-2 rounded-xl flex items-center space-x-2 transition hover:bg-slate-900 border border-slate-800"
              title="Platform Administrator Console"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline font-bold">Product Admin</span>
            </a>

            {/* Start Free Trial CTA Button (Academy Login Removed) */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 transition duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Next-Gen Enterprise SaaS for Indian Coaching Institutes & Academies</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Scale Your Academy with <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Zero Financial Confusion
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Automated FIFO fee collection, atomic receipt generation, standard 1st-15th stream support, dynamic brand customization, and digital student ID cards built specifically for coaching institutes.
          </p>

          {/* Subdomain Checker Widget */}
          <div className="mt-12 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl backdrop-blur-xl">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-left mb-2 px-2">
              Claim Your Custom Subdomain
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 w-full">
                <input
                  type="text"
                  placeholder="enter custom subdomain"
                  value={slug}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(val);
                    setSignupForm({ ...signupForm, slug: val });
                  }}
                  className="bg-transparent text-white placeholder-slate-600 focus:outline-none w-full font-bold text-base"
                />
                <span className="text-slate-400 text-xs sm:text-sm font-mono pl-1 font-semibold shrink-0">
                  .educare.prohitcoretech.com
                </span>
              </div>

              <button
                onClick={() => {
                  if (slugStatus.available) setShowModal(true);
                }}
                disabled={!slugStatus.available}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-base px-8 py-3.5 rounded-2xl transition shadow-lg shadow-orange-500/25 shrink-0 cursor-pointer"
              >
                Claim Now
              </button>
            </div>

            {/* Availability Indicator */}
            {slug && (
              <div className="mt-3 px-2 flex items-center space-x-2 text-sm text-left font-medium">
                {loadingCheck ? (
                  <span className="text-slate-400 text-xs font-mono">Checking availability...</span>
                ) : slugStatus.checked ? (
                  slugStatus.available ? (
                    <span className="text-emerald-400 flex items-center font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                      {slug}.educare.prohitcoretech.com is available for instant launch!
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center font-bold text-xs">
                      <XCircle className="w-4 h-4 mr-1.5 text-rose-400" />
                      {slugStatus.reason || 'Subdomain unavailable'}
                    </span>
                  )
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SAMPLE SCREENSHOTS SHOWCASE SECTION */}
      <section className="py-20 relative z-10 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">
              <Laptop className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Tenant Screen Previews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Experience the Tenant Portal Interface</h2>
            <p className="text-slate-400 mt-2 font-medium">Explore high-fidelity mockups of actual academy administration screens built for fast daily operations.</p>
          </div>

          {/* Navigation Tabs for Screens */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTab('idcard')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'idcard' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Digital Student ID Cards</span>
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'fees' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>FIFO Fee Engine & Receipts</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'timetable' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Academics & Timetable Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Executive Dashboard</span>
            </button>
          </div>

          {/* SCREEN DISPLAY CONTAINER */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-800/80">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-slate-400 pl-2">
                chopra.educare.prohitcoretech.com/{activeTab === 'idcard' ? 'students' : activeTab === 'fees' ? 'fees' : activeTab === 'timetable' ? 'academics' : 'dashboard'}
              </span>
            </div>

            {/* TAB 1: DIGITAL ID CARD PREVIEW */}
            {activeTab === 'idcard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-white text-base">Student Master Directory & ID Card Studio</h3>
                    <p className="text-xs text-slate-400 font-medium">Manage student roster, photo uploads, blood group records, and single-click PDF ID card exports.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-500/30">
                      Standard 1st - 15th Supported
                    </span>
                  </div>
                </div>

                {/* ID Card Mockup Preview */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
                  {/* FRONT CARD MOCKUP */}
                  <div className="w-full max-w-[340px] h-[220px] bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-2xl flex flex-col justify-between text-slate-800">
                    <div className="bg-orange-600 text-white p-2 px-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-5 h-5 text-yellow-300" />
                        <div>
                          <h4 className="font-black text-[10px] uppercase text-yellow-300">CHOPRA ACADEMY</h4>
                          <p className="text-[7px] text-orange-100 font-medium">Dahisar, Mumbai</p>
                        </div>
                      </div>
                      <span className="text-[6.5px] bg-orange-700 px-1.5 py-0.5 rounded uppercase font-extrabold">VERIFIED</span>
                    </div>

                    <div className="bg-orange-500 text-white text-center py-0.5 font-black text-[9px] uppercase tracking-widest">
                      STUDENT ID CARD
                    </div>

                    <div className="p-3 flex items-start justify-between flex-1 gap-2 bg-gradient-to-b from-orange-50/20 to-white">
                      <div className="space-y-1 text-[9px]">
                        <p className="font-black text-slate-900 text-[10.5px]">NAME: ROHIT BARGE</p>
                        <p className="font-bold text-slate-600">ROLL NO: <span className="font-mono text-orange-600 font-extrabold">STU-2026-00003</span></p>
                        <p className="font-bold text-slate-600">COURSE: <span className="text-slate-900 font-extrabold">Std 12th (SCIENCE)</span></p>
                        <p className="font-bold text-slate-600">BATCH: <span className="text-slate-800 font-bold">Morning Batch</span></p>
                        <p className="font-bold text-slate-600">VALID UPTO: <span className="font-mono text-rose-600 font-bold">31-MAR-2027</span></p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-[62px] h-[72px] rounded-lg bg-slate-200 border-2 border-orange-500 overflow-hidden flex items-center justify-center">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <span className="text-[6px] font-serif italic text-slate-800 mt-1">Sandeep Chopra</span>
                        <span className="text-[5px] uppercase font-sans text-slate-500">PRINCIPAL'S SIGNATURE</span>
                      </div>
                    </div>

                    <div className="bg-orange-950 text-white p-1 px-3 flex items-center justify-between text-[7px] font-bold">
                      <span className="bg-orange-800 px-1.5 py-0.5 rounded text-[6px] uppercase">ISSUED BY ACADEMY</span>
                      <span className="font-mono">+91 9821979149</span>
                    </div>
                  </div>

                  {/* BACK CARD MOCKUP */}
                  <div className="w-full max-w-[340px] h-[220px] bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-2xl flex flex-col justify-between text-slate-800">
                    <div className="bg-orange-600 text-white p-2 text-center">
                      <h4 className="font-black text-[10px] uppercase text-yellow-300">EMERGENCY CONTACT INFORMATION</h4>
                      <p className="text-[7px] text-orange-100 font-bold uppercase">IMPORTANT DETAILS</p>
                    </div>

                    <div className="p-3 space-y-1 text-[8.5px] leading-tight flex-1 bg-gradient-to-b from-orange-50/10 to-white">
                      <p className="border-b pb-0.5"><strong className="text-slate-900">BLOOD GROUP:</strong> <span className="font-mono font-black text-rose-600 bg-rose-50 px-1 rounded">B+</span></p>
                      <p className="border-b pb-0.5"><strong className="text-slate-900">EMERGENCY CONTACT:</strong> Subhash Barge</p>
                      <p className="border-b pb-0.5"><strong className="text-slate-900">EMERGENCY PHONE:</strong> 9021979149</p>
                      <p className="border-b pb-0.5 truncate"><strong className="text-slate-900">ADDRESS:</strong> Dahisar, Mumbai 400068</p>
                      
                      <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-200 text-[7px]">
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
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Monthly Fee Settled</span>
                    <p className="text-2xl font-black text-emerald-400 font-mono mt-1">₹4,85,000</p>
                    <span className="text-[10px] text-emerald-500 font-bold">↑ 18% vs last month</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Pending Outstanding</span>
                    <p className="text-2xl font-black text-rose-400 font-mono mt-1">₹42,500</p>
                    <span className="text-[10px] text-slate-500 font-bold">Distributed across 12 installments</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Advance Balance Ledger</span>
                    <p className="text-2xl font-black text-amber-400 font-mono mt-1">₹18,000</p>
                    <span className="text-[10px] text-amber-500 font-bold">Auto-applied to next month FIFO</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-white text-sm">Recent Fee Receipts & FIFO Ledger Distribution</h4>
                    <span className="text-xs font-mono text-orange-400 font-bold">Showing Latest 10 Transactions</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 uppercase font-bold text-[10px] text-slate-400">
                        <tr>
                          <th className="p-3">Receipt No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Amount Paid</th>
                          <th className="p-3">FIFO Settlement</th>
                          <th className="p-3">Payment Mode</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        <tr>
                          <td className="p-3 font-mono text-orange-400 font-bold">REC-2026-0042</td>
                          <td className="p-3 font-bold text-white">Rohit Barge (Std 12th Sci)</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">₹12,000</td>
                          <td className="p-3 text-slate-400">Inst 1 (₹8,000) + Inst 2 (₹4,000)</td>
                          <td className="p-3"><span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">UPI / GPay</span></td>
                          <td className="p-3 text-right">
                            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-orange-500/30">Share Receipt</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-orange-400 font-bold">REC-2026-0041</td>
                          <td className="p-3 font-bold text-white">Mahesh Zambre (Std 11th Gen)</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">₹15,000</td>
                          <td className="p-3 text-slate-400">Full Single Payment Settle</td>
                          <td className="p-3"><span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded text-[10px]">Cash Ledger</span></td>
                          <td className="p-3 text-right">
                            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-orange-500/30">Share Receipt</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACADEMICS & TIMETABLE PREVIEW */}
            {activeTab === 'timetable' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Lecture Roaster & Shift Batch Management</h4>
                    <p className="text-xs text-slate-400">Weekly schedule with standard selection, shift badges (Morning/Afternoon/Evening), and CSV roster data extraction.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-500/30">
                      Download CSV Template
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-xs text-slate-300">
                    <thead className="bg-slate-900 uppercase font-bold text-[10px] text-slate-400">
                      <tr>
                        <th className="p-3">Time Slot</th>
                        <th className="p-3">Monday</th>
                        <th className="p-3">Tuesday</th>
                        <th className="p-3">Wednesday</th>
                        <th className="p-3">Thursday</th>
                        <th className="p-3">Friday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-3 font-mono font-bold text-orange-400">08:00 AM - 09:30 AM</td>
                        <td className="p-3"><span className="bg-orange-500/10 border border-orange-500/30 text-orange-300 p-2 rounded-xl block font-bold">Physics • Prof. Sharma<br/><span className="text-[10px] text-slate-400">Std 12th (Morning Batch)</span></span></td>
                        <td className="p-3"><span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2 rounded-xl block font-bold">Chemistry • Prof. Verma<br/><span className="text-[10px] text-slate-400">Std 12th (Morning Batch)</span></span></td>
                        <td className="p-3"><span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2 rounded-xl block font-bold">Maths • Prof. Kulkarni<br/><span className="text-[10px] text-slate-400">Std 12th (Morning Batch)</span></span></td>
                        <td className="p-3"><span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-2 rounded-xl block font-bold">Biology • Prof. Patil<br/><span className="text-[10px] text-slate-400">Std 12th (Morning Batch)</span></span></td>
                        <td className="p-3"><span className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2 rounded-xl block font-bold">Physics Revision<br/><span className="text-[10px] text-slate-400">Std 12th (Morning Batch)</span></span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: EXECUTIVE DASHBOARD PREVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Total Enrolled Students</span>
                    <p className="text-3xl font-black text-white font-mono mt-1">428</p>
                    <span className="text-[10px] text-emerald-400 font-bold">Active in 8 batches</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Total Faculty Members</span>
                    <p className="text-3xl font-black text-amber-400 font-mono mt-1">16</p>
                    <span className="text-[10px] text-amber-500 font-bold">With Auto Faculty ID</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Fee Collection</span>
                    <p className="text-3xl font-black text-emerald-400 font-mono mt-1">₹8,45,000</p>
                    <span className="text-[10px] text-emerald-400 font-bold">FIFO settled</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Subscription Status</span>
                    <p className="text-xl font-black text-orange-400 uppercase mt-2">ACTIVE PRO</p>
                    <span className="text-[10px] text-slate-400 font-bold">Expires March 2027</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Multi-Tenant Platform Architecture</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Each academy operates on its own dedicated subdomain with automated tenant context resolution, custom branding, and isolated MongoDB schemas.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
                  >
                    Launch Your Academy Tenant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS GRID */}
      <section className="py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-white">Engineered for High-Growth Coaching Academies</h2>
            <p className="text-slate-400 mt-3 text-lg font-medium">Comprehensive tools designed to eliminate financial friction, manual errors, and record confusion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/40 transition shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">Atomic FIFO Fee Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Payments automatically settle overdue & pending installments in strict FIFO order inside MongoDB session transactions. Overpayments convert into advance credits seamlessly.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/40 transition shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">Strict Tenant Isolation</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Request-scoped TenantContextService and TenantScopedRepository enforce zero cross-tenant data leakage. All access is verified strictly from JWT tokens.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/40 transition shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">Digital Student ID Cards & Receipts</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Generate high-resolution printable ID cards (Front & Back) and HTML5 Canvas fee receipt cards for 2-click sharing on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 relative bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-white">Simple, Transparent Indian Rupee Pricing</h2>
            <p className="text-slate-400 mt-3 text-lg font-medium">No hidden transaction fees. Pick a plan that fits your academy size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white font-mono">₹999</span>
                  <span className="text-slate-400 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-mono font-semibold">Billed annually at ₹11,988</p>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-300 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Up to 200 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Digital Student ID Card PDF</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Standard Subdomain</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl transition border border-slate-700 cursor-pointer text-sm"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-gradient-to-b from-slate-900 to-orange-950/30 border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">Professional Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-black text-white font-mono">₹2,999</span>
                  <span className="text-slate-400 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-orange-400 text-xs mt-2 font-mono font-bold">Billed annually at ₹35,988</p>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-300 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Up to 1,000 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Digital Student ID Card PDF</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Instant WhatsApp Receipt Sharing</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Custom Primary Brand Color</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition cursor-pointer text-sm"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Network</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white font-mono">₹7,999</span>
                  <span className="text-slate-400 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-medium">Multi-Branch Coaching Chains</p>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-300 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Unlimited Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Multi-Branch Scoping & Reports</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Platform Admin Console Access</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 shrink-0" /> Priority 24/7 SLA Support</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl transition border border-slate-700 cursor-pointer text-sm"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNUP TRIAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-slate-100">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <div>
              <h2 className="text-2xl font-black text-white">Create Your Academy Tenant</h2>
              <p className="text-slate-400 text-xs font-medium mt-1">Launch your branded SaaS portal with a 14-day free trial. No credit card required.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Academy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chopra Academy"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Subdomain Slug *</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
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
                    className="w-full bg-transparent text-white focus:outline-none font-bold text-sm"
                  />
                  <span className="text-slate-400 text-xs font-mono font-semibold">.educare.prohitcoretech.com</span>
                </div>
              </div>

              {/* Academy Logo Section */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>Academy Logo (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-normal">PNG / JPG / Base64</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Logo URL (e.g. https://...)"
                      value={signupForm.logoUrl}
                      onChange={(e) => setSignupForm({ ...signupForm, logoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none font-medium"
                    />
                    <label className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition flex items-center space-x-1 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-orange-400" />
                      <span>Upload File</span>
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
                    <div className="flex items-center space-x-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <img
                        src={signupForm.logoUrl}
                        alt="Academy Logo Preview"
                        className="w-9 h-9 object-contain rounded-lg border border-slate-700 bg-white p-1"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <div className="text-xs">
                        <span className="font-bold text-orange-400 block">Academy Logo Attached</span>
                        <span className="text-[10px] text-slate-400 font-mono">Will be displayed on receipts & ID cards</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Sandeep Chopra"
                  value={signupForm.adminName}
                  onChange={(e) => setSignupForm({ ...signupForm, adminName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Admin Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@chopraacademy.com"
                  value={signupForm.adminEmail}
                  onChange={(e) => setSignupForm({ ...signupForm, adminEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter password"
                    value={signupForm.adminPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, adminPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none pr-10 font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-orange-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              {signupMessage && (
                <div
                  className={`text-xs p-3 rounded-xl font-bold ${
                    signupMessage.startsWith('Success')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {signupMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition text-sm cursor-pointer"
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
