'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Zap, CreditCard, Sparkles, CheckCircle2, XCircle, ArrowRight, BookOpen, Users, BarChart3, Check, ShieldAlert, LogIn, Eye, EyeOff } from 'lucide-react';
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
        }, 1500);
      }
    } catch (err: any) {
      setSignupMessage(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              PE
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                PROHIT Educare
              </span>
              <span className="text-[10px] uppercase tracking-wider block text-indigo-400 font-semibold -mt-1">
                by PROHIT CoreTech
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm font-medium">
            {/* Product Admin (Platform Owner) Login Link */}
            <a
              href="/platform-admin"
              className="text-slate-400 hover:text-rose-400 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition border border-transparent hover:border-rose-500/20"
              title="Product Admin Console"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Product Admin</span>
            </a>

            {/* Academy Tenant Login Link */}
            <a
              href="http://viraj.localhost:3000/login"
              className="text-slate-400 hover:text-indigo-400 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Academy Login</span>
            </a>

            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center space-x-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Next-Gen Multi-Tenant SaaS for Educational Academies</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Scale Your Academy with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              Zero Financial Confusion
            </span>
          </h1>

          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automated FIFO fee collection, atomic receipt generation, standard 11th+ medium locking, dynamic branding, and multi-tenant security built for Indian Coaching Institutes.
          </p>

          {/* Subdomain Availability Checker Widget */}
          <div className="mt-12 max-w-xl mx-auto bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-2xl backdrop-blur">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider text-left mb-2 px-2">
              Claim Your Custom Subdomain
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="viraj"
                  value={slug}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(val);
                    setSignupForm({ ...signupForm, slug: val });
                  }}
                  className="bg-transparent text-white placeholder-slate-600 focus:outline-none w-full font-medium text-sm sm:text-base"
                />
                <span className="text-slate-500 text-xs sm:text-sm font-mono pl-1">.educare.prohitcoretech.com</span>
              </div>
              <button
                onClick={() => {
                  if (slugStatus.available) setShowModal(true);
                }}
                disabled={!slugStatus.available}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                Claim Now
              </button>
            </div>

            {/* Availability indicator */}
            {slug && (
              <div className="mt-3 px-2 flex items-center space-x-2 text-sm text-left">
                {loadingCheck ? (
                  <span className="text-slate-400">Checking availability...</span>
                ) : slugStatus.checked ? (
                  slugStatus.available ? (
                    <span className="text-emerald-400 flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                      {slug}.educare.prohitcoretech.com is available!
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center font-medium">
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

      {/* Feature Grid */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">Engineered for High-Growth Academies</h2>
            <p className="text-slate-400 mt-3">Comprehensive tools designed to eliminate operational friction and manual errors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Atomic FIFO Fee Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Payments automatically settle overdue & pending installments in strict FIFO order inside MongoDB session transactions. Overpayments convert into advance credits seamlessly.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Strict Tenant Isolation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Request-scoped TenantContextService and TenantScopedRepository enforce zero cross-tenant leakage. All access verified strictly from JWT tokens.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Receipt Card Generation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
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
            <h2 className="text-4xl font-extrabold text-white">Simple, Transparent Indian Rupee Pricing</h2>
            <p className="text-slate-400 mt-3 text-lg">No hidden transaction fees. Pick a plan that fits your academy size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">₹999</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
                <p className="text-slate-400 text-xs mt-2">Billed annually at ₹11,988</p>

                <ul className="mt-8 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Up to 200 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Canvas Digital Receipts</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Standard Subdomain</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Professional Academy</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">₹2,999</span>
                  <span className="text-slate-300 text-sm ml-2">/ month</span>
                </div>
                <p className="text-indigo-300 text-xs mt-2">Billed annually at ₹35,988</p>

                <ul className="mt-8 space-y-3 text-sm text-slate-200">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Up to 1,000 Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Atomic FIFO Fee Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Instant WhatsApp Receipt Share</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Cashfree Payments Integration</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Custom Domain Support</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Network</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">₹7,999</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
                <p className="text-slate-400 text-xs mt-2">Multi-Branch Academy Chains</p>

                <ul className="mt-8 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Unlimited Active Students</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Multi-Branch Branch Scoping</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Platform Admin Impersonation API</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2.5" /> Dedicated SLA & Priority Support</li>
                </ul>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Academy</h2>
            <p className="text-slate-400 text-sm mb-6">Get started with a 14-day full access trial. No credit card required.</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Academy Name</label>
                <input
                  type="text"
                  required
                  placeholder="Viraj Academy of Science"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subdomain Slug</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <input
                    type="text"
                    required
                    placeholder="viraj"
                    value={signupForm.slug}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full bg-transparent text-white focus:outline-none"
                  />
                  <span className="text-slate-500 text-xs font-mono">.educare.prohitcoretech.com</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Viraj Patel"
                  value={signupForm.adminName}
                  onChange={(e) => setSignupForm({ ...signupForm, adminName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@virajacademy.com"
                  value={signupForm.adminEmail}
                  onChange={(e) => setSignupForm({ ...signupForm, adminEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signupForm.adminPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, adminPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {signupMessage && (
                <div
                  className={`text-sm p-3 rounded-xl ${
                    signupMessage.startsWith('Success')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {signupMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition"
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
