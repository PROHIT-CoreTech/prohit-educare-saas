'use client';

import React, { useState } from 'react';
import { Lock, Mail, Building2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function AcademyLoginPage({ params }: { params: { slug: string } }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-xl space-y-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20 uppercase">
            {params.slug.charAt(0)}
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 capitalize">{params.slug} Academy</h1>
            <p className="text-xs text-orange-600 font-mono font-semibold">{params.slug}.educare.prohitcoretech.com</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Enter your authorized staff credentials to access the academy ERP portal.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Staff Email *</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-orange-500 transition">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type="email"
                required
                placeholder="admin@academy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 relative focus-within:border-orange-500 transition">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none pr-8 font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-orange-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm flex items-center justify-center space-x-2"
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
