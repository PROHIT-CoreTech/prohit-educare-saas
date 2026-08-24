'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, CreditCard, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import Link from 'next/link';

export default function TenantDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, paymentsRes] = await Promise.all([
        apiClient.get('/reports/financial-overview'),
        apiClient.get('/reports/recent-payments?limit=5'),
      ]);
      setOverview(overviewRes.data);
      setRecentPayments(paymentsRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Academy Overview</h1>
          <p className="text-sm text-slate-400">Real-time financial balances and student metrics</p>
        </div>

        <Link
          href={`/fees`}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>Collect Fees</span>
        </Link>
      </div>

      {/* KPI Grid */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Billed Fees</span>
            <p className="text-3xl font-extrabold text-white mt-2">₹{overview.totalBilled?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-slate-500 mt-1 block">Across all active schedules</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Collected</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">₹{overview.totalPaid?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-emerald-500 mt-1 block">Settled via FIFO engine</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Pending Receivables</span>
            <p className="text-3xl font-extrabold text-rose-400 mt-2">₹{overview.remainingBalance?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-rose-500 mt-1 block">{overview.pendingInstallments || 0} unpaid installments</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs font-semibold uppercase text-slate-400">Advance Credit Balance</span>
            <p className="text-3xl font-extrabold text-indigo-400 mt-2">₹{overview.advanceBalance?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-indigo-500 mt-1 block">Overpayment accrued balance</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4">Receipt #</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentPayments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-mono text-indigo-400 font-semibold">{p.receiptNumber}</td>
                  <td className="p-4 font-medium text-white">{p.studentId?.name || 'Student'}</td>
                  <td className="p-4 text-emerald-400 font-semibold">₹{p.totalAmountPaid}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-mono">
                      {p.paymentMode}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
