'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, BookOpen, BarChart3, LogOut, ShieldAlert, ShieldCheck, Sparkles, AlertCircle, Settings } from 'lucide-react';
import { apiClient } from '../../../lib/api';

export default function AcademyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const pathname = usePathname();
  const [academy, setAcademy] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const [unauthenticated, setUnauthenticated] = useState(false);

  useEffect(() => {
    let token = typeof window !== 'undefined' ? localStorage.getItem('prohit_auth_token') : null;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token');
      if (queryToken) {
        token = queryToken;
        localStorage.setItem('prohit_auth_token', queryToken);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    if (token) {
      setUnauthenticated(false);
      apiClient
        .get('/academies/my-academy')
        .then((res) => setAcademy(res.data))
        .catch(() => {});

      apiClient
        .get('/billing/my-subscription')
        .then((res) => setSubscription(res.data))
        .catch(() => {});

      apiClient
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          if (res.data.user?.isImpersonating) {
            setIsImpersonating(true);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem('prohit_auth_token');
            setUnauthenticated(true);
          }
        });
    } else {
      setUnauthenticated(true);
    }
  }, [pathname]);

  if (pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  const primaryColor = academy?.primaryColor || '#f97316'; // Vibrant Orange default

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-amber-400 text-slate-950 font-bold px-4 py-1.5 text-center text-xs flex items-center justify-center space-x-2 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-slate-950" />
          <span>Platform Admin Impersonation Session Active for {academy?.name || params.slug}</span>
        </div>
      )}

      {/* Unauthenticated Banner */}
      {unauthenticated && (
        <div className="bg-rose-600 text-white font-bold px-4 py-2 text-center text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 mx-auto">
            <AlertCircle className="w-4 h-4 text-white" />
            <span>You are not logged in to {academy?.name || params.slug} Academy. Please sign in to perform actions or manage data.</span>
            <Link
              href="/login"
              className="bg-white text-rose-600 hover:bg-slate-100 px-3 py-1 rounded-lg font-extrabold text-[11px] shadow transition ml-2 inline-flex items-center space-x-1"
            >
              <span>Sign In Now</span>
            </Link>
          </div>
        </div>
      )}

      {/* Subscription / Trial Expiration Banner */}
      {subscription && (subscription.isTrialExpired || subscription.subscriptionStatus === 'EXPIRED') && (
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold px-4 py-2 text-center text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 mx-auto">
            <AlertCircle className="w-4 h-4 animate-bounce text-yellow-200" />
            <span>
              Your 14-Day Free Trial / Subscription for {academy?.name || 'Academy'} has expired! Renew now to maintain full platform access.
            </span>
            <Link
              href="/subscription"
              className="bg-white text-orange-600 hover:bg-slate-100 px-3 py-1 rounded-lg font-extrabold text-[11px] shadow transition ml-2 inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Renew / Upgrade Now</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Tenant Navigation */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {academy?.logoUrl ? (
              <img
                src={academy.logoUrl}
                alt={academy?.name || 'Academy Logo'}
                className="w-10 h-10 object-contain rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {academy?.name?.charAt(0) || params.slug.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">{academy?.name || `${params.slug} Academy`}</h1>
              <span className="text-xs text-orange-600 font-mono font-semibold">{params.slug}.prohiteducare.com</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
            <Link
              href={`/dashboard`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/dashboard')
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              href={`/students`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/students')
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </Link>

            <Link
              href={`/fees`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/fees')
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Fee Engine</span>
            </Link>

            <Link
              href={`/academics`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/academics')
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Academics</span>
            </Link>

            <Link
              href={`/reports`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/reports')
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </Link>

            <Link
              href={`/settings`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/settings')
                  ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <Link
              href={`/subscription`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/subscription')
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-sm'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Subscription</span>
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem('prohit_auth_token');
                window.location.href = `/login`;
              }}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
