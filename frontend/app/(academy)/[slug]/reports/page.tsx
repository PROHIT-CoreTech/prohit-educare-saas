'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Download, FileText, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await apiClient.get('/reports/financial-overview');
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Financial & Operational Analytics</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">MongoDB Aggregation Pipeline driven business metrics</p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Billed Receivables</span>
            <p className="text-3xl font-black text-slate-900 font-mono">₹{overview.totalBilled?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 font-medium">Gross fees scheduled for current academic period</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Settled (Paid)</span>
            <p className="text-3xl font-black text-emerald-600 font-mono">₹{overview.totalPaid?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-700 font-semibold">Allocated FIFO across due dates</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Outstanding Balance</span>
            <p className="text-3xl font-black text-orange-600 font-mono">₹{overview.remainingBalance?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-orange-700 font-semibold">Net uncollected receivables</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center space-y-4 shadow-sm">
        <FileText className="w-12 h-12 text-orange-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900">Export Audit-Ready Financial Statement</h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
          All financial allocations are audited atomically with immutable sequence counters per academy.
        </p>
        <button
          onClick={() => window.print()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 inline-flex items-center space-x-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Print / Export PDF Report</span>
        </button>
      </div>
    </div>
  );
}
