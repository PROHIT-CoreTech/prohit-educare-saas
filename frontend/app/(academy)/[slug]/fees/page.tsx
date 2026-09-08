'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, CheckCircle, Share2, Download, RefreshCw, DollarSign, Smartphone, Loader2, AlertCircle, Search, X, ChevronDown, User, History, Eye, Calendar } from 'lucide-react';
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

  // Tab state for left column: INSTALLMENTS vs RECEIPTS
  const [feeTab, setFeeTab] = useState<'INSTALLMENTS' | 'RECEIPTS'>('INSTALLMENTS');

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

  const numberToWordsINR = (amount: number): string => {
    if (!amount || isNaN(amount) || amount <= 0) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (num: number): string => {
      const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + ' Crore ' : '';
      str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + ' Lakh ' : '';
      str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + ' Thousand ' : '';
      str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + ' Hundred ' : '';
      str += Number(n[5]) !== 0 ? (str !== '' ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
      return str.trim();
    };

    const words = inWords(Math.floor(amount));
    return words ? words + ' Rupees Only' : '';
  };

  const handleRecordPayment = async () => {
    if (!selectedStudentId || amountToPay <= 0) {
      alert('Please select a student and enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      const res = await apiClient.post('/billing/collect-payment', {
        studentId: selectedStudentId,
        amountPaid: Number(amountToPay),
        paymentMode,
        transactionRef,
      });

      const currentRem = feeSummary?.summary?.remainingBalance || 0;
      const updatedRem = Math.max(0, currentRem - Number(amountToPay));

      setReceiptData({
        receiptNumber: res.data.receiptNumber || 'REC-' + Date.now(),
        amountPaid: Number(amountToPay),
        paymentMode,
        studentName: feeSummary?.student?.name || 'Student',
        studentCode: feeSummary?.student?.studentCode || 'STU-2026-00001',
        parentName: feeSummary?.student?.parentName || '',
        date: new Date().toLocaleDateString('en-IN'),
        transactionRef,
        academyName: academyInfo?.name || "Viraj's Academy",
        branchName: feeSummary?.student?.branchName || 'Main Branch',
        remainingBalance: updatedRem,
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

    canvas.width = 720;
    canvas.height = 480;

    // Cream / Ivory Paper Background (matching Sample Image 1)
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, 720, 480);

    // Dark Navy Border Frame (matching Sample Image 1)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 688, 448);

    // Inner Dotted Border Frame
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(22, 22, 676, 436);
    ctx.setLineDash([]);

    // Header Title (Viraj's Academy or Tenant Academy Name)
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 26px serif';
    ctx.fillText(data.academyName || "Viraj's Academy", 40, 68);

    // Header Top Right Details
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`No.: ${data.receiptNumber || '1402'}`, 520, 55);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Date : ${data.date}`, 520, 78);

    // Centered RECEIPT Pill Box
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(290, 85, 140, 32, 16);
    } else {
      ctx.rect(290, 85, 140, 32);
    }
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RECEIPT', 360, 106);
    ctx.textAlign = 'left';

    // Divider Line under Header
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 130);
    ctx.lineTo(680, 130);
    ctx.stroke();

    // Form Lines Structure (Matching physical receipt book layout in Image 1)
    const drawFormLine = (label: string, value: string, y: number, isMono = false) => {
      ctx.fillStyle = '#475569';
      ctx.font = '13px sans-serif';
      ctx.fillText(label, 40, y);

      const labelWidth = ctx.measureText(label).width;
      const startX = 45 + labelWidth;
      const endX = 675;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, y + 3);
      ctx.lineTo(endX, y + 3);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = isMono ? 'bold 15px monospace' : 'bold 14px sans-serif';
      ctx.fillText(value, startX + 5, y - 2);
    };

    // Line 1: Received from Mr. / Mrs. / M/s.
    drawFormLine('Received from Mr. / Mrs. / M/s.', data.studentName + (data.parentName ? ` (Parent: ${data.parentName})` : ''), 170);

    // Line 2: a sum of Rs.
    const inWordsText = numberToWordsINR(data.amountPaid);
    drawFormLine('a sum of Rs.', `₹${(data.amountPaid || 0).toLocaleString('en-IN')}  (${inWordsText})`, 215, true);

    // Line 3: Vide Cash / Online / Cheque No.
    const modeRef = `${data.paymentMode}${data.transactionRef ? ' - ' + data.transactionRef : ''}`;
    drawFormLine('Vide Cash / Online / Cheque No.', modeRef, 260);

    // Line 4: Branch
    drawFormLine('Branch', data.branchName || 'Main Branch', 305);

    // Line 5: Balance Amount / Status
    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText('Remaining Balance:', 40, 350);

    if (data.remainingBalance <= 0) {
      // FULLY PAYMENT DONE Green Badge
      ctx.fillStyle = '#dcfce7';
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(185, 332, 200, 26, 6);
      } else {
        ctx.rect(185, 332, 200, 26);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('FULLY PAYMENT DONE ✓', 205, 349);
    } else {
      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`₹${data.remainingBalance.toLocaleString('en-IN')}`, 185, 350);

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(185, 354);
      ctx.lineTo(300, 354);
      ctx.stroke();
    }

    // Bottom Footer Row
    // Left Box: Rs. [ Amount Paid ] Pill Badge
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(40, 395, 210, 45, 22);
    } else {
      ctx.rect(40, 395, 210, 45);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Rs.', 58, 423);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`₹${(data.amountPaid || 0).toLocaleString('en-IN')}`, 95, 423);

    // Note below Rs pill
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('*SUBJECT TO REALISATION OF CHEQUE', 40, 455);

    // Authorised Signatory Right Column
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`For ${data.academyName || "VIRAJ ACADEMY"}`, 480, 415);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('(Authorised Signatory)', 490, 445);
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

  const handleDownloadReceipt = () => {
    if (!canvasRef.current || !receiptData) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receiptData.receiptNumber}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleWhatsAppDirect = () => {
    if (!receiptData) return;
    const currentStudent = students.find((s) => s._id === selectedStudentId);
    const parentPhone = currentStudent?.parentPhone || currentStudent?.phone || '';
    const cleanPhone = parentPhone.replace(/\D/g, '');

    const message = `Official Fee Payment Receipt\n\nAcademy: ${academyInfo?.name || 'Academy'}\nReceipt No: ${receiptData.receiptNumber}\nStudent: ${receiptData.studentName} (${receiptData.studentCode})\nAmount Paid: ₹${receiptData.amountPaid?.toLocaleString('en-IN')}\nPayment Mode: ${receiptData.paymentMode}\nDate: ${receiptData.date}\n\nThank you!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = cleanPhone
      ? `https://wa.me/91${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(waUrl, '_blank');
  };

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
        handleDownloadReceipt();
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

            {/* Tabbed Left Column Container for Installments & Receipts */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              {/* Tab Navigation Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFeeTab('INSTALLMENTS')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
                      feeTab === 'INSTALLMENTS'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Fee Installments</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      feeTab === 'INSTALLMENTS' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {feeSummary.feeSchedules?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeeTab('RECEIPTS')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
                      feeTab === 'RECEIPTS'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>Payment Receipts</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      feeTab === 'RECEIPTS' ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {feeSummary.payments?.length || 0}
                    </span>
                  </button>
                </div>

                <span className="text-xs font-bold text-slate-400 hidden md:inline">
                  {feeTab === 'INSTALLMENTS' ? 'FIFO Installment Schedule' : 'Saved Payment History'}
                </span>
              </div>

              {/* TAB 1: FEE INSTALLMENTS */}
              {feeTab === 'INSTALLMENTS' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {feeSummary.feeSchedules?.map((inst: any) => (
                    <div
                      key={inst._id}
                      className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-orange-200 transition"
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
              )}

              {/* TAB 2: PAYMENT RECEIPTS HISTORY */}
              {feeTab === 'RECEIPTS' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {!feeSummary.payments || feeSummary.payments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1 bg-slate-50 border border-slate-100 rounded-2xl">
                      <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700 text-sm">No payment receipts recorded yet</p>
                      <p className="text-slate-500">Collect fee payments using the Quick Payment form to generate official digital receipts.</p>
                    </div>
                  ) : (
                    feeSummary.payments.map((p: any, idx: number) => (
                      <div
                        key={p._id || idx}
                        className="bg-slate-50 border border-slate-200 hover:border-orange-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-orange-600 bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded">
                              {p.receiptNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            Mode: <span className="font-bold text-slate-800 uppercase">{p.paymentMode}</span>
                            {p.transactionRef && <span className="ml-2 font-mono text-[11px] text-slate-600">Ref: {p.transactionRef}</span>}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-500 block font-medium">Amount Paid</span>
                            <span className="text-sm font-black text-emerald-700 font-mono">
                              ₹{p.totalAmountPaid?.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setReceiptData({
                                receiptNumber: p.receiptNumber,
                                amountPaid: p.totalAmountPaid,
                                paymentMode: p.paymentMode,
                                studentName: feeSummary?.student?.name || 'Student',
                                studentCode: feeSummary?.student?.studentCode || 'STU',
                                parentName: feeSummary?.student?.parentName || '',
                                date: new Date(p.paymentDate).toLocaleDateString('en-IN'),
                                transactionRef: p.transactionRef || '',
                                academyName: academyInfo?.name || "Viraj's Academy",
                                branchName: feeSummary?.student?.branchName || 'Main Branch',
                                remainingBalance: feeSummary?.summary?.remainingBalance || 0,
                                allocations: p.allocations,
                              });
                            }}
                            className="bg-white border border-slate-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
          </div>
        </div>
      )}

      {/* Official Fee Receipt Centered Modal Overlay */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-4xl xl:max-w-5xl w-full relative shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setReceiptData(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 text-emerald-600 border-b border-slate-100 pb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Official Fee Receipt</h3>
                <p className="text-xs text-slate-500 font-medium">Atomic FIFO Settlement Verified</p>
              </div>
            </div>

            {/* Horizontal 2-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Interactive HTML Receipt Card */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Printable HTML Receipt</span>
                <div className="bg-[#fdfcf7] border-2 border-slate-800 rounded-2xl p-5 space-y-4 font-serif relative shadow-md text-slate-900">
                  {/* Header Top Row */}
                  <div className="flex items-start justify-between border-b border-slate-300 pb-3">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 font-serif leading-tight">{receiptData.academyName || "Viraj's Academy"}</h4>
                    </div>
                    <div className="text-right font-sans">
                      <span className="text-xs font-mono font-bold text-slate-900 block">No.: {receiptData.receiptNumber || '1402'}</span>
                      <span className="text-[11px] text-slate-600 font-medium block">Date : {receiptData.date}</span>
                    </div>
                  </div>

                  {/* Centered RECEIPT Pill Badge */}
                  <div className="text-center my-1">
                    <span className="inline-block border-2 border-slate-800 rounded-full px-6 py-0.5 font-sans font-bold text-xs uppercase tracking-widest text-slate-900 bg-white">
                      RECEIPT
                    </span>
                  </div>

                  {/* Form Line Rows with Bottom Underlines */}
                  <div className="space-y-2.5 text-xs font-sans pt-1">
                    <div className="flex flex-wrap items-baseline border-b border-slate-400 pb-1 gap-1">
                      <span className="text-slate-600 font-medium">Received from Mr. / Mrs. / M/s.</span>
                      <span className="font-extrabold text-slate-950 px-1">{receiptData.studentName} {receiptData.parentName ? `(Parent: ${receiptData.parentName})` : ''}</span>
                    </div>

                    <div className="flex flex-wrap items-baseline border-b border-slate-400 pb-1 gap-1">
                      <span className="text-slate-600 font-medium">a sum of Rs.</span>
                      <span className="font-mono font-extrabold text-slate-950 text-sm px-1">₹{receiptData.amountPaid?.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] font-semibold text-slate-700">({numberToWordsINR(receiptData.amountPaid)})</span>
                    </div>

                    <div className="flex flex-wrap items-baseline border-b border-slate-400 pb-1 gap-1">
                      <span className="text-slate-600 font-medium">Vide Cash / Online / Cheque No.</span>
                      <span className="font-bold text-slate-950 uppercase px-1">{receiptData.paymentMode} {receiptData.transactionRef ? `(${receiptData.transactionRef})` : ''}</span>
                      <span className="text-slate-600 font-medium ml-auto">Dtd.</span>
                      <span className="font-bold text-slate-950">{receiptData.date}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-400 pb-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-600 font-medium">Branch:</span>
                        <span className="font-bold text-slate-950">{receiptData.branchName || 'Main Branch'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600 font-medium">Remaining Balance:</span>
                        {receiptData.remainingBalance <= 0 ? (
                          <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wide">
                            FULLY PAYMENT DONE ✓
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-rose-600 text-sm">
                            ₹{receiptData.remainingBalance?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Section */}
                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <div className="border-2 border-slate-900 rounded-full px-4 py-1.5 inline-flex items-center space-x-2 bg-white text-slate-900 font-sans font-bold text-sm shadow-xs">
                        <span>Rs.</span>
                        <span className="font-mono font-black text-emerald-700 text-base">₹{receiptData.amountPaid?.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1 font-sans">*SUBJECT TO REALISATION OF CHEQUE</span>
                    </div>

                    <div className="text-right font-sans">
                      <span className="font-bold text-slate-900 text-xs block">For {receiptData.academyName || "VIRAJ ACADEMY"}</span>
                      <span className="text-[10px] text-slate-500 italic block mt-4">(Authorised Signatory)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Generated Canvas Card Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Generated PNG Image Card</span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md bg-white p-1">
                  <canvas
                    ref={(node) => {
                      canvasRef.current = node;
                      if (node && receiptData) {
                        drawReceiptCard(node, receiptData);
                      }
                    }}
                    className="w-full h-auto block rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons UI */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>Send on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReceiptData(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 text-xs transition cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
