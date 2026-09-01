'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Zap, CreditCard, Sparkles, CheckCircle2, XCircle, ArrowRight, BookOpen, Users, BarChart3, Check, ShieldAlert, LogIn, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20 text-lg">
              PE
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                PROHIT Educare
              </span>
              <span className="text-[10px] uppercase tracking-wider block text-orange-600 font-extrabold -mt-1">
                by PROHIT CoreTech
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm font-semibold">
            {/* Product Admin Login Link */}
            <a
              href="/platform-admin"
              className="text-slate-600 hover:text-rose-600 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition hover:bg-rose-50"
              title="Product Admin Console"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Product Admin</span>
            </a>

            {/* Academy Tenant Login Link */}
            <a
              href="http://viraj.localhost:3000/login"
              className="text-slate-600 hover:text-orange-600 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition hover:bg-orange-50"
            >
              <LogIn className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">Academy Login</span>
            </a>

            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition duration-200 flex items-center space-x-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-full text-orange-700 text-xs font-bold uppercase tracking-wide mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Next-Gen Multi-Tenant SaaS for Educational Academies</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Scale Your Academy with <br />
            <span className="text-orange-600">
              Zero Financial Confusion
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Automated FIFO fee collection, atomic receipt generation, standard 1st-15th stream support, dynamic branding, and multi-tenant security built for Indian Coaching Institutes.
          </p>

          {/* Subdomain Availability Checker Widget */}
          <div className="mt-10 max-w-xl mx-auto bg-white border border-slate-200 p-3 rounded-2xl shadow-md">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-left mb-2 px-2">
              Claim Your Custom Subdomain
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Enter custom subdomain"
                  value={slug}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(val);
                    setSignupForm({ ...signupForm, slug: val });
                  }}
                  className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full font-bold text-sm sm:text-base"
                />
                <span className="text-slate-500 text-xs sm:text-sm font-mono pl-1 font-semibold">.educare.prohitcoretech.com</span>
              </div>
              <button
                onClick={() => {
                  if (slugStatus.available) setShowModal(true);
                }}
                disabled={!slugStatus.available}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md shadow-orange-500/20"
              >
                Claim Now
              </button>
            </div>

            {/* Availability indicator */}
            {slug && (
              <div className="mt-3 px-2 flex items-center space-x-2 text-sm text-left font-medium">
                {loadingCheck ? (
                  <span className="text-slate-500">Checking availability...</span>
                ) : slugStatus.checked ? (
                  slugStatus.available ? (
                    <span className="text-emerald-700 flex items-center font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                      {slug}.educare.prohitcoretech.com is available!
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center font-bold">
                      <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                      {slugStatus.reason || 'Subdomain unavailable'}
                    </span>
                  )
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Engineered for High-Growth Academies</h2>
            <p className="text-slate-500 mt-2 font-medium">Comprehensive tools designed to eliminate operational friction and manual errors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-orange-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Atomic FIFO Fee Engine</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Payments automatically settle overdue & pending installments in strict FIFO order inside MongoDB session transactions. Overpayments convert into advance credits seamlessly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-orange-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Strict Tenant Isolation</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Request-scoped TenantContextService and TenantScopedRepository enforce zero cross-tenant leakage. All access verified strictly from JWT tokens.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-orange-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Instant Receipt Card Generation</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Generate high-resolution digital receipt cards directly on HTML5 Canvas and share instantly via WhatsApp or Web Share API with 2-tap simplicity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Explicit Indian Rupees (₹) Pricing */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900">Simple, Transparent Indian Rupee Pricing</h2>
            <p className="text-slate-500 mt-2 text-lg font-medium">No hidden transaction fees. Pick a plan that fits your academy size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900 font-mono">₹999</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-mono font-semibold">Billed annually at ₹11,988</p>

                <ul className="mt-8 space-y-3 text-sm text-slate-700 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Up to 200 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Canvas Digital Receipts</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Standard Subdomain</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition border border-slate-200"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-orange-50/30 border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-md">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-xs">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Professional Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-black text-slate-900 font-mono">₹2,999</span>
                  <span className="text-slate-600 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-orange-700 text-xs mt-2 font-mono font-bold">Billed annually at ₹35,988</p>

                <ul className="mt-8 space-y-3 text-sm text-slate-700 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Up to 1,000 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Instant WhatsApp Receipt Share</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Cashfree Payments Integration</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Custom Domain Support</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-orange-500/20 transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 transition shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise Network</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900 font-mono">₹7,999</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">/ month</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-medium">Multi-Branch Academy Chains</p>

                <ul className="mt-8 space-y-3 text-sm text-slate-700 font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Unlimited Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Multi-Branch Branch Scoping</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Platform Admin Impersonation API</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2.5" /> Dedicated SLA & Priority Support</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition border border-slate-200"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Create Your Academy</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Get started with a 14-day full access trial. No credit card required.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academy Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter academy name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subdomain Slug</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter subdomain slug"
                    value={signupForm.slug}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full bg-transparent text-slate-900 focus:outline-none font-bold"
                  />
                  <span className="text-slate-500 text-xs font-mono font-semibold">.educare.prohitcoretech.com</span>
                </div>
              </div>

              {/* Academy Logo Section (Upload or Image URL) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Academy Logo (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / JPG / Data URL</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Logo URL (e.g. https://...)"
                      value={signupForm.logoUrl}
                      onChange={(e) => setSignupForm({ ...signupForm, logoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-orange-500 focus:outline-none font-medium"
                    />
                    <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition flex items-center space-x-1 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
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
                    <div className="flex items-center space-x-3 p-2 bg-orange-50/60 border border-orange-200 rounded-xl">
                      <img
                        src={signupForm.logoUrl}
                        alt="Academy Logo Preview"
                        className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <div className="text-xs">
                        <span className="font-bold text-orange-800 block">Academy Logo Attached</span>
                        <span className="text-[10px] text-slate-500 font-mono">Will be featured on receipts & portal header</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name of admin"
                  value={signupForm.adminName}
                  onChange={(e) => setSignupForm({ ...signupForm, adminName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email address"
                  value={signupForm.adminEmail}
                  onChange={(e) => setSignupForm({ ...signupForm, adminEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter password"
                    value={signupForm.adminPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, adminPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none pr-10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-orange-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
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
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm"
              >
                {submitting ? 'Creating Academy...' : 'Launch Academy Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
