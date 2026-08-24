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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Financial & Operational Analytics</h1>
        <p className="text-sm text-slate-400">MongoDB Aggregation Pipeline driven business metrics</p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Billed Receivables</span>
            <p className="text-3xl font-extrabold text-white">₹{overview.totalBilled?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500">Gross fees scheduled for current academic period</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Settled (Paid)</span>
            <p className="text-3xl font-extrabold text-emerald-400">₹{overview.totalPaid?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-500">Allocated FIFO across due dates</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Outstanding Balance</span>
            <p className="text-3xl font-extrabold text-rose-400">₹{overview.remainingBalance?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-rose-500">Net uncollected receivables</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
        <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Export Audit-Ready Financial Statement</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          All financial allocations are audited atomically with immutable sequence counters per academy.
        </p>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg inline-flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Print / Export PDF Report</span>
        </button>
      </div>
    </div>
  );
}
