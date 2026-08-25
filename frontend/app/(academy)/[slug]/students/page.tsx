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
    discountAmount: 0,
    paymentType: 'FULL' as 'FULL' | 'INSTALLMENT',
    installmentCount: 3,
    customTotalFee: 35000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stuRes, classRes, feeRes] = await Promise.all([
        apiClient.get('/students'),
        apiClient.get('/classes'),
        apiClient.get('/fee-engine/structures').catch(() => ({ data: [] })),
      ]);
      setStudents(stuRes.data);
      setClasses(classRes.data);
      setFeeStructures(feeRes.data || []);

      if (classRes.data.length > 0) {
        const firstStd = classRes.data[0].standard;
        const matchedFee = feeRes.data?.find((fs: any) => fs.standard === firstStd);
        setFormData((prev) => ({
          ...prev,
          classBatchId: classRes.data[0]._id,
          standard: firstStd,
          customTotalFee: matchedFee ? matchedFee.totalAmount : firstStd >= 11 ? 50000 : 35000,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchSelect = (batchId: string) => {
    const sel = activeBatchList.find((c: any) => (c._id || c.id) === batchId);
    const std = sel ? sel.standard : 10;
    const matchedFee = feeStructures.find((fs) => fs.standard === std);
    const feeAmt = matchedFee ? matchedFee.totalAmount : std >= 11 ? 50000 : 35000;

    setFormData({
      ...formData,
      classBatchId: batchId,
      standard: std,
      customTotalFee: feeAmt,
    });
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let targetBatchId = formData.classBatchId;

      if (targetBatchId.startsWith('preset_')) {
        const preset = DEFAULT_BATCH_PRESETS.find((p) => p.id === targetBatchId);
        if (preset) {
          const newBatchRes = await apiClient.post('/classes', {
            standard: preset.standard,
            medium: preset.medium,
            section: preset.section,
            batchName: preset.batchName,
          });
          targetBatchId = newBatchRes.data._id;
        }
      }

      await apiClient.post('/students', {
        name: formData.name,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        classBatchId: targetBatchId,
        standard: formData.standard,
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
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm),
  );

  const activeBatchList = classes.length > 0 ? classes : DEFAULT_BATCH_PRESETS;

  const netTotalFee = Math.max(0, (Number(formData.customTotalFee) || 0) - (Number(formData.discountAmount) || 0));
  const activeInstallmentCount = formData.paymentType === 'INSTALLMENT' ? Number(formData.installmentCount) || 3 : 1;
  const perInstallmentAmount = Math.round(netTotalFee / activeInstallmentCount);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Student Roster</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage student enrollments, fee discounts & installment schedules (Std 1st - 15th)</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center px-4 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="Search by student name, code, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full text-sm font-medium"
        />
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Student Code</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class Batch</th>
                <th className="p-4">Parent Phone</th>
                <th className="p-4">Advance Credit</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    No enrolled students found. Click &quot;Add New Student&quot; to enroll.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-orange-600 font-bold">{s.studentCode}</td>
                    <td className="p-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="p-4 text-slate-700">
                      <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-mono font-medium">
                        {s.classBatchId?.batchName || `Std ${s.standard}th`}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{s.parentPhone}</td>
                    <td className="p-4 text-slate-900 font-bold font-mono">₹{s.advanceBalance || 0}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-5 my-8 text-slate-900">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-lg font-bold"
            >
              ✕
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900">Enroll New Student</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Configure class batch, parent details, fee discount & installment schedule (Std 1st - 15th).</p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
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
                    placeholder="Rajesh Sharma"
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
                    placeholder="9876543210"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class Batch (Std 1st - 15th) *</label>
                <select
                  value={formData.classBatchId}
                  onChange={(e) => handleBatchSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                >
                  <optgroup label="Academic Class Batches">
                    {activeBatchList.map((c: any) => {
                      const id = c._id || c.id;
                      const secLabel = c.section && c.section !== 'none' ? ` - ${c.section.toUpperCase()}` : '';
                      return (
                        <option key={id} value={id}>
                          {c.batchName || `Std ${c.standard}th ${c.medium}${secLabel}`}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              {/* Fee & Discount Section */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-orange-600 uppercase">
                  <span>Fee & Payment Schedule</span>
                  <Calculator className="w-4 h-4 text-orange-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Total Fee (₹)</label>
                    <input
                      type="number"
                      value={formData.customTotalFee}
                      onChange={(e) => setFormData({ ...formData, customTotalFee: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Fee Discount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-emerald-600 font-bold font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Plan & Installments */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Plan</label>
                    <select
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
                    >
                      <option value="FULL">Full Payment</option>
                      <option value="INSTALLMENT">Installments Plan</option>
                    </select>
                  </div>

                  {formData.paymentType === 'INSTALLMENT' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Installment Count</label>
                      <select
                        value={formData.installmentCount}
                        onChange={(e) => setFormData({ ...formData, installmentCount: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
                      >
                        <option value={3}>3 Installments</option>
                        <option value={6}>6 Installments</option>
                        <option value={9}>9 Installments</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Live Breakdown Preview */}
                <div className="bg-white border border-orange-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono shadow-sm">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Net Billed Fee:</span>
                    <span className="text-emerald-700 font-black">₹{netTotalFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] font-sans">
                      {formData.paymentType === 'INSTALLMENT' ? `${activeInstallmentCount} Monthly Schedules:` : 'Single Schedule:'}
                    </span>
                    <span className="text-orange-600 font-black">
                      {formData.paymentType === 'INSTALLMENT'
                        ? `₹${perInstallmentAmount.toLocaleString('en-IN')} / month`
                        : `₹${netTotalFee.toLocaleString('en-IN')}`}
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
