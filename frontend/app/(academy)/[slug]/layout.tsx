'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, BookOpen, BarChart3, LogOut, 
  ShieldAlert, ShieldCheck, Sparkles, AlertCircle, Settings, Menu, X 
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  const primaryColor = academy?.primaryColor || '#f97316';

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Fee Engine', href: '/fees', icon: CreditCard },
    { name: 'Academics', href: '/academics', icon: BookOpen },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col font-sans relative bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url('/dashboard_bg_edu_tech.jpg')` }}
    >
      {/* Soft Translucent Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-slate-50/15 to-orange-100/25 pointer-events-none" />

      {/* Floating Math Symbols & Node Watermarks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 select-none">
        <div className="absolute top-12 left-10 text-orange-600 text-6xl font-serif font-bold animate-pulse">∑</div>
        <div className="absolute top-1/4 right-20 text-cyan-600 text-7xl font-mono font-bold">π</div>
        <div className="absolute bottom-1/3 left-1/4 text-teal-600 text-6xl font-serif font-bold">∫</div>
        <div className="absolute bottom-20 right-1/3 text-orange-500 text-5xl font-mono">E = mc²</div>
        <div className="absolute top-1/3 left-1/3 text-indigo-500 text-6xl font-serif">∞</div>
        <div className="absolute bottom-12 left-16 text-cyan-500 text-5xl font-mono">Δx</div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-center text-xs flex items-center justify-center space-x-2 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">Platform Admin Impersonation Session Active for {academy?.name || params.slug}</span>
          </div>
        )}

        {/* Unauthenticated Banner */}
        {unauthenticated && (
          <div className="bg-rose-600 text-white font-bold px-3 py-2 text-center text-xs flex flex-col sm:flex-row items-center justify-between shadow-md gap-2">
            <div className="flex items-center space-x-2 mx-auto">
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span className="truncate">You are not logged in. Please sign in to manage data.</span>
            </div>
            <Link
              href="/login"
              className="bg-white text-rose-600 hover:bg-slate-100 px-3 py-1 rounded-lg font-extrabold text-[11px] shadow transition shrink-0"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {/* Subscription / Trial Expiration Banner */}
        {subscription && (subscription.isTrialExpired || subscription.subscriptionStatus === 'EXPIRED') && (
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold px-3 py-2 text-center text-xs flex flex-col sm:flex-row items-center justify-between shadow-md gap-2">
            <div className="flex items-center space-x-2 mx-auto">
              <AlertCircle className="w-4 h-4 animate-bounce text-yellow-200 shrink-0" />
              <span className="truncate">Trial / Subscription expired! Renew now to maintain access.</span>
            </div>
            <Link
              href="/settings"
              className="bg-white text-orange-600 hover:bg-slate-100 px-3 py-1 rounded-lg font-extrabold text-[11px] shadow transition shrink-0 inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Renew Now</span>
            </Link>
          </div>
        )}

        {/* Top Tenant Navigation */}
        <header className="border-b border-white/60 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {academy?.logoUrl ? (
              <img
                src={academy.logoUrl}
                alt={academy?.name || 'Academy Logo'}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-base sm:text-lg shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {academy?.name?.charAt(0) || params.slug.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 leading-tight truncate">
                {academy?.name || `${params.slug} Academy`}
              </h1>
              <span className="text-[10px] sm:text-xs text-orange-600 font-mono font-semibold block truncate">
                {params.slug}.educare.prohitcoretech.com
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs sm:text-sm font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname.includes(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition ${
                    active
                      ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                localStorage.removeItem('prohit_auth_token');
                window.location.href = `/login`;
              }}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-600" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 shadow-xl space-y-1.5 animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname.includes(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl flex items-center justify-between transition font-bold text-sm ${
                    active
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-orange-600' : 'text-slate-500'}`} />
                    <span>{link.name}</span>
                  </div>
                  {active && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                </Link>
              );
            })}

            <button
              onClick={() => {
                localStorage.removeItem('prohit_auth_token');
                window.location.href = `/login`;
              }}
              className="w-full px-4 py-3 rounded-xl flex items-center space-x-3 text-rose-600 hover:bg-rose-50 font-bold text-sm transition border border-rose-100 mt-2"
            >
              <LogOut className="w-5 h-5 text-rose-600" />
              <span>Logout Account</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Responsive Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>

      {/* Mobile Bottom Navigation Bar (< 1024px) for Quick 1-Tap Access */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const active = pathname.includes(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                active ? 'text-orange-600 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-orange-600 scale-110' : 'text-slate-500'}`} />
              <span className="text-[10px] mt-0.5">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      </div>
    </div>
  );
}
