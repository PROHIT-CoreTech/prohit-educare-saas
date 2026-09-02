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
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-900 relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('/login_bg_classroom.jpg')` }}
    >
      {/* Light Ambient Overlay for High Readability */}
      <div className="absolute inset-0 bg-slate-900/25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/50 via-transparent to-orange-950/20 pointer-events-none" />

      {/* Floating Geometric Wireframe & Math Nodes Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="30%" r="200" fill="none" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="80%" cy="70%" r="300" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
          <path d="M 100 100 L 300 400 L 600 200 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      </div>

      {/* Floating Crisp White Glassmorphism Card */}
      <div className="bg-white/95 backdrop-blur-xl border border-white/80 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10">
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
