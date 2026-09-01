'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Settings, ShieldCheck, CreditCard, UserCheck, Plus, Sparkles, CheckCircle2, AlertCircle, Building2, Search, Edit3, Trash2, BookOpen, Layers, Check, Upload, Image as ImageIcon, User, Phone, Mail, MapPin, Palette } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'fee-structure' | 'faculty' | 'subscription'>('profile');
  
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [renewingPlan, setRenewingPlan] = useState<string | null>(null);
  const [renewalError, setRenewalError] = useState('');

  const [academyInfo, setAcademyInfo] = useState<any>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    directorName: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    primaryColor: '#f97316',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeForm, setFeeForm] = useState({
    standard: 10,
    medium: 'english',
    stream: 'science',
    name: 'Annual Tuition Fee',
    totalAmount: 35000,
    installmentsCount: 1,
  });

  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    qualification: '',
    assignedStandards: [] as string[],
    status: 'ACTIVE',
  });

  const [selectedFeeCategory, setSelectedFeeCategory] = useState<string>('all');

  const availableStandardOptions = [
    '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th',
    '10th Eng', '10th Mar', '11th Sci', '11th Com', '11th Arts',
    '12th Sci', '12th Com', '12th Arts', '13th', '14th', '15th',
  ];

  const feeCategories = useMemo(() => {
    return [
      {
        id: 'primary',
        title: 'Primary School',
        subtitle: 'Standards 1st through 5th (Foundational Education)',
        badge: '1st - 5th',
        gradient: 'from-amber-500 to-orange-500',
        badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
        items: feeStructures.filter((f) => f.standard >= 1 && f.standard <= 5),
      },
      {
        id: 'middle',
        title: 'Middle School',
        subtitle: 'Standards 6th through 8th (Secondary Prep)',
        badge: '6th - 8th',
        gradient: 'from-blue-500 to-cyan-500',
        badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200',
        items: feeStructures.filter((f) => f.standard >= 6 && f.standard <= 8),
      },
      {
        id: 'secondary',
        title: 'High School / Board Batches',
        subtitle: 'Standards 9th & 10th (SSC / State Board Prep)',
        badge: '9th - 10th',
        gradient: 'from-emerald-500 to-teal-500',
        badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        items: feeStructures.filter((f) => f.standard >= 9 && f.standard <= 10),
      },
      {
        id: 'higher_secondary',
        title: 'Junior College (11th - 12th)',
        subtitle: 'Higher Secondary Streams (Science, Commerce & Arts)',
        badge: '11th - 12th',
        gradient: 'from-purple-500 to-indigo-500',
        badgeStyle: 'bg-purple-50 text-purple-800 border-purple-200',
        items: feeStructures.filter((f) => f.standard >= 11 && f.standard <= 12),
      },
      {
        id: 'degree',
        title: 'Undergraduate & Degree',
        subtitle: 'Standards 13th through 15th (FY / SY / TY Degree & Diploma)',
        badge: '13th - 15th',
        gradient: 'from-rose-500 to-pink-500',
        badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200',
        items: feeStructures.filter((f) => f.standard >= 13 && f.standard <= 15),
      },
    ];
  }, [feeStructures]);

  useEffect(() => {
    fetchAcademy();
    fetchSubscription();
    fetchFeeStructures();
    fetchFaculty();
  }, []);

  const fetchAcademy = async () => {
    try {
      const res = await apiClient.get('/academies/my-academy');
      setAcademyInfo(res.data);
      setProfileForm({
        name: res.data.name || '',
        directorName: res.data.directorName || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        address: res.data.address || '',
        logoUrl: res.data.logoUrl || '',
        primaryColor: res.data.primaryColor || '#f97316',
      });
    } catch (e) {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    try {
      await apiClient.patch('/academies/my-academy', profileForm);
      setProfileSuccess('Academy Profile updated successfully!');
      setShowEditProfileModal(false);
      setTimeout(() => setProfileSuccess(''), 4000);
      fetchAcademy();
    } catch (err: any) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await apiClient.get('/billing/my-subscription');
      setSubscription(res.data);
    } catch (e) {
    } finally {
      setLoadingSub(false);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const res = await apiClient.get('/fee-engine/structures');
      setFeeStructures(res.data);
    } catch (e) {}
  };

  const fetchFaculty = async () => {
    try {
      const res = await apiClient.get('/faculty');
      setFacultyList(res.data);
    } catch (e) {}
  };

  const handleOpenNewFeeModal = () => {
    setEditingFeeId(null);
    setFeeForm({
      standard: 10,
      medium: 'english',
      stream: 'science',
      name: 'Annual Tuition Fee',
      totalAmount: 35000,
      installmentsCount: 1,
    });
    setShowFeeModal(true);
  };

  const handleOpenEditFeeModal = (fs: any) => {
    setEditingFeeId(fs._id);
    setFeeForm({
      standard: fs.standard || 10,
      medium: fs.medium || 'english',
      stream: fs.stream || 'science',
      name: fs.name || 'Annual Tuition Fee',
      totalAmount: fs.totalAmount || 35000,
      installmentsCount: fs.installmentsCount || 1,
    });
    setShowFeeModal(true);
  };

  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeeId) {
        await apiClient.put(`/fee-engine/structures/${editingFeeId}`, feeForm);
      } else {
        await apiClient.post('/fee-engine/structures', feeForm);
      }
      setShowFeeModal(false);
      fetchFeeStructures();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const handleDeleteFeeStructure = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await apiClient.delete(`/fee-engine/structures/${id}`);
      fetchFeeStructures();
    } catch (err: any) {
      alert('Failed to delete fee structure');
    }
  };

  const handleOpenNewFacultyModal = () => {
    setEditingFacultyId(null);
    setFacultyForm({
      name: '',
      phone: '',
      email: '',
      subject: '',
      qualification: '',
      assignedStandards: [],
      status: 'ACTIVE',
    });
    setShowFacultyModal(true);
  };

  const handleOpenEditFacultyModal = (f: any) => {
    setEditingFacultyId(f._id);
    setFacultyForm({
      name: f.name || '',
      phone: f.phone || '',
      email: f.email || '',
      subject: f.subject || '',
      qualification: f.qualification || '',
      assignedStandards: (f.assignedStandards || []).map((s: any) => String(s)),
      status: f.status || 'ACTIVE',
    });
    setShowFacultyModal(true);
  };

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFacultyId) {
        await apiClient.put(`/faculty/${editingFacultyId}`, facultyForm);
      } else {
        await apiClient.post('/faculty', facultyForm);
      }
      setShowFacultyModal(false);
      fetchFaculty();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save faculty profile');
    }
  };

  const handleToggleFacultyStatus = async (f: any) => {
    const nextStatus = f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.put(`/faculty/${f._id}`, { status: nextStatus });
      fetchFaculty();
    } catch (err: any) {
      alert('Failed to update faculty status');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to remove this faculty profile?')) return;
    try {
      await apiClient.delete(`/faculty/${id}`);
      fetchFaculty();
    } catch (err: any) {
      alert('Failed to delete faculty profile');
    }
  };

  const handleRenewSubscription = async (planKey: string, amount: number) => {
    setRenewingPlan(planKey);
    setRenewalError('');

    try {
      const res = await apiClient.post('/billing/renew-subscription', { plan: planKey });
      const { paymentSessionId, orderId } = res.data;

      const windowRef = window as any;
      if (windowRef.Cashfree) {
        const cashfree = windowRef.Cashfree({ mode: 'sandbox' });
        cashfree.checkout({
          paymentSessionId,
          returnUrl: `${window.location.origin}/${params.slug}/settings`,
        });
      } else {
        await apiClient.post('/billing/verify-renewal', { orderId, plan: planKey });
        alert(`Successfully upgraded to ${planKey} Plan!`);
        fetchSubscription();
      }
    } catch (err: any) {
      setRenewalError(err.response?.data?.message || 'Failed to initiate Cashfree payment');
    } finally {
      setRenewingPlan(null);
    }
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.subject.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.phone.includes(facultySearch)
  );

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-orange-500" />
            <span>Academy Administration & Settings</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage your academy profile, standard fee structures (Std 1st – 15th), faculty directory, and subscription
          </p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'profile'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Academy Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('fee-structure')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'fee-structure'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Standard Fee Structures (Std 1st - 15th)</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'faculty'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faculty Directory ({facultyList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'subscription'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Subscription & Billing</span>
        </button>
      </div>

      {profileSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-4 rounded-2xl flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* TAB 0: ACADEMY PROFILE WITH EDIT OPTION */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center space-x-4">
                {academyInfo?.logoUrl ? (
                  <img
                    src={academyInfo.logoUrl}
                    alt="Academy Logo"
                    className="w-16 h-16 object-contain rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl text-white font-black text-2xl flex items-center justify-center shadow-md uppercase"
                    style={{ backgroundColor: academyInfo?.primaryColor || '#f97316' }}
                  >
                    {academyInfo?.name?.charAt(0) || params.slug.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-slate-900">{academyInfo?.name || `${params.slug} Academy`}</h2>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                      {academyInfo?.subscriptionStatus || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-orange-600 font-mono font-semibold mt-0.5">
                    {params.slug}.educare.prohitcoretech.com
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEditProfileModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-2 self-start sm:self-auto"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Academy Name</span>
                <span className="text-base font-extrabold text-slate-900">{academyInfo?.name || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Director / Owner Name</span>
                <span className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>{academyInfo?.directorName || 'Director'}</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                <span className="text-base font-bold text-slate-900 font-mono flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>{academyInfo?.phone || 'Not Provided'}</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contact Email</span>
                <span className="text-base font-bold text-slate-900 flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span>{academyInfo?.email || `admin@${params.slug}.com`}</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Academy Address / City</span>
                <span className="text-base font-bold text-slate-900 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{academyInfo?.address || 'Maharashtra, India'}</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Brand Color</span>
                <div className="flex items-center space-x-2">
                  <span
                    className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                    style={{ backgroundColor: academyInfo?.primaryColor || '#f97316' }}
                  />
                  <span className="text-sm font-bold font-mono text-slate-900 uppercase">
                    {academyInfo?.primaryColor || '#f97316'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACADEMY PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-orange-600 font-bold text-xs uppercase mb-1">
                <Edit3 className="w-4 h-4" />
                <span>Profile Settings</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Edit Academy Profile</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Update your official academy name, director details, contact phone/email, address, logo, and brand theme.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Academy Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Director / Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.directorName}
                    onChange={(e) => setProfileForm({ ...profileForm, directorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Academy Address / Location</label>
                <input
                  type="text"
                  placeholder="Enter academy campus address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Logo Upload / URL */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Academy Official Logo</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG / JPG / Data URL</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Logo Image URL (e.g. https://...)"
                      value={profileForm.logoUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                    />
                    <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition flex items-center space-x-1 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_SIZE = 400;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                  }
                                } else {
                                  if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  setProfileForm({ ...profileForm, logoUrl: canvas.toDataURL('image/png', 0.85) });
                                } else {
                                  setProfileForm({ ...profileForm, logoUrl: event.target?.result as string });
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {profileForm.logoUrl && (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50/50 border border-orange-200 rounded-xl">
                      <img
                        src={profileForm.logoUrl}
                        alt="Logo Preview"
                        className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-0.5"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <div className="text-xs">
                        <span className="font-bold text-orange-800 block">Logo Attached</span>
                        <span className="text-[10px] text-slate-500 font-mono">Will be rendered on student receipts & portal header</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Color Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Primary Brand Accent Color</label>
                <div className="flex items-center space-x-3">
                  {['#f97316', '#4f46e5', '#059669', '#d97706', '#dc2626'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, primaryColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        profileForm.primaryColor === color ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={profileForm.primaryColor}
                    onChange={(e) => setProfileForm({ ...profileForm, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: STANDARD-WISE FEE STRUCTURES */}
      {activeTab === 'fee-structure' && (
        <div className="space-y-8">
          {/* Header & Main CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <span>Standard Fee Structures</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Base annual tuition fee catalog organized by academic tiers (Std 1st through 15th)
              </p>
            </div>
            <button
              onClick={handleOpenNewFeeModal}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Fee Structure</span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs text-xs">
            <button
              onClick={() => setSelectedFeeCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition ${
                selectedFeeCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Tiers ({feeStructures.length})
            </button>

            {feeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFeeCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  selectedFeeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{cat.title.split(' ')[0]}</span>
                <span className="bg-slate-200/80 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-md font-mono">
                  {cat.items.length}
                </span>
              </button>
            ))}
          </div>

          {/* Categorized Fee Groups */}
          <div className="space-y-8">
            {feeCategories
              .filter((cat) => selectedFeeCategory === 'all' || selectedFeeCategory === cat.id)
              .map((category) => (
                <div key={category.id} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.gradient} shadow-xs`} />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                          <span>{category.title}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${category.badgeStyle}`}>
                            {category.badge}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">{category.subtitle}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {category.items.length} {category.items.length === 1 ? 'Structure' : 'Structures'}
                    </span>
                  </div>

                  {/* Category Cards Grid */}
                  {category.items.length === 0 ? (
                    <div className="bg-slate-50/60 border border-dashed border-slate-200 p-6 rounded-2xl text-center space-y-2">
                      <p className="text-xs font-semibold text-slate-500">
                        No fee structures configured for {category.title}.
                      </p>
                      <button
                        onClick={handleOpenNewFeeModal}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
                      >
                        + Configure structure for this tier
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {category.items.map((fs) => {
                        const stream = fs.stream?.toLowerCase();
                        const medium = fs.medium?.toLowerCase();

                        const streamBadgeClass =
                          stream === 'science'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : stream === 'commerce'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : stream === 'arts'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200';

                        return (
                          <div
                            key={fs._id}
                            className="bg-white border border-slate-200 hover:border-orange-300 p-6 rounded-3xl shadow-sm hover:shadow-md transition space-y-4 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="bg-orange-50 text-orange-700 text-xs font-black px-3 py-1 rounded-xl border border-orange-200 font-mono">
                                  Std {fs.standard}th
                                </span>

                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${streamBadgeClass}`}>
                                  {fs.standard <= 10
                                    ? medium === 'semi_english'
                                      ? 'Semi-English'
                                      : medium === 'marathi'
                                      ? 'Marathi'
                                      : medium === 'hindi'
                                      ? 'Hindi'
                                      : 'English'
                                    : fs.stream !== 'none'
                                    ? fs.stream
                                    : 'General'}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => handleOpenEditFeeModal(fs)}
                                  className="text-slate-400 hover:text-orange-600 p-1.5 rounded-lg transition hover:bg-orange-50"
                                  title="Edit Fee Structure"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFeeStructure(fs._id)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition hover:bg-rose-50"
                                  title="Delete Fee Structure"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{fs.name}</h4>
                              <div className="text-3xl font-black text-slate-900 mt-1 font-mono tracking-tight">
                                ₹{fs.totalAmount?.toLocaleString('en-IN')}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Installment Rule:</span>
                              <span className="font-extrabold text-orange-600 bg-orange-50/60 px-2.5 py-0.5 rounded-md border border-orange-100">
                                {fs.installmentsCount > 1
                                  ? `${fs.installmentsCount} Term Installments`
                                  : 'Full Payment (Lump Sum)'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY DIRECTORY */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search faculty by name, subject, or phone..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium shadow-sm"
              />
            </div>

            <button
              onClick={handleOpenNewFacultyModal}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Profile</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Faculty Name</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Contact Phone & Email</th>
                  <th className="p-4">Qualification</th>
                  <th className="p-4">Assigned Standards</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      No faculty members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-slate-900">{f.name}</td>
                      <td className="p-4">
                        <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-orange-200">
                          {f.subject}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleFacultyStatus(f)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                            f.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle status"
                        >
                          {f.status || 'ACTIVE'}
                        </button>
                      </td>
                      <td className="p-4 font-mono text-slate-800">
                        <div>{f.phone}</div>
                        <span className="text-[10px] text-slate-500 block font-sans">{f.email || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{f.qualification || 'M.Sc / B.Ed'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {f.assignedStandards && f.assignedStandards.length > 0 ? (
                            f.assignedStandards.map((std: string) => (
                              <span key={std} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-slate-200">
                                {std.includes('Std') ? std : `Std ${std}`}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">All Standards</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditFacultyModal(f)}
                            className="text-slate-400 hover:text-orange-600 p-1.5 rounded-lg transition"
                            title="Edit Faculty Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaculty(f._id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                            title="Delete Faculty Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION & BILLING */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    subscription?.subscriptionStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  Status: {subscription?.subscriptionStatus || 'TRIAL'}
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">Tenant License</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{subscription?.name || params.slug} Academy</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Trial/License Expiry Date:{' '}
                <span className="font-mono text-emerald-700 font-bold">
                  {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('en-IN') : 'Active'}
                </span>
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
              <div className="text-2xl font-black text-orange-600 font-mono">{subscription?.daysRemaining || 14} Days</div>
              <span className="text-[11px] text-slate-600 font-bold">Subscription Remaining</span>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Starter Plan</h3>
              <div className="text-3xl font-black text-slate-900 font-mono">
                ₹11,988 <span className="text-xs text-slate-500 font-normal">/ year</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Up to 250 Active Students</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Standards 1st to 15th Supported</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Fee Engine & Receipts</span>
                </li>
              </ul>
              <button
                onClick={() => handleRenewSubscription('STARTER', 11988)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200"
              >
                Renew Starter (₹11,988)
              </button>
            </div>

            {/* Professional */}
            <div className="bg-orange-50/40 border-2 border-orange-500 p-6 rounded-3xl space-y-4 relative shadow-md">
              <span className="absolute -top-3 right-6 bg-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                POPULAR
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Professional Plan</h3>
              <div className="text-3xl font-black text-slate-900 font-mono">
                ₹35,988 <span className="text-xs text-slate-500 font-normal">/ year</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Up to 1,000 Active Students</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Standards 1st to 15th & Streams</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Faculty & Exam Grading System</span>
                </li>
              </ul>
              <button
                onClick={() => handleRenewSubscription('PROFESSIONAL', 35988)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-orange-500/20"
              >
                Renew Professional (₹35,988)
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Enterprise Plan</h3>
              <div className="text-3xl font-black text-slate-900 font-mono">
                ₹95,988 <span className="text-xs text-slate-500 font-normal">/ year</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Unlimited Students & Multi-Branch</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Custom Domain & Branding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Dedicated Account Manager</span>
                </li>
              </ul>
              <button
                onClick={() => handleRenewSubscription('ENTERPRISE', 95988)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200"
              >
                Renew Enterprise (₹95,988)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FEE STRUCTURE MODAL */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowFeeModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h2 className="text-xl font-black text-slate-900">
              {editingFeeId ? 'Edit Standard Fee Structure' : 'Configure Standard Fee Structure'}
            </h2>

            <form onSubmit={handleSaveFeeStructure} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Standard (1 - 15)</label>
                <select
                  value={feeForm.standard}
                  onChange={(e) => {
                    const std = Number(e.target.value);
                    setFeeForm({
                      ...feeForm,
                      standard: std,
                      medium: std >= 11 ? 'english' : feeForm.medium,
                      stream: std >= 11 ? 'science' : 'none',
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((std) => (
                    <option key={std} value={std}>
                      Standard {std}th {std >= 13 ? '(College/Degree)' : std >= 11 ? '(Higher Secondary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Medium / Stream Field */}
              {feeForm.standard <= 10 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medium of Instruction (Std 1st - 10th)</label>
                  <select
                    value={feeForm.medium}
                    onChange={(e) => setFeeForm({ ...feeForm, medium: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="marathi">Marathi Medium</option>
                    <option value="semi_english">Semi-English Medium</option>
                    <option value="english">English Medium</option>
                    <option value="hindi">Hindi Medium</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stream / Section (Std 11th - 15th)</label>
                  <select
                    value={feeForm.stream}
                    onChange={(e) => setFeeForm({ ...feeForm, stream: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="science">Science Stream</option>
                    <option value="commerce">Commerce Stream</option>
                    <option value="arts">Arts Stream</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Structure Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter fee structure name"
                  value={feeForm.name}
                  onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Base Fee Amount (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={feeForm.totalAmount}
                    onChange={(e) => setFeeForm({ ...feeForm, totalAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Installments Count</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={feeForm.installmentsCount}
                    onChange={(e) => setFeeForm({ ...feeForm, installmentsCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm"
              >
                {editingFeeId ? 'Update Fee Structure' : 'Save Fee Structure'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FACULTY MODAL */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowFacultyModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h2 className="text-xl font-black text-slate-900">
              {editingFacultyId ? 'Edit Faculty Profile' : 'Add Faculty Profile'}
            </h2>

            <form onSubmit={handleSaveFaculty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Faculty Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name of faculty"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter phone number"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter subject specialization"
                    value={facultyForm.subject}
                    onChange={(e) => setFacultyForm({ ...facultyForm, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Faculty Status</label>
                  <select
                    value={facultyForm.status}
                    onChange={(e) => setFacultyForm({ ...facultyForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="Enter qualification"
                  value={facultyForm.qualification}
                  onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-medium"
                />
              </div>

              {/* Multi-Select Assigned Standards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Assigned Standards (Multi-Select)
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto">
                  {availableStandardOptions.map((std) => {
                    const isSelected = facultyForm.assignedStandards.includes(std);
                    return (
                      <button
                        key={std}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFacultyForm({
                              ...facultyForm,
                              assignedStandards: facultyForm.assignedStandards.filter((s) => s !== std),
                            });
                          } else {
                            setFacultyForm({
                              ...facultyForm,
                              assignedStandards: [...facultyForm.assignedStandards, std],
                            });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border transition ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        {isSelected ? `✓ Std ${std}` : `+ Std ${std}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm"
              >
                {editingFacultyId ? 'Update Faculty Profile' : 'Save Faculty Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
