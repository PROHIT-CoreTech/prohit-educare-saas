'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, User, Users, Phone, Mail, Award, CheckCircle, BookOpen, Layers, Calculator, Sparkles, Calendar, AlertCircle, LogIn, GraduationCap, UserX, UserCheck, Filter, CreditCard, Printer, Download, Upload, Camera, Edit3, ChevronDown, ChevronUp, MoreVertical, Eye } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import {
  isValidMobile,
  isValidEmail,
  isValidName,
  isValidStandard,
  isValidAmount,
  isValidInstallmentCount,
  formatValidationErrorMessage,
} from '../../../../lib/validation';
import { ALL_STANDARDS, formatStandard, formatStandardFull, getStandardsForAcademicLevels } from '../../../../lib/standards';

const DEFAULT_BATCH_PRESETS = [
  { id: 'preset_daycare_eng', standard: -4, medium: 'english', section: 'none', batchName: 'Class Day Care (Early Years)' },
  { id: 'preset_playgroup_eng', standard: -3, medium: 'english', section: 'none', batchName: 'Class Playgroup (Toddlers)' },
  { id: 'preset_nursery_eng', standard: -2, medium: 'english', section: 'none', batchName: 'Class Nursery (Foundational)' },
  { id: 'preset_jrkg_eng', standard: -1, medium: 'english', section: 'none', batchName: 'Class Jr KG (English Medium)' },
  { id: 'preset_srkg_eng', standard: 0, medium: 'english', section: 'none', batchName: 'Class Sr KG (English Medium)' },
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

const StudentAvatar = ({
  photoUrl,
  gender,
  name,
  className = "w-9 h-9 rounded-full",
  iconClassName = "w-5 h-5",
}: {
  photoUrl?: string;
  gender?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
}) => {
  if (photoUrl) {
    return <img src={photoUrl} alt={name || 'Student'} className={`${className} object-cover border border-slate-200 shadow-xs`} />;
  }

  const g = (gender || 'MALE').toUpperCase();
  const isFemale = g === 'FEMALE';

  if (isFemale) {
    return (
      <div
        className={`${className} bg-pink-100 border border-pink-300 text-pink-700 flex items-center justify-center font-black shrink-0 overflow-hidden relative shadow-xs`}
        title={`Female Student (${name || ''})`}
      >
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4.5" fill="#fbcfe8" stroke="#db2777" />
          <path d="M5.5 21v-1.5a5.5 5.5 0 0 1 11 0V21" fill="#f472b6" stroke="#db2777" />
          <path d="M7 8c-1.5 0.5-2.5 2-2.5 4" stroke="#db2777" strokeWidth="1.5" />
          <path d="M17 8c1.5 0.5 2.5 2 2.5 4" stroke="#db2777" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center font-black shrink-0 overflow-hidden relative shadow-xs`}
      title={`Male Student (${name || ''})`}
    >
      <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4.5" fill="#bfdbfe" stroke="#2563eb" />
        <path d="M5.5 21v-1.5a5.5 5.5 0 0 1 11 0V21" fill="#60a5fa" stroke="#2563eb" />
      </svg>
    </div>
  );
};

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [academyInfo, setAcademyInfo] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const toggleExpandStudent = (id: string) => {
    setExpandedStudentId((prev) => (prev === id ? null : id));
  };

  const offeredStandards = useMemo(() => {
    const types = academyInfo?.institutionTypes && academyInfo.institutionTypes.length > 0
      ? academyInfo.institutionTypes
      : [academyInfo?.institutionType || 'High School'];
    const allowed = getStandardsForAcademicLevels(types);
    const filtered = ALL_STANDARDS.filter((s) => allowed.includes(s.standard));
    return filtered.length > 0 ? filtered : ALL_STANDARDS;
  }, [academyInfo]);

  const [usageStats, setUsageStats] = useState<{
    activeStudents: number;
    totalRecords: number;
    studentLimit: number;
    isUnlimited?: boolean;
    remainingStudents: number;
    usagePercentage: number;
    subscriptionStatus: string;
    planKey: string;
  } | null>(null);

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
    gender: 'MALE',
    bloodGroup: 'Not Available',
    emergencyContactName: '',
    emergencyPhone: '',
    address: '',
    rollNo: '',
    validUpto: '31-MAR-2027',
  });
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [editFormError, setEditFormError] = useState('');

  const handleOpenEditModal = (stu: any) => {
    setEditingStudent(stu);
    setEditFormError('');
    setEditFormData({
      name: stu.name || '',
      parentName: stu.parentName || '',
      parentPhone: stu.parentPhone || '',
      parentEmail: stu.parentEmail || '',
      photoUrl: stu.photoUrl || '',
      gender: stu.gender ? stu.gender.toUpperCase() : 'MALE',
      bloodGroup: stu.bloodGroup || 'Not Available',
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
    setEditFormError('');

    if (!isValidName(editFormData.name)) {
      setEditFormError("Student's full name is required (at least 2 characters).");
      return;
    }
    if (!isValidName(editFormData.parentName)) {
      setEditFormError("Parent's full name is required (at least 2 characters).");
      return;
    }
    if (!isValidMobile(editFormData.parentPhone)) {
      setEditFormError('Parent phone must be a valid 10-digit mobile number starting with 6-9 (e.g. 9876543210).');
      return;
    }
    if (editFormData.parentEmail && !isValidEmail(editFormData.parentEmail)) {
      setEditFormError('Please enter a valid email address or leave it blank.');
      return;
    }
    if (editFormData.emergencyPhone && !isValidMobile(editFormData.emergencyPhone)) {
      setEditFormError('Emergency phone must be a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    setIsUpdatingStudent(true);
    try {
      await apiClient.patch(`/students/${editingStudent._id}`, editFormData);
      setShowEditModal(false);
      setEditingStudent(null);
      fetchData();
    } catch (err: any) {
      setEditFormError(formatValidationErrorMessage(err, 'Failed to update student profile. Please check inputs and try again.'));
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
  const [promoteFormError, setPromoteFormError] = useState('');

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
    gender: 'MALE',
    bloodGroup: 'Not Available',
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
  const [formError, setFormError] = useState('');
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
      const [stuRes, classRes, feeRes, acadRes, usageRes] = await Promise.all([
        apiClient.get('/students'),
        apiClient.get('/classes'),
        apiClient.get('/fee-engine/structures').catch(() => ({ data: [] })),
        apiClient.get('/academies/my-academy').catch(() => ({ data: null })),
        apiClient.get('/students/usage-stats').catch(() => ({ data: null })),
      ]);
      setStudents(stuRes.data);
      setClasses(classRes.data);
      if (acadRes?.data) setAcademyInfo(acadRes.data);
      if (usageRes?.data) setUsageStats(usageRes.data);
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
      } else if (acadRes?.data) {
        const types = acadRes.data.institutionTypes && acadRes.data.institutionTypes.length > 0
          ? acadRes.data.institutionTypes
          : [acadRes.data.institutionType || 'High School'];
        const allowed = getStandardsForAcademicLevels(types);
        const fallbackStd = allowed[0] ?? 1;
        const matchedFee = getMatchingFeeAmount(fallbackStd, 'english', 'none', loadedFeeStructures);
        setFormData((prev) => ({
          ...prev,
          standard: fallbackStd,
          classBatchId: `preset_${fallbackStd}`,
          medium: 'english',
          stream: 'none',
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
    setFormError('');

    if (!isValidName(formData.name)) {
      setFormError("Student's full name is required (at least 2 characters).");
      return;
    }
    if (!isValidName(formData.parentName)) {
      setFormError("Parent's full name is required (at least 2 characters).");
      return;
    }
    if (!isValidMobile(formData.parentPhone)) {
      setFormError('Parent phone must be a valid 10-digit mobile number starting with 6-9 (e.g. 9876543210).');
      return;
    }
    if (formData.parentEmail && !isValidEmail(formData.parentEmail)) {
      setFormError('Please enter a valid parent email address or leave it blank.');
      return;
    }
    if (formData.emergencyPhone && !isValidMobile(formData.emergencyPhone)) {
      setFormError('Emergency phone must be a valid 10-digit mobile number starting with 6-9.');
      return;
    }
    if (!isValidStandard(formData.standard)) {
      setFormError('Please select a valid academic standard / level.');
      return;
    }

    const feeAmount = Number(formData.customTotalFee);
    if (isNaN(feeAmount) || feeAmount < 0) {
      setFormError('Net billed fee must be a valid positive amount.');
      return;
    }

    const discountAmt = Number(formData.discountAmount) || 0;
    if (discountAmt < 0) {
      setFormError('Discount amount cannot be negative.');
      return;
    }
    if (discountAmt > feeAmount) {
      setFormError(`Discount amount (₹${discountAmt.toLocaleString('en-IN')}) cannot exceed the total fee (₹${feeAmount.toLocaleString('en-IN')}).`);
      return;
    }

    if (formData.paymentType === 'INSTALLMENT') {
      const instCount = Number(formData.installmentCount);
      if (!isValidInstallmentCount(instCount)) {
        setFormError('Number of installments must be an integer between 1 and 24.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('prohit_auth_token') : null;
      if (!token) {
        setAuthError(true);
        setFormError('Authentication Required: You are not signed in or your session has expired. Please sign in to enroll students.');
        setIsSubmitting(false);
        return;
      }

      let targetBatchId = formData.classBatchId;

      // Check if an existing batch in the classes list already matches
      const existingMatch = classes.find(
        (c: any) =>
          c.standard === formData.standard &&
          (formData.standard >= 11 ? c.section === formData.stream : c.medium === formData.medium)
      );

      if (existingMatch && (targetBatchId.startsWith('preset_') || !targetBatchId)) {
        targetBatchId = existingMatch._id;
      } else if (targetBatchId.startsWith('preset_')) {
        let preset = DEFAULT_BATCH_PRESETS.find((p) => p.id === targetBatchId || p.standard === formData.standard);
        const stdLabel = formatStandard(formData.standard);
        const medLabel = formData.standard >= 11 ? (formData.stream || 'science').toUpperCase() : (formData.medium || 'english').toUpperCase();
        const batchName = preset ? preset.batchName : `Class ${stdLabel} (${medLabel} Medium)`;

        const newBatchRes = await apiClient.post('/classes', {
          standard: formData.standard,
          medium: formData.standard <= 10 ? formData.medium : preset?.medium || 'english',
          section: formData.standard >= 11 ? formData.stream : preset?.section || 'none',
          batchName,
        });
        targetBatchId = newBatchRes.data._id;
      }

      await apiClient.post('/students', {
        name: formData.name.trim(),
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        parentEmail: formData.parentEmail ? formData.parentEmail.trim() : undefined,
        classBatchId: targetBatchId,
        standard: formData.standard,
        medium: formData.standard <= 10 ? formData.medium : 'english',
        stream: formData.standard >= 11 ? formData.stream : 'none',
        photoUrl: formData.photoUrl,
        gender: formData.gender || 'MALE',
        bloodGroup: formData.bloodGroup,
        emergencyContactName: (formData.emergencyContactName || formData.parentName).trim(),
        emergencyPhone: (formData.emergencyPhone || formData.parentPhone).trim(),
        address: formData.address ? formData.address.trim() : '',
        rollNo: formData.rollNo ? formData.rollNo.trim() : '',
        validUpto: formData.validUpto,
        discountAmount: discountAmt,
        paymentType: formData.paymentType,
        installmentCount: formData.paymentType === 'INSTALLMENT' ? Number(formData.installmentCount) : 1,
        customTotalFee: feeAmount,
      });

      setShowAddModal(false);
      setFormError('');
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
        gender: 'MALE',
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
        setFormError('Authentication Required: Your session has expired or you are not logged in. Please sign in to your academy again.');
      } else {
        setFormError(formatValidationErrorMessage(err, 'Failed to enroll student. Please check all inputs and try again.'));
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
    const nextStd = Math.min(15, (student.standard !== undefined && student.standard !== null ? student.standard : 10) + 1);
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
    setPromoteFormError('');

    if (!isValidStandard(promoteFormData.targetStandard)) {
      setPromoteFormError('Please select a valid academic level / standard to promote into.');
      return;
    }

    const feeAmount = Number(promoteFormData.customTotalFee);
    if (isNaN(feeAmount) || feeAmount < 0) {
      setPromoteFormError('Net fee amount must be a valid positive amount.');
      return;
    }

    const discountAmt = Number(promoteFormData.discountAmount) || 0;
    if (discountAmt < 0) {
      setPromoteFormError('Discount amount cannot be negative.');
      return;
    }
    if (discountAmt > feeAmount) {
      setPromoteFormError(`Discount amount (₹${discountAmt.toLocaleString('en-IN')}) cannot exceed the total fee (₹${feeAmount.toLocaleString('en-IN')}).`);
      return;
    }

    if (promoteFormData.paymentType === 'INSTALLMENT') {
      const instCount = Number(promoteFormData.installmentCount);
      if (!isValidInstallmentCount(instCount)) {
        setPromoteFormError('Number of installments must be an integer between 1 and 24.');
        return;
      }
    }

    setIsPromoting(true);
    try {
      let targetBatchId = promoteFormData.classBatchId;

      // Check if existing batch already matches
      const existingMatch = classes.find(
        (c: any) =>
          c.standard === promoteFormData.targetStandard &&
          (promoteFormData.targetStandard >= 11 ? c.section === promoteFormData.stream : c.medium === promoteFormData.medium)
      );

      if (existingMatch && (targetBatchId.startsWith('preset_') || !targetBatchId)) {
        targetBatchId = existingMatch._id;
      } else if (targetBatchId.startsWith('preset_')) {
        let preset = DEFAULT_BATCH_PRESETS.find((p) => p.id === targetBatchId || p.standard === promoteFormData.targetStandard);
        const stdLabel = formatStandard(promoteFormData.targetStandard);
        const medLabel = promoteFormData.targetStandard >= 11 ? (promoteFormData.stream || 'science').toUpperCase() : (promoteFormData.medium || 'english').toUpperCase();
        const batchName = preset ? preset.batchName : `Class ${stdLabel} (${medLabel} Medium)`;

        const newBatchRes = await apiClient.post('/classes', {
          standard: promoteFormData.targetStandard,
          medium: promoteFormData.targetStandard <= 10 ? promoteFormData.medium : preset?.medium || 'english',
          section: promoteFormData.targetStandard >= 11 ? promoteFormData.stream : preset?.section || 'none',
          batchName,
        });
        targetBatchId = newBatchRes.data._id;
      }

      await apiClient.post(`/students/${selectedStudentForPromote._id}/promote`, {
        targetStandard: promoteFormData.targetStandard,
        classBatchId: targetBatchId,
        medium: promoteFormData.targetStandard <= 10 ? promoteFormData.medium : 'english',
        stream: promoteFormData.targetStandard >= 11 ? promoteFormData.stream : 'none',
        discountAmount: discountAmt,
        paymentType: promoteFormData.paymentType,
        installmentCount: promoteFormData.paymentType === 'INSTALLMENT' ? Number(promoteFormData.installmentCount) : 1,
        customTotalFee: feeAmount,
      });

      setShowPromoteModal(false);
      setSelectedStudentForPromote(null);
      setPromoteFormError('');
      fetchData();
    } catch (err: any) {
      setPromoteFormError(formatValidationErrorMessage(err, 'Failed to promote student. Please verify all inputs and try again.'));
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
          disabled={usageStats ? (usageStats.studentLimit !== -1 && usageStats.remainingStudents <= 0) : false}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-2 self-start sm:self-auto shrink-0 text-xs sm:text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Student Quota Usage & Remaining Count Widget */}
      {usageStats && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900">
                  Student Capacity Quota ({usageStats.planKey} Plan)
                </span>
                <span className="text-xs text-slate-500 font-medium block -mt-0.5">
                  {usageStats.studentLimit === -1 || usageStats.isUnlimited
                    ? `${usageStats.totalRecords} Enrolled • Unlimited Capacity`
                    : `${usageStats.totalRecords} Enrolled / ${usageStats.studentLimit} Limit (${usageStats.remainingStudents} Remaining Seats)`}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`text-xs font-black px-3 py-1 rounded-xl border ${
                usageStats.studentLimit === -1 || usageStats.isUnlimited
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : usageStats.remainingStudents === 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : usageStats.usagePercentage >= 80
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {usageStats.studentLimit === -1 || usageStats.isUnlimited
                  ? 'Unlimited Capacity'
                  : `${usageStats.remainingStudents} Seats Remaining (${100 - usageStats.usagePercentage}% Available)`}
              </span>
              <a
                href="/subscription"
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition"
              >
                Upgrade Plan
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                usageStats.studentLimit === -1 || usageStats.isUnlimited
                  ? 'bg-emerald-500'
                  : usageStats.usagePercentage >= 100
                  ? 'bg-rose-500'
                  : usageStats.usagePercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${usageStats.studentLimit === -1 || usageStats.isUnlimited ? 100 : usageStats.usagePercentage}%` }}
            />
          </div>
        </div>
      )}

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
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Student Code</th>
                <th className="py-3.5 px-4">Class & Batch</th>
                <th className="py-3.5 px-4">Parent Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
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
                filteredStudents.map((stu) => {
                  const isExpanded = expandedStudentId === stu._id;
                  return (
                    <React.Fragment key={stu._id}>
                      <tr className={`hover:bg-slate-50/80 transition ${isExpanded ? 'bg-orange-50/20' : ''}`}>
                        {/* Student Name & Avatar */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center space-x-3">
                            <StudentAvatar
                              photoUrl={stu.photoUrl}
                              gender={stu.gender}
                              name={stu.name}
                              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-400 transition"
                              iconClassName="w-5 h-5"
                            />
                            <div>
                              <div
                                onClick={() => toggleExpandStudent(stu._id)}
                                className="font-bold text-slate-900 text-sm leading-snug hover:text-orange-600 transition cursor-pointer flex items-center space-x-1"
                                title="Click to view student details"
                              >
                                <span>{stu.name}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium block">
                                {stu.gender ? stu.gender.charAt(0).toUpperCase() + stu.gender.slice(1).toLowerCase() : 'Student'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Student Code / Roll Number */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-lg inline-block">
                            {stu.studentCode || stu.rollNumber || 'STU-2026-00001'}
                          </span>
                        </td>

                        {/* Standard, Medium & Stream */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                              {formatStandardFull(stu.standard)}
                            </span>
                            <span className="bg-orange-50 text-orange-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-orange-200 uppercase">
                              {stu.standard <= 10
                                ? stu.medium === 'semi_english' ? 'Semi-Eng' : stu.medium === 'marathi' ? 'Marathi' : stu.medium === 'hindi' ? 'Hindi' : 'English'
                                : stu.stream !== 'none' ? stu.stream : 'General'}
                            </span>
                          </div>
                        </td>

                        {/* Parent Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-xs text-slate-800 leading-snug">{stu.parentName}</div>
                          <a
                            href={`tel:${stu.parentPhone}`}
                            className="text-[11px] text-slate-500 hover:text-orange-600 font-mono flex items-center space-x-1 mt-0.5 transition"
                            title="Call Parent"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{stu.parentPhone}</span>
                          </a>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {stu.status === 'INACTIVE' ? (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Inactive</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>

                        {/* Simplified Actions Column */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Toggle Detail Placeholder Button */}
                            <button
                              onClick={() => toggleExpandStudent(stu._id)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center space-x-1 cursor-pointer ${
                                isExpanded
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                              }`}
                              title={isExpanded ? 'Hide Details' : 'View Full Details & Placeholder'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'Hide' : 'Details'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Quick Edit Profile Button */}
                            <button
                              onClick={() => handleOpenEditModal(stu)}
                              className="bg-white hover:bg-slate-100 text-slate-700 p-1.5 rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs"
                              title="Edit Student Profile"
                            >
                              <Edit3 className="w-4 h-4 text-slate-600" />
                            </button>

                            {/* Dropdown Menu for More Actions */}
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(openActionMenuId === stu._id ? null : stu._id);
                                }}
                                className="bg-white hover:bg-slate-100 text-slate-700 p-1.5 rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs"
                                title="More Actions"
                              >
                                <MoreVertical className="w-4 h-4 text-slate-600" />
                              </button>

                              {openActionMenuId === stu._id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setOpenActionMenuId(null)}
                                  />
                                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-left">
                                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Student Actions
                                    </div>

                                    {/* Digital ID Card */}
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setSelectedIdCardStudent(stu);
                                        setShowIdCardModal(true);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2.5 transition cursor-pointer"
                                    >
                                      <CreditCard className="w-4 h-4 text-teal-600" />
                                      <span>Digital Student ID Card</span>
                                    </button>

                                    {/* Test Results */}
                                    <Link
                                      href={`academics?tab=exams&studentId=${stu._id}`}
                                      onClick={() => setOpenActionMenuId(null)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 flex items-center space-x-2.5 transition cursor-pointer"
                                    >
                                      <Award className="w-4 h-4 text-indigo-600" />
                                      <span>Test Results & Marks</span>
                                    </Link>

                                    {/* Promote Std */}
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        handleOpenPromoteModal(stu);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-800 flex items-center space-x-2.5 transition cursor-pointer"
                                    >
                                      <GraduationCap className="w-4 h-4 text-orange-600" />
                                      <span>Promote to Next Std</span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100" />

                                    {/* Status Toggle */}
                                    {stu.status === 'INACTIVE' ? (
                                      <button
                                        onClick={() => {
                                          setOpenActionMenuId(null);
                                          handleToggleStatus(stu._id, stu.status);
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2.5 transition cursor-pointer"
                                      >
                                        <UserCheck className="w-4 h-4 text-emerald-600" />
                                        <span>Re-activate Admission</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setOpenActionMenuId(null);
                                          handleToggleStatus(stu._id, stu.status);
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center space-x-2.5 transition cursor-pointer"
                                      >
                                        <UserX className="w-4 h-4 text-rose-600" />
                                        <span>Deactivate (Left Academy)</span>
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Detail Placeholder Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={6} className="p-3 sm:p-5">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
                              {/* Detail Placeholder Top Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div className="flex items-center space-x-3.5">
                                  <StudentAvatar
                                    photoUrl={stu.photoUrl}
                                    gender={stu.gender}
                                    name={stu.name}
                                    className="w-12 h-12 rounded-2xl shadow-xs"
                                    iconClassName="w-7 h-7"
                                  />
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-base font-extrabold text-slate-900">{stu.name}</h3>
                                      <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                                        {stu.studentCode || stu.rollNumber || 'STU-2026-00001'}
                                      </span>
                                      {stu.status === 'INACTIVE' ? (
                                        <span className="bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                                          Inactive (Left)
                                        </span>
                                      ) : (
                                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                          Active Admission
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                      Complete student records, medical details, parent contacts & enrollment data
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleExpandStudent(stu._id)}
                                  className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
                                >
                                  <span>Close Details</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* 3 Detail Information Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Card 1: Personal & Medical Info */}
                                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
                                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                                    <User className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Personal & Medical Info</span>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Blood Group:</span>
                                      <span
                                        className={`font-bold px-2 py-0.5 rounded-md text-[11px] border ${
                                          stu.bloodGroup && stu.bloodGroup !== 'Not Available'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}
                                      >
                                        {stu.bloodGroup || 'Not Available'}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Gender:</span>
                                      <span className="font-bold text-slate-800">
                                        {stu.gender ? stu.gender.toUpperCase() : 'MALE'}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Roll No / ID:</span>
                                      <span className="font-mono font-bold text-slate-800">
                                        {stu.rollNo || stu.studentCode || 'N/A'}
                                      </span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/70">
                                      <span className="text-slate-500 font-medium block text-[11px]">Address:</span>
                                      <span className="text-slate-800 font-semibold block mt-0.5">
                                        {stu.address || 'Address not registered'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 2: Parent & Emergency Contact */}
                                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
                                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Parent & Emergency Contact</span>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div>
                                      <span className="text-slate-500 font-medium block text-[11px]">Parent / Guardian:</span>
                                      <span className="font-bold text-slate-800 block text-xs">{stu.parentName}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Primary Phone:</span>
                                      <a href={`tel:${stu.parentPhone}`} className="font-mono font-bold text-blue-600 hover:underline">
                                        {stu.parentPhone}
                                      </a>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Email Address:</span>
                                      <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                        {stu.parentEmail || 'Not provided'}
                                      </span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/70 space-y-1">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium">Emergency Contact:</span>
                                        <span className="font-bold text-slate-800">{stu.emergencyContactName || stu.parentName}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium">Emergency Phone:</span>
                                        <a href={`tel:${stu.emergencyPhone || stu.parentPhone}`} className="font-mono font-bold text-rose-600 hover:underline">
                                          {stu.emergencyPhone || stu.parentPhone}
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 3: Academic & Batch Details */}
                                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
                                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Academic & Batch Details</span>
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Standard / Level:</span>
                                      <span className="font-bold text-slate-900">
                                        {formatStandardFull(stu.standard)}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Medium:</span>
                                      <span className="font-bold text-slate-800 capitalize">
                                        {stu.medium === 'semi_english' ? 'Semi-English' : stu.medium || 'English'}
                                      </span>
                                    </div>

                                    {stu.standard >= 11 && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Stream / Section:</span>
                                        <span className="font-bold text-slate-800 capitalize">
                                          {stu.stream !== 'none' ? stu.stream : 'General'}
                                        </span>
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-200/70">
                                      <span className="text-slate-500 font-medium block text-[11px]">Assigned Class Batch:</span>
                                      <span className="font-semibold text-slate-800 block text-xs mt-0.5">
                                        {stu.classBatchId?.batchName || `${formatStandardFull(stu.standard)} General Batch`}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <span className="text-slate-500 font-medium">ID Card Validity:</span>
                                      <span className="font-mono font-bold text-slate-700">{stu.validUpto || '31-MAR-2027'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Detail Placeholder Bottom Quick Actions Toolbar */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                                <span className="text-xs font-bold text-slate-600">Quick Actions:</span>

                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Edit Profile */}
                                  <button
                                    onClick={() => handleOpenEditModal(stu)}
                                    className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit Profile</span>
                                  </button>

                                  {/* Digital ID Card */}
                                  <button
                                    onClick={() => {
                                      setSelectedIdCardStudent(stu);
                                      setShowIdCardModal(true);
                                    }}
                                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Digital ID Card</span>
                                  </button>

                                  {/* Test Results */}
                                  <Link
                                    href={`academics?tab=exams&studentId=${stu._id}`}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Test Results</span>
                                  </Link>

                                  {/* Promote Std */}
                                  <button
                                    onClick={() => handleOpenPromoteModal(stu)}
                                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Promote Std</span>
                                  </button>

                                  {/* Toggle Status */}
                                  {stu.status === 'INACTIVE' ? (
                                    <button
                                      onClick={() => handleToggleStatus(stu._id, stu.status)}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                    >
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Re-activate</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleStatus(stu._id, stu.status)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                                    >
                                      <UserX className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Deactivate</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
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
                Promote <strong className="text-slate-900">{selectedStudentForPromote.name}</strong> from {formatStandardFull(selectedStudentForPromote.standard)} to the next standard and initialize the new academic fee schedule.
              </p>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              {promoteFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-start space-x-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold block">Validation Alert</strong>
                    <span>{promoteFormError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoteFormError('')}
                    className="text-rose-400 hover:text-rose-700 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Target Next Standard *</label>
                  {academyInfo?.institutionTypes && academyInfo.institutionTypes.length > 0 && (
                    <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      Offered Levels
                    </span>
                  )}
                </div>
                <select
                  value={promoteFormData.targetStandard}
                  onChange={(e) => handlePromoteStandardChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold text-sm"
                >
                  {offeredStandards.map((s) => (
                    <option key={s.standard} value={s.standard}>
                      {s.fullLabel}
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
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-start space-x-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold block">Validation Alert</strong>
                    <span>{formError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormError('')}
                    className="text-rose-400 hover:text-rose-700 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Photo Upload Provision */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">Student Passport Photo & Gender *</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <StudentAvatar photoUrl={formData.photoUrl} gender={formData.gender} name={formData.name || 'Preview'} className="w-full h-full rounded-2xl" iconClassName="w-8 h-8" />
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
                    <span className="text-[10px] text-slate-400 block font-medium">If no photo uploaded, default avatar applies based on gender</span>
                  </div>
                </div>
              </div>

              {/* Gender Selection & Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender *</label>
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center space-x-1 ${
                        formData.gender === 'MALE'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center space-x-1 ${
                        formData.gender === 'FEMALE'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Female</span>
                    </button>
                  </div>
                </div>
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
                    {['Not Available', 'A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg) => (
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Standard / Academic Level *</label>
                  {academyInfo?.institutionTypes && academyInfo.institutionTypes.length > 0 && (
                    <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      Offered Levels Only
                    </span>
                  )}
                </div>
                <select
                  value={formData.standard}
                  onChange={(e) => handleStandardChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                >
                  {offeredStandards.map((s) => (
                    <option key={s.standard} value={s.standard}>
                      {s.fullLabel}
                    </option>
                  ))}
                </select>
                {academyInfo?.institutionTypes && academyInfo.institutionTypes.length > 0 && (
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Offered by your academy: <strong className="text-slate-700">{academyInfo.institutionTypes.join(', ')}</strong>
                  </p>
                )}
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
              {editFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-start space-x-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold block">Validation Alert</strong>
                    <span>{editFormError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFormError('')}
                    className="text-rose-400 hover:text-rose-700 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Photo Upload Provision */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">Update Passport Photo & Gender</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <StudentAvatar photoUrl={editFormData.photoUrl} gender={editFormData.gender} name={editFormData.name || 'Preview'} className="w-full h-full rounded-2xl" iconClassName="w-8 h-8" />
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

              {/* Gender Selection & Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender *</label>
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, gender: 'MALE' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center space-x-1 ${
                        editFormData.gender === 'MALE'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, gender: 'FEMALE' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center space-x-1 ${
                        editFormData.gender === 'FEMALE'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Female</span>
                    </button>
                  </div>
                </div>
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
                    {['Not Available', 'A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((bg) => (
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
                        {formatStandardFull(selectedIdCardStudent.standard)} {selectedIdCardStudent.stream !== 'none' ? `(${selectedIdCardStudent.stream.toUpperCase()})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-600">BATCH:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">
                        {selectedIdCardStudent.classBatchId?.batchName || `${formatStandardFull(selectedIdCardStudent.standard)} Batch`}
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
                      <StudentAvatar photoUrl={selectedIdCardStudent.photoUrl} gender={selectedIdCardStudent.gender} name={selectedIdCardStudent.name} className="w-full h-full rounded-none" iconClassName="w-10 h-10" />
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
                  <span className="font-mono text-[7px]">{academyInfo?.phone || '+91 97739 69033'}</span>
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
