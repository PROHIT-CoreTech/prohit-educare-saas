'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, CheckCircle, Share2, Download, RefreshCw, DollarSign, Smartphone } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function FeeEnginePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [feeSummary, setFeeSummary] = useState<any>(null);
  const [amountToPay, setAmountToPay] = useState<number>(5000);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const [receiptData, setReceiptData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedStudentId(res.data[0]._id);
        fetchSummary(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async (studentId: string) => {
    try {
      const res = await apiClient.get(`/fee-engine/student-summary/${studentId}`);
      setFeeSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    fetchSummary(id);
  };

  const handleRecordPayment = async () => {
    if (!selectedStudentId || amountToPay <= 0) return;
    setProcessing(true);
    try {
      const res = await apiClient.post('/fee-engine/record-payment', {
        studentId: selectedStudentId,
        amountPaid: Number(amountToPay),
        paymentMode,
        transactionRef,
      });

      setReceiptData({
        receiptNumber: res.data.receiptNumber,
        amountPaid: amountToPay,
        paymentMode,
        studentName: feeSummary?.student?.name,
        date: new Date().toLocaleDateString(),
        allocations: res.data.allocations,
      });

      // Refresh student fee summary
      fetchSummary(selectedStudentId);
    } catch (err: any) {
      alert('Payment Recording Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  // Generate Digital Receipt Card on HTML5 Canvas
  useEffect(() => {
    if (receiptData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 600;
      canvas.height = 400;

      // Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, 600, 400);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 400);

      // Border Accent
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 380);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('PROHIT EDUCARE - OFFICIAL RECEIPT', 30, 50);

      ctx.fillStyle = '#818cf8';
      ctx.font = '16px monospace';
      ctx.fillText(`Receipt #: ${receiptData.receiptNumber}`, 30, 80);

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(30, 100);
      ctx.lineTo(570, 100);
      ctx.stroke();

      // Details
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Student: ${receiptData.studentName}`, 30, 140);
      ctx.fillText(`Date: ${receiptData.date}`, 30, 170);
      ctx.fillText(`Payment Mode: ${receiptData.paymentMode}`, 30, 200);

      // Amount Box
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fillRect(30, 230, 540, 70);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`AMOUNT PAID: ₹${receiptData.amountPaid.toLocaleString('en-IN')}`, 50, 275);

      // Footer Stamp
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Atomic FIFO Settlement Verified by PROHIT CoreTech Engine', 30, 355);
    }
  }, [receiptData]);

  const handleShareReceipt = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `receipt_${receiptData.receiptNumber}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Fee Receipt ${receiptData.receiptNumber}`,
            text: `Fee Payment Receipt of ₹${receiptData.amountPaid} for ${receiptData.studentName}`,
            files: [file],
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${receiptData.receiptNumber}.png`;
        a.click();
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Atomic FIFO Fee Collection Engine</h1>
        <p className="text-sm text-slate-400">Record payments with sequential schedule allocation and instant receipt cards</p>
      </div>

      {/* Student Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="block text-xs font-semibold text-slate-300 uppercase">Select Target Student</label>
        <select
          value={selectedStudentId}
          onChange={handleStudentChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium"
        >
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.studentCode}) - Std {s.standard}
            </option>
          ))}
        </select>
      </div>

      {/* Student Fee Summary & Schedule Breakdown */}
      {feeSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Fee Schedules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Fee Schedule Installments (FIFO Priority)</h2>
              <div className="space-y-3">
                {feeSummary.feeSchedules?.map((inst: any) => (
                  <div
                    key={inst._id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-indigo-400">Installment #{inst.installmentNo}</span>
                      <p className="text-sm font-medium text-white">Due Date: {new Date(inst.dueDate).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        Paid ₹{inst.paidAmount} / Total ₹{inst.amount}
                      </p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                          inst.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : inst.status === 'PARTIAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Mobile 2-Tap Payment Modal Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                <Smartphone className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">Quick 2-Tap Payment</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={amountToPay}
                  onChange={(e) => setAmountToPay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-2xl font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online Card / NetBanking</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="UPI Ref ID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleRecordPayment}
                disabled={processing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 text-base"
              >
                <CreditCard className="w-5 h-5" />
                <span>{processing ? 'Processing FIFO Transaction...' : 'Tap 2: Confirm Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Canvas Receipt Card Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full relative shadow-2xl space-y-4 text-center">
            <button onClick={() => setReceiptData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              ✕
            </button>
            <h2 className="text-xl font-bold text-white">Payment Recorded Successfully</h2>

            <div className="flex justify-center my-4">
              <canvas ref={canvasRef} className="rounded-2xl shadow-2xl border border-slate-700 max-w-full h-auto" />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleShareReceipt}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share / Download Receipt Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
