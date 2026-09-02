'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Metrics Count-Up Animation State & Refs
  const metricsRef = useRef<HTMLDivElement>(null);
  const [hasAnimatedMetrics, setHasAnimatedMetrics] = useState(false);
  const [metricAccuracy, setMetricAccuracy] = useState('99.8%');
  const [metricSpeed, setMetricSpeed] = useState('10x');
  const [metricCompliance, setMetricCompliance] = useState('100%');
  const [metricSetup, setMetricSetup] = useState('< 60 Secs');

  useEffect(() => {
    const node = metricsRef.current;
    if (!node || hasAnimatedMetrics) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimatedMetrics(true);
          observer.disconnect();

          const duration = 2000;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = Math.min(now - startTime, duration);
            const progress = elapsed / duration;
            // Ease-out cubic curve for smooth decelerating finish
            const easeOut = 1 - Math.pow(1 - progress, 3);

            // 1. Accuracy: 0 to 99.8 (preserve 1 decimal place, keep %)
            const accuracyVal = (easeOut * 99.8).toFixed(1);
            setMetricAccuracy(`${accuracyVal}%`);

            // 2. Speed: 0 to 10 (keep x)
            const speedVal = Math.round(easeOut * 10);
            setMetricSpeed(`${speedVal}x`);

            // 3. Compliance: 0 to 100 (keep %)
            const complianceVal = Math.round(easeOut * 100);
            setMetricCompliance(`${complianceVal}%`);

            // 4. Setup: 0 to 60 (keep < and Secs)
            const setupVal = Math.round(easeOut * 60);
            setMetricSetup(`< ${setupVal} Secs`);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasAnimatedMetrics]);

  const [signupForm, setSignupForm] = useState({
    name: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    logoUrl: '',
    primaryColor: '#f97316',
    institutionType: 'High School',
    institutionTypes: ['High School'] as string[],
    educationBoard: 'SSC / State Board',
    educationBoards: ['SSC / State Board'] as string[],
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
      const payload = {
        ...signupForm,
        institutionType: signupForm.institutionTypes?.[0] || signupForm.institutionType || 'High School',
        educationBoard: signupForm.educationBoards?.[0] || signupForm.educationBoard || 'SSC / State Board',
      };
      const res = await apiClient.post('/academies/signup', payload);
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
      const rawMsg = err.response?.data?.message;
      const msgStr = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : 'Signup failed. Please try again.';
      setSignupMessage(msgStr);
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
                  placeholder="e.g. myacademy"
                  value={slug}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(val);
                    setSignupForm((prev) => ({ ...prev, slug: val }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setShowModal(true);
                      setOnboardingStep(1);
                    }
                  }}
                  className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full font-bold text-sm sm:text-base min-w-0"
                />
                <span className="text-slate-500 text-[11px] sm:text-sm font-mono pl-1 font-semibold shrink-0 truncate">
                  .educare.prohitcoretech.com
                </span>
              </div>

              <button
                onClick={() => {
                  setShowModal(true);
                  setOnboardingStep(1);
                }}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl sm:rounded-2xl transition shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
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
                demo-academy.educare.prohitcoretech.com/{activeTab === 'idcard' ? 'students' : activeTab === 'fees' ? 'fees' : activeTab === 'timetable' ? 'academics' : 'dashboard'}
              </span>
            </div>

            {/* TAB 1: DIGITAL ID CARD PREVIEW */}
            {activeTab === 'idcard' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Student Master Directory &amp; ID Card Studio</h3>
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
                          <h4 className="font-black text-[10px] uppercase text-yellow-300">EXCELLENCE ACADEMY</h4>
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
                        <span className="text-[6px] font-serif italic text-slate-800 mt-0.5">Authorized Signatory</span>
                        <span className="text-[5px] uppercase font-sans text-slate-500">PRINCIPAL&apos;S SIGNATURE</span>
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

      {/* CORE OPERATIONAL BENEFIT PILLARS SECTION */}
      <section id="features" className="py-16 sm:py-24 relative bg-slate-900 text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-orange-400 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Core Application Features &amp; Benefits</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Everything Your Academy Needs to Scale Without Chaos
            </h2>
            <p className="text-slate-400 mt-4 text-sm sm:text-lg font-medium leading-relaxed">
              Purpose-built for coaching institutes, junior colleges, and schools across India. Replaces disconnected tools with one easy-to-use platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Automated Fee Collection & Receipts */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-orange-500/50 p-6 sm:p-8 rounded-3xl transition duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-400 transition">
                Automated Fee Collection &amp; Receipts
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Automatically tracks cash and online fee payments against pending monthly installments. Generates instant PDF receipts for parents and students.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-orange-400">
                <span>Clear Fee Tracking &amp; Reminders</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 2: Multi-Category & Multi-Board */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/50 p-6 sm:p-8 rounded-3xl transition duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-400 transition">
                Multi-School Level &amp; Board Support
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Flexibly manage Primary, High School, Jr. College (Science, Commerce &amp; Arts), and Degree programs across SSC, CBSE, ICSE, IB, and HSC boards.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-blue-400">
                <span>Multi-Category Selection</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 3: Smart Lecture Roster & Timetables */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/50 p-6 sm:p-8 rounded-3xl transition duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition">
                Timetable &amp; Faculty Lecture Schedules
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Day-wise faculty timetable grid across Standards 1st–15th. Upload schedules in bulk with CSV support and avoid class slot overlaps.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-purple-400">
                <span>CSV Timetable Import</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 4: Roster-Driven Faculty Attendance */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 p-6 sm:p-8 rounded-3xl transition duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition">
                Roster-Driven Faculty Attendance
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Track teacher attendance directly mapped to scheduled timetable slots. Mark Present, Absent, Half Day, or Leave with one tap and export monthly payroll audit logs.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-emerald-400">
                <span>Automated Payroll Readiness</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 5: Printable Digital Student ID Cards */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 p-6 sm:p-8 rounded-3xl transition duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition">
                Printable Digital Student ID Cards
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Auto-generate high-resolution printable Student ID cards formatted with student photo, roll number, stream, emergency contacts, QR codes, and custom brand colors.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-amber-400">
                <span>Instant PDF &amp; Canvas Export</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Feature 6: Instant Subdomain SaaS Setup */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-rose-500/50 p-6 sm:p-8 rounded-3xl transition duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-rose-400 transition">
                Instant Subdomain &amp; Brand Portal
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                Provision your custom portal at <span className="font-mono text-white">name.educare.prohitcoretech.com</span> in under 60 seconds with custom brand colors, logo branding, and isolated data security.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-rose-400">
                <span>14-Day Automated Free Trial</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETITIVE COMPARISON GRID SECTION */}
      <section id="comparison" className="py-16 sm:py-24 relative bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-orange-100 px-4 py-1.5 rounded-full text-orange-800 text-xs font-black uppercase tracking-widest mb-4 border border-orange-200">
              <Shield className="w-4 h-4 text-orange-600" />
              <span>Why Switch to PROHIT Educare</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Replace Excel Spreadsheets &amp; Legacy Software
            </h2>
            <p className="text-slate-600 mt-4 text-sm sm:text-lg font-medium">
              See how PROHIT Educare outperforms outdated manual workflows and legacy ERP tools.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4 sm:p-5">Feature Requirement</th>
                  <th className="p-4 sm:p-5 text-slate-400">Excel / Paper Registers</th>
                  <th className="p-4 sm:p-5 text-slate-400">Legacy ERP Tools</th>
                  <th className="p-4 sm:p-5 text-orange-400 bg-slate-800/80">PROHIT Educare SaaS 🚀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-700">
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Fee Collection &amp; Ledger</td>
                  <td className="p-4 sm:p-5 text-rose-600">Manual calculation errors &amp; untracked cash</td>
                  <td className="p-4 sm:p-5 text-slate-500">Rigid single fee structure</td>
                  <td className="p-4 sm:p-5 bg-orange-50/50 text-orange-950 font-bold">Automated FIFO engine + 1st–15th stream support</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Academic Levels &amp; Boards</td>
                  <td className="p-4 sm:p-5 text-rose-600">No built-in validation</td>
                  <td className="p-4 sm:p-5 text-slate-500">Complex developer reconfiguration required</td>
                  <td className="p-4 sm:p-5 bg-orange-50/50 text-orange-950 font-bold">Multi-select Primary, High School, Jr. College &amp; Boards</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Faculty Lecture Roster</td>
                  <td className="p-4 sm:p-5 text-rose-600">Paper timetables with slot conflicts</td>
                  <td className="p-4 sm:p-5 text-slate-500">Static non-interactive PDF upload</td>
                  <td className="p-4 sm:p-5 bg-orange-50/50 text-orange-950 font-bold">Interactive Std 1st–15th grid + CSV bulk import</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Faculty Daily Attendance</td>
                  <td className="p-4 sm:p-5 text-rose-600">Manual paper sign-in registers</td>
                  <td className="p-4 sm:p-5 text-slate-500">Requires expensive hardware biometric devices</td>
                  <td className="p-4 sm:p-5 bg-orange-50/50 text-orange-950 font-bold">Roster-driven 1-click attendance logging &amp; reports</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Student ID Card Generation</td>
                  <td className="p-4 sm:p-5 text-rose-600">Expensive third-party print vendors</td>
                  <td className="p-4 sm:p-5 text-slate-500">Generic unbranded templates</td>
                  <td className="p-4 sm:p-5 bg-orange-50/50 text-orange-950 font-bold">Instant printable PDF ID cards with QR &amp; brand colors</td>
                </tr>
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Setup &amp; Subdomain Provisioning</td>
                  <td className="p-4 sm:p-5 text-rose-600">N/A (Unorganized files)</td>
                  <td className="p-4 sm:p-5 text-slate-500">Weeks of local server IT setup</td>
                  <td className="p-4 sm:p-5 bg-orange-50/50 text-orange-950 font-bold">Instant 60-second automated setup with custom subdomain</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* OPERATIONAL ROI & METRICS IMPACT BAR */}
      <section ref={metricsRef} className="py-14 sm:py-20 relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-orange-400/40">
            <div className="p-4 space-y-1">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono block whitespace-nowrap">{metricAccuracy}</span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-orange-100 block">Fee Collection Accuracy</span>
              <span className="text-[11px] text-orange-200/80 font-medium block">Zero uncollected or unrecorded installments</span>
            </div>

            <div className="p-4 space-y-1 pt-6 md:pt-4">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono block whitespace-nowrap">{metricSpeed}</span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-orange-100 block">Faster Student Enrollment</span>
              <span className="text-[11px] text-orange-200/80 font-medium block">Admission &amp; ID Card generation under 2 mins</span>
            </div>

            <div className="p-4 space-y-1 pt-6 md:pt-4">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono block whitespace-nowrap">{metricCompliance}</span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-orange-100 block">Multi-Board Compliance</span>
              <span className="text-[11px] text-orange-200/80 font-medium block">Full support for SSC, CBSE, ICSE, IB &amp; HSC</span>
            </div>

            <div className="p-4 space-y-1 pt-6 md:pt-4">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono block whitespace-nowrap">{metricSetup}</span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-orange-100 block">Instant Tenant Setup</span>
              <span className="text-[11px] text-orange-200/80 font-medium block">Custom subdomain setup with 14-day free trial</span>
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

      {/* SIGNUP TRIAL MODAL - 4-STEP ONBOARDING WIZARD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false);
                setOnboardingStep(1);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            {/* Stepper Header & Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Step {onboardingStep} of 4
                    </span>
                    <span className="text-xs font-bold text-slate-500">14-Day Free Trial Setup</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {onboardingStep === 1 && '1. Academy Identity & Subdomain'}
                    {onboardingStep === 2 && '2. Academic Offerings & Boards'}
                    {onboardingStep === 3 && '3. Branding & Portal Identity'}
                    {onboardingStep === 4 && '4. Administrator Account & Launch'}
                  </h2>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(onboardingStep / 4) * 100}%` }}
                />
              </div>

              {/* Step Navigation Dots */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-500">
                <span className={onboardingStep >= 1 ? 'text-orange-600 font-extrabold' : ''}>1. Identity</span>
                <span className={onboardingStep >= 2 ? 'text-orange-600 font-extrabold' : ''}>2. Offerings</span>
                <span className={onboardingStep >= 3 ? 'text-orange-600 font-extrabold' : ''}>3. Branding</span>
                <span className={onboardingStep >= 4 ? 'text-orange-600 font-extrabold' : ''}>4. Launch</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* STEP 1: ACADEMY IDENTITY & SUBDOMAIN */}
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Academy Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Excellence Academy"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Custom Subdomain Slug *</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 overflow-hidden">
                      <input
                        type="text"
                        required
                        placeholder="e.g. excellence"
                        value={signupForm.slug}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setSlug(val);
                          setSignupForm({ ...signupForm, slug: val });
                        }}
                        className="w-full bg-transparent text-slate-900 focus:outline-none font-extrabold text-sm min-w-0"
                      />
                      <span className="text-slate-500 text-xs font-mono font-bold shrink-0">.educare.prohitcoretech.com</span>
                    </div>

                    {/* Slug Live Availability Indicator */}
                    {slug && (
                      <div className="mt-2 text-xs font-bold flex items-center space-x-1.5">
                        {loadingCheck ? (
                          <span className="text-slate-500 animate-pulse">Checking availability...</span>
                        ) : slugStatus.checked ? (
                          slugStatus.available ? (
                            <span className="text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                              <span>Subdomain is available! https://{slug}.educare.prohitcoretech.com</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-rose-500 inline" />
                              <span>{slugStatus.reason || 'Subdomain is already taken.'}</span>
                            </span>
                          )
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academy Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-semibold text-xs sm:text-sm"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!signupForm.name || !signupForm.slug || (slugStatus.checked && !slugStatus.available)}
                      onClick={() => setOnboardingStep(2)}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-xs sm:text-sm flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Next: Offerings &amp; Boards</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMIC OFFERINGS & BOARDS */}
              {onboardingStep === 2 && (
                <div className="space-y-4">
                  {/* Multi-Select Academic Levels Offered */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Academic Levels Offered * (Select All That Apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                      {[
                        'Primary School',
                        'Mid Primary',
                        'High School',
                        'Jr. College (Science)',
                        'Jr. College (Commerce)',
                        'Jr. College (Arts)',
                        'Under Graduate (UG)',
                        'Other / Coaching',
                      ].map((level) => {
                        const isChecked = signupForm.institutionTypes?.includes(level);
                        return (
                          <label
                            key={level}
                            className={`flex items-center space-x-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated = [...(signupForm.institutionTypes || [])];
                                if (e.target.checked) {
                                  if (!updated.includes(level)) updated.push(level);
                                } else {
                                  updated = updated.filter((item) => item !== level);
                                }
                                if (updated.length === 0) updated = ['High School'];
                                setSignupForm({
                                  ...signupForm,
                                  institutionTypes: updated,
                                  institutionType: updated[0],
                                });
                              }}
                              className="hidden"
                            />
                            <span className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[10px]">
                              {isChecked ? '✓' : ''}
                            </span>
                            <span className="truncate">{level}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Select Education Boards Offered */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Education Boards Offered * (Select All That Apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                      {[
                        'SSC / State Board',
                        'CBSE',
                        'ICSE / ICSC',
                        'IB / International',
                        'HSC State Board',
                        'University Board',
                        'Other / N/A',
                      ].map((board) => {
                        const isChecked = signupForm.educationBoards?.includes(board);
                        return (
                          <label
                            key={board}
                            className={`flex items-center space-x-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                              isChecked
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated = [...(signupForm.educationBoards || [])];
                                if (e.target.checked) {
                                  if (!updated.includes(board)) updated.push(board);
                                } else {
                                  updated = updated.filter((item) => item !== board);
                                }
                                if (updated.length === 0) updated = ['SSC / State Board'];
                                setSignupForm({
                                  ...signupForm,
                                  educationBoards: updated,
                                  educationBoard: updated[0],
                                });
                              }}
                              className="hidden"
                            />
                            <span className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[10px]">
                              {isChecked ? '✓' : ''}
                            </span>
                            <span className="truncate">{board}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-xs sm:text-sm flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Next: Branding &amp; Color</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: BRANDING & IDENTITY */}
              {onboardingStep === 3 && (
                <div className="space-y-4">
                  {/* Primary Brand Theme Color Picker */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Primary Theme Accent Color</label>
                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                      {[
                        { name: 'Orange', hex: '#f97316' },
                        { name: 'Royal Blue', hex: '#2563eb' },
                        { name: 'Emerald', hex: '#059669' },
                        { name: 'Purple', hex: '#7c3aed' },
                        { name: 'Crimson', hex: '#e11d48' },
                      ].map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setSignupForm({ ...signupForm, primaryColor: color.hex })}
                          className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            signupForm.primaryColor === color.hex
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: color.hex }} />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Upload Section */}
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none font-medium min-w-0"
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

                      {/* Live Brand Card Preview */}
                      <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {signupForm.logoUrl ? (
                            <img
                              src={signupForm.logoUrl}
                              alt="Logo Preview"
                              className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-700 shrink-0"
                              onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                              {signupForm.name ? signupForm.name.slice(0, 2).toUpperCase() : 'PA'}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-sm block">{signupForm.name || 'Your Academy Portal'}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">https://{signupForm.slug || 'demo'}.educare.prohitcoretech.com</span>
                          </div>
                        </div>
                        <span
                          className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                          style={{ backgroundColor: signupForm.primaryColor || '#f97316' }}
                          title="Selected Accent Theme"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(4)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-xs sm:text-sm flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Next: Admin Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ADMINISTRATOR ACCOUNT & LAUNCH */}
              {onboardingStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Super Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Rajesh Sharma"
                      value={signupForm.adminName}
                      onChange={(e) => setSignupForm({ ...signupForm, adminName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Super Admin Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@youracademy.com"
                      value={signupForm.adminEmail}
                      onChange={(e) => setSignupForm({ ...signupForm, adminEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Enter password (min 6 characters)"
                        value={signupForm.adminPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, adminPassword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none pr-10 font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Card Before Launch */}
                  <div className="bg-orange-50/70 border border-orange-200 p-3.5 rounded-2xl space-y-1 text-xs">
                    <span className="font-extrabold text-orange-950 block text-sm">Tenant Setup Summary:</span>
                    <div className="text-orange-900 space-y-0.5 font-medium">
                      <p>• Subdomain: <span className="font-bold font-mono">https://{signupForm.slug || 'demo'}.educare.prohitcoretech.com</span></p>
                      <p>• Offerings: <span className="font-bold">{signupForm.institutionTypes?.join(', ')}</span></p>
                      <p>• Boards: <span className="font-bold">{signupForm.educationBoards?.join(', ')}</span></p>
                    </div>
                  </div>

                  {signupMessage && (
                    <div
                      className={`text-xs p-3 rounded-xl font-bold ${
                        String(signupMessage).startsWith('Success')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {String(signupMessage)}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !signupForm.adminName || !signupForm.adminEmail || !signupForm.adminPassword}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition text-xs sm:text-sm cursor-pointer flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                      <span>{submitting ? 'Creating Academy Tenant...' : '🚀 Launch Academy SaaS Now'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
