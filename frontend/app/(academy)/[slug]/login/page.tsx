'use client';

import React, { useState } from 'react';
import { Lock, Mail, Building, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
            {params.slug.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-xl text-white capitalize">{params.slug} Academy</h1>
            <p className="text-xs text-indigo-400 font-mono">{params.slug}.educare.prohitcoretech.com</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Staff Email</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <Mail className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="email"
                required
                placeholder="admin@academy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 relative">
              <Lock className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            {loading ? 'Authenticating...' : 'Sign In to Academy'}
          </button>
        </form>
      </div>
    </div>
  );
}
