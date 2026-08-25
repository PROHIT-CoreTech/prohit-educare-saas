'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, Award, CheckCircle, BookOpen, Layers, Calculator, Sparkles, Calendar } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

const DEFAULT_BATCH_PRESETS = [
  { id: 'preset_10_eng', standard: 10, medium: 'english', section: 'none', batchName: 'Class 10th (English Medium)' },
  { id: 'preset_10_mar', standard: 10, medium: 'marathi', section: 'none', batchName: 'Class 10th (Marathi Medium)' },
  { id: 'preset_10_semi', standard: 10, medium: 'semi_english', section: 'none', batchName: 'Class 10th (Semi-English Medium)' },
  { id: 'preset_10_hin', standard: 10, medium: 'hindi', section: 'none', batchName: 'Class 10th (Hindi Medium)' },
  { id: 'preset_9_eng', standard: 9, medium: 'english', section: 'none', batchName: 'Class 9th (English Medium)' },
  { id: 'preset_9_mar', standard: 9, medium: 'marathi', section: 'none', batchName: 'Class 9th (Marathi Medium)' },
  { id: 'preset_9_semi', standard: 9, medium: 'semi_english', section: 'none', batchName: 'Class 9th (Semi-English Medium)' },
  { id: 'preset_9_hin', standard: 9, medium: 'hindi', section: 'none', batchName: 'Class 9th (Hindi Medium)' },
  { id: 'preset_8_eng', standard: 8, medium: 'english', section: 'none', batchName: 'Class 8th (English Medium)' },
  { id: 'preset_8_mar', standard: 8, medium: 'marathi', section: 'none', batchName: 'Class 8th (Marathi Medium)' },
  { id: 'preset_8_semi', standard: 8, medium: 'semi_english', section: 'none', batchName: 'Class 8th (Semi-English Medium)' },
  { id: 'preset_8_hin', standard: 8, medium: 'hindi', section: 'none', batchName: 'Class 8th (Hindi Medium)' },
  { id: 'preset_5_eng', standard: 5, medium: 'english', section: 'none', batchName: 'Class 5th (English Medium)' },
  { id: 'preset_5_mar', standard: 5, medium: 'marathi', section: 'none', batchName: 'Class 5th (Marathi Medium)' },
  { id: 'preset_5_semi', standard: 5, medium: 'semi_english', section: 'none', batchName: 'Class 5th (Semi-English Medium)' },
  { id: 'preset_5_hin', standard: 5, medium: 'hindi', section: 'none', batchName: 'Class 5th (Hindi Medium)' },
  { id: 'preset_11_sci', standard: 11, medium: 'english', section: 'science', batchName: 'Class 11th Science (English)' },
  { id: 'preset_11_com', standard: 11, medium: 'english', section: 'commerce', batchName: 'Class 11th Commerce (English)' },
  { id: 'preset_12_sci', standard: 12, medium: 'english', section: 'science', batchName: 'Class 12th Science (English)' },
  { id: 'preset_12_com', standard: 12, medium: 'english', section: 'commerce', batchName: 'Class 12th Commerce (English)' },
  { id: 'preset_13_sci', standard: 13, medium: 'english', section: 'science', batchName: 'Class 13th FY B.Sc / Degree' },
  { id: 'preset_14_sci', standard: 14, medium: 'english', section: 'science', batchName: 'Class 14th SY B.Sc / Degree' },
  { id: 'preset_15_sci', standard: 15, medium: 'english', section: 'science', batchName: 'Class 15th TY B.Sc / Degree' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classBatchId: 'preset_10_eng',
    standard: 10,
    medium: 'english',
    stream: 'science',
    discountAmount: 0,
    paymentType: 'FULL',
    installmentCount: 3,
    customTotalFee: 35000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getMatchingFeeAmount = (std: number, med: string, str: string, currentFeeStructures = feeStructures) => {
    if (std >= 11) {
      const exactMatch = currentFeeStructures.find((fs) => fs.standard === std && fs.stream === str);
      if (exactMatch) return exactMatch.totalAmount;
      const stdMatch = currentFeeStructures.find((fs) => fs.standard === std);
      if (stdMatch) return stdMatch.totalAmount;
      return 50000;
    } else {
      const exactMatch = currentFeeStructures.find((fs) => fs.standard === std && fs.medium === med);
      if (exactMatch) return exactMatch.totalAmount;
      const stdMatch = currentFeeStructures.find((fs) => fs.standard === std);
      if (stdMatch) return stdMatch.totalAmount;
      return 35000;
    }
  };

  const fetchData = async () => {
    try {
      const [stuRes, classRes, feeRes] = await Promise.all([
        apiClient.get('/students'),
        apiClient.get('/classes'),
        apiClient.get('/fee-engine/structures').catch(() => ({ data: [] })),
      ]);
      setStudents(stuRes.data);
      setClasses(classRes.data);
      const loadedFeeStructures = feeRes.data || [];
      setFeeStructures(loadedFeeStructures);

      if (classRes.data.length > 0) {
        const firstStd = classRes.data[0].standard;
        const firstMed = classRes.data[0].medium || 'english';
        const firstStr = classRes.data[0].section || 'science';
        const matchedFee = getMatchingFeeAmount(firstStd, firstMed, firstStr, loadedFeeStructures);

        setFormData((prev) => ({
          ...prev,
          classBatchId: classRes.data[0]._id,
          standard: firstStd,
          medium: firstMed,
          stream: firstStr,
          customTotalFee: matchedFee,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeBatchList = classes.length > 0 ? classes : DEFAULT_BATCH_PRESETS;

  const handleStandardChange = (newStd: number) => {
    const defaultMed = newStd <= 10 ? formData.medium : 'english';
    const defaultStr = newStd >= 11 ? (formData.stream === 'none' ? 'science' : formData.stream) : 'none';

    const matchingBatches = activeBatchList.filter((b: any) => b.standard === newStd);
    const selectedBatchId = matchingBatches.length > 0 
      ? (matchingBatches[0]._id || matchingBatches[0].id) 
      : `preset_${newStd}`;

    const feeAmt = getMatchingFeeAmount(newStd, defaultMed, defaultStr);

    setFormData({
      ...formData,
      standard: newStd,
      medium: defaultMed,
      stream: defaultStr,
      classBatchId: selectedBatchId,
      customTotalFee: feeAmt,
    });
  };

  const handleMediumChange = (newMed: string) => {
    const feeAmt = getMatchingFeeAmount(formData.standard, newMed, formData.stream);
    setFormData({
      ...formData,
      medium: newMed,
      customTotalFee: feeAmt,
    });
  };

  const handleStreamChange = (newStr: string) => {
    const feeAmt = getMatchingFeeAmount(formData.standard, formData.medium, newStr);
    setFormData({
      ...formData,
      stream: newStr,
      customTotalFee: feeAmt,
    });
  };

  const handleBatchSelect = (batchId: string) => {
    const sel = activeBatchList.find((c: any) => (c._id || c.id) === batchId);
    const std = sel ? sel.standard : formData.standard;
    const med = sel ? sel.medium || 'english' : formData.medium;
    const str = sel ? sel.section || 'none' : formData.stream;

    const feeAmt = getMatchingFeeAmount(std, med, str);

    setFormData({
      ...formData,
      classBatchId: batchId,
      standard: std,
      medium: med,
      stream: str,
      customTotalFee: feeAmt,
    });
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let targetBatchId = formData.classBatchId;

      if (targetBatchId.startsWith('preset_')) {
        let preset = DEFAULT_BATCH_PRESETS.find((p) => p.id === targetBatchId);
        if (!preset) {
          preset = {
            id: `preset_${formData.standard}`,
            standard: formData.standard,
            medium: formData.standard <= 10 ? formData.medium : 'english',
            section: formData.standard >= 11 ? formData.stream : 'none',
            batchName: `Class ${formData.standard}th Standard Batch`,
          };
        }
        const newBatchRes = await apiClient.post('/classes', {
          standard: preset.standard,
          medium: formData.standard <= 10 ? formData.medium : preset.medium,
          section: formData.standard >= 11 ? formData.stream : preset.section,
          batchName: preset.batchName,
        });
        targetBatchId = newBatchRes.data._id;
      }

      await apiClient.post('/students', {
        name: formData.name,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        classBatchId: targetBatchId,
        standard: formData.standard,
        medium: formData.standard <= 10 ? formData.medium : 'english',
        stream: formData.standard >= 11 ? formData.stream : 'none',
        discountAmount: Number(formData.discountAmount) || 0,
        paymentType: formData.paymentType,
        installmentCount: formData.paymentType === 'INSTALLMENT' ? Number(formData.installmentCount) : 1,
        customTotalFee: Number(formData.customTotalFee) || 35000,
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        classBatchId: classes.length > 0 ? classes[0]._id : 'preset_10_eng',
        standard: 10,
        medium: 'english',
        stream: 'science',
        discountAmount: 0,
        paymentType: 'FULL',
        installmentCount: 3,
        customTotalFee: 35000,
      });
      fetchData();
    } catch (err: any) {
      alert('Error enrolling student: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone?.includes(searchTerm)
  );

  const netFee = Math.max(0, (formData.customTotalFee || 0) - (formData.discountAmount || 0));
  const installmentAmount = formData.paymentType === 'INSTALLMENT' ? Math.round(netFee / formData.installmentCount) : netFee;

  const currentStdBatches = activeBatchList.filter((b: any) => b.standard === formData.standard);

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Roster</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage student enrollments, fee discounts & installment schedules</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by student name, code, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Student Code</th>
                <th className="p-4">Parent Details</th>
                <th className="p-4">Standard, Medium & Stream</th>
                <th className="p-4">Advance Credit</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                    No enrolled students found. Click &quot;Add New Student&quot; to enroll your first student.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">{stu.name}</td>
                    <td className="p-4 font-mono font-semibold text-orange-600">{stu.rollNumber}</td>
                    <td className="p-4 font-medium">
                      <div>{stu.parentName}</div>
                      <div className="text-xs text-slate-500 font-mono">{stu.parentPhone}</div>
                    </td>
                    <td className="p-4 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200">
                          Std {stu.standard}th - {stu.classBatchId?.batchName || 'General Batch'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                          {stu.standard <= 10
                            ? stu.medium === 'semi_english' ? 'Semi-Eng' : stu.medium === 'marathi' ? 'Marathi' : stu.medium === 'hindi' ? 'Hindi' : 'English'
                            : stu.stream !== 'none' ? stu.stream : 'General'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600">₹{stu.advanceCredit?.toLocaleString('en-IN') || 0}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900">Enroll New Student</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Configure target standard, medium/stream, class batch, fee discount & installment schedule (Std 1st - 15th).
              </p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name of student"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name of parent"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter parent phone number"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              {/* Standard Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Standard (1st - 15th) *</label>
                <select
                  value={formData.standard}
                  onChange={(e) => handleStandardChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((std) => (
                    <option key={std} value={std}>
                      Std {std}th {std >= 13 ? '(Degree)' : std >= 11 ? '(Science/Comm/Arts)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Medium / Stream & Batch Selector */}
              <div className="grid grid-cols-2 gap-4">
                {formData.standard <= 10 ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medium of Instruction *</label>
                    <select
                      value={formData.medium}
                      onChange={(e) => handleMediumChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                    >
                      <option value="marathi">Marathi Medium</option>
                      <option value="semi_english">Semi-English Medium</option>
                      <option value="english">English Medium</option>
                      <option value="hindi">Hindi Medium</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stream / Section *</label>
                    <select
                      value={formData.stream}
                      onChange={(e) => handleStreamChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                    >
                      <option value="science">Science Stream</option>
                      <option value="commerce">Commerce Stream</option>
                      <option value="arts">Arts Stream</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class Batch *</label>
                  <select
                    value={formData.classBatchId}
                    onChange={(e) => handleBatchSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  >
                    {currentStdBatches.length > 0 ? (
                      currentStdBatches.map((c: any) => {
                        const id = c._id || c.id;
                        const secLabel = c.section && c.section !== 'none' ? ` - ${c.section.toUpperCase()}` : '';
                        return (
                          <option key={id} value={id}>
                            {c.batchName || `Std ${c.standard}th ${c.medium}${secLabel}`}
                          </option>
                        );
                      })
                    ) : (
                      <option value={`preset_${formData.standard}`}>General Std {formData.standard}th Batch</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Fee & Discount Section */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-orange-600 uppercase">
                  <span>Fee & Payment Schedule</span>
                  <Calculator className="w-4 h-4 text-orange-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Base Total Fee (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.customTotalFee}
                      onChange={(e) => setFormData({ ...formData, customTotalFee: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Fee Discount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Payment Plan</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="FULL">Full Payment (Single Schedule)</option>
                    <option value="INSTALLMENT">Installment Schedule</option>
                  </select>
                </div>

                {formData.paymentType === 'INSTALLMENT' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Number of Installments</label>
                    <select
                      value={formData.installmentCount}
                      onChange={(e) => setFormData({ ...formData, installmentCount: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                    >
                      <option value={3}>3 Installments (Quarterly Split)</option>
                      <option value={6}>6 Installments (Bi-Monthly Split)</option>
                      <option value={9}>9 Installments (Monthly Split)</option>
                    </select>
                  </div>
                )}

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Net Billed Fee:</span>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">₹{netFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block font-medium">
                      {formData.paymentType === 'INSTALLMENT' ? `Per Installment (${formData.installmentCount}x):` : 'Single Schedule:'}
                    </span>
                    <span className="font-extrabold text-orange-600 font-mono text-sm">
                      ₹{installmentAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm"
              >
                {isSubmitting ? 'Enrolling Student...' : 'Save & Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
