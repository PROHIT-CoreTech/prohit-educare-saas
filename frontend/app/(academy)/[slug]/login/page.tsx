'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Globe } from 'lucide-react';
import { apiClient } from '@/lib/api';
import loginBg from '@/public/login_bg_classroom.svg';

export default function AcademyLoginPage({ params }: { params: { slug: string } }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [academyLogo, setAcademyLogo] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get(`/academies/check-slug/${params.slug}`)
      .then((res) => {
        if (res.data?.logoUrl) {
          setAcademyLogo(res.data.logoUrl);
        }
      })
      .catch(() => {});
  }, [params.slug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', {
        email,
        pass: password,
        academySlug: params.slug,
      });
      if (res.data.token) {
        localStorage.setItem('prohit_auth_token', res.data.token);
        window.location.href = `/dashboard`;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid staff email or password');
    } finally {
      setLoading(false);
    }
  };

  const academyName = params.slug
    ? params.slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('-') + ' Academy'
    : 'Priya-Academy Academy';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans relative overflow-hidden bg-slate-950">
      {/* Real Smart Classroom / Analytics Orange Mesh SVG Background */}
      <Image
        src={loginBg}
        alt="Academy Orange Mesh Background"
        fill
        priority
        className="object-cover z-0 pointer-events-none"
      />

      {/* Main Container Layout */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* LEFT COLUMN: Brand Watermark & ERP Info */}
        <div className="lg:col-span-7 hidden lg:flex flex-col justify-between h-full min-h-[580px] p-4 text-white pointer-events-none select-none">
          {/* Top Left Academy Pill */}
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit border border-white/10 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-white text-[#EA580C] flex items-center justify-center font-black text-base shadow-xs uppercase">
              {params.slug.charAt(0).toUpperCase()}
            </div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white">{academyName}</span>
          </div>

          {/* Bottom Left ERP Info Box */}
          <div className="max-w-md space-y-3 bg-black/40 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white">Smart Academy ERP &amp; Governance</h2>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              Automated FIFO fee collection, student ID card studio, faculty timetable rosters, and isolated multi-tenant security.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Pure White Login Card */}
        <div className="col-span-12 lg:col-span-5 flex items-center justify-center lg:justify-end">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full space-y-6 text-slate-900 border border-white/50 relative">
            {/* Header & Branding Badge */}
            <div className="flex items-start space-x-4">
              {academyLogo ? (
                <img
                  src={academyLogo}
                  alt={academyName}
                  className="w-12 h-12 object-contain rounded-2xl border border-slate-200 bg-white p-1 shadow-md shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-orange-500/30 uppercase shrink-0">
                  {params.slug.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight capitalize truncate">
                  {academyName}
                </h1>
                <div className="flex items-center space-x-1 text-xs font-semibold text-[#EA580C] mt-0.5">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{params.slug}.educare.prohitcoretech.com</span>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-4">
              Enter your authorized staff credentials to access the academy ERP portal.
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  STAFF EMAIL *
                </label>
                <div className="flex items-center bg-slate-50/90 border border-slate-200/90 rounded-xl px-3.5 py-3 focus-within:border-[#EA580C] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition shadow-xs">
                  <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="priyanka@prohiteducare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-semibold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PASSWORD *
                </label>
                <div className="flex items-center bg-slate-50/90 border border-slate-200/90 rounded-xl px-3.5 py-3 focus-within:border-[#EA580C] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition relative shadow-xs">
                  <Lock className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none pr-8 font-semibold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#EA580C]" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold shadow-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#EA580C] hover:bg-orange-600 active:scale-[0.98] transition-all duration-200 text-white font-bold py-3.5 shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-white" />
                    <span>Sign In to Academy</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
