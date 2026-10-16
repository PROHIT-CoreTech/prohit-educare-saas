'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Calendar,
  Edit3,
  Trash2,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  TrendingUp,
  X,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Check,
  RefreshCw,
  Clock,
  BookOpen,
  Lock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api';

const COMMON_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Social Science',
  'Hindi',
  'Marathi',
  'Computer Science',
  'Economics',
  'Accountancy',
];

const COMMON_EXAMS = [
  'Unit Test 1',
  'Unit Test 2',
  'Midterm Examination',
  'Semester 1 Final',
  'Semester 2 Final',
  'Weekly Practice Test',
  'Monthly Assessment',
  'Board Preliminary 1',
  'Board Preliminary 2',
];

const EXAM_TYPES = [
  'Unit Test',
  'Midterm Exam',
  'Final Exam',
  'Weekly Quiz',
  'Monthly Assessment',
  'Practice Test',
  'Preliminary Board',
  'Oral / Practical',
];

const REMARK_PRESETS = [
  'Outstanding performance! Consistent and meticulous work.',
  'Very good understanding and neat presentation of answers.',
  'Good progress; keep practicing regularly to aim higher.',
  'Needs improvement in numerical calculations and problem solving.',
  'Focus more on foundational concepts and timely revisions.',
  'Careless mistakes in step calculations; revise before submitting.',
];

const StudentAvatar = ({
  photoUrl,
  gender,
  name,
  className = 'w-10 h-10 rounded-full',
  iconClassName = 'w-5 h-5',
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
  const isFemale = (gender || 'MALE').toUpperCase() === 'FEMALE';
  if (isFemale) {
    return (
      <div
        className={`${className} bg-pink-100 border border-pink-300 text-pink-700 flex items-center justify-center font-black shrink-0 overflow-hidden relative shadow-xs`}
        title={`Female Student (${name || ''})`}
      >
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4.5" fill="#fbcfe8" stroke="#db2777" />
          <path d="M5.5 21v-1.5a5.5 5.5 0 0 1 11 0V21" fill="#f472b6" stroke="#db2777" />
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

interface ExamsTabProps {
  academyInfo: any;
  classes: any[];
  allowedStandards: number[];
  initialStudentId?: string | null;
  slug?: string;
}

export default function ExamsTab({
  academyInfo,
  classes,
  allowedStandards,
  initialStudentId,
  slug,
}: ExamsTabProps) {
  // Subscription Tier Verification
  // Student Test Results & Examination engine is strictly available on Professional & Enterprise tiers
  const planKey = (academyInfo?.subscriptionPlanKey || (academyInfo?.subscriptionStatus === 'TRIAL' ? 'TRIAL' : 'STARTER')).toUpperCase().trim();
  const isEligibleTier =
    planKey.includes('PROFESSIONAL') ||
    planKey.includes('PRO') ||
    planKey.includes('ENTERPRISE') ||
    planKey.includes('UNLIMITED');

  // Data lists
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);

  // Filters
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'student' | 'batch'>(initialStudentId ? 'student' : 'student');

  // Exam Marks
  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [batchMarks, setBatchMarks] = useState<any[]>([]);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);
  const [testSearchQuery, setTestSearchQuery] = useState<string>('');
  const [selectedExamTypeFilter, setSelectedExamTypeFilter] = useState<string>('all');

  // Modal: Add / Edit Test Result
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [editingMark, setEditingMark] = useState<any | null>(null);
  const [testForm, setTestForm] = useState({
    studentId: '',
    classBatchId: '',
    examName: 'Unit Test 1',
    examType: 'Unit Test',
    subject: '',
    marksObtained: '',
    totalMarks: '50',
    grade: '',
    remarks: '',
    examDate: new Date().toISOString().split('T')[0],
  });
  const [testFormError, setTestFormError] = useState<string>('');
  const [isSubmittingTest, setIsSubmittingTest] = useState<boolean>(false);

  // Modal: Print Student Report Card / Result Slip
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<'cumulative' | 'single'>('cumulative');
  const [singlePrintMark, setSinglePrintMark] = useState<any | null>(null);

  // Fetch Students list on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await apiClient.get('/students');
      const activeList = Array.isArray(res.data) ? res.data : [];
      setStudents(activeList);

      // If initialStudentId was passed or we have students, set initial student
      if (initialStudentId) {
        setSelectedStudentId(initialStudentId);
      } else if (activeList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(activeList[0]._id);
      }
    } catch (e) {
      console.error('Failed to load students', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Selected Student Object
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId || selectedStudentId === 'all') return null;
    return students.find((s) => s._id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Filtered Students list based on Standard and Batch selection & search query
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      // Standard filter
      if (selectedStandard !== 'all' && stu.standard !== Number(selectedStandard)) {
        return false;
      }
      // Batch filter
      if (selectedBatchId !== 'all') {
        const bId = stu.classBatchId?._id || stu.classBatchId;
        if (bId !== selectedBatchId) return false;
      }
      // Search query filter
      if (studentSearchQuery.trim()) {
        const q = studentSearchQuery.toLowerCase();
        const nameMatch = stu.name?.toLowerCase().includes(q);
        const rollMatch = stu.rollNo?.toLowerCase().includes(q);
        const phoneMatch = stu.parentPhone?.includes(q);
        if (!nameMatch && !rollMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [students, selectedStandard, selectedBatchId, studentSearchQuery]);

  // Load Marks whenever selected student or selected batch changes
  useEffect(() => {
    if (viewMode === 'student' && selectedStudentId && selectedStudentId !== 'all') {
      fetchStudentMarks(selectedStudentId);
    } else if (viewMode === 'batch' && selectedBatchId && selectedBatchId !== 'all') {
      fetchBatchMarks(selectedBatchId);
    }
  }, [selectedStudentId, selectedBatchId, viewMode]);

  const fetchStudentMarks = async (studentId: string) => {
    setLoadingMarks(true);
    try {
      const res = await apiClient.get(`/exam-marks/student/${studentId}`);
      setStudentMarks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load student test marks', e);
      setStudentMarks([]);
    } finally {
      setLoadingMarks(false);
    }
  };

  const fetchBatchMarks = async (batchId: string) => {
    setLoadingMarks(true);
    try {
      const res = await apiClient.get(`/exam-marks/class/${batchId}`);
      setBatchMarks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load batch test marks', e);
      setBatchMarks([]);
    } finally {
      setLoadingMarks(false);
    }
  };

  // Grade helper
  const calculateGradeFromMarks = (obtained: number, total: number) => {
    if (!total || total <= 0) return 'F';
    const pct = (obtained / total) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 35) return 'C';
    return 'F';
  };

  // Performance Stats for Selected Student
  const studentStats = useMemo(() => {
    if (!studentMarks || studentMarks.length === 0) {
      return {
        totalTests: 0,
        averagePercentage: 0,
        highestScore: 0,
        highestSubject: 'N/A',
        overallGrade: 'N/A',
        passedCount: 0,
        failedCount: 0,
        totalObtained: 0,
        totalMax: 0,
      };
    }

    let totalObtained = 0;
    let totalMax = 0;
    let highestPct = -1;
    let highestSubject = 'N/A';
    let passedCount = 0;

    studentMarks.forEach((mark) => {
      totalObtained += mark.marksObtained;
      totalMax += mark.totalMarks;
      const pct = (mark.marksObtained / mark.totalMarks) * 100;
      if (pct > highestPct) {
        highestPct = pct;
        highestSubject = mark.subject;
      }
      if (pct >= 35) {
        passedCount++;
      }
    });

    const averagePercentage = totalMax > 0 ? Math.round(((totalObtained / totalMax) * 100) * 10) / 10 : 0;
    const overallGrade = calculateGradeFromMarks(totalObtained, totalMax);

    return {
      totalTests: studentMarks.length,
      averagePercentage,
      highestScore: Math.round(highestPct * 10) / 10,
      highestSubject,
      overallGrade,
      passedCount,
      failedCount: studentMarks.length - passedCount,
      totalObtained,
      totalMax,
    };
  }, [studentMarks]);

  // Filtered Student Marks (based on search & exam type)
  const filteredStudentMarks = useMemo(() => {
    return studentMarks.filter((mark) => {
      if (selectedExamTypeFilter !== 'all' && mark.examType !== selectedExamTypeFilter) {
        return false;
      }
      if (testSearchQuery.trim()) {
        const q = testSearchQuery.toLowerCase();
        const subjectMatch = mark.subject?.toLowerCase().includes(q);
        const nameMatch = mark.examName?.toLowerCase().includes(q);
        if (!subjectMatch && !nameMatch) return false;
      }
      return true;
    });
  }, [studentMarks, selectedExamTypeFilter, testSearchQuery]);

  // Open Modal: Add New Test Result
  const handleOpenAddTestModal = (student?: any) => {
    const targetStudent = student || selectedStudent;
    if (!targetStudent) {
      alert('Please select a student first to add test results.');
      return;
    }

    setEditingMark(null);
    setTestFormError('');
    setTestForm({
      studentId: targetStudent._id,
      classBatchId: targetStudent.classBatchId?._id || targetStudent.classBatchId || '',
      examName: 'Unit Test 1',
      examType: 'Unit Test',
      subject: 'Mathematics',
      marksObtained: '',
      totalMarks: '50',
      grade: '',
      remarks: '',
      examDate: new Date().toISOString().split('T')[0],
    });
    setShowTestModal(true);
  };

  // Open Modal: Edit Existing Test Result
  const handleOpenEditTestModal = (mark: any) => {
    setEditingMark(mark);
    setTestFormError('');
    setTestForm({
      studentId: mark.studentId?._id || mark.studentId,
      classBatchId: mark.classBatchId?._id || mark.classBatchId,
      examName: mark.examName,
      examType: mark.examType || 'Unit Test',
      subject: mark.subject,
      marksObtained: String(mark.marksObtained),
      totalMarks: String(mark.totalMarks),
      grade: mark.grade || '',
      remarks: mark.remarks || '',
      examDate: mark.examDate ? new Date(mark.examDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowTestModal(true);
  };

  // Save or Update Test Result
  const handleSaveTestResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestFormError('');

    const obtained = parseFloat(testForm.marksObtained);
    const total = parseFloat(testForm.totalMarks);

    if (isNaN(obtained) || obtained < 0) {
      setTestFormError('Marks obtained must be a valid positive number');
      return;
    }
    if (isNaN(total) || total <= 0) {
      setTestFormError('Total marks must be a number greater than 0');
      return;
    }
    if (obtained > total) {
      setTestFormError(`Marks obtained (${obtained}) cannot exceed total marks (${total})`);
      return;
    }
    if (!testForm.subject.trim()) {
      setTestFormError('Please enter or select a subject name');
      return;
    }
    if (!testForm.examName.trim()) {
      setTestFormError('Please enter an exam or test title');
      return;
    }

    setIsSubmittingTest(true);
    try {
      const payload = {
        studentId: testForm.studentId,
        classBatchId: testForm.classBatchId,
        examName: testForm.examName.trim(),
        examType: testForm.examType,
        subject: testForm.subject.trim(),
        marksObtained: obtained,
        totalMarks: total,
        grade: testForm.grade?.trim() || calculateGradeFromMarks(obtained, total),
        remarks: testForm.remarks.trim(),
        examDate: testForm.examDate,
      };

      if (editingMark) {
        await apiClient.patch(`/exam-marks/${editingMark._id}`, payload);
      } else {
        await apiClient.post('/exam-marks', payload);
      }

      setShowTestModal(false);
      setEditingMark(null);

      // Refresh marks list
      if (testForm.studentId) {
        fetchStudentMarks(testForm.studentId);
      }
      if (testForm.classBatchId && viewMode === 'batch') {
        fetchBatchMarks(testForm.classBatchId);
      }
    } catch (err: any) {
      setTestFormError(err.response?.data?.message || 'Failed to save test result. Please try again.');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  // Delete Test Result
  const handleDeleteTestResult = async (markId: string) => {
    if (!confirm('Are you sure you want to permanently delete this test result record?')) {
      return;
    }
    try {
      await apiClient.delete(`/exam-marks/${markId}`);
      if (selectedStudentId) {
        fetchStudentMarks(selectedStudentId);
      }
      if (selectedBatchId && viewMode === 'batch') {
        fetchBatchMarks(selectedBatchId);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete test result record');
    }
  };

  // Open Print Modal
  const handleOpenPrintModal = (mode: 'cumulative' | 'single', singleMark?: any) => {
    setPrintMode(mode);
    setSinglePrintMark(singleMark || null);
    setShowPrintModal(true);
  };

  // Trigger browser print
  const handleTriggerPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Active form calculated preview
  const liveObtained = parseFloat(testForm.marksObtained);
  const liveTotal = parseFloat(testForm.totalMarks);
  const liveValid = !isNaN(liveObtained) && !isNaN(liveTotal) && liveTotal > 0 && liveObtained <= liveTotal;
  const livePercentage = liveValid ? Math.round(((liveObtained / liveTotal) * 100) * 10) / 10 : 0;
  const liveGrade = liveValid ? calculateGradeFromMarks(liveObtained, liveTotal) : '-';

  // If not on Professional or Enterprise tier, show feature paywall
  if (!isEligibleTier) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8 max-w-4xl mx-auto my-4 text-slate-900">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 text-orange-700 px-4 py-1.5 rounded-full border border-orange-200 font-extrabold text-xs uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Professional & Enterprise Exclusive Feature</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-950">
            Student Test Results & Examination Engine
          </h2>

          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Academic assessment, student test records, automated grading, and official report slip generation are exclusively available on the <strong className="text-slate-900 font-extrabold">Professional Tier</strong> and <strong className="text-slate-900 font-extrabold">Enterprise Tier</strong> subscriptions.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Full Test Records & Marks Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record individual student scores across Unit Tests, Midterms, Quizzes, and Board Preliminary examinations with subject-level breakdown.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Auto Grade & Performance Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant percentage calculation, automated grade assignments (A+, A, B+, B, C, F), highest scoring subject metrics, and pass/fail indicators.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Official Printable Report Cards & Slips</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate branded, verified student performance slips and cumulative report cards with academy logo, evaluation breakdown, and formal signature blocks.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Batch-Wide Academic Overviews</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare exam results across entire classes, filter by exam type, and monitor academic progress across branches and standards.
            </p>
          </div>
        </div>

        {/* Current Plan vs Required Tier */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Current Subscription: {academyInfo?.subscriptionPlanKey || 'Starter Tier'}</span>
            </div>
            <h4 className="text-lg md:text-xl font-black text-white">
              Upgrade to Professional Tier (₹2,999/mo)
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Unlock the Examination Engine, capacity for up to 1,500 students, up to 6 branch locations, stream locks, and priority support.
            </p>
          </div>

          <Link
            href={`/${slug || academyInfo?.slug || ''}/subscription`}
            className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center space-x-2 transition shrink-0 justify-center cursor-pointer"
          >
            <span>Upgrade Subscription</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Academic Assessment & Examination Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Student Test Results & Performance Cards
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Record unit tests, midterm and final examinations for each student. Track subject-wise scoring, automate grade computations, and generate official printable result slips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {selectedStudent && (
              <button
                onClick={() => handleOpenPrintModal('cumulative')}
                disabled={studentMarks.length === 0}
                className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-white/15 transition flex items-center space-x-2 backdrop-blur-md cursor-pointer"
                title="Print official cumulative performance report card"
              >
                <Printer className="w-4 h-4 text-orange-400" />
                <span>Print Report Slip</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAddTestModal()}
              disabled={!selectedStudent}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center space-x-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Test Result</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Student Picker Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Standard Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Standard</label>
            <select
              value={selectedStandard}
              onChange={(e) => {
                setSelectedStandard(e.target.value);
                setSelectedBatchId('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Standards</option>
              {allowedStandards.map((std) => (
                <option key={std} value={std}>
                  Std {std}th
                </option>
              ))}
            </select>
          </div>

          {/* Class Batch Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Batches</option>
              {classes
                .filter((c) => selectedStandard === 'all' || c.standard === Number(selectedStandard))
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    Std {c.standard}th - {c.batchName}
                  </option>
                ))}
            </select>
          </div>

          {/* Student Picker Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
              <span>Select Student ({filteredStudents.length} Available)</span>
              {loadingStudents && <span className="text-orange-500 lowercase font-medium">loading...</span>}
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setViewMode('student');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-orange-500"
              >
                {filteredStudents.length === 0 ? (
                  <option value="">No students found in this filter</option>
                ) : (
                  filteredStudents.map((stu) => (
                    <option key={stu._id} value={stu._id}>
                      {stu.name} (Roll: {stu.rollNo || 'N/A'}) - Std {stu.standard}th [{stu.classBatchId?.batchName || 'General'}]
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Search Student Quick Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student by name, roll no..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setViewMode('student');
                if (filteredStudents.length > 0 && !selectedStudentId) {
                  setSelectedStudentId(filteredStudents[0]._id);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'student'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Particular Student View</span>
            </button>

            <button
              onClick={() => {
                setViewMode('batch');
                if (selectedBatchId === 'all' && classes.length > 0) {
                  setSelectedBatchId(classes[0]._id);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'batch'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch All Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: PARTICULAR STUDENT VIEW */}
      {viewMode === 'student' && (
        <div className="space-y-6">
          {selectedStudent ? (
            <>
              {/* Student Profile Card & Summary Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <StudentAvatar
                      photoUrl={selectedStudent.photoUrl}
                      gender={selectedStudent.gender}
                      name={selectedStudent.name}
                      className="w-16 h-16 rounded-2xl shadow-md border-2 border-white ring-2 ring-orange-200 shrink-0"
                      iconClassName="w-8 h-8"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-xl font-black text-slate-900">{selectedStudent.name}</h2>
                        <span className="bg-orange-50 text-orange-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-orange-200">
                          Roll: {selectedStudent.rollNo || 'N/A'}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-indigo-200">
                          Std {selectedStudent.standard}th - {selectedStudent.classBatchId?.batchName || 'General'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3">
                        <span>Parent: <strong className="text-slate-700">{selectedStudent.parentName}</strong></span>
                        <span>•</span>
                        <span>Mobile: <strong className="text-slate-700">{selectedStudent.parentPhone}</strong></span>
                        <span>•</span>
                        <span>Medium: <strong className="text-slate-700 capitalize">{selectedStudent.medium || 'English'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleOpenAddTestModal(selectedStudent)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record Test Result</span>
                    </button>

                    <button
                      onClick={() => handleOpenPrintModal('cumulative')}
                      disabled={studentMarks.length === 0}
                      className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>

                {/* 4 Performance Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                  <div className="bg-gradient-to-br from-indigo-50/70 to-indigo-100/40 border border-indigo-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-indigo-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Tests Taken</span>
                      <BookOpen className="w-4 h-4 opacity-75" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {studentStats.totalTests}
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-600 mt-1">
                      {studentStats.totalTests > 0 ? `${studentStats.passedCount} Passed / ${studentStats.failedCount} Needs Review` : 'No tests recorded'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 border border-emerald-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-emerald-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Overall Average</span>
                      <TrendingUp className="w-4 h-4 opacity-75" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {studentStats.averagePercentage}%
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                      {studentStats.averagePercentage >= 75 ? '★ Distinction Score' : studentStats.averagePercentage >= 60 ? 'First Class' : studentStats.averagePercentage >= 35 ? 'Passing Score' : 'Needs Support'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/70 to-amber-100/40 border border-amber-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-amber-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Highest Score</span>
                      <Sparkles className="w-4 h-4 opacity-75" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {studentStats.highestScore}%
                    </div>
                    <div className="text-[11px] font-semibold text-amber-700 truncate mt-1">
                      Subject: {studentStats.highestSubject}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50/70 to-purple-100/40 border border-purple-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-purple-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Overall Grade</span>
                      <Award className="w-4 h-4 opacity-75" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {studentStats.overallGrade}
                    </div>
                    <div className="text-[11px] font-semibold text-purple-700 mt-1">
                      {studentStats.totalObtained} / {studentStats.totalMax} Total Marks
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Test Results Table Container */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    <h3 className="text-base font-black text-slate-900">
                      Test Results History ({filteredStudentMarks.length})
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search inside results */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        placeholder="Search exam or subject..."
                        value={testSearchQuery}
                        onChange={(e) => setTestSearchQuery(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Filter by Exam Type */}
                    <select
                      value={selectedExamTypeFilter}
                      onChange={(e) => setSelectedExamTypeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Exam Types</option>
                      {EXAM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => fetchStudentMarks(selectedStudent._id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      title="Refresh test results"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingMarks ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Loading test results...</p>
                  </div>
                ) : filteredStudentMarks.length === 0 ? (
                  <div className="py-14 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <p className="text-base font-extrabold text-slate-800">
                        No Test Results Recorded Yet
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {selectedStudent.name} does not have any recorded test marks. Click below to add their first Unit Test, Quiz, or Term score.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenAddTestModal(selectedStudent)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Test Result</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px] tracking-wider">
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Exam Name & Type</th>
                          <th className="p-3.5">Subject</th>
                          <th className="p-3.5">Marks Obtained</th>
                          <th className="p-3.5">Score %</th>
                          <th className="p-3.5">Grade</th>
                          <th className="p-3.5">Teacher Feedback</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredStudentMarks.map((mark) => {
                          const pct = mark.percentage || Math.round(((mark.marksObtained / mark.totalMarks) * 100) * 10) / 10;
                          const isPass = pct >= 35;
                          const formattedDate = mark.examDate
                            ? new Date(mark.examDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A';

                          return (
                            <tr key={mark._id} className="hover:bg-slate-50/70 transition">
                              <td className="p-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                                {formattedDate}
                              </td>

                              <td className="p-3.5">
                                <div className="space-y-0.5">
                                  <div className="font-extrabold text-slate-900">{mark.examName}</div>
                                  <span className="inline-block bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-md border border-slate-200">
                                    {mark.examType || 'Unit Test'}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3.5 font-bold text-slate-900">
                                <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-100">
                                  {mark.subject}
                                </span>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="font-black text-slate-900 font-mono text-sm">
                                    {mark.marksObtained} <span className="text-slate-400 font-normal text-xs">/ {mark.totalMarks}</span>
                                  </div>
                                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 35 ? 'bg-amber-500' : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black font-mono border ${
                                    pct >= 80
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : pct >= 60
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : pct >= 35
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </td>

                              <td className="p-3.5 whitespace-nowrap">
                                <span className="inline-block bg-slate-900 text-white font-black text-xs px-2.5 py-0.5 rounded-md font-mono shadow-xs">
                                  {mark.grade || calculateGradeFromMarks(mark.marksObtained, mark.totalMarks)}
                                </span>
                              </td>

                              <td className="p-3.5 max-w-xs">
                                {mark.remarks ? (
                                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 italic">
                                    &ldquo;{mark.remarks}&rdquo;
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs italic">No remarks recorded</span>
                                )}
                              </td>

                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-1.5">
                                  {/* Print Single Result Slip */}
                                  <button
                                    onClick={() => handleOpenPrintModal('single', mark)}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                                    title="Print single test slip"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Edit Test Mark */}
                                  <button
                                    onClick={() => handleOpenEditTestModal(mark)}
                                    className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                                    title="Edit test score"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Test Mark */}
                                  <button
                                    onClick={() => handleDeleteTestResult(mark._id)}
                                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                                    title="Delete test result"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4">
              <User className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">No Student Selected</h3>
                <p className="text-xs text-slate-500">Please choose a student from the dropdown above to view or add test scores.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: BATCH ALL STUDENTS OVERVIEW */}
      {viewMode === 'batch' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Batch-Wide Test Results
              </h3>
              <p className="text-xs text-slate-500">
                Showing all recorded tests for students in the selected class batch.
              </p>
            </div>

            <button
              onClick={() => {
                if (selectedBatchId && selectedBatchId !== 'all') {
                  fetchBatchMarks(selectedBatchId);
                }
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Batch Results</span>
            </button>
          </div>

          {loadingMarks ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading batch test marks...</p>
            </div>
          ) : batchMarks.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No test marks recorded for this batch yet.</p>
              <p className="text-xs text-slate-400">Switch to Particular Student view to start adding marks for individual students.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px]">
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Exam Name</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Marks Obtained</th>
                    <th className="p-3.5">Percentage</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {batchMarks.map((bm) => {
                    const stu = bm.studentId;
                    const pct = bm.percentage || Math.round(((bm.marksObtained / bm.totalMarks) * 100) * 10) / 10;
                    return (
                      <tr key={bm._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center space-x-2">
                            <StudentAvatar
                              photoUrl={stu?.photoUrl}
                              gender={stu?.gender}
                              name={stu?.name}
                              className="w-7 h-7 rounded-full text-xs"
                              iconClassName="w-3.5 h-3.5"
                            />
                            <div>
                              <div>{stu?.name || 'Unknown Student'}</div>
                              <span className="text-[10px] text-slate-400 font-mono">Roll: {stu?.rollNo || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-700">{bm.examName}</td>
                        <td className="p-3.5 font-bold text-indigo-700">{bm.subject}</td>
                        <td className="p-3.5 font-mono font-bold">{bm.marksObtained} / {bm.totalMarks}</td>
                        <td className="p-3.5 font-mono font-extrabold">{pct}%</td>
                        <td className="p-3.5">
                          <span className="bg-slate-900 text-white font-mono text-[11px] font-black px-2 py-0.5 rounded">
                            {bm.grade}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              if (stu?._id) {
                                setSelectedStudentId(stu._id);
                                setViewMode('student');
                              }
                            }}
                            className="text-orange-600 hover:text-orange-700 font-bold text-xs underline"
                          >
                            View Student Card
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT TEST RESULT                                           */}
      {/* ========================================================================= */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-xl w-full relative shadow-2xl space-y-5 my-8">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase">
                <Award className="w-4 h-4" />
                <span>{editingMark ? 'Edit Academic Score' : 'Record New Test Score'}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {editingMark ? 'Update Test Result' : 'Add Test Result for Student'}
              </h2>
              {selectedStudent && (
                <div className="text-xs text-slate-500">
                  Student: <strong className="text-slate-800">{selectedStudent.name}</strong> (Roll: {selectedStudent.rollNo || 'N/A'}) - Std {selectedStudent.standard}th
                </div>
              )}
            </div>

            <form onSubmit={handleSaveTestResult} className="space-y-4">
              {/* Exam Name & Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exam Title / Test Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1, Midterm Exam, Weekly Quiz"
                  value={testForm.examName}
                  onChange={(e) => setTestForm({ ...testForm, examName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_EXAMS.slice(0, 6).map((exam) => (
                    <button
                      type="button"
                      key={exam}
                      onClick={() => setTestForm({ ...testForm, examName: exam })}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 transition"
                    >
                      + {exam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Type & Exam Date (Two Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Exam Type
                  </label>
                  <select
                    value={testForm.examType}
                    onChange={(e) => setTestForm({ ...testForm, examType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={testForm.examDate}
                    onChange={(e) => setTestForm({ ...testForm, examDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Subject & Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Science, English"
                  value={testForm.subject}
                  onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_SUBJECTS.slice(0, 8).map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setTestForm({ ...testForm, subject: sub })}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100 transition"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marks Inputs (Marks Obtained & Total Marks) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    placeholder="e.g. 42"
                    value={testForm.marksObtained}
                    onChange={(e) => setTestForm({ ...testForm, marksObtained: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total / Max Marks *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder="e.g. 50 or 100"
                    value={testForm.totalMarks}
                    onChange={(e) => setTestForm({ ...testForm, totalMarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Real-time Calculation Preview Card */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-700 uppercase">Live Score Preview</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      {liveValid ? `${livePercentage}%` : '-- %'}
                    </span>
                    <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded font-mono">
                      Grade: {liveGrade}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      liveValid && livePercentage >= 35
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {liveValid ? (livePercentage >= 35 ? 'PASSED' : 'NEEDS REVISION') : 'Pending Input'}
                  </span>
                </div>
              </div>

              {/* Teacher Remarks / Feedback & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Teacher Remarks / Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Excellent presentation and problem solving skills..."
                  value={testForm.remarks}
                  onChange={(e) => setTestForm({ ...testForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                />
                <div className="space-y-1 mt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quick feedback suggestions:</span>
                  <div className="flex flex-wrap gap-1">
                    {REMARK_PRESETS.slice(0, 3).map((rem, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setTestForm({ ...testForm, remarks: rem })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md border border-slate-200 text-left"
                      >
                        {rem.substring(0, 35)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {testFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{testFormError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingTest}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/25 transition text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmittingTest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Test Record...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingMark ? 'Save Changes' : 'Confirm & Save Test Score'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE OFFICIAL REPORT CARD / RESULT SLIP                     */}
      {/* ========================================================================= */}
      {showPrintModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-4 text-slate-900 overflow-y-auto">
          {/* Print Isolation Style Tag */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm;
              }
              html, body {
                height: 100% !important;
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-result-card, #printable-result-card * {
                visibility: visible !important;
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
              }
              #printable-result-card {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
                display: block !important;
              }
            }
          `}</style>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-3xl w-full relative shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header controls (Screen only) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase" style={{ color: academyInfo?.primaryColor || '#f97316' }}>
                <Printer className="w-4 h-4" />
                <span>Official Print Preview</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTriggerPrint}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Toggle Print Mode (Screen only) */}
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <button
                onClick={() => setPrintMode('cumulative')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  printMode === 'cumulative' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cumulative Academic Performance Report ({studentMarks.length} Tests)
              </button>
              {singlePrintMark && (
                <button
                  onClick={() => setPrintMode('single')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    printMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Single Test Result Slip ({singlePrintMark.examName} - {singlePrintMark.subject})
                </button>
              )}
            </div>

            {/* PRINTABLE REPORT CARD CONTAINER */}
            <div id="printable-result-card" className="border-2 border-slate-800 p-6 md:p-8 rounded-2xl bg-white text-slate-900 space-y-6">
              {/* Academy Official Header */}
              <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                {academyInfo?.logoUrl && (
                  <img
                    src={academyInfo.logoUrl}
                    alt={academyInfo?.name || 'Academy Logo'}
                    className="h-14 mx-auto object-contain mb-2"
                  />
                )}
                <h1 className="text-2xl font-black uppercase tracking-wide text-slate-950">
                  {academyInfo?.name || 'Academic Institution'}
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  {academyInfo?.tagline || 'Excellence in Education & Competitive Preparation'}
                </p>
                <div className="text-[11px] text-slate-500 font-medium">
                  {academyInfo?.address ? `${academyInfo.address} • ` : ''}
                  Phone: {academyInfo?.phone || academyInfo?.contactNumber || 'N/A'} • Email: {academyInfo?.email || 'N/A'}
                </div>
                <div className="pt-2">
                  <span className="inline-block bg-slate-900 text-white text-xs font-extrabold uppercase px-4 py-1 rounded tracking-widest">
                    {printMode === 'cumulative' ? 'STUDENT ACADEMIC PERFORMANCE CARD' : 'OFFICIAL TEST RESULT SLIP'}
                  </span>
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-300">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Student Name:</span>
                  <span className="font-black text-slate-900 text-sm">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Roll Number:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{selectedStudent.rollNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Standard & Batch:</span>
                  <span className="font-bold text-slate-800">
                    Std {selectedStudent.standard}th - {selectedStudent.classBatchId?.batchName || 'General Batch'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Medium / Stream:</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {selectedStudent.medium || 'English'} ({selectedStudent.stream !== 'none' ? selectedStudent.stream : 'General'})
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Parent Name / Contact:</span>
                  <span className="font-medium text-slate-800">
                    {selectedStudent.parentName} ({selectedStudent.parentPhone})
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Date of Issue:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Scores Breakdown Table */}
              <div>
                <table className="w-full text-left text-xs border border-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px]">
                      <th className="border border-slate-800 p-2.5">Date</th>
                      <th className="border border-slate-800 p-2.5">Exam Name & Type</th>
                      <th className="border border-slate-800 p-2.5">Subject</th>
                      <th className="border border-slate-800 p-2.5 text-center">Marks</th>
                      <th className="border border-slate-800 p-2.5 text-center">Total</th>
                      <th className="border border-slate-800 p-2.5 text-center">Percentage</th>
                      <th className="border border-slate-800 p-2.5 text-center">Grade</th>
                      <th className="border border-slate-800 p-2.5">Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {(printMode === 'single' && singlePrintMark ? [singlePrintMark] : studentMarks).map((mark, i) => {
                      const pct = mark.percentage || Math.round(((mark.marksObtained / mark.totalMarks) * 100) * 10) / 10;
                      return (
                        <tr key={mark._id || i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="border border-slate-300 p-2 font-mono text-[11px] whitespace-nowrap">
                            {mark.examDate ? new Date(mark.examDate).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {mark.examName} <span className="text-[10px] text-slate-500 font-normal">({mark.examType})</span>
                          </td>
                          <td className="border border-slate-300 p-2 font-extrabold">{mark.subject}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono font-black">{mark.marksObtained}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{mark.totalMarks}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono font-black">{pct}%</td>
                          <td className="border border-slate-300 p-2 text-center font-mono font-black">{mark.grade}</td>
                          <td className="border border-slate-300 p-2 text-[11px] italic text-slate-700">{mark.remarks || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cumulative Aggregate Summary Block */}
              {printMode === 'cumulative' && (
                <div className="bg-slate-100 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Total Marks Scored:</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {studentStats.totalObtained} / {studentStats.totalMax}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Overall Percentage:</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {studentStats.averagePercentage}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Final Performance Grade:</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {studentStats.overallGrade}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Result Status:</span>
                    <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded border border-emerald-300">
                      {studentStats.averagePercentage >= 75 ? 'PASSED (DISTINCTION)' : studentStats.averagePercentage >= 35 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                    </span>
                  </div>
                </div>
              )}

              {/* Signatures & Seal Block */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-t border-slate-800 w-44 mx-auto pt-2" />
                  <p className="font-black text-slate-900">Subject Faculty / Class Teacher</p>
                  <p className="text-[10px] text-slate-500">Evaluated & Verified</p>
                </div>

                <div className="space-y-1">
                  <div className="border-t border-slate-800 w-44 mx-auto pt-2" />
                  <p className="font-black text-slate-900">Principal / Academic Director</p>
                  <p className="text-[10px] text-slate-500">Official Seal & Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
