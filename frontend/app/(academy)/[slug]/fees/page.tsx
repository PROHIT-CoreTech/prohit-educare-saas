'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, CheckCircle, Share2, Download, RefreshCw, DollarSign, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function FeeEnginePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [feeSummary, setFeeSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [amountToPay, setAmountToPay] = useState<number>(0);
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
        const firstStudentId = res.data[0]._id;
        setSelectedStudentId(firstStudentId);
        fetchSummary(firstStudentId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async (studentId: string) => {
    if (!studentId) return;
    setLoadingSummary(true);
    try {
      const res = await apiClient.get(`/fee-engine/student-summary/${studentId}`);
      setFeeSummary(res.data);

      // Auto-set payment amount to next pending installment due amount
      const pendingInst = res.data.feeSchedules?.find((s: any) => s.status !== 'PAID');
      if (pendingInst) {
        setAmountToPay(pendingInst.amount - pendingInst.paidAmount);
      } else if (res.data.summary?.remainingBalance) {
        setAmountToPay(res.data.summary.remainingBalance);
      } else {
        setAmountToPay(0);
      }
    } catch (err) {
      console.error('Error fetching student summary:', err);
      setFeeSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    setFeeSummary(null);
    fetchSummary(id);
  };

  const handleInitializeFee = async () => {
    if (!selectedStudentId) return;
    setLoadingSummary(true);
    try {
      const studentObj = students.find((s) => s._id === selectedStudentId);
      const payload = {
        studentId: selectedStudentId,
        standard: studentObj?.standard || 10,
        discountAmount: studentObj?.discountAmount || 0,
        paymentType: studentObj?.paymentType || 'FULL',
        installmentCount: studentObj?.installmentCount || 1,
        customTotalFee: studentObj?.customTotalFee,
      };

      try {
        await apiClient.post('/fee-engine/assign-structure', payload);
      } catch (e) {
        await apiClient.post('/fee-engine/initialize-student-fee', payload);
      }

      fetchSummary(selectedStudentId);
    } catch (err: any) {
      alert('Error initializing fee schedule: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSummary(false);
    }
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
        receiptNumber: res.data.receiptNumber || 'REC-' + Date.now(),
        amountPaid: Number(amountToPay),
        paymentMode,
        studentName: feeSummary?.student?.name || 'Student',
        studentCode: feeSummary?.student?.studentCode || 'STU-2026-00001',
        date: new Date().toLocaleDateString('en-IN'),
        allocations: res.data.allocations,
      });

      fetchSummary(selectedStudentId);
    } catch (err: any) {
      alert('Payment Recording Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const drawReceiptCard = (canvas: HTMLCanvasElement | null, data: any) => {
    if (!canvas || !data) return;
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
    ctx.fillText(`Receipt #: ${data.receiptNumber || ''}`, 30, 80);

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(570, 95);
    ctx.stroke();

    // Details
    ctx.fillStyle = '#334155';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Student Name: ${data.studentName || 'Student'}`, 30, 135);
    ctx.fillText(`Student No / Code: ${data.studentCode || 'N/A'}`, 30, 160);
    ctx.fillText(`Date: ${data.date}`, 30, 185);
    ctx.fillText(`Payment Mode: ${data.paymentMode}`, 30, 210);

    // Amount Box (Mint Green Light Background)
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(30, 235, 540, 70);
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 235, 540, 70);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`AMOUNT PAID: ₹${(data.amountPaid || 0).toLocaleString('en-IN')}`, 50, 280);

    // Footer Stamp
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Atomic FIFO Settlement Verified by PROHIT CoreTech Engine', 30, 360);
  };

  // Generate Digital Receipt Card on HTML5 Canvas (High Contrast Light Theme)
  useEffect(() => {
    if (receiptData) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          drawReceiptCard(canvasRef.current, receiptData);
        }
      }, 50);
      return () => clearTimeout(timer);
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
    <div className="space-y-8 font-sans text-slate-900">
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
              {s.name} ({s.studentCode || 'STU-CODE'}) - Std {s.standard}th
            </option>
          ))}
        </select>
      </div>

      {/* Loading Skeleton */}
      {loadingSummary && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 font-bold space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-sm font-medium">Fetching student fee configuration & schedule...</p>
        </div>
      )}

      {/* Empty / Uninitialized State Fallback */}
      {!loadingSummary && (!feeSummary || !feeSummary.feeSchedules || feeSummary.feeSchedules.length === 0) && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto font-bold text-xl">
            ₹
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No Active Fee Schedule Found</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              This student record does not have a generated fee schedule yet. Click below to generate their standard fee plan.
            </p>
          </div>
          <button
            onClick={handleInitializeFee}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-orange-500/20 transition"
          >
            Generate Fee Schedule Plan Now
          </button>
        </div>
      )}

      {/* Student Fee Summary & Schedule Breakdown */}
      {!loadingSummary && feeSummary && feeSummary.feeSchedules && feeSummary.feeSchedules.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Student Configured Fee Plan Card */}
            <div className="bg-orange-50/60 border border-orange-200 p-5 rounded-3xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/80 pb-3">
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Configured Fee Plan</span>
                  <h3 className="text-lg font-black text-slate-900">{feeSummary.student?.name} ({feeSummary.student?.studentCode || 'STU'})</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs uppercase">
                    Std {feeSummary.student?.standard}th - {feeSummary.student?.standard <= 10 ? (feeSummary.student?.medium || 'English') : (feeSummary.student?.stream || 'General')}
                  </span>
                  <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 uppercase">
                    {feeSummary.student?.paymentType === 'INSTALLMENT' ? `${feeSummary.student?.installmentCount || 3} Installments Split` : '1 Full Payment'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono pt-1">
                <div>
                  <span className="text-slate-500 block font-sans font-medium">Net Billed Fee:</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{feeSummary.summary?.totalBilled?.toLocaleString('en-IN')}</span>
                  {feeSummary.student?.discountAmount > 0 && (
                    <span className="text-[10px] text-emerald-700 block font-sans font-bold">Disc: ₹{feeSummary.student.discountAmount}</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block font-sans font-medium">Total Paid:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">₹{feeSummary.summary?.totalPaid?.toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-sans font-medium">Remaining Due:</span>
                  <span className="font-extrabold text-rose-600 text-sm">₹{feeSummary.summary?.remainingBalance?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

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
                      <p className="text-sm font-semibold text-slate-900">Due Date: {new Date(inst.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900 font-mono">
                        Paid ₹{inst.paidAmount?.toLocaleString('en-IN')} / Total ₹{inst.amount?.toLocaleString('en-IN')}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter transaction reference or cheque number"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium text-xs"
                />
              </div>

              <button
                onClick={handleRecordPayment}
                disabled={processing || amountToPay <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <span>Recording Payment...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Tap 2: Confirm Payment</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Receipt Modal Card */}
            {receiptData && (
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-md">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900">Payment Saved & Receipt Generated!</h3>
                </div>

                {/* HTML Styled Digital Receipt Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block">Official Fee Receipt</span>
                      <h4 className="text-sm font-extrabold text-slate-900">{receiptData.studentName}</h4>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 block">Student Code: {receiptData.studentCode}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-orange-600 block">{receiptData.receiptNumber}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{receiptData.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium">Payment Mode:</span>
                      <span className="font-bold text-slate-800 uppercase">{receiptData.paymentMode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Settlement Status:</span>
                      <span className="font-bold text-emerald-700 uppercase">Atomic FIFO Settled</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-800 uppercase">Total Amount Paid</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">₹{receiptData.amountPaid?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Digital Canvas Receipt (For Image Download / WhatsApp Share) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <canvas
                    ref={(node) => {
                      canvasRef.current = node;
                      if (node && receiptData) {
                        drawReceiptCard(node, receiptData);
                      }
                    }}
                    className="w-full h-auto block"
                  />
                </div>

                <button
                  onClick={handleShareReceipt}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center space-x-2 text-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Receipt (WhatsApp / Download)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
