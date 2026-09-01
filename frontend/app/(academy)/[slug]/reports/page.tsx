'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);

  // Filters
  const [selectedStandard, setSelectedStandard] = useState<string>('all');

  // Paginated Payments Data (10 per page batch)
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchPaginatedPayments();
  }, [page, selectedStandard]);

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

  const fetchPaginatedPayments = async () => {
    try {
      const res = await apiClient.get(
        `/reports/paginated-payments?page=${page}&limit=10&standard=${selectedStandard}`,
      );
      setPaymentsData(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotalPayments(res.data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            <span>Reports &amp; Financial Receipts</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Academic Year 2026-27 collection overview and audit-ready receipt transactions
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit PDF Report</span>
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-extrabold text-slate-800">Loading Financial Receipts &amp; Reports...</p>
            <p className="text-xs text-slate-400 font-medium">Fetching transaction history and collection metrics</p>
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

          {/* Recent Payments / Transactions Table with Pagination (10 per page) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-orange-500" />
                  <span>Recent Payment Transactions</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Showing 10 transactions per batch ({totalPayments} total transactions recorded)
                </p>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs self-start sm:self-auto">
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

            {/* Pagination Controls (10 per batch) */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1 border border-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1 border border-slate-200 cursor-pointer"
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
