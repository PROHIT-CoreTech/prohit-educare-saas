'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, TrendingUp, Building2, Users, ExternalLink, Lock, CheckCircle, 
  PauseCircle, XCircle, Database, Eye, EyeOff, PlusCircle, Check, AlertCircle, 
  History, Calendar, CreditCard, Receipt, Search, Filter, Layers, Upload, 
  ArrowRight, ArrowLeft, User, FileSpreadsheet, FileUp, CheckCircle2, Download, 
  AlertTriangle, Tag, Edit, Trash2, Sparkles, Percent, DollarSign, Megaphone, Sliders,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { isValidMobile } from '../../../lib/validation';
import { downloadSampleExcelTemplate, parseExcelFile, ValidatedStudentRow } from '../../../lib/excel-import';

export default function PlatformAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@prohiteducare.com');
  const [loginPassword, setLoginPassword] = useState('AdminPassword123!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [academies, setAcademies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'tenants' | 'transactions' | 'overview' | 'plans' | 'coupons'>('tenants');
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowQuickActions(false);
    if (showQuickActions) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showQuickActions]);

  // Dynamic Plans & Coupons state
  const [plans, setPlans] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [bannerSettings, setBannerSettings] = useState<any>({ isEnabled: false, text: '', couponCode: '', badgeText: '' });
  const [bannerForm, setBannerForm] = useState<any>({ isEnabled: false, text: '', couponCode: '', badgeText: '' });
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);

  // Plan editing & modal state
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    priceMonthly: 2999,
    originalPrice: '' as string | number,
    offerBadge: '',
    studentLimit: 'Up to 1,500 Students',
    maxStudents: 1500,
    maxBranches: 6,
    description: '',
    featuresText: '',
    popular: false,
    isActive: true,
    sortOrder: 0,
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Coupon modal state
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: 20,
    minOrderAmount: 0,
    maxDiscountAmount: '' as string | number,
    usageLimit: 500,
    validUntil: '',
    applicablePlans: ['ALL'],
    isActive: true,
    description: '',
  });
  const [savingCoupon, setSavingCoupon] = useState(false);

  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const [selectedTenantRecords, setSelectedTenantRecords] = useState<any>(null);
  const [inspecting, setInspecting] = useState(false);
  const [selectedTenantDetail, setSelectedTenantDetail] = useState<any>(null);

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedBulkAcademyId, setSelectedBulkAcademyId] = useState('');
  const [parsedRows, setParsedRows] = useState<ValidatedStudentRow[]>([]);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [parseError, setParseError] = useState('');
  const [importingStudents, setImportingStudents] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineStep, setOfflineStep] = useState<number>(1);
  const [showOfflinePassword, setShowOfflinePassword] = useState(false);
  const [signatureError, setSignatureError] = useState('');
  const [offlineForm, setOfflineForm] = useState({
    name: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    logoUrl: '',
    directorSignatureUrl: '',
    institutionType: 'High School',
    institutionTypes: ['High School'] as string[],
    educationBoard: 'SSC / State Board',
    educationBoards: ['SSC / State Board'] as string[],
    plan: 'PROFESSIONAL',
    subscriptionStatus: 'ACTIVE',
    paymentMode: 'CASH',
    paymentReference: '',
  });
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('prohit_platform_token');
    if (savedToken) {
      setToken(savedToken);
      fetchAdminData(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await apiClient.post('/platform/auth/login', {
        email: loginEmail,
        pass: loginPassword,
      });
      if (res.data.token) {
        localStorage.setItem('prohit_platform_token', res.data.token);
        setToken(res.data.token);
        fetchAdminData(res.data.token);
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Invalid platform credentials');
    }
  };

  const fetchAdminData = async (authToken: string) => {
    setLoading(true);
    try {
      const [metricsRes, academiesRes, auditRes, plansRes, couponsRes, bannerRes] = await Promise.all([
        apiClient.get('/platform/metrics', { headers: { Authorization: `Bearer ${authToken}` } }),
        apiClient.get('/platform/academies', { headers: { Authorization: `Bearer ${authToken}` } }),
        apiClient.get('/platform/audit-logs', { headers: { Authorization: `Bearer ${authToken}` } }),
        apiClient.get('/platform/plans', { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => ({ data: [] })),
        apiClient.get('/platform/coupons', { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => ({ data: [] })),
        apiClient.get('/platform/banner', { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => ({ data: { isEnabled: false } })),
      ]);
      setMetrics(metricsRes.data);
      setAcademies(academiesRes.data);
      setAuditLogs(auditRes.data);
      if (plansRes?.data) setPlans(plansRes.data);
      if (couponsRes?.data) setCoupons(couponsRes.data);
      if (bannerRes?.data) {
        setBannerSettings(bannerRes.data);
        setBannerForm(bannerRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch platform admin data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('prohit_platform_token');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const res = await apiClient.post('/platform/banner', bannerForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBannerSettings(res.data);
      setBannerSavedSuccess(true);
      setTimeout(() => setBannerSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Error updating banner: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingBanner(false);
    }
  };

  const handleOpenEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name || '',
      slug: plan.slug || '',
      priceMonthly: plan.priceMonthly || 0,
      originalPrice: plan.originalPrice || '',
      offerBadge: plan.offerBadge || '',
      studentLimit: plan.studentLimit || '',
      maxStudents: plan.maxStudents ?? 400,
      maxBranches: plan.maxBranches ?? 2,
      description: plan.description || '',
      featuresText: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      popular: Boolean(plan.popular),
      isActive: plan.isActive !== undefined ? Boolean(plan.isActive) : true,
      sortOrder: plan.sortOrder ?? 0,
    });
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      slug: '',
      priceMonthly: 1999,
      originalPrice: '',
      offerBadge: '',
      studentLimit: 'Up to 500 Students',
      maxStudents: 500,
      maxBranches: 3,
      description: '',
      featuresText: 'Up to 2 Branches\nAtomic FIFO Fee Engine\nStudent Profiles\nBasic Reports',
      popular: false,
      isActive: true,
      sortOrder: plans.length + 1,
    });
    setShowCreatePlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingPlan(true);
    try {
      const features = planForm.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: planForm.name,
        slug: planForm.slug,
        priceMonthly: Number(planForm.priceMonthly),
        originalPrice: planForm.originalPrice !== '' && Number(planForm.originalPrice) > 0 ? Number(planForm.originalPrice) : undefined,
        offerBadge: planForm.offerBadge,
        studentLimit: planForm.studentLimit,
        maxStudents: Number(planForm.maxStudents),
        maxBranches: Number(planForm.maxBranches),
        description: planForm.description,
        features,
        popular: planForm.popular,
        isActive: planForm.isActive,
        sortOrder: Number(planForm.sortOrder),
      };

      if (editingPlan) {
        await apiClient.patch(`/platform/plans/${editingPlan._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingPlan(null);
      } else {
        await apiClient.post('/platform/plans', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShowCreatePlanModal(false);
      }

      const res = await apiClient.get('/platform/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data);
      alert('Plan pricing & settings saved successfully! Changes are immediately live on the landing page.');
    } catch (err: any) {
      alert('Error saving plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;
    try {
      await apiClient.post(`/platform/plans/${planId}/delete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await apiClient.get('/platform/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data);
    } catch (err: any) {
      alert('Error deleting plan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingCoupon(true);
    try {
      const payload = {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount) || 0,
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : undefined,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
        validUntil: couponForm.validUntil ? new Date(couponForm.validUntil) : undefined,
        applicablePlans: couponForm.applicablePlans,
        isActive: couponForm.isActive,
        description: couponForm.description,
      };

      await apiClient.post('/platform/coupons', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateCouponModal(false);
      setCouponForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 0,
        maxDiscountAmount: '',
        usageLimit: 500,
        validUntil: '',
        applicablePlans: ['ALL'],
        isActive: true,
        description: '',
      });

      const res = await apiClient.get('/platform/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
      alert('Coupon created successfully! It is now active for subscriber checkout.');
    } catch (err: any) {
      alert('Error creating coupon: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (coupon: any) => {
    try {
      await apiClient.patch(
        `/platform/coupons/${coupon._id}`,
        { isActive: !coupon.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const res = await apiClient.get('/platform/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
    } catch (err: any) {
      alert('Error updating coupon: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCoupon = async (couponId: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await apiClient.post(`/platform/coupons/${couponId}/delete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await apiClient.get('/platform/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
    } catch (err: any) {
      alert('Error deleting coupon: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleInspectRecords = async (academyId: string) => {
    setInspecting(true);
    try {
      const res = await apiClient.get(`/platform/academies/${academyId}/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTenantRecords(res.data);
    } catch (err: any) {
      alert('Error fetching tenant records: ' + (err.response?.data?.message || err.message));
    } finally {
      setInspecting(false);
    }
  };

  const handleImpersonate = async (academyId: string, slug: string) => {
    try {
      const res = await apiClient.post(
        `/platform/academies/${academyId}/impersonate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.token) {
        localStorage.setItem('prohit_auth_token', res.data.token);
        const targetUrl = window.location.hostname.includes('localhost')
          ? `http://${slug}.localhost:3000/dashboard?token=${res.data.token}`
          : `https://${slug}.educare.prohitcoretech.com/dashboard?token=${res.data.token}`;
        window.open(targetUrl, '_blank');
      }
    } catch (err: any) {
      alert('Impersonation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (academyId: string, newStatus: string) => {
    try {
      await apiClient.patch(
        `/platform/academies/${academyId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchAdminData(token!);
    } catch (err: any) {
      alert('Status update failed');
    }
  };

  const handleExtendTrial = async (academyId: string, days: number = 14) => {
    try {
      let res;
      try {
        res = await apiClient.post(
          `/platform/academies/${academyId}/extend-trial`,
          { days },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (postErr: any) {
        if (postErr.response?.status === 404 || postErr.message?.includes('Cannot POST') || postErr.response?.status === 405) {
          res = await apiClient.patch(
            `/platform/academies/${academyId}/extend-trial`,
            { days },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } else {
          throw postErr;
        }
      }
      alert(res.data.message || 'Trial period extended by 14 days!');
      fetchAdminData(token!);
      if (selectedTenantDetail && selectedTenantDetail._id === academyId) {
        setSelectedTenantDetail({
          ...selectedTenantDetail,
          subscriptionStatus: res.data.academy?.subscriptionStatus || selectedTenantDetail.subscriptionStatus,
          trialEndsAt: res.data.academy?.trialEndsAt || selectedTenantDetail.trialEndsAt,
        });
      }
    } catch (err: any) {
      alert('Failed to extend trial period: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOfflineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offlineForm.phone && !isValidMobile(offlineForm.phone)) {
      setOfflineMessage('Invalid Mobile Number: Contact phone must be a valid 10-digit mobile number starting with 6-9 (e.g. 9876543210) and cannot be a dummy number like 0000000000.');
      return;
    }
    setOfflineSubmitting(true);
    setOfflineMessage('');
    try {
      const res = await apiClient.post('/platform/academies/register-offline', offlineForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOfflineMessage(`Success! ${res.data.message}`);
      fetchAdminData(token!);
      setTimeout(() => {
        setShowOfflineModal(false);
        setOfflineForm({
          name: '',
          slug: '',
          adminName: '',
          adminEmail: '',
          adminPassword: '',
          phone: '',
          logoUrl: '',
          directorSignatureUrl: '',
          institutionType: 'High School',
          institutionTypes: ['High School'],
          educationBoard: 'SSC / State Board',
          educationBoards: ['SSC / State Board'],
          plan: 'PROFESSIONAL',
          subscriptionStatus: 'ACTIVE',
          paymentMode: 'CASH',
          paymentReference: '',
        });
        setOfflineStep(1);
      }, 1500);
    } catch (err: any) {
      setOfflineMessage('Registration failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setOfflineSubmitting(false);
    }
  };

  const handleOpenBulkUploadModal = (academyId?: string) => {
    setSelectedBulkAcademyId(academyId || (academies.length > 0 ? academies[0]._id : ''));
    setParsedRows([]);
    setParseError('');
    setImportResult(null);
    setShowBulkUploadModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingExcel(true);
    setParseError('');
    setImportResult(null);
    try {
      const rows = await parseExcelFile(file);
      setParsedRows(rows);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse Excel file.');
    } finally {
      setParsingExcel(false);
      e.target.value = '';
    }
  };

  const handleExecuteBulkImport = async () => {
    if (!selectedBulkAcademyId) {
      alert('Please select a target Academy Tenant first.');
      return;
    }
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid student rows found in the uploaded file.');
      return;
    }

    setImportingStudents(true);
    setImportResult(null);
    try {
      const payload = validRows.map((r) => ({
        name: r.name,
        parentName: r.parentName,
        parentPhone: r.parentPhone,
        parentEmail: r.parentEmail,
        standard: r.standard,
        medium: r.medium,
        stream: r.stream,
        rollNo: r.rollNo,
        dateOfBirth: r.dateOfBirth,
        bloodGroup: r.bloodGroup,
        address: r.address,
        emergencyPhone: r.emergencyPhone,
        customTotalFee: r.customTotalFee,
      }));

      const res = await apiClient.post(`/platform/academies/${selectedBulkAcademyId}/bulk-import-students`, {
        students: payload,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setImportResult(res.data);
      if (token) fetchAdminData(token);
    } catch (err: any) {
      alert('Bulk import failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setImportingStudents(false);
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredAcademies = academies.filter((ac) => {
    const matchesSearch =
      ac.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      ac.slug.toLowerCase().includes(tenantSearch.toLowerCase());
    const matchesStatus = tenantStatusFilter === 'ALL' || ac.subscriptionStatus === tenantStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    // Exclude non-transactional audit actions like IMPERSONATE_START
    if (log.action === 'IMPERSONATE_START') return false;

    const details = log.details || {};
    const academyName = details.academyName || log.academyId?.name || '';
    const academySlug = details.academySlug || log.academyId?.slug || '';
    const action = log.action || '';
    const query = auditSearch.toLowerCase();
    return (
      academyName.toLowerCase().includes(query) ||
      academySlug.toLowerCase().includes(query) ||
      action.toLowerCase().includes(query)
    );
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900">Master Admin Console</h1>
              <p className="text-xs text-slate-500 font-medium">PROHIT CoreTech Master System Access</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Master Admin Email</label>
              <input
                type="email"
                required
                placeholder="Enter master admin email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Master Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter master password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 pr-10 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4 text-orange-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {loginError && <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">{loginError}</div>}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition"
            >
              Sign In as Master Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20 shrink-0">
              MA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Admin Console</h1>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>System Live</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                PROHIT CoreTech System Control Room &bull; Multi-Tenant Manager &amp; SaaS Pricing Engine
              </p>
            </div>
          </div>

          {/* Action Center - Scalable Dropdown & Primary Tools */}
          <div className="flex items-center space-x-2.5 flex-wrap sm:flex-nowrap">
            {/* Quick Actions Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickActions(!showQuickActions);
                }}
                className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-600" />
                <span>Quick Actions</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
              </button>

              {showQuickActions && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Console Utilities &amp; Management Tools
                  </div>

                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setOfflineStep(1);
                      setShowOfflineModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 font-bold flex items-center space-x-2.5 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Register Offline Academy</p>
                      <span className="text-[10px] text-slate-500 font-normal">Guided 4-step onboarding wizard</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      handleOpenBulkUploadModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-orange-50 text-slate-800 hover:text-orange-700 font-bold flex items-center space-x-2.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-orange-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Bulk Student Excel Import</p>
                      <span className="text-[10px] text-slate-500 font-normal">Upload roster spreadsheet directly</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      if (token) fetchAdminData(token);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 font-bold flex items-center space-x-2.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-600 shrink-0 ${loading ? 'animate-spin' : ''}`} />
                    <div>
                      <p className="font-bold text-slate-900">Refresh All System Data</p>
                      <span className="text-[10px] text-slate-500 font-normal">Sync metrics, plans, coupons &amp; logs</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Primary CTA */}
            <button
              onClick={() => {
                setOfflineStep(1);
                setShowOfflineModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Academy</span>
            </button>

            {/* Direct Refresh Button */}
            <button
              onClick={() => {
                if (token) fetchAdminData(token);
              }}
              title="Refresh All Data"
              disabled={loading}
              className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-bold p-2.5 rounded-xl border border-slate-200 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem('prohit_platform_token');
                setToken(null);
              }}
              className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3.5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Monthly Recurring Revenue</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹{metrics.mrr?.toLocaleString('en-IN')}</p>
              <span className="text-xs text-emerald-700 font-bold mt-1 block">Active Subscriptions</span>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Academies</span>
                <Building2 className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2 font-mono">{metrics.totalAcademies}</p>
              <span className="text-xs text-slate-500 font-medium mt-1 block">{metrics.activeAcademies} Active | {metrics.trialAcademies} Trial</span>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total System Students</span>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2 font-mono">{metrics.totalStudents}</p>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Across all tenants</span>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Master Access Level</span>
                <Database className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-xl font-black text-emerald-700 mt-2">Full Cross-Tenant Inspector</p>
              <span className="text-xs text-slate-500 font-medium mt-1 block">Global Data Control Active</span>
            </div>
          </div>
        )}

        {/* Master Admin Interactive Tabs Navigation Bar */}
        <div className="bg-white border border-slate-200 p-2 sm:p-2.5 rounded-3xl shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Horizontal Segmented Navigation Track */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-0.5 max-w-full scrollbar-none">
              {[
                { id: 'tenants' as const, label: 'Academy Tenants', icon: Building2, count: academies.length },
                { id: 'transactions' as const, label: 'Transaction History', icon: History, count: filteredAuditLogs.length },
                { id: 'plans' as const, label: 'Plans & Pricing', icon: Sliders, count: plans.length },
                { id: 'coupons' as const, label: 'Coupons & Promo Offers', icon: Tag, count: coupons.length },
                { id: 'overview' as const, label: 'Financial Overview', icon: Layers, count: null },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-black transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contextual Action per Active Tab */}
            <div className="flex items-center space-x-2 shrink-0 justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
              {activeTab === 'tenants' && (
                <button
                  onClick={() => handleOpenBulkUploadModal()}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-2 rounded-xl border border-emerald-200 transition shadow-2xs inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bulk Excel Import</span>
                </button>
              )}

              {activeTab === 'plans' && (
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanForm({
                      name: '',
                      slug: '',
                      priceMonthly: 1999,
                      originalPrice: 2499,
                      offerBadge: 'Special Offer',
                      studentLimit: 'Up to 500 Students',
                      maxStudents: 500,
                      maxBranches: 2,
                      description: '',
                      featuresText: 'FIFO Fee Engine\nMulti-Branch Support\nCanvas Fee Receipts',
                      popular: false,
                      isActive: true,
                      sortOrder: plans.length + 1,
                    });
                    setShowCreatePlanModal(true);
                  }}
                  className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold px-3.5 py-2 rounded-xl border border-orange-200 transition shadow-2xs inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
                  <span>Add Custom Plan</span>
                </button>
              )}

              {activeTab === 'coupons' && (
                <button
                  onClick={() => setShowCreateCouponModal(true)}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-2 rounded-xl border border-emerald-200 transition shadow-2xs inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Create Coupon</span>
                </button>
              )}

              {activeTab === 'overview' && (
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  MRR: ₹{metrics?.mrr?.toLocaleString('en-IN') || 0}/mo
                </span>
              )}

              {activeTab === 'transactions' && (
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  Audit Logs: {filteredAuditLogs.length} Events
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: ACADEMY TENANTS ROSTER */}
        {activeTab === 'tenants' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search academy or slug..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600 font-bold uppercase">Status:</span>
                {['ALL', 'ACTIVE', 'TRIAL', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTenantStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      tenantStatusFilter === st
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Academy Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Subdomain</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Master Admin Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAcademies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No academy tenants found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAcademies.map((ac) => {
                      return (
                        <tr key={ac._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                            <div className="text-sm">{ac.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 font-normal">ID: {ac._id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-xl text-xs font-mono font-bold inline-flex items-center space-x-1">
                              <span>{ac.slug}.educare.prohitcoretech.com</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                ac.subscriptionStatus === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ac.subscriptionStatus === 'TRIAL'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {ac.subscriptionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => setSelectedTenantDetail(ac)}
                                className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Show Details</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTION HISTORY */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search transactions by tenant name or action..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-mono font-bold border border-slate-200">
                Showing {filteredAuditLogs.length} Transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Date & Time</th>
                    <th className="p-4 whitespace-nowrap">Academy / Subdomain</th>
                    <th className="p-4 whitespace-nowrap">Action Event</th>
                    <th className="p-4 whitespace-nowrap">Subscription Start</th>
                    <th className="p-4 whitespace-nowrap">Subscription Expiry</th>
                    <th className="p-4 whitespace-nowrap">Payment Mode & Ref</th>
                    <th className="p-4 whitespace-nowrap">Plan & Amount</th>
                    <th className="p-4 whitespace-nowrap">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        No subscription transaction logs found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const details = log.details || {};
                      const academyName = details.academyName || log.academyId?.name || 'Platform System';
                      const academySlug = details.academySlug || log.academyId?.slug || 'admin';
                      const paymentMode = details.paymentMode || (log.action === 'OFFLINE_TENANT_REGISTERED' ? 'OFFLINE_CASH' : 'CASHFREE_PG');

                      const isTrial =
                        details.paymentMode === '14_DAY_FREE_TRIAL' ||
                        details.paymentMode === 'OFFLINE_TRIAL' ||
                        details.paymentMode === 'FREE_TRIAL' ||
                        details.plan === '14-Day Free Trial' ||
                        details.plan === '14-Day Trial' ||
                        details.plan === 'TRIAL' ||
                        details.plan === 'TRIAL_14' ||
                        details.amount === 0 ||
                        log.action === '14-DAY FREE TRIAL STARTED' ||
                        log.action === 'TRIAL_EXTENDED_14_DAYS' ||
                        log.academyId?.subscriptionStatus === 'TRIAL';

                      const displayAmount = isTrial || details.amount === 0
                        ? 'N/A'
                        : details.amount !== undefined && details.amount !== null && Number(details.amount) > 0
                        ? `₹${Number(details.amount).toLocaleString('en-IN')} / mo`
                        : details.plan === 'STARTER'
                        ? '₹999 / mo'
                        : '₹2,999 / mo';

                      const subStart = formatDate(details.subscriptionStart || log.academyId?.createdAt || log.createdAt);
                      const subExpiry = formatDate(
                        isTrial
                          ? log.academyId?.trialEndsAt ||
                            (details.subscriptionExpiry && new Date(details.subscriptionExpiry).getTime() - new Date(log.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
                              ? details.subscriptionExpiry
                              : new Date(new Date(log.createdAt).setDate(new Date(log.createdAt).getDate() + 14)))
                          : details.subscriptionExpiry ||
                            log.academyId?.subscriptionEndsAt ||
                            new Date(new Date(log.createdAt).setMonth(new Date(log.createdAt).getMonth() + 1))
                      );

                      return (
                        <tr key={log._id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono text-slate-700 whitespace-nowrap font-medium">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                            <div>{academyName}</div>
                            <span className="text-orange-600 font-mono text-[10px] font-bold">{academySlug}.educare.prohitcoretech.com</span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                                log.action === 'OFFLINE_TENANT_REGISTERED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.action === 'IMPERSONATE_START'
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : log.action === 'TRIAL_EXTENDED_14_DAYS'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {log.action === 'OFFLINE_TENANT_REGISTERED'
                                ? 'Offline Provisioning'
                                : log.action === 'IMPERSONATE_START'
                                ? 'Admin Impersonation'
                                : log.action === 'TRIAL_EXTENDED_14_DAYS'
                                ? 'Trial +14 Days Extended'
                                : log.action}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono text-slate-700 whitespace-nowrap font-semibold">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-orange-500" />
                              <span>{subStart}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-mono text-emerald-700 font-bold whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{subExpiry}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-800 whitespace-nowrap font-semibold">
                            <div className="flex items-center space-x-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                              <span>{paymentMode}</span>
                            </div>
                            {details.paymentReference && (
                              <span className="text-[10px] text-slate-500 block font-normal">Ref: {details.paymentReference}</span>
                            )}
                          </td>
                          <td className={`p-4 font-black whitespace-nowrap ${isTrial || details.amount === 0 ? 'text-slate-500 font-sans text-xs' : 'text-emerald-700 font-mono'}`}>
                            {log.action === 'OFFLINE_TENANT_REGISTERED' || log.action?.includes('Provision') || log.action?.includes('TRIAL') ? displayAmount : 'N/A'}
                          </td>
                          <td className="p-4 text-slate-600 whitespace-nowrap font-medium">
                            {log.platformUserId?.name || 'Master Admin'} ({log.platformUserId?.email || 'admin@prohiteducare.com'})
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">System Financial Breakdown & Tier Revenue</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Monthly recurring subscription tiers active across all academy tenants</p>
              </div>

              <button
                onClick={() => setActiveTab('plans')}
                className="inline-flex items-center space-x-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-3.5 py-2 rounded-xl border border-orange-200 transition shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Modify Tier Prices & Offers</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <div
                    key={plan._id || plan.slug}
                    className={`p-6 rounded-2xl border transition relative ${
                      plan.popular
                        ? 'bg-orange-50/50 border-orange-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${plan.popular ? 'text-orange-600' : 'text-slate-500'}`}>
                        {plan.name} (₹{plan.priceMonthly.toLocaleString('en-IN')}/mo)
                      </span>
                      {plan.offerBadge && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {plan.offerBadge}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline space-x-2">
                      <p className="text-3xl font-black text-slate-900 font-mono">
                        ₹{plan.priceMonthly.toLocaleString('en-IN')} <span className="text-base font-semibold text-slate-500">/ mo</span>
                      </p>
                      {plan.originalPrice && plan.originalPrice > plan.priceMonthly && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ₹{plan.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">
                      {plan.studentLimit || (plan.maxStudents > 0 ? `Up to ${plan.maxStudents} Students` : 'Unlimited Students')}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter Tier (₹999/mo)</span>
                    <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹999 / mo</p>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">Up to 400 Students per tenant</span>
                  </div>

                  <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Professional Tier (₹2,999/mo)</span>
                    <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹2,999 / mo</p>
                    <span className="text-xs text-orange-700 font-bold mt-1 block">Most Popular (Up to 1,500 Students)</span>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise Tier (₹7,999/mo)</span>
                    <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹7,999 / mo</p>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">Unlimited Multi-Branch Chains & Students</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Platform Health & Scalability Architecture</h3>
              <ul className="text-xs text-slate-700 space-y-2 font-medium">
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Multi-Tenant Request-Scoped Isolation (TenantContextService)</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Monthly Subscription Lifecycle & Auto-Renew Management</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Dynamic Price Control & Coupon Discount Engine Live Sync</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Atomic FIFO Fee Engine with Remainder Absorption</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Cashfree Payments HMAC-SHA256 Webhook Verification</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: PLANS & PRICING MANAGER (LIVE TO LANDING PAGE) */}
        {activeTab === 'plans' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Real-Time Pricing & Tier Catalog</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Plans & Dynamic Pricing Manager</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Update monthly rates, set strikethrough regular prices for offers, customize promo badges, and control student quotas. All changes sync immediately to the landing page and checkout.
                </p>
              </div>

              <button
                onClick={handleOpenCreatePlan}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-2 text-xs shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Custom Tier</span>
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isPopular = plan.popular;
                const hasDiscount = plan.originalPrice && plan.originalPrice > plan.priceMonthly;

                return (
                  <div
                    key={plan._id || plan.slug}
                    className={`rounded-3xl p-6 border flex flex-col justify-between space-y-5 transition relative shadow-sm ${
                      isPopular
                        ? 'border-2 border-orange-500 bg-orange-50/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 right-6 bg-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {plan.slug}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            plan.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {plan.isActive ? 'Active on Web' : 'Hidden'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                          {plan.description || 'Standard monthly SaaS tier'}
                        </p>
                      </div>

                      {/* Pricing Display */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Monthly Rate</span>
                          {hasDiscount && (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              {plan.offerBadge || 'Special Offer'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-black text-slate-900 font-mono">
                            ₹{plan.priceMonthly.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ month</span>
                        </div>

                        {hasDiscount && (
                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-mono">
                            <span>Regular:</span>
                            <span className="line-through">₹{plan.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="text-emerald-700 font-bold font-sans">
                              (Save ₹{(plan.originalPrice - plan.priceMonthly).toLocaleString('en-IN')})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity & Quotas */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Student Limit</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">
                            {plan.maxStudents > 0 ? `${plan.maxStudents} Students` : 'Unlimited'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Branch Limit</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">
                            {plan.maxBranches > 0 ? `Up to ${plan.maxBranches} Branches` : 'Unlimited'}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Included Features ({plan.features?.length || 0})
                        </span>
                        <ul className="text-xs text-slate-700 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {plan.features?.map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight font-medium">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center space-x-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Tier &amp; Offers</span>
                      </button>

                      {plan.slug !== 'STARTER' && plan.slug !== 'PROFESSIONAL' && plan.slug !== 'ENTERPRISE' && (
                        <button
                          onClick={() => handleDeletePlan(plan._id, plan.name)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-2.5 rounded-xl transition cursor-pointer"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS & PROMO OFFERS */}
        {activeTab === 'coupons' && (
          <div className="space-y-8">
            {/* 1. Promotional Announcement Banner Manager */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
                    <Megaphone className="w-4 h-4 text-orange-500" />
                    <span>Global Landing Page Banner</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Promotional Announcement Banner</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Display an interactive flash discount notification across the header of the landing page and pricing page.
                  </p>
                </div>

                {bannerSavedSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Banner Published to Landing Page!</span>
                  </div>
                )}
              </div>

              {/* Banner Live Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Live Banner Preview (As seen by website visitors):
                </span>
                {bannerForm.isEnabled ? (
                  <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-3 px-4 rounded-2xl text-xs shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>{bannerForm.badgeText || 'SPECIAL OFFER'}</span>
                      </span>
                      <span className="font-semibold text-white/95">{bannerForm.text || 'Flash Offer Announcement Text'}</span>
                    </div>

                    {bannerForm.couponCode && (
                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="bg-white text-slate-900 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 font-mono text-[11px] font-black">
                          <Tag className="w-3 h-3 text-orange-600" />
                          <span>{bannerForm.couponCode}</span>
                        </div>
                        <span className="text-[10px] bg-black/30 px-2 py-1 rounded-lg font-bold">Copy Code</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-100 border border-dashed border-slate-300 rounded-2xl p-4 text-center text-xs text-slate-500 font-medium">
                    Banner is currently disabled. Toggle &quot;Enable Banner&quot; below to display on the landing page.
                  </div>
                )}
              </div>

              {/* Banner Edit Form */}
              <form onSubmit={handleSaveBanner} className="space-y-4 pt-2">
                <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <input
                    type="checkbox"
                    id="bannerEnabled"
                    checked={bannerForm.isEnabled}
                    onChange={(e) => setBannerForm({ ...bannerForm, isEnabled: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="bannerEnabled" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                    Enable Promotional Announcement Banner on Landing &amp; Pricing Pages
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Banner Message Text *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Special Launch Offer: Get 20% OFF on all monthly subscriptions!"
                      value={bannerForm.text}
                      onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Promo Badge Label</label>
                    <input
                      type="text"
                      placeholder="e.g. LIMITED OFFER or 30% OFF"
                      value={bannerForm.badgeText}
                      onChange={(e) => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Highlighted Coupon Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME20"
                      value={bannerForm.couponCode}
                      onChange={(e) => setBannerForm({ ...bannerForm, couponCode: e.target.value.toUpperCase().trim() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={savingBanner}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition text-xs cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <span>{savingBanner ? 'Publishing...' : 'Save & Publish Banner'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* 2. Coupons Management Table & Creation */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
                    <Tag className="w-4 h-4 text-orange-500" />
                    <span>Discounts &amp; Promotional Codes</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Discount Coupons Management</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Generate and manage promotional coupons for subscriber onboarding, monthly renewals, and special sales campaigns.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateCouponModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 text-xs shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
              </div>

              {/* Coupons List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 whitespace-nowrap">Coupon Code</th>
                      <th className="p-3.5 whitespace-nowrap">Discount Value</th>
                      <th className="p-3.5 whitespace-nowrap">Min Order Value</th>
                      <th className="p-3.5 whitespace-nowrap">Applicable Plans</th>
                      <th className="p-3.5 whitespace-nowrap">Times Used</th>
                      <th className="p-3.5 whitespace-nowrap">Valid Until</th>
                      <th className="p-3.5 whitespace-nowrap">Status</th>
                      <th className="p-3.5 whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          No coupons created yet. Click &quot;Create New Coupon&quot; to generate promotional discount codes.
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => (
                        <tr key={coupon._id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                            <span className="bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-1 rounded-lg">
                              {coupon.code}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap font-bold text-emerald-700 text-sm">
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} FLAT OFF`}
                          </td>
                          <td className="p-3.5 whitespace-nowrap font-mono">
                            {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'No minimum'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap font-semibold">
                            {Array.isArray(coupon.applicablePlans) && coupon.applicablePlans.includes('ALL')
                              ? 'All Monthly Plans'
                              : coupon.applicablePlans?.join(', ')}
                          </td>
                          <td className="p-3.5 whitespace-nowrap font-mono font-medium">
                            {coupon.timesUsed || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'uses'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-slate-500">
                            {coupon.validUntil ? formatDate(coupon.validUntil) : 'No Expiry'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                coupon.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {coupon.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-right space-x-2">
                            <button
                              onClick={() => handleToggleCoupon(coupon)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition cursor-pointer ${
                                coupon.isActive
                                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {coupon.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded transition cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PLAN EDIT / CREATE MODAL */}
      {(editingPlan || showCreatePlanModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowCreatePlanModal(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
                <Sliders className="w-4 h-4 text-orange-500" />
                <span>{editingPlan ? 'Edit Monthly Tier & Offer' : 'Create Custom Monthly Plan'}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {editingPlan ? `Edit ${editingPlan.name}` : 'New Subscription Plan'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Updates will automatically reflect on the landing page, pricing page, and tenant subscription panel.
              </p>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Plan Slug / Identifier *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingPlan)}
                    value={planForm.slug}
                    onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value.toUpperCase().trim() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold uppercase disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Monthly Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planForm.priceMonthly}
                    onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Original Price (Strikethrough) (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 3999 (to show discount)"
                    value={planForm.originalPrice}
                    onChange={(e) => setPlanForm({ ...planForm, originalPrice: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Offer Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Save 25% or Diwali Offer"
                    value={planForm.offerBadge}
                    onChange={(e) => setPlanForm({ ...planForm, offerBadge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Student Quota Limit (-1 for Unlimited)</label>
                  <input
                    type="number"
                    value={planForm.maxStudents}
                    onChange={(e) => setPlanForm({ ...planForm, maxStudents: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Student Limit Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 1,500 Students"
                    value={planForm.studentLimit}
                    onChange={(e) => setPlanForm({ ...planForm, studentLimit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Max Total Branches</label>
                  <input
                    type="number"
                    min={1}
                    value={planForm.maxBranches}
                    onChange={(e) => setPlanForm({ ...planForm, maxBranches: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Plan Description</label>
                <input
                  type="text"
                  placeholder="Short description of who this plan is best suited for"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Features List (One feature per line)
                </label>
                <textarea
                  rows={4}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none"
                  placeholder="Atomic FIFO Fee Engine&#10;Up to 6 Branches&#10;Digital ID Cards"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Mark as Most Popular</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Active on Website</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setShowCreatePlanModal(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingPlan}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition text-xs cursor-pointer"
                >
                  {savingPlan ? 'Saving Changes...' : 'Save Plan & Update Landing Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateCouponModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Coupon Generator</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Create Promotional Coupon</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Subscribers can enter this coupon code at checkout to receive an instant discount on their monthly subscription.
              </p>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20 or DIWALI50"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().trim() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-black uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FLAT">Flat (₹ INR) Off</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    {couponForm.discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0 for no minimum"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Max Cap (₹, for % type)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional cap amount"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 500"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Coupon Description / Note</label>
                <input
                  type="text"
                  placeholder="e.g. 20% discount on monthly subscription"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCouponModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition text-xs cursor-pointer"
                >
                  {savingCoupon ? 'Creating...' : 'Create & Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Admin Offline Academy Registration Modal - 4-Step Guided Onboarding Wizard */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-2xl space-y-5">
            <button
              onClick={() => {
                setShowOfflineModal(false);
                setOfflineStep(1);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold mb-1 uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Master Admin Onboarding Wizard</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Register Offline Academy Tenant</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Guided step-wise onboarding for offline academy provisioning & subscription setup.
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOfflineStep(1)}
                  className={`p-2 rounded-xl flex flex-col items-center space-y-1 transition cursor-pointer ${
                    offlineStep === 1
                      ? 'bg-orange-500 text-white shadow-xs'
                      : offlineStep > 1
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{offlineStep > 1 ? '✓' : '1'}</span>
                  </div>
                  <span className="truncate text-[10px]">1. Academy</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (offlineForm.name.trim() && offlineForm.slug.trim()) setOfflineStep(2);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center space-y-1 transition cursor-pointer ${
                    offlineStep === 2
                      ? 'bg-orange-500 text-white shadow-xs'
                      : offlineStep > 2
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{offlineStep > 2 ? '✓' : '2'}</span>
                  </div>
                  <span className="truncate text-[10px]">2. Programs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (offlineForm.name.trim() && offlineForm.slug.trim()) setOfflineStep(3);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center space-y-1 transition cursor-pointer ${
                    offlineStep === 3
                      ? 'bg-orange-500 text-white shadow-xs'
                      : offlineStep > 3
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{offlineStep > 3 ? '✓' : '3'}</span>
                  </div>
                  <span className="truncate text-[10px]">3. Director</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (offlineForm.name.trim() && offlineForm.slug.trim() && offlineForm.adminName.trim() && offlineForm.adminEmail.trim()) {
                      setOfflineStep(4);
                    }
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center space-y-1 transition cursor-pointer ${
                    offlineStep === 4
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>4</span>
                  </div>
                  <span className="truncate text-[10px]">4. Payment</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleOfflineRegister} className="space-y-4 text-xs">
              {/* STEP 1: ACADEMY IDENTITY & SUBDOMAIN */}
              {offlineStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Step 1 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-900">Academy Identity & Subdomain URL</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Academy Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Excellence Academy"
                        value={offlineForm.name}
                        onChange={(e) => setOfflineForm({ ...offlineForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Subdomain Slug *</label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. excellence"
                          value={offlineForm.slug}
                          onChange={(e) =>
                            setOfflineForm({
                              ...offlineForm,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                            })
                          }
                          className="w-full bg-transparent text-slate-900 focus:outline-none font-bold"
                        />
                        <span className="text-slate-500 font-mono text-[11px]">.educare.prohitcoretech.com</span>
                      </div>
                    </div>
                  </div>

                  {/* Logo URL & File Upload */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Academy Logo (Optional)</span>
                      <span className="text-[10px] text-slate-400 font-normal">PNG / JPG / Data URL</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Paste Logo URL (e.g. https://...)"
                          value={offlineForm.logoUrl}
                          onChange={(e) => setOfflineForm({ ...offlineForm, logoUrl: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                        />
                        <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition flex items-center space-x-1 shrink-0">
                          <Upload className="w-3.5 h-3.5 text-orange-500" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setOfflineForm({ ...offlineForm, logoUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {offlineForm.logoUrl && (
                        <div className="flex items-center space-x-3 p-2.5 bg-orange-50/60 border border-orange-200 rounded-xl">
                          <img
                            src={offlineForm.logoUrl}
                            alt="Academy Logo Preview"
                            className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white"
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                          <div className="text-xs">
                            <span className="font-bold text-orange-800 block">Academy Logo Attached</span>
                            <span className="text-[10px] text-slate-500 font-mono">Will be rendered on student receipts & dashboard header</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!offlineForm.name.trim() || !offlineForm.slug.trim()}
                      onClick={() => setOfflineStep(2)}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Next Step: Academic Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMIC LEVELS & EDUCATION BOARDS */}
              {offlineStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Step 2 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-900">Academic Levels & Education Boards Offered</h3>
                  </div>

                  {/* Multi-Select Academic Levels Offered */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Academic Levels Offered * (Select All That Apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      {[
                        'Kindergarten / Pre-Primary',
                        'Primary School',
                        'Mid Primary',
                        'High School',
                        'Jr. College (Science)',
                        'Jr. College (Commerce)',
                        'Jr. College (Arts)',
                        'Under Graduate (UG)',
                        'Other / Coaching',
                      ].map((level) => {
                        const isChecked = offlineForm.institutionTypes?.includes(level);
                        return (
                          <label
                            key={level}
                            className={`flex items-center space-x-1.5 p-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated = [...(offlineForm.institutionTypes || [])];
                                if (e.target.checked) {
                                  if (!updated.includes(level)) updated.push(level);
                                } else {
                                  updated = updated.filter((item) => item !== level);
                                }
                                if (updated.length === 0) updated = ['High School'];
                                setOfflineForm({
                                  ...offlineForm,
                                  institutionTypes: updated,
                                  institutionType: updated[0],
                                });
                              }}
                              className="hidden"
                            />
                            <span className="w-3 h-3 rounded border border-current flex items-center justify-center text-[9px]">
                              {isChecked ? '✓' : ''}
                            </span>
                            <span className="truncate">{level}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Select Education Boards Offered */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Education Boards Offered * (Select All That Apply)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      {[
                        'SSC / State Board',
                        'CBSE',
                        'ICSE / ICSC',
                        'IB / International',
                        'HSC State Board',
                        'University Board',
                        'Other / N/A',
                      ].map((board) => {
                        const isChecked = offlineForm.educationBoards?.includes(board);
                        return (
                          <label
                            key={board}
                            className={`flex items-center space-x-1.5 p-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                              isChecked
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated = [...(offlineForm.educationBoards || [])];
                                if (e.target.checked) {
                                  if (!updated.includes(board)) updated.push(board);
                                } else {
                                  updated = updated.filter((item) => item !== board);
                                }
                                if (updated.length === 0) updated = ['SSC / State Board'];
                                setOfflineForm({
                                  ...offlineForm,
                                  educationBoards: updated,
                                  educationBoard: updated[0],
                                });
                              }}
                              className="hidden"
                            />
                            <span className="w-3 h-3 rounded border border-current flex items-center justify-center text-[9px]">
                              {isChecked ? '✓' : ''}
                            </span>
                            <span className="truncate">{board}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setOfflineStep(1)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOfflineStep(3)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Next Step: Director Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DIRECTOR & SYSTEM ADMIN ACCOUNT */}
              {offlineStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Step 3 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-900">Director & Admin Account Credentials</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Director Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name of director"
                        value={offlineForm.adminName}
                        onChange={(e) => setOfflineForm({ ...offlineForm, adminName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Director Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter director email address"
                        value={offlineForm.adminEmail}
                        onChange={(e) => setOfflineForm({ ...offlineForm, adminEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Default Password</label>
                      <div className="relative">
                        <input
                          type={showOfflinePassword ? 'text' : 'password'}
                          placeholder="Enter default password"
                          value={offlineForm.adminPassword}
                          onChange={(e) => setOfflineForm({ ...offlineForm, adminPassword: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 pr-10 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOfflinePassword(!showOfflinePassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition"
                        >
                          {showOfflinePassword ? <EyeOff className="w-4 h-4 text-orange-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="Enter phone number"
                        value={offlineForm.phone}
                        onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Director Digital Signature Upload (PNG Format Only) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-700 uppercase">
                        Director Digital Signature <span className="text-slate-400 font-semibold text-[11px] normal-case">(Optional)</span> <span className="text-orange-600 font-extrabold text-[11px] normal-case">(PNG Format Only)</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium">Transparent PNG optional — used on printed ID cards</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Paste PNG Signature URL (e.g. https://.../signature.png)"
                          value={offlineForm.directorSignatureUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !val.startsWith('data:image/') && !val.toLowerCase().endsWith('.png') && !val.toLowerCase().includes('.png?')) {
                              setSignatureError('Note: Digital signature requires a PNG format image with transparency.');
                            } else {
                              setSignatureError('');
                            }
                            setOfflineForm({ ...offlineForm, directorSignatureUrl: val });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 text-xs font-medium"
                        />
                        <label className="shrink-0 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition flex items-center space-x-1">
                          <Upload className="w-3.5 h-3.5 text-orange-600" />
                          <span>Upload PNG</span>
                          <input
                            type="file"
                            accept="image/png,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
                                  alert('Invalid file format! Digital signature must be in PNG format (.png) only.');
                                  e.target.value = '';
                                  return;
                                }
                                setSignatureError('');
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setOfflineForm({ ...offlineForm, directorSignatureUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Signature Live Preview */}
                      <div className="flex items-center justify-center border border-slate-200 rounded-xl p-2 bg-slate-900/90 text-white min-h-[44px]">
                        {offlineForm.directorSignatureUrl ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={offlineForm.directorSignatureUrl}
                              alt="Director Signature"
                              className="max-h-8 max-w-[110px] object-contain invert brightness-200 filter"
                              onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded shrink-0">PNG Verified ✓</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium italic">No PNG signature attached</span>
                        )}
                      </div>
                    </div>
                    {signatureError && (
                      <p className="text-[11px] text-amber-600 font-bold">
                        ⚠️ {signatureError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setOfflineStep(2)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={!offlineForm.adminName.trim() || !offlineForm.adminEmail.trim()}
                      onClick={() => setOfflineStep(4)}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Next Step: Billing & Settlement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBSCRIPTION PLAN & OFFLINE PAYMENT SETTLEMENT */}
              {offlineStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Step 4 of 4</span>
                    <h3 className="text-base font-extrabold text-slate-900">Subscription Tier & Offline Payment Settlement</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Subscription Plan</label>
                      <select
                        value={offlineForm.plan}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isTrial = val === 'TRIAL_14';
                          setOfflineForm({
                            ...offlineForm,
                            plan: val,
                            subscriptionStatus: isTrial ? 'TRIAL' : 'ACTIVE',
                            paymentMode: isTrial ? 'OFFLINE_TRIAL' : offlineForm.paymentMode === 'OFFLINE_TRIAL' ? 'CASH' : offlineForm.paymentMode,
                            paymentReference: isTrial ? '14-Day Free Trial Activated' : offlineForm.paymentReference === '14-Day Free Trial Activated' ? '' : offlineForm.paymentReference,
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-semibold"
                      >
                        <option value="TRIAL_14">🎁 14-Day Free Trial (₹0)</option>
                        <option value="STARTER">Starter (₹999/mo)</option>
                        <option value="PROFESSIONAL">Professional (₹2,999/mo)</option>
                        <option value="ENTERPRISE">Enterprise (₹7,999/mo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Initial Status</label>
                      <select
                        value={offlineForm.subscriptionStatus}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOfflineForm({
                            ...offlineForm,
                            subscriptionStatus: val,
                            plan: val === 'TRIAL' ? 'TRIAL_14' : offlineForm.plan === 'TRIAL_14' ? 'PROFESSIONAL' : offlineForm.plan,
                            paymentMode: val === 'TRIAL' ? 'OFFLINE_TRIAL' : offlineForm.paymentMode === 'OFFLINE_TRIAL' ? 'CASH' : offlineForm.paymentMode,
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-semibold"
                      >
                        <option value="TRIAL">TRIAL (14 Days Free)</option>
                        <option value="ACTIVE">ACTIVE (Paid Tenant)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Offline Settlement Mode</label>
                      <select
                        value={offlineForm.paymentMode}
                        onChange={(e) => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-semibold"
                      >
                        <option value="OFFLINE_TRIAL">🎁 14-Day Free Trial</option>
                        <option value="CASH">Cash Payment</option>
                        <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                        <option value="CHEQUE">Cheque Payment</option>
                        <option value="CONTRACT">Annual Contract</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Payment Receipt Ref / Notes</label>
                    <input
                      type="text"
                      placeholder="Enter payment receipt reference or transaction notes"
                      value={offlineForm.paymentReference}
                      onChange={(e) => setOfflineForm({ ...offlineForm, paymentReference: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  {/* Pre-submission Summary Preview Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-sans text-xs">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block">Provisioning Summary</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                      <div><span className="text-slate-400">Academy:</span> <span className="font-bold text-slate-900">{offlineForm.name || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Subdomain:</span> <span className="font-mono font-bold text-orange-700">{offlineForm.slug || 'slug'}.educare</span></div>
                      <div><span className="text-slate-400">Director:</span> <span className="font-bold text-slate-900">{offlineForm.adminName}</span></div>
                      <div><span className="text-slate-400">Plan & Status:</span> <span className="font-bold text-emerald-700">{offlineForm.plan === 'TRIAL_14' || offlineForm.subscriptionStatus === 'TRIAL' ? '🎁 14-Day Free Trial (TRIAL)' : `${offlineForm.plan} (${offlineForm.subscriptionStatus})`}</span></div>
                    </div>
                  </div>

                  {offlineMessage && (
                    <div
                      className={`text-xs p-3 rounded-xl font-bold ${
                        offlineMessage.startsWith('Success')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {offlineMessage}
                    </div>
                  )}

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setOfflineStep(3)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={offlineSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition text-sm cursor-pointer"
                    >
                      {offlineSubmitting ? 'Provisioning Academy...' : 'Provision & Activate Academy 🚀'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Master Admin Cross-Tenant Records Inspector Modal */}
      {selectedTenantRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedTenantRecords(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Master Record Inspector: {selectedTenantRecords.academy?.name}
              </h2>
              <p className="text-xs text-orange-600 font-mono font-bold">
                {selectedTenantRecords.academy?.slug}.educare.prohitcoretech.com (Tenant ID: {selectedTenantRecords.academy?._id})
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase">Total Students</span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">{selectedTenantRecords.summary?.totalStudents}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase">Total Staff Users</span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">{selectedTenantRecords.summary?.totalStaff}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase">Total Collected</span>
                <p className="text-2xl font-black text-emerald-700 font-mono mt-1">₹{selectedTenantRecords.summary?.totalCollected?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase">Pending Fees</span>
                <p className="text-2xl font-black text-orange-600 font-mono mt-1">₹{selectedTenantRecords.summary?.pendingBalance?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2">Enrolled Student Records ({selectedTenantRecords.students?.length})</h3>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-48 overflow-y-auto text-xs space-y-2">
                {selectedTenantRecords.students?.map((s: any) => (
                  <div key={s._id} className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="font-bold text-slate-900">{s.name} ({s.studentCode})</span>
                    <span className="text-slate-600 font-medium">Parent: {s.parentName} ({s.parentPhone})</span>
                    <span className="text-orange-600 font-bold font-mono">Advance: ₹{s.advanceBalance || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2">Recorded Payment Ledger ({selectedTenantRecords.payments?.length})</h3>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-48 overflow-y-auto text-xs space-y-2">
                {selectedTenantRecords.payments?.map((p: any) => (
                  <div key={p._id} className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="font-mono text-orange-600 font-bold">{p.receiptNumber}</span>
                    <span className="text-emerald-700 font-black font-mono">₹{p.totalAmountPaid} ({p.paymentMode})</span>
                    <span className="text-slate-500 font-medium">{new Date(p.paymentDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* BULK STUDENT EXCEL UPLOAD MODAL */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-4xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBulkUploadModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Bulk Student Excel Upload</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Import multiple student records and auto-generate fee schedules for a selected Academy Tenant using Excel (.xlsx, .xls, .csv).
                </p>
              </div>
            </div>

            {/* Target Academy Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Target Academy Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBulkAcademyId}
                  onChange={(e) => setSelectedBulkAcademyId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                >
                  <option value="">-- Choose Target Academy --</option>
                  {academies.map((ac) => (
                    <option key={ac._id} value={ac._id}>
                      {ac.name} ({ac.slug}) — {ac.institutionType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={downloadSampleExcelTemplate}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Sample (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 text-center bg-slate-50/50 transition">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                id="excel-file-input"
                className="hidden"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <FileUp className="w-10 h-10 text-emerald-600 animate-bounce" />
                <span className="font-extrabold text-sm text-slate-800">
                  {parsingExcel ? 'Parsing Excel File...' : 'Click to Upload Excel Sheet (.xlsx / .csv)'}
                </span>
                <span className="text-xs text-slate-500">Supports standard SheetJS columns: Student Name, Parent Name, Parent Phone, Standard...</span>
              </label>
            </div>

            {parseError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-4 rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {importResult && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 font-black text-sm text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{importResult.message}</span>
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="pt-2 text-rose-700 space-y-1">
                    <span className="font-bold block">Row Errors ({importResult.errors.length}):</span>
                    <ul className="list-disc pl-5 space-y-0.5 max-h-32 overflow-y-auto">
                      {importResult.errors.map((errStr: string, idx: number) => (
                        <li key={idx}>{errStr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Parsed Rows Validation Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800">
                    Preview & Validation ({parsedRows.filter((r) => r.isValid).length} Valid / {parsedRows.filter((r) => !r.isValid).length} Errors out of {parsedRows.length} total)
                  </span>

                  <button
                    onClick={handleExecuteBulkImport}
                    disabled={importingStudents || parsedRows.filter((r) => r.isValid).length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center space-x-2"
                  >
                    {importingStudents ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Importing Students...</span>
                      </>
                    ) : (
                      <span>Execute Import ({parsedRows.filter((r) => r.isValid).length} Valid Records)</span>
                    )}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-2.5">Row #</th>
                        <th className="p-2.5">Student Name</th>
                        <th className="p-2.5">Parent Name</th>
                        <th className="p-2.5">Parent Phone</th>
                        <th className="p-2.5">Std</th>
                        <th className="p-2.5">Medium</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className={r.isValid ? 'bg-emerald-50/40' : 'bg-rose-50/50'}>
                          <td className="p-2.5 font-bold">{r.rowNum}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{r.name || '—'}</td>
                          <td className="p-2.5 text-slate-700">{r.parentName || '—'}</td>
                          <td className="p-2.5 font-mono">{r.parentPhone || '—'}</td>
                          <td className="p-2.5 font-bold">Std {r.standard}</td>
                          <td className="p-2.5 uppercase text-[10px] font-bold">{r.medium}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            {r.isValid ? (
                              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Valid ✓</span>
                            ) : (
                              <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">{r.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Particular Tenant Full Details Modal */}
      {selectedTenantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTenantDetail(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-start space-x-3 border-b border-slate-200 pb-4 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-xl shrink-0">
                {selectedTenantDetail.name?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-slate-900">{selectedTenantDetail.name}</h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      selectedTenantDetail.subscriptionStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedTenantDetail.subscriptionStatus === 'TRIAL'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedTenantDetail.subscriptionStatus}
                  </span>
                </div>
                <p className="text-xs text-orange-600 font-mono font-bold mt-1 flex items-center space-x-1">
                  <span>{selectedTenantDetail.slug}.educare.prohitcoretech.com</span>
                  <span className="text-slate-400 font-normal ml-2">ID: {selectedTenantDetail._id}</span>
                </p>
              </div>
            </div>

            {/* Grid 1: Academic Particulars (Type & Board) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>Academic Particulars (Type & Board)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                {/* Institution Types */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Institution Types</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const types: string[] = selectedTenantDetail.institutionTypes?.length
                        ? selectedTenantDetail.institutionTypes
                        : [selectedTenantDetail.institutionType || 'High School'];
                      return types.map((t) => (
                        <span
                          key={t}
                          className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold"
                        >
                          {t}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                {/* Education Boards */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Education Boards</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const boards: string[] = selectedTenantDetail.educationBoards?.length
                        ? selectedTenantDetail.educationBoards
                        : [selectedTenantDetail.educationBoard || 'SSC / State Board'];
                      return boards.map((b) => (
                        <span
                          key={b}
                          className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold"
                        >
                          {b}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Director & Contact Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                <User className="w-4 h-4 text-orange-500" />
                <span>Director & Contact Particulars</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Director Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedTenantDetail.directorName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-bold text-slate-800">{selectedTenantDetail.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTenantDetail.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Grid 3: Subscription Status & Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Subscription Status & Timeline</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Subscription Status</span>
                  <span className="font-extrabold text-slate-900">{selectedTenantDetail.subscriptionStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Date</span>
                  <span className="font-mono font-bold text-slate-800">{formatDate(selectedTenantDetail.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {selectedTenantDetail.subscriptionStatus === 'TRIAL' ? 'Trial Expiry Date' : 'Subscription Expiry'}
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono font-bold text-emerald-700">
                      {formatDate(selectedTenantDetail.subscriptionStatus === 'TRIAL' ? selectedTenantDetail.trialEndsAt : selectedTenantDetail.subscriptionEndsAt)}
                    </span>
                    <button
                      onClick={() => handleExtendTrial(selectedTenantDetail._id, 14)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition cursor-pointer"
                      title="Add +14 Days Trial Extension"
                    >
                      +14 Days
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 4: Master Admin Tools */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <span>Master Admin Control Actions</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExtendTrial(selectedTenantDetail._id, 14)}
                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
                  title="Extend trial period by 14 days"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Extend Trial (+14 Days)</span>
                </button>

                {selectedTenantDetail.subscriptionStatus === 'ACTIVE' ? (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedTenantDetail._id, 'CANCELLED');
                      setSelectedTenantDetail({ ...selectedTenantDetail, subscriptionStatus: 'CANCELLED' });
                    }}
                    className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl border border-rose-200 transition font-bold"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedTenantDetail._id, 'ACTIVE');
                      setSelectedTenantDetail({ ...selectedTenantDetail, subscriptionStatus: 'ACTIVE' });
                    }}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-200 transition font-bold"
                  >
                    Activate Subscription
                  </button>
                )}

                <button
                  onClick={() => {
                    handleOpenBulkUploadModal(selectedTenantDetail._id);
                    setSelectedTenantDetail(null);
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 transition shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Bulk Import Students</span>
                </button>

                <button
                  onClick={() => {
                    handleInspectRecords(selectedTenantDetail._id);
                    setSelectedTenantDetail(null);
                  }}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2.5 rounded-xl border border-indigo-200 inline-flex items-center space-x-1.5 transition"
                >
                  <Database className="w-4 h-4" />
                  <span>Inspect System Records</span>
                </button>

                <button
                  onClick={() => handleImpersonate(selectedTenantDetail._id, selectedTenantDetail.slug)}
                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 shadow-md shadow-orange-500/20 transition"
                >
                  <span>Impersonate Tenant</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
