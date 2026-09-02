'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Mail, Building2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

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
      .then(() => {})
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
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-900 relative overflow-hidden bg-slate-950">
      {/* Rich Ambient Gradient Mesh Background (100% Reliable, No 404 image dependencies) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-orange-950/40 to-slate-950 z-0 pointer-events-none" />

      {/* Ambient Spotlights */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Pure SVG Smart Classroom & Tech Mesh Illustration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30 select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
            </linearGradient>
            <pattern id="eduGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eduGrid)" />
          
          {/* Smartboard Outline */}
          <rect x="5%" y="10%" width="35%" height="45%" rx="16" fill="none" stroke="url(#gridGrad)" strokeWidth="2" strokeDasharray="8 4" />
          
          {/* Geometric Edu-Nodes */}
          <circle cx="20%" cy="30%" r="140" fill="none" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="75%" cy="65%" r="220" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />
          <line x1="20%" y1="30%" x2="75%" y2="65%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <circle cx="45%" cy="80%" r="180" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
        </svg>

        {/* Floating Math Symbols */}
        <div className="absolute top-16 left-20 text-orange-400 text-6xl font-serif opacity-70">∑</div>
        <div className="absolute top-1/3 right-24 text-cyan-400 text-7xl font-mono opacity-70">π</div>
        <div className="absolute bottom-1/4 left-16 text-purple-400 text-6xl font-serif opacity-70">∫</div>
        <div className="absolute bottom-16 right-1/3 text-orange-400 text-4xl font-mono opacity-70">E = mc²</div>
      </div>

      {/* Floating Crisp White Glassmorphism Card */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10">
        <div className="flex items-center space-x-3.5">
          {academyLogo ? (
            <img
              src={academyLogo}
              alt={params.slug}
              className="w-12 h-12 object-contain rounded-2xl border border-slate-200 bg-white p-1 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20 uppercase shrink-0">
              {params.slug.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-extrabold text-xl text-slate-900 capitalize truncate">{params.slug} Academy</h1>
            <p className="text-xs text-orange-600 font-mono font-semibold truncate">{params.slug}.educare.prohitcoretech.com</p>
          </div>
        </div>

        <div className="border-t border-slate-200/80 pt-3">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Enter your authorized staff credentials to access the academy ERP portal.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Staff Email *</label>
            <div className="flex items-center bg-slate-50/90 border border-slate-200/90 rounded-xl px-3.5 py-2.5 focus-within:border-orange-500 focus-within:bg-white transition shadow-xs">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="email"
                required
                placeholder="admin@academy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-semibold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
            <div className="flex items-center bg-slate-50/90 border border-slate-200/90 rounded-xl px-3.5 py-2.5 relative focus-within:border-orange-500 focus-within:bg-white transition shadow-xs">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
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
                className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-orange-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50/90 p-3 rounded-xl border border-rose-200 font-semibold shadow-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition text-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Academy</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
