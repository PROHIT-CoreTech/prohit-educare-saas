'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, CheckCircle, Share2, Download, RefreshCw, DollarSign, Smartphone, Loader2, AlertCircle, Search, X, ChevronDown, User } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function FeeEnginePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [feeSummary, setFeeSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showOnlineDisabledAlert, setShowOnlineDisabledAlert] = useState(false);

  const [receiptData, setReceiptData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [academyInfo, setAcademyInfo] = useState<any>(null);

  // Searchable student dropdown state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStudents();
    apiClient.get('/academies/my-academy').then((res) => setAcademyInfo(res.data)).catch(() => {});
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
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
    } finally {
      setLoadingStudents(false);
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
    handleSelectStudent(id);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsDropdownOpen(false);
    setFeeSummary(null);
    fetchSummary(studentId);
  };

  const filteredStudents = students.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const nameMatch = s.name?.toLowerCase().includes(q);
    const codeMatch = s.studentCode?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q);
    const stdMatch =
      `std ${s.standard}`.toLowerCase().includes(q) ||
      `class ${s.standard}`.toLowerCase().includes(q) ||
      `${s.standard}th`.toLowerCase().includes(q) ||
      `${s.standard}` === q;
    const parentMatch = s.parentName?.toLowerCase().includes(q) || s.parentPhone?.toLowerCase().includes(q);
    return nameMatch || codeMatch || stdMatch || parentMatch;
  });

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

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
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Atomic FIFO Fee Collection Engine</h1>
          {academyInfo?.institutionType && (
            <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-md text-xs font-black">
              {academyInfo.institutionType}
            </span>
          )}
          {academyInfo?.educationBoard && (
            <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-md text-xs font-black">
              {academyInfo.educationBoard}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Sequential schedule allocation & instant receipt cards tailored for {academyInfo?.name || 'Academy'} ({academyInfo?.institutionType || 'High School'} - {academyInfo?.educationBoard || 'State Board'})
        </p>
      </div>

      {/* Student Selector Card with Real-Time Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" ref={dropdownRef}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Target Student</label>
            <p className="text-xs text-slate-500 font-medium">Search by name, student code (e.g. STU-2026-00004), class, or parent contact</p>
          </div>
          {students.length > 0 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
              {filteredStudents.length} of {students.length} Students
            </span>
          )}
        </div>

        <div className="relative">
          {/* Main Combobox Input Bar */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student by name, code, std, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-24 py-3.5 text-slate-900 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                }}
                className="absolute right-10 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 transition"
            >
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </button>
          </div>

          {/* Selected Student Highlight Banner */}
          {selectedStudent && (
            <div className="mt-2.5 bg-orange-50/80 border border-orange-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {selectedStudent.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedStudent.name}</span>
                  <div className="flex items-center space-x-2 text-slate-600 font-medium">
                    <span className="font-mono text-[11px] font-bold text-orange-700">{selectedStudent.studentCode || 'STU-CODE'}</span>
                    <span>•</span>
                    <span>Std {selectedStudent.standard}th</span>
                    {selectedStudent.parentPhone && (
                      <>
                        <span>•</span>
                        <span>Parent: {selectedStudent.parentPhone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                Active Selection
              </span>
            </div>
          )}

          {/* Dropdown Menu Popup */}
          {isDropdownOpen && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              {loadingStudents ? (
                <div className="p-4 text-center text-slate-400 font-medium text-xs flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span>Loading students list...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <User className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No students found</p>
                  <p className="text-xs text-slate-400">No student matching &quot;{searchTerm}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-bold text-orange-600 hover:underline pt-1 block mx-auto"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = s._id === selectedStudentId;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => handleSelectStudent(s._id)}
                      className={`w-full text-left p-3.5 transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-orange-50/90 font-bold border-l-4 border-orange-500 pl-4'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition ${
                          isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-600'
                        }`}>
                          {s.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-orange-950' : 'text-slate-900 group-hover:text-orange-600'}`}>
                            {s.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mt-0.5">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {s.studentCode || 'STU-CODE'}
                            </span>
                            <span>•</span>
                            <span>Std {s.standard}th</span>
                            {s.parentName && (
                              <>
                                <span>•</span>
                                <span>Parent: {s.parentName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
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
                  onChange={(e) => {
                    if (e.target.value === 'ONLINE_GATEWAY') {
                      setShowOnlineDisabledAlert(true);
                      return;
                    }
                    setPaymentMode(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                >
                  <option value="CASH">Cash Payment (Offline)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS (Offline)</option>
                  <option value="CHEQUE">Cheque (Offline)</option>
                  <option value="UPI">UPI Transfer (Manual Verification)</option>
                  <option value="ONLINE_GATEWAY">⚡ Online Gateway Payment (Disabled)</option>
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
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

            {/* Offline Sales Mode - Online Payment Disabled Modal Alert */}
            {showOnlineDisabledAlert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-5 text-center">
                  <button
                    onClick={() => setShowOnlineDisabledAlert(false)}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
                  >
                    ✕
                  </button>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Online Payment Gateway Disabled</h3>
                    <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                      Online payment gateway integration is currently disabled for offline sales mode. Please collect fee payments via <span className="font-bold text-slate-900">Cash, Cheque, or Direct Bank Transfer</span>, or contact the Product Owner / Administrator to activate online payments.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-600 font-mono space-y-1 text-left">
                    <p><span className="font-bold text-slate-800">Product Support:</span> PROHIT CoreTech</p>
                    <p><span className="font-bold text-slate-800">Phone:</span> +91 9561042069 / +91 97739 69033</p>
                    <p><span className="font-bold text-slate-800">Email:</span> info@prohitcoretech.com</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOnlineDisabledAlert(false);
                      setPaymentMode('CASH');
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md transition text-xs cursor-pointer"
                  >
                    Switch to Offline Cash / Bank Mode
                  </button>
                </div>
              </div>
            )}

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
