'use client';

import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Calendar, Clock, BookOpen, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import Link from 'next/link';

export default function TenantDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, scheduleRes] = await Promise.all([
        apiClient.get('/reports/financial-overview'),
        apiClient.get(`/roster/today?day=${todayDayName}`),
      ]);
      setOverview(overviewRes.data);
      setTodaySchedule(scheduleRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Academy Overview & Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Academic Year 2026-27 operational metrics, collections, and daily schedule
          </p>
        </div>

        <Link
          href={`/fees`}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>Collect Fees</span>
        </Link>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-extrabold text-slate-800">Loading Dashboard Metrics...</p>
            <p className="text-xs text-slate-400 font-medium">Fetching real-time financial collections and today&apos;s schedule</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Grid (Top Row) */}
          {overview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Total Admissions */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Total Admissions</span>
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 font-mono">{overview.totalAdmissions || 0}</p>
                <span className="text-xs text-orange-600 font-semibold block">Academic Year 2026-27</span>
              </div>

              {/* 2. Daily Collection */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Daily Collection</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-600 font-mono">₹{(overview.dailyCollection || 0).toLocaleString('en-IN')}</p>
                <span className="text-xs text-emerald-700 font-medium block">Today&apos;s settled receipts</span>
              </div>

              {/* 3. Monthly Fees Collection */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Monthly Fees Collection</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 font-mono">₹{(overview.monthlyCollection || 0).toLocaleString('en-IN')}</p>
                <span className="text-xs text-slate-500 block">Current month settled</span>
              </div>

              {/* 4. Monthly Fees Collection Pending */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Monthly Fees Pending</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-amber-600 font-mono">₹{(overview.monthlyCollectionPending || 0).toLocaleString('en-IN')}</p>
                <span className="text-xs text-amber-700 font-semibold block">Current month outstanding dues</span>
              </div>
            </div>
          )}

          {/* Schedule Overview Section: Today's Lectures & Upcoming Schedule */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-extrabold text-slate-900">Today&apos;s Lectures &amp; Upcoming Schedule</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Day-wise standard and subject allocations per faculty member for <span className="font-bold text-orange-600">{todayDayName}</span>
                </p>
              </div>

              <Link
                href="/academics"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center space-x-1"
              >
                <span>Manage Timetable</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Lectures Scheduled for Today</p>
                <p className="text-xs text-slate-500">
                  Configure faculty day-wise timetable slots under Academics &gt; Lecture Roster.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaySchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{item.faculty?.name || 'Faculty'}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">{item.faculty?.qualification || 'Specialist'}</span>
                      </div>
                      <span className="bg-orange-50 text-orange-700 text-xs font-extrabold px-2.5 py-1 rounded-full border border-orange-200">
                        {item.faculty?.subject || 'Subject'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                        Today&apos;s Allocated Slots:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.slots?.map((slot: string, slotIdx: number) => (
                          <span
                            key={slotIdx}
                            className="bg-white text-slate-800 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs font-mono"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
