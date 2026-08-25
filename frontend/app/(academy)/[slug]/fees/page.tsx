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

      fetchSummary(selectedStudentId);
    } catch (err: any) {
      alert('Payment Recording Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  // Generate Digital Receipt Card on HTML5 Canvas (High Contrast Light Theme)
  useEffect(() => {
    if (receiptData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 600;
      canvas.height = 400;

      // Crisp White Canvas Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 400);

      // Vibrant Orange Top Accent Header
      ctx.fillStyle = '#f97316';
      ctx.fillRect(0, 0, 600, 15);

      // Border Outline
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 580, 380);

      // Header Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('PROHIT EDUCARE - OFFICIAL RECEIPT', 30, 50);

      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`Receipt #: ${receiptData.receiptNumber}`, 30, 80);

      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(30, 95);
      ctx.lineTo(570, 95);
      ctx.stroke();

      // Details
      ctx.fillStyle = '#334155';
      ctx.font = '15px sans-serif';
      ctx.fillText(`Student Name: ${receiptData.studentName}`, 30, 135);
      ctx.fillText(`Date: ${receiptData.date}`, 30, 165);
      ctx.fillText(`Payment Mode: ${receiptData.paymentMode}`, 30, 195);

      // Amount Box (Mint Green Light Background)
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(30, 225, 540, 75);
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 225, 540, 75);

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`AMOUNT PAID: ₹${receiptData.amountPaid.toLocaleString('en-IN')}`, 50, 272);

      // Footer Stamp
      ctx.fillStyle = '#64748b';
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
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${receiptData.receiptNumber}.png`;
        a.click();
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Atomic FIFO Fee Collection Engine</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Record payments with sequential schedule allocation and instant receipt cards</p>
      </div>

      {/* Student Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase">Select Target Student</label>
        <select
          value={selectedStudentId}
          onChange={handleStudentChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
        >
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.studentCode}) - Std {s.standard}th
            </option>
          ))}
        </select>
      </div>

      {/* Student Fee Summary & Schedule Breakdown */}
      {feeSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Fee Schedule Installments (FIFO Priority)</h2>
              <div className="space-y-3">
                {feeSummary.feeSchedules?.map((inst: any) => (
                  <div
                    key={inst._id}
                    className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <span className="text-xs font-bold text-orange-600 uppercase">Installment #{inst.installmentNo}</span>
                      <p className="text-sm font-semibold text-slate-900">Due Date: {new Date(inst.dueDate).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900 font-mono">
                        Paid ₹{inst.paidAmount} / Total ₹{inst.amount}
                      </p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 uppercase ${
                          inst.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inst.status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
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

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-orange-600 mb-1">
                <Smartphone className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-extrabold text-slate-900">Quick 2-Tap Payment</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={amountToPay}
                  onChange={(e) => setAmountToPay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl font-black text-emerald-700 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-semibold focus:outline-none"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online Card / NetBanking</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="UPI Ref ID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <button
                onClick={handleRecordPayment}
                disabled={processing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 text-base"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full relative shadow-2xl space-y-4 text-center">
            <button onClick={() => setReceiptData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h2 className="text-xl font-extrabold text-slate-900">Payment Recorded Successfully</h2>

            <div className="flex justify-center my-4">
              <canvas ref={canvasRef} className="rounded-2xl shadow-md border border-slate-200 max-w-full h-auto" />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleShareReceipt}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2"
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
