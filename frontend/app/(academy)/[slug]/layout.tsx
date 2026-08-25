'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, BookOpen, BarChart3, LogOut, ShieldAlert, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    const token = localStorage.getItem('prohit_auth_token');
    if (token) {
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
        .catch(() => {});
    }
  }, []);

  if (pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  const primaryColor = academy?.primaryColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-1 text-center text-xs flex items-center justify-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Platform Admin Impersonation Session Active for {academy?.name || params.slug}</span>
        </div>
      )}

      {/* Subscription / Trial Expiration Banner */}
      {subscription && (subscription.isTrialExpired || subscription.subscriptionStatus === 'EXPIRED') && (
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold px-4 py-2 text-center text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2 mx-auto">
            <AlertCircle className="w-4 h-4 animate-bounce text-yellow-300" />
            <span>
              Your 14-Day Free Trial / Subscription for {academy?.name || 'Academy'} has expired! Upgrade now to maintain full platform access.
            </span>
            <Link
              href="/subscription"
              className="bg-white text-rose-700 hover:bg-slate-100 px-3 py-1 rounded-lg font-extrabold text-[11px] shadow transition ml-2 inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Renew / Upgrade Now</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Tenant Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {academy?.name?.charAt(0) || params.slug.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">{academy?.name || `${params.slug} Academy`}</h1>
              <span className="text-xs text-slate-400 font-mono">{params.slug}.prohiteducare.com</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4 text-sm font-medium">
            <Link
              href={`/dashboard`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/dashboard') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              href={`/students`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/students') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </Link>

            <Link
              href={`/fees`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/fees') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Fee Engine</span>
            </Link>

            <Link
              href={`/academics`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/academics') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Academics</span>
            </Link>

            <Link
              href={`/reports`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/reports') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </Link>

            <Link
              href={`/subscription`}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                pathname.includes('/subscription') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Subscription</span>
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem('prohit_auth_token');
                window.location.href = `/login`;
              }}
              className="text-slate-400 hover:text-rose-400 p-2 rounded-xl"
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
