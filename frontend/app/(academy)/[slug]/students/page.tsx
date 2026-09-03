'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, Award, CheckCircle, BookOpen, Layers, Calculator, Sparkles, Calendar, AlertCircle, LogIn, GraduationCap, UserX, UserCheck, Filter, CreditCard, Printer, Download, Upload, Camera, Edit3 } from 'lucide-react';
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
  const [academyInfo, setAcademyInfo] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Digital ID Card State
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [selectedIdCardStudent, setSelectedIdCardStudent] = useState<any>(null);

  const handlePrintIdCard = () => {
    if (!selectedIdCardStudent) return;
    const originalTitle = document.title;
    const code = selectedIdCardStudent.rollNo || selectedIdCardStudent.studentCode || 'STUDENT';
    const cleanName = (selectedIdCardStudent.name || 'Student').trim().replace(/\s+/g, '_');
    document.title = `${code}_${cleanName}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Edit Student Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    photoUrl: '',
    bloodGroup: 'B+',
    emergencyContactName: '',
    emergencyPhone: '',
    address: '',
    rollNo: '',
    validUpto: '31-MAR-2027',
  });
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);

  const handleOpenEditModal = (stu: any) => {
    setEditingStudent(stu);
    setEditFormData({
      name: stu.name || '',
      parentName: stu.parentName || '',
      parentPhone: stu.parentPhone || '',
      parentEmail: stu.parentEmail || '',
      photoUrl: stu.photoUrl || '',
      bloodGroup: stu.bloodGroup || 'B+',
      emergencyContactName: stu.emergencyContactName || stu.parentName || '',
      emergencyPhone: stu.emergencyPhone || stu.parentPhone || '',
      address: stu.address || '',
      rollNo: stu.rollNo || stu.studentCode || '',
      validUpto: stu.validUpto || '31-MAR-2027',
    });
    setShowEditModal(true);
  };

  const handleSaveEditedStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsUpdatingStudent(true);
    try {
      await apiClient.patch(`/students/${editingStudent._id}`, editFormData);
      setShowEditModal(false);
      setEditingStudent(null);
      fetchData();
    } catch (err: any) {
      alert('Failed to update student profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  // Promotion State
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudentForPromote, setSelectedStudentForPromote] = useState<any>(null);
  const [promoteFormData, setPromoteFormData] = useState({
    targetStandard: 10,
    classBatchId: '',
    medium: 'english',
    stream: 'science',
    discountAmount: 0,
    paymentType: 'FULL',
    installmentCount: 3,
    customTotalFee: 35000,
  });
  const [isPromoting, setIsPromoting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classBatchId: 'preset_10_eng',
    standard: 10,
    medium: 'english',
    stream: 'science',
    photoUrl: '',
    bloodGroup: 'B+',
    emergencyContactName: '',
    emergencyPhone: '',
    address: '',
    rollNo: '',
    validUpto: '31-MAR-2027',
    discountAmount: 0,
    paymentType: 'FULL',
    installmentCount: 3,
    customTotalFee: 35000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const [stuRes, classRes, feeRes, acadRes] = await Promise.all([
        apiClient.get('/students'),
        apiClient.get('/classes'),
        apiClient.get('/fee-engine/structures').catch(() => ({ data: [] })),
        apiClient.get('/academies/my-academy').catch(() => ({ data: null })),
      ]);
      setStudents(stuRes.data);
      setClasses(classRes.data);
      if (acadRes?.data) setAcademyInfo(acadRes.data);
      const loadedFeeStructures = feeRes.data || [];
      setFeeStructures(loadedFeeStructures);
      setAuthError(false);

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
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.data?.message?.includes('Authorization')) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('prohit_auth_token') : null;
      if (!token) {
        setAuthError(true);
        alert('Authentication Required: You are not signed in or your session has expired. Please sign in to enroll students.');
        setIsSubmitting(false);
        return;
      }

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
        photoUrl: formData.photoUrl,
        bloodGroup: formData.bloodGroup,
        emergencyContactName: formData.emergencyContactName || formData.parentName,
        emergencyPhone: formData.emergencyPhone || formData.parentPhone,
        address: formData.address,
        rollNo: formData.rollNo,
        validUpto: formData.validUpto,
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
        photoUrl: '',
        bloodGroup: 'B+',
        emergencyContactName: '',
        emergencyPhone: '',
        address: '',
        rollNo: '',
        validUpto: '31-MAR-2027',
        discountAmount: 0,
        paymentType: 'FULL',
        installmentCount: 3,
        customTotalFee: 35000,
      });
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.data?.message?.includes('Authorization')) {
        setAuthError(true);
        alert('Authentication Required: Your session has expired or you are not logged in. Please sign in to your academy again.');
      } else {
        alert('Error enrolling student: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Toggle (Deactivate / Re-activate)
  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      await apiClient.patch(`/students/${studentId}`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert('Failed to update student status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Open March - April Promotion Modal
  const handleOpenPromoteModal = (student: any) => {
    setSelectedStudentForPromote(student);
    const nextStd = Math.min(15, (student.standard || 10) + 1);
    const defaultMed = nextStd <= 10 ? (student.medium || 'english') : 'english';
    const defaultStr = nextStd >= 11 ? (student.stream === 'none' ? 'science' : (student.stream || 'science')) : 'none';

    const matchingBatches = activeBatchList.filter((b: any) => b.standard === nextStd);
    const selectedBatchId = matchingBatches.length > 0 
      ? (matchingBatches[0]._id || matchingBatches[0].id) 
      : `preset_${nextStd}`;

    const feeAmt = getMatchingFeeAmount(nextStd, defaultMed, defaultStr);

    setPromoteFormData({
      targetStandard: nextStd,
      classBatchId: selectedBatchId,
      medium: defaultMed,
      stream: defaultStr,
      discountAmount: student.discountAmount || 0,
      paymentType: student.paymentType || 'FULL',
      installmentCount: student.installmentCount || 3,
      customTotalFee: feeAmt,
    });

    setShowPromoteModal(true);
  };

  const handlePromoteStandardChange = (newStd: number) => {
    const defaultMed = newStd <= 10 ? promoteFormData.medium : 'english';
    const defaultStr = newStd >= 11 ? (promoteFormData.stream === 'none' ? 'science' : promoteFormData.stream) : 'none';

    const matchingBatches = activeBatchList.filter((b: any) => b.standard === newStd);
    const selectedBatchId = matchingBatches.length > 0 
      ? (matchingBatches[0]._id || matchingBatches[0].id) 
      : `preset_${newStd}`;

    const feeAmt = getMatchingFeeAmount(newStd, defaultMed, defaultStr);

    setPromoteFormData({
      ...promoteFormData,
      targetStandard: newStd,
      medium: defaultMed,
      stream: defaultStr,
      classBatchId: selectedBatchId,
      customTotalFee: feeAmt,
    });
  };

  const handlePromoteMediumChange = (newMed: string) => {
    const feeAmt = getMatchingFeeAmount(promoteFormData.targetStandard, newMed, promoteFormData.stream);
    setPromoteFormData({
      ...promoteFormData,
      medium: newMed,
      customTotalFee: feeAmt,
    });
  };

  const handlePromoteStreamChange = (newStr: string) => {
    const feeAmt = getMatchingFeeAmount(promoteFormData.targetStandard, promoteFormData.medium, newStr);
    setPromoteFormData({
      ...promoteFormData,
      stream: newStr,
      customTotalFee: feeAmt,
    });
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPromote) return;
    setIsPromoting(true);
    try {
      let targetBatchId = promoteFormData.classBatchId;

      if (targetBatchId.startsWith('preset_')) {
        let preset = DEFAULT_BATCH_PRESETS.find((p) => p.id === targetBatchId);
        if (!preset) {
          preset = {
            id: `preset_${promoteFormData.targetStandard}`,
            standard: promoteFormData.targetStandard,
            medium: promoteFormData.targetStandard <= 10 ? promoteFormData.medium : 'english',
            section: promoteFormData.targetStandard >= 11 ? promoteFormData.stream : 'none',
            batchName: `Class ${promoteFormData.targetStandard}th Standard Batch`,
          };
        }
        const newBatchRes = await apiClient.post('/classes', {
          standard: preset.standard,
          medium: promoteFormData.targetStandard <= 10 ? promoteFormData.medium : preset.medium,
          section: promoteFormData.targetStandard >= 11 ? promoteFormData.stream : preset.section,
          batchName: preset.batchName,
        });
        targetBatchId = newBatchRes.data._id;
      }

      await apiClient.post(`/students/${selectedStudentForPromote._id}/promote`, {
        targetStandard: promoteFormData.targetStandard,
        classBatchId: targetBatchId,
        medium: promoteFormData.targetStandard <= 10 ? promoteFormData.medium : 'english',
        stream: promoteFormData.targetStandard >= 11 ? promoteFormData.stream : 'none',
        discountAmount: Number(promoteFormData.discountAmount) || 0,
        paymentType: promoteFormData.paymentType,
        installmentCount: promoteFormData.paymentType === 'INSTALLMENT' ? Number(promoteFormData.installmentCount) : 1,
        customTotalFee: Number(promoteFormData.customTotalFee) || 35000,
      });

      setShowPromoteModal(false);
      setSelectedStudentForPromote(null);
      fetchData();
    } catch (err: any) {
      alert('Error promoting student: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPromoting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentCode || s.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' ? s.status !== 'INACTIVE' : s.status === 'INACTIVE');

    return matchesSearch && matchesStatus;
  });

  const netFee = Math.max(0, (formData.customTotalFee || 0) - (formData.discountAmount || 0));
  const installmentAmount = formData.paymentType === 'INSTALLMENT' ? Math.round(netFee / formData.installmentCount) : netFee;

  const currentStdBatches = activeBatchList.filter((b: any) => b.standard === formData.standard);

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {authError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-rose-900">Authentication Required</p>
              <p className="text-xs text-rose-700">Please sign in to your academy to enroll and manage student records.</p>
            </div>
          </div>
          <a
            href={`/login`}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Academy</span>
          </a>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Roster</h1>
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
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Enrollments, standard promotions & active student records configured for {academyInfo?.name || 'Academy'} ({academyInfo?.institutionType || 'High School'} - {academyInfo?.educationBoard || 'State Board'})
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-2 self-start sm:self-auto shrink-0 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search & Status Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by student name, code (e.g. STU-2026-00001), or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-orange-500 font-medium shadow-sm"
          />
        </div>

        {/* Active / Inactive Status Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 p-1.5 rounded-2xl overflow-x-auto shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 shrink-0" />
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'ALL' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Active ({students.filter((s) => s.status !== 'INACTIVE').length})
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Inactive / Left ({students.filter((s) => s.status === 'INACTIVE').length})
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Student Code / Number</th>
                <th className="p-4">Parent Details</th>
                <th className="p-4">Standard, Medium & Stream</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Student Records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                    No students found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-3">
                        {stu.photoUrl ? (
                          <img src={stu.photoUrl} alt={stu.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-xs border border-orange-200 shrink-0">
                            {stu.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div>{stu.name}</div>
                          {stu.bloodGroup && (
                            <span className="text-[10px] text-rose-600 font-bold block">
                              Blood: {stu.bloodGroup}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-orange-600">{stu.studentCode || stu.rollNumber || 'STU-2026-00001'}</td>
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
                    <td className="p-4">
                      {stu.status === 'INACTIVE' ? (
                        <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200 uppercase">
                          INACTIVE (LEFT)
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Student Profile Button */}
                        <button
                          onClick={() => handleOpenEditModal(stu)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition flex items-center space-x-1 cursor-pointer"
                          title="Edit Student Profile & Photo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Digital ID Card Button */}
                        <button
                          onClick={() => {
                            setSelectedIdCardStudent(stu);
                            setShowIdCardModal(true);
                          }}
                          className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-200 transition flex items-center space-x-1 cursor-pointer"
                          title="View & Download Digital Student ID Card"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Digital ID Card</span>
                        </button>

                        {/* Promote / Continue Next Standard Button */}
                        <button
                          onClick={() => handleOpenPromoteModal(stu)}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-200 transition flex items-center space-x-1"
                          title="Promote / Continue to Next Standard"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Promote Std</span>
                        </button>

                        {/* Status Toggle (Deactivate / Re-activate) */}
                        {stu.status === 'INACTIVE' ? (
                          <button
                            onClick={() => handleToggleStatus(stu._id, stu.status)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center space-x-1"
                            title="Re-activate Student Admission"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Re-activate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(stu._id, stu.status)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center space-x-1"
                            title="Deactivate Student (Left Academy)"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MARCH - APRIL STUDENT PROMOTION MODAL */}
      {showPromoteModal && selectedStudentForPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPromoteModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-orange-600 font-bold text-xs uppercase mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>March - April Result Progression</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Promote / Continue Student</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Promote <strong className="text-slate-900">{selectedStudentForPromote.name}</strong> from Standard {selectedStudentForPromote.standard}th to the next standard and initialize the new academic fee schedule.
              </p>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Next Standard *</label>
                <select
                  value={promoteFormData.targetStandard}
                  onChange={(e) => handlePromoteStandardChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold text-sm"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((std) => (
                    <option key={std} value={std}>
                      Std {std}th {std >= 13 ? '(Degree)' : std >= 11 ? '(Science/Comm/Arts)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medium / Stream & Batch Selector */}
              <div className="grid grid-cols-2 gap-4">
                {promoteFormData.targetStandard <= 10 ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medium *</label>
                    <select
                      value={promoteFormData.medium}
                      onChange={(e) => handlePromoteMediumChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold text-xs"
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
                      value={promoteFormData.stream}
                      onChange={(e) => handlePromoteStreamChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold text-xs"
                    >
                      <option value="science">Science Stream</option>
                      <option value="commerce">Commerce Stream</option>
                      <option value="arts">Arts Stream</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class Batch *</label>
                  <select
                    value={promoteFormData.classBatchId}
                    onChange={(e) => setPromoteFormData({ ...promoteFormData, classBatchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold text-xs"
                  >
                    {activeBatchList.filter((b: any) => b.standard === promoteFormData.targetStandard).map((c: any) => {
                      const id = c._id || c.id;
                      const secLabel = c.section && c.section !== 'none' ? ` - ${c.section.toUpperCase()}` : '';
                      return (
                        <option key={id} value={id}>
                          {c.batchName || `Std ${c.standard}th ${c.medium}${secLabel}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Fee & Discount Config for New Year */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-orange-600 uppercase">
                  <span>New Year Fee Schedule Plan</span>
                  <Calculator className="w-4 h-4 text-orange-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Base Fee (₹)</label>
                    <input
                      type="number"
                      required
                      value={promoteFormData.customTotalFee}
                      onChange={(e) => setPromoteFormData({ ...promoteFormData, customTotalFee: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Fee Discount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={promoteFormData.discountAmount}
                      onChange={(e) => setPromoteFormData({ ...promoteFormData, discountAmount: Number(e.target.value) })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Payment Plan</label>
                  <select
                    value={promoteFormData.paymentType}
                    onChange={(e) => setPromoteFormData({ ...promoteFormData, paymentType: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="FULL">Full Payment (Single Schedule)</option>
                    <option value="INSTALLMENT">Installment Schedule</option>
                  </select>
                </div>

                {promoteFormData.paymentType === 'INSTALLMENT' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Installment Count</label>
                    <select
                      value={promoteFormData.installmentCount}
                      onChange={(e) => setPromoteFormData({ ...promoteFormData, installmentCount: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value={3}>3 Installments</option>
                      <option value={6}>6 Installments</option>
                      <option value={9}>9 Installments</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isPromoting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm flex items-center justify-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{isPromoting ? 'Promoting Student...' : `Confirm Promotion to Std ${promoteFormData.targetStandard}th`}</span>
              </button>
            </form>
          </div>
        </div>
      )}

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
              {/* Photo Upload Provision */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">Student Passport Photo Provision *</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Student Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 transition flex items-center space-x-2 cursor-pointer w-fit shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
                      <span>Upload Student Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setFormData({ ...formData, photoUrl: evt.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400 block font-medium">Supported formats: JPG, PNG, WEBP (Max 2MB)</span>
                  </div>
                </div>
              </div>

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

              {/* Blood Group & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address / City</label>
                  <input
                    type="text"
                    placeholder="e.g. 123, Shanti Nagar, Pune"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
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

      {/* EDIT STUDENT PROFILE MODAL */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <div>
              <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs uppercase mb-1">
                <Edit3 className="w-4 h-4 text-orange-500" />
                <span>Student Master Directory</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Edit Student Profile</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Update passport photo, parent contact details, blood group, and address for <strong className="text-slate-900">{editingStudent.name}</strong>.
              </p>
            </div>

            <form onSubmit={handleSaveEditedStudent} className="space-y-4">
              {/* Photo Upload Provision */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">Update Passport Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {editFormData.photoUrl ? (
                      <img src={editFormData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 transition flex items-center space-x-2 cursor-pointer w-fit shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setEditFormData({ ...editFormData, photoUrl: evt.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.parentName}
                    onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.parentPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Address / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Dahisar, Mumbai"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editFormData.emergencyContactName}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={editFormData.emergencyPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingStudent}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm"
              >
                {isUpdatingStudent ? 'Saving Changes...' : 'Update Student Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL STUDENT ID CARD MODAL */}
      {showIdCardModal && selectedIdCardStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 text-slate-900 overflow-y-auto">
          {/* Print isolation styles */}
          <style>{`
            @media print {
              @page {
                size: landscape;
                margin: 0;
              }
              html, body {
                height: 100% !important;
                max-height: 100% !important;
                overflow: hidden !important;
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-id-card, #printable-id-card * {
                visibility: visible !important;
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                text-shadow: none !important;
                filter: none !important;
              }
              #printable-id-card {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: auto !important;
                height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
                border: none !important;
                display: flex !important;
                flex-direction: row !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 24px !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
              }
            }
          `}</style>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-4xl w-full relative shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowIdCardModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2 font-bold text-xs uppercase mb-1" style={{ color: academyInfo?.primaryColor || '#f97316' }}>
                  <CreditCard className="w-4 h-4" />
                  <span>Official Student Identifier</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">Digital Student ID Card (Front & Back)</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Official two-sided identification card formatted for standard plastic card printing (CR80 ratio).
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrintIdCard}
                  style={{ backgroundColor: academyInfo?.primaryColor || '#f97316' }}
                  className="hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>

            {/* Printable ID Card Container (Front & Back Cards) */}
            <div id="printable-id-card" className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center py-4 bg-slate-100 p-5 md:p-6 rounded-3xl border border-slate-200">
              
              {/* FRONT PAGE CARD */}
              <div 
                className="w-[350px] min-h-[220px] bg-white rounded-2xl border-2 overflow-hidden shadow-xl flex flex-col justify-between relative text-slate-800 shrink-0"
                style={{ borderColor: academyInfo?.primaryColor || '#f97316' }}
              >
                {/* Header Banner */}
                <div 
                  className="text-white p-2 px-3 flex items-center space-x-2 border-b-2"
                  style={{ 
                    backgroundColor: academyInfo?.primaryColor || '#f97316',
                    borderColor: 'rgba(0,0,0,0.15)'
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 p-1 flex items-center justify-center border border-white/30 shrink-0">
                    {academyInfo?.logoUrl ? (
                      <img src={academyInfo.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <GraduationCap className="w-4 h-4 text-yellow-300" />
                    )}
                  </div>
                  <div className="leading-tight overflow-hidden">
                    <h3 className="font-black uppercase text-[11px] tracking-wide text-yellow-300 truncate">
                      {academyInfo?.name || 'ACADEMY NAME'}
                    </h3>
                    <p className="text-[8px] text-white/90 font-medium truncate">{academyInfo?.address || 'Academic & Coaching ERP'}</p>
                  </div>
                </div>

                {/* Sub-Header Title Banner */}
                <div 
                  className="text-white text-center py-0.5 font-black uppercase text-[9.5px] tracking-widest shadow-xs"
                  style={{ backgroundColor: academyInfo?.primaryColor || '#f97316', filter: 'brightness(0.88)' }}
                >
                  STUDENT ID CARD
                </div>

                {/* Card Body */}
                <div className="p-3 px-3.5 flex items-start justify-between flex-1 gap-2 bg-gradient-to-b from-slate-50 to-white">
                  {/* Student Text Fields */}
                  <div className="space-y-1 text-[9.5px] text-slate-800 flex-1 leading-tight">
                    <div className="pb-0.5">
                      <span className="font-black text-slate-900 text-[11px] block truncate uppercase">
                        NAME: {selectedIdCardStudent.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-600">ROLL NO:</span>
                      <span className="font-mono font-extrabold" style={{ color: academyInfo?.primaryColor || '#f97316' }}>
                        {selectedIdCardStudent.rollNo || selectedIdCardStudent.studentCode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-600">COURSE:</span>
                      <span className="font-extrabold text-slate-900">
                        Std {selectedIdCardStudent.standard}th {selectedIdCardStudent.stream !== 'none' ? `(${selectedIdCardStudent.stream.toUpperCase()})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-600">BATCH:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">
                        {selectedIdCardStudent.classBatchId?.batchName || `Std ${selectedIdCardStudent.standard}th Batch`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 pt-0.5">
                      <span className="font-bold text-slate-600">VALID UPTO:</span>
                      <span className="font-mono font-bold text-rose-700">{selectedIdCardStudent.validUpto || '31-MAR-2027'}</span>
                    </div>
                  </div>

                  {/* Student Photo & Principal Signature */}
                  <div className="flex flex-col items-center shrink-0 space-y-1">
                    <div 
                      className="w-[68px] h-[78px] rounded-lg bg-slate-100 border-2 overflow-hidden shadow-sm flex items-center justify-center"
                      style={{ borderColor: academyInfo?.primaryColor || '#f97316' }}
                    >
                      {selectedIdCardStudent.photoUrl ? (
                        <img src={selectedIdCardStudent.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-9 h-9 text-slate-400" />
                      )}
                    </div>
                    <div className="text-[7px] font-bold text-slate-600 border-t border-slate-300 pt-0.5 w-full text-center">
                      <span className="font-serif italic block text-[9px] text-slate-900 leading-none truncate max-w-[80px]">
                        {academyInfo?.directorName || 'Director'}
                      </span>
                      <span className="uppercase text-[5.5px] tracking-tighter text-slate-500 font-sans block">PRINCIPAL'S SIGNATURE</span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div 
                  className="text-white p-1 px-3 flex items-center justify-between text-[7.5px] font-bold border-t"
                  style={{ 
                    backgroundColor: academyInfo?.primaryColor || '#f97316',
                    filter: 'brightness(0.75)',
                    borderColor: 'rgba(0,0,0,0.15)'
                  }}
                >
                  <span 
                    className="text-white px-2 py-0.5 rounded text-[6.5px] tracking-wider uppercase font-black"
                    style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
                  >
                    ISSUED BY ACADEMY
                  </span>
                  <span className="font-mono text-[7px]">{academyInfo?.phone || '+91 9561042069'}</span>
                </div>
              </div>

              {/* BACK PAGE CARD */}
              <div 
                className="w-[350px] min-h-[220px] bg-white rounded-2xl border-2 overflow-hidden shadow-xl flex flex-col justify-between relative text-slate-800 shrink-0"
                style={{ borderColor: academyInfo?.primaryColor || '#f97316' }}
              >
                {/* Back Header */}
                <div 
                  className="text-white p-1.5 px-3 text-center border-b-2"
                  style={{ 
                    backgroundColor: academyInfo?.primaryColor || '#f97316',
                    borderColor: 'rgba(0,0,0,0.15)'
                  }}
                >
                  <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-yellow-300">
                    EMERGENCY CONTACT INFORMATION
                  </h4>
                  <p className="text-[7.5px] text-white/90 font-bold uppercase tracking-widest">IMPORTANT DETAILS</p>
                </div>

                {/* Back Details Grid */}
                <div className="p-2.5 px-3.5 space-y-1 text-[9px] leading-tight flex-1 bg-gradient-to-b from-slate-50 to-white">
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-0.5">
                    <span className="font-extrabold text-slate-900 uppercase">BLOOD GROUP:</span>
                    <span className="font-mono font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[8.5px]">
                      {selectedIdCardStudent.bloodGroup || 'B+'}
                    </span>
                  </div>

                  <div className="border-b border-slate-100 pb-0.5">
                    <span className="font-extrabold text-slate-900 uppercase">EMERGENCY CONTACT NAME: </span>
                    <span className="font-bold text-slate-700">{selectedIdCardStudent.emergencyContactName || selectedIdCardStudent.parentName}</span>
                  </div>

                  <div className="border-b border-slate-100 pb-0.5">
                    <span className="font-extrabold text-slate-900 uppercase">EMERGENCY PHONE NO: </span>
                    <span className="font-mono font-bold text-slate-800">{selectedIdCardStudent.emergencyPhone || selectedIdCardStudent.parentPhone}</span>
                  </div>

                  <div className="border-b border-slate-100 pb-0.5 truncate">
                    <span className="font-extrabold text-slate-900 uppercase">ADDRESS: </span>
                    <span className="font-bold text-slate-800">{selectedIdCardStudent.address || 'Address Not Provided'}</span>
                  </div>

                  {/* Instructions Box */}
                  <div 
                    className="p-1.5 rounded-xl text-[7.5px] space-y-0.5 border"
                    style={{ 
                      borderColor: `${academyInfo?.primaryColor || '#f97316'}40`,
                      backgroundColor: `${academyInfo?.primaryColor || '#f97316'}10`
                    }}
                  >
                    <span className="font-black uppercase tracking-wider block" style={{ color: academyInfo?.primaryColor || '#f97316' }}>
                      INSTRUCTIONS:
                    </span>
                    <ol className="list-decimal list-inside space-y-0.5 font-medium leading-tight text-slate-700">
                      <li>This card is non-transferable.</li>
                      <li>Loss of card must be reported immediately.</li>
                      <li>Always wear this card within academy premises.</li>
                      <li>If found, please return to academy address above.</li>
                    </ol>
                  </div>
                </div>

                {/* Back Footer Bar */}
                <div 
                  className="text-white p-1 px-3 text-center text-[7px] font-bold border-t"
                  style={{ 
                    backgroundColor: academyInfo?.primaryColor || '#f97316',
                    filter: 'brightness(0.75)',
                    borderColor: 'rgba(0,0,0,0.15)'
                  }}
                >
                  <span>PROHIT EDUCARE ERP • DIGITAL ACADEMY IDENTIFICATION</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
