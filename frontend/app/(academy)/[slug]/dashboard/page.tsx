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
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Academy Overview</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Real-time financial balances and student metrics</p>
        </div>

        <Link
          href={`/fees`}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>Collect Fees</span>
        </Link>
      </div>

      {/* KPI Grid */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Billed Fees</span>
            <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹{overview.totalBilled?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-slate-500 mt-1 block">Across all active schedules</span>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Collected</span>
            <p className="text-3xl font-black text-emerald-600 mt-2 font-mono">₹{overview.totalPaid?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-emerald-700 font-medium mt-1 block">Settled via FIFO engine</span>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pending Receivables</span>
            <p className="text-3xl font-black text-orange-600 mt-2 font-mono">₹{overview.remainingBalance?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-orange-700 font-medium mt-1 block">{overview.pendingInstallments || 0} unpaid installments</span>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Advance Credit Balance</span>
            <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹{overview.advanceBalance?.toLocaleString('en-IN')}</p>
            <span className="text-xs text-slate-500 mt-1 block">Overpayment accrued balance</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs border-b border-slate-200 font-bold">
              <tr>
                <th className="p-4">Receipt #</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentPayments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono text-orange-600 font-bold">{p.receiptNumber}</td>
                  <td className="p-4 font-semibold text-slate-900">{p.studentId?.name || 'Student'}</td>
                  <td className="p-4 text-emerald-600 font-bold font-mono">₹{p.totalAmountPaid}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full font-mono font-medium border border-slate-200">
                      {p.paymentMode}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-medium">{new Date(p.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
