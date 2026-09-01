'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  Download,
  FileText,
  CheckCircle2,
  TrendingUp,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);

  // Filters
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [trendResolution, setTrendResolution] = useState<'Daily' | 'Monthly' | 'Yearly' | '3-Year' | '5-Year'>('Monthly');

  // Trend Data
  const [trendData, setTrendData] = useState<any[]>([]);

  // P&L Data
  const [pnlInterval, setPnlInterval] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [pnlData, setPnlData] = useState<any>(null);

  // Paginated Payments Data
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchTrendData();
  }, [trendResolution, selectedStandard]);

  useEffect(() => {
    fetchPnlData();
  }, [pnlInterval]);

  useEffect(() => {
    fetchPaginatedPayments();
  }, [page, selectedStandard, selectedMonth]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reports/financial-overview');
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const res = await apiClient.get(
        `/reports/trend-analytics?resolution=${trendResolution}&standard=${selectedStandard}`,
      );
      setTrendData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPnlData = async () => {
    try {
      const res = await apiClient.get(`/reports/profit-and-loss?interval=${pnlInterval}`);
      setPnlData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaginatedPayments = async () => {
    try {
      const res = await apiClient.get(
        `/reports/paginated-payments?page=${page}&limit=10&standard=${selectedStandard}`,
      );
      setPaymentsData(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalPayments(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const maxTrendAmount = Math.max(...trendData.map((d) => d.amount || 0), 1);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            <span>Reports &amp; Financial Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Academic Year 2026-27 collection trends, Profit &amp; Loss breakdown, and audit-ready receipts
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit PDF Report</span>
        </button>
      </div>

      {/* Loading Spinner Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-extrabold text-slate-800">Loading Financial Reports &amp; Analytics...</p>
            <p className="text-xs text-slate-400 font-medium">Computing collections, Profit &amp; Loss breakdown, and transaction logs</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Fees Collection Today */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-sm">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Fees Collection Today</span>
            <p className="text-3xl font-black text-emerald-600 font-mono">
              ₹{(overview.dailyCollection || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-emerald-700 font-semibold">Settled today across cash &amp; online modes</p>
          </div>

          {/* 2. Monthly Fees Collection */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-sm">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Monthly Fees Collection</span>
            <p className="text-3xl font-black text-slate-900 font-mono">
              ₹{(overview.monthlyCollection || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 font-medium">Current month gross settled fees</p>
          </div>

          {/* 3. Financial Year 2026-27 Collection */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-sm">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Financial Year 2026-27 Collection</span>
            <p className="text-3xl font-black text-orange-600 font-mono">
              ₹{(overview.fyCollection || overview.totalPaid || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-orange-700 font-semibold">Total settled for Academic Year 2026-27</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Standard Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700 uppercase">Standard:</span>
            <select
              value={selectedStandard}
              onChange={(e) => {
                setSelectedStandard(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Standards (1st - 15th)</option>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((std) => (
                <option key={std} value={String(std)}>
                  Standard {std}th
                </option>
              ))}
            </select>
          </div>

          {/* Date Range / Month-Year Picker */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700 uppercase">Month/Year:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Trend Line Resolution Granularity Switch */}
        <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Resolution:</span>
          {(['Daily', 'Monthly', 'Yearly', '3-Year', '5-Year'] as const).map((res) => (
            <button
              key={res}
              onClick={() => setTrendResolution(res)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                trendResolution === res
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Line Visual Analytics */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Fee Collection Trend ({trendResolution})</h2>
            <p className="text-xs text-slate-500 font-medium">Aggregated revenue timeline across selected parameters</p>
          </div>
          <span className="bg-orange-50 text-orange-700 text-xs font-mono font-bold px-3 py-1 rounded-xl border border-orange-200 uppercase">
            {trendResolution} Granularity
          </span>
        </div>

        {trendData.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No collection trend data recorded for this filter criteria.
          </div>
        ) : (
          <div className="pt-6 pb-2 space-y-3">
            <div className="flex items-end space-x-3 h-44 overflow-x-auto pb-2">
              {trendData.map((t, idx) => {
                const heightPercent = Math.max(12, Math.round((t.amount / maxTrendAmount) * 100));
                return (
                  <div key={idx} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                      ₹{t.amount?.toLocaleString('en-IN')}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-32">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl transition-all duration-300 group-hover:from-orange-600 group-hover:to-amber-500"
                      />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-500 truncate w-full text-center">
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* P&L Reporting Section */}
      {pnlData && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                <span>Profit &amp; Loss (P&amp;L) Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Gross fee collections vs. operational expenditure analysis for tenant accounting
              </p>
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs">
              {(['Monthly', 'Quarterly', 'Yearly'] as const).map((int) => (
                <button
                  key={int}
                  onClick={() => setPnlInterval(int)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                    pnlInterval === int ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {int}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gross Income */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Gross Income / Revenue</span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                ₹{pnlData.grossRevenue?.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Settled fee collections ({pnlInterval})</span>
            </div>

            {/* Total Expenses */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Operational Expenses</span>
              <p className="text-2xl font-black text-rose-600 font-mono">
                ₹{pnlData.expenses?.totalExpenses?.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-rose-700 font-medium">Faculty payroll, rent &amp; utilities</span>
            </div>

            {/* Net Profit */}
            <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Net Profit</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Margin: {pnlData.profitMargin}
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-700 font-mono">
                ₹{pnlData.netProfit?.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-800 font-medium">Net operating margin ({pnlInterval})</span>
            </div>
          </div>

          {/* Detailed Expense Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Expense Category Breakdown:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Faculty Payroll</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ₹{pnlData.expenses?.facultySalaries?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Campus Rent</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ₹{pnlData.expenses?.infrastructureRent?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Software &amp; ERP</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ₹{pnlData.expenses?.techErpLicense?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Admin &amp; Utilities</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ₹{pnlData.expenses?.adminUtilities?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moved Component: Recent Payments / Transactions Table with Pagination */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recent Payment Transactions</h2>
            <p className="text-xs text-slate-500 font-medium">
              Audit log of settled receipts ({totalPayments} total transactions recorded)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs border-b border-slate-200 font-bold">
              <tr>
                <th className="p-4">Receipt #</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Standard</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paymentsData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    No payment receipts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                paymentsData.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-orange-600 font-bold">{p.receiptNumber}</td>
                    <td className="p-4 font-semibold text-slate-900">{p.studentId?.name || 'Student'}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        Std {p.studentId?.standard || '10'}th
                      </span>
                    </td>
                    <td className="p-4 text-emerald-600 font-bold font-mono">
                      ₹{p.totalAmountPaid?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium border border-slate-200 uppercase">
                        {p.paymentMode}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">
            Page <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-slate-200"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
