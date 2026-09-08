'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, BookOpen, BarChart3, LogOut, 
  ShieldAlert, ShieldCheck, Sparkles, AlertCircle, Settings, Menu, X, Building2 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import dashboardBg from '@/public/dashboard_bg_edu_tech.svg';

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
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('prohit_selected_branch_id');
      if (stored) setSelectedBranchId(stored);
    }
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prohit_selected_branch_id', branchId);
      window.dispatchEvent(new Event('branch-changed'));
    }
  };

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
        .get('/branches')
        .then((res) => setBranches(res.data))
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
    { name: 'Branches', href: '/branches', icon: Building2 },
    { name: 'Fee Engine', href: '/fees', icon: CreditCard },
    { name: 'Academics', href: '/academics', icon: BookOpen },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans relative bg-slate-100 overflow-x-hidden">
      {/* Real Educational Tech Background Image (Next.js Bundled Asset) */}
      <Image
        src={dashboardBg}
        alt="Dashboard Background"
        fill
        priority
        className="object-cover z-0 pointer-events-none opacity-85 fixed"
      />

      {/* Soft Ambient Overlay */}
      <div className="fixed inset-0 bg-white/20 z-0 pointer-events-none" />

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Brand & Branch Selector */}
          <div className="flex items-center space-x-3 shrink-0">
            {academy?.logoUrl ? (
              <img
                src={academy.logoUrl}
                alt={academy?.name || 'Academy Logo'}
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-base sm:text-lg shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {academy?.name?.charAt(0) || params.slug.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight whitespace-nowrap">
                  {academy?.name || `${params.slug} Academy`}
                </h1>
                <span className="text-[10px] text-orange-600 font-mono font-semibold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 hidden md:inline-block whitespace-nowrap">
                  {params.slug}
                </span>
              </div>

              {/* Next Line: Branch Selector Dropdown */}
              {branches.length > 0 && (
                <div className="mt-1 flex items-center space-x-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-2.5 py-0.5 text-xs w-fit shrink-0 transition">
                  <Building2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <select
                    value={selectedBranchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs pr-1"
                  >
                    <option value="ALL">All Branches</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} {b.isMain ? '(Main)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 text-xs sm:text-sm font-medium shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname.includes(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1.5 xl:px-3 xl:py-2 rounded-xl flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap ${
                    active
                      ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                localStorage.removeItem('prohit_auth_token');
                window.location.href = `/login`;
              }}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition ml-1 shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden shrink-0">
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
            {/* Mobile Branch Selector */}
            {branches.length > 0 && (
              <div className="sm:hidden mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <span>Selected Branch:</span>
                </div>
                <select
                  value={selectedBranchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="bg-white border border-slate-200 font-bold text-slate-800 text-xs px-2 py-1 rounded-lg focus:outline-none"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} {b.isMain ? '(Main)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
