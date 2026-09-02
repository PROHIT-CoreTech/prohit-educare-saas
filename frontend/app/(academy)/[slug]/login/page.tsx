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
    ? params.slug.charAt(0).toUpperCase() + params.slug.slice(1) + ' Academy'
    : 'Chopra Academy';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#EA580C] font-sans relative overflow-hidden">
      {/* 1. LEFT SIDE: Workspace / Illustration Column (Desktop >= 1024px) */}
      <div className="lg:col-span-6 xl:col-span-7 hidden lg:flex relative overflow-hidden bg-[#EA580C]">
        {/* Workspace Vector Background Illustration */}
        <Image
          src={loginBg}
          alt="Academy Workspace Illustration"
          fill
          priority
          className="object-cover object-left-top z-0 pointer-events-none opacity-90"
        />

        {/* Ambient Orange Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EA580C]/30 to-[#EA580C] z-10 pointer-events-none" />

        {/* Left Side Decorative Brand Watermark */}
        <div className="relative z-20 p-12 flex flex-col justify-between h-full text-white pointer-events-none select-none">
          <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl w-fit border border-white/10 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-white text-[#EA580C] flex items-center justify-center font-black text-lg">
              {params.slug.charAt(0).toUpperCase()}
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider">{academyName}</span>
          </div>

          <div className="max-w-md space-y-3 bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/15 shadow-2xl">
            <h2 className="text-2xl font-black leading-tight text-white">Smart Academy ERP &amp; Governance</h2>
            <p className="text-xs text-orange-100 font-medium leading-relaxed">
              Automated FIFO fee collection, student ID card studio, faculty timetable rosters, and isolated multi-tenant security.
            </p>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDE: Centered Pure White Login Card Container */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-20 bg-[#EA580C]">
        {/* Login Card Component */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 sm:p-10 space-y-6 text-slate-900 border border-white/40 relative">
          {/* Header / Branding */}
          <div className="flex items-start space-x-4">
            {academyLogo ? (
              <img
                src={academyLogo}
                alt={academyName}
                className="w-12 h-12 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-orange-500/30 uppercase shrink-0">
                {params.slug.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-xl sm:text-2xl text-slate-800 tracking-tight capitalize truncate">
                {academyName}
              </h1>
              <div className="flex items-center space-x-1 text-xs font-semibold text-[#EA580C] mt-0.5">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{params.slug}.educare.prohitcoretech.com</span>
              </div>
            </div>
          </div>

          {/* Description Text */}
          <p className="text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-4">
            Enter your authorized staff credentials to access the academy ERP portal.
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            {/* Staff Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                STAFF EMAIL *
              </label>
              <div className="flex items-center bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-[#EA580C] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition shadow-xs">
                <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="chopra@academy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-semibold text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                PASSWORD *
              </label>
              <div className="flex items-center bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-[#EA580C] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition relative shadow-xs">
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

            {/* Error Message */}
            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold shadow-xs">
                {error}
              </div>
            )}

            {/* Submit Button */}
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
  );
}
