'use client';

import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, CreditCard, UserCheck, Plus, Sparkles, CheckCircle2, AlertCircle, Building2, Search, Edit3, Trash2, BookOpen, Layers, Check } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'subscription' | 'fee-structure' | 'faculty'>('fee-structure');
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [renewingPlan, setRenewingPlan] = useState<string | null>(null);
  const [renewalError, setRenewalError] = useState('');

  // Fee Structure state
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    standard: 10,
    name: 'Annual Tuition Fee',
    totalAmount: 35000,
    installmentsCount: 3,
  });

  // Faculty state
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    qualification: '',
    assignedStandards: [] as number[],
  });

  useEffect(() => {
    fetchSubscription();
    fetchFeeStructures();
    fetchFaculty();
  }, []);

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

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/fee-engine/structures', feeForm);
      setShowFeeModal(false);
      fetchFeeStructures();
      setFeeForm({
        standard: 10,
        name: 'Annual Tuition Fee',
        totalAmount: 35000,
        installmentsCount: 3,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/faculty', facultyForm);
      setShowFacultyModal(false);
      fetchFaculty();
      setFacultyForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        qualification: '',
        assignedStandards: [],
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save faculty profile');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Academy Administration & Settings</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage your subscription license, standard-wise fee structures (Std 1st – 15th), and faculty directory
          </p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fee-structure')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'fee-structure'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Standard Fee Structures (Std 1st - 15th)</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'faculty'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faculty Directory ({facultyList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeTab === 'subscription'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Subscription & Billing</span>
        </button>
      </div>

      {/* TAB 1: STANDARD-WISE FEE STRUCTURES */}
      {activeTab === 'fee-structure' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Standard Fee Structures</h2>
              <p className="text-xs text-slate-400">Configure base total fees and default installment counts for Standards 1st through 15th</p>
            </div>
            <button
              onClick={() => setShowFeeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Fee Structure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feeStructures.length === 0 ? (
              <div className="col-span-3 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 text-sm">
                No standard fee structures configured yet. Click &quot;Configure Fee Structure&quot; to set up base tuition fees for Std 1st - 15th.
              </div>
            ) : (
              feeStructures.map((fs) => (
                <div key={fs._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-xl border border-indigo-500/20">
                      Standard {fs.standard}th
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{fs.installmentsCount} Installments</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{fs.name}</h3>
                    <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                      ₹{fs.totalAmount?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-1 text-xs text-slate-400 font-mono">
                    {fs.installmentBreakdown?.map((inst: any) => (
                      <div key={inst.installmentNo} className="flex justify-between">
                        <span>Installment {inst.installmentNo}:</span>
                        <span className="text-white font-semibold">₹{inst.amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY DIRECTORY */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search faculty by name, subject, or phone..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setShowFacultyModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Profile</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Faculty Name</th>
                  <th className="p-4">Subject Specialization</th>
                  <th className="p-4">Contact Phone & Email</th>
                  <th className="p-4">Qualification</th>
                  <th className="p-4">Assigned Standards</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No faculty members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{f.name}</td>
                      <td className="p-4">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full text-[11px] font-bold border border-indigo-500/20">
                          {f.subject}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        <div>{f.phone}</div>
                        <span className="text-[10px] text-slate-500 block">{f.email || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-slate-300">{f.qualification || 'M.Sc / B.Ed'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {f.assignedStandards?.map((std: number) => (
                            <span key={std} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                              Std {std}
                            </span>
                          )) || <span className="text-slate-500 text-[10px]">All Standards</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteFaculty(f._id)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition"
                          title="Delete Faculty Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    subscription?.subscriptionStatus === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  Status: {subscription?.subscriptionStatus || 'TRIAL'}
                </span>
                <span className="text-xs text-slate-400 font-mono">Tenant License</span>
              </div>
              <h2 className="text-2xl font-black text-white">{subscription?.name || params.slug} Academy</h2>
              <p className="text-xs text-slate-400 mt-1">
                Trial/License Expiry Date:{' '}
                <span className="font-mono text-emerald-400">
                  {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('en-IN') : 'Active'}
                </span>
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-2xl font-black text-indigo-400 font-mono">{subscription?.daysRemaining || 14} Days</div>
              <span className="text-[11px] text-slate-400 font-medium">Subscription Remaining</span>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white">Starter Plan</h3>
              <div className="text-3xl font-black text-white font-mono">
                ₹11,988 <span className="text-xs text-slate-400 font-normal">/ year</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Up to 250 Active Students</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Standards 1st to 15th Supported</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Fee Engine & Receipts</span>
                </li>
              </ul>
              <button
                onClick={() => handleRenewSubscription('STARTER', 11988)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Renew Starter (₹11,988)
              </button>
            </div>

            {/* Professional */}
            <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900 border-2 border-indigo-500 p-6 rounded-3xl space-y-4 relative">
              <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                POPULAR
              </span>
              <h3 className="text-lg font-bold text-white">Professional Plan</h3>
              <div className="text-3xl font-black text-white font-mono">
                ₹35,988 <span className="text-xs text-slate-400 font-normal">/ year</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Up to 1,000 Active Students</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Standards 1st to 15th & Streams</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Faculty & Exam Grading System</span>
                </li>
              </ul>
              <button
                onClick={() => handleRenewSubscription('PROFESSIONAL', 35988)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
              >
                Renew Professional (₹35,988)
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white">Enterprise Plan</h3>
              <div className="text-3xl font-black text-white font-mono">
                ₹95,988 <span className="text-xs text-slate-400 font-normal">/ year</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited Students & Multi-Branch</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Custom Domain & Branding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Dedicated Account Manager</span>
                </li>
              </ul>
              <button
                onClick={() => handleRenewSubscription('ENTERPRISE', 95988)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Renew Enterprise (₹95,988)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FEE STRUCTURE MODAL */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4">
            <button onClick={() => setShowFeeModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              ✕
            </button>
            <h2 className="text-xl font-bold text-white">Configure Standard Fee Structure</h2>

            <form onSubmit={handleCreateFeeStructure} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Standard (1 - 15)</label>
                <select
                  value={feeForm.standard}
                  onChange={(e) => setFeeForm({ ...feeForm, standard: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((std) => (
                    <option key={std} value={std}>
                      Standard {std}th {std >= 13 ? '(College/Degree)' : std >= 11 ? '(Higher Secondary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Structure Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Std 11th Science Annual Fee"
                  value={feeForm.name}
                  onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Total Base Fee Amount (₹)</label>
                <input
                  type="number"
                  min={1000}
                  required
                  value={feeForm.totalAmount}
                  onChange={(e) => setFeeForm({ ...feeForm, totalAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Default Installments Split</label>
                <select
                  value={feeForm.installmentsCount}
                  onChange={(e) => setFeeForm({ ...feeForm, installmentsCount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                >
                  <option value={1}>1 Full Payment (Single Schedule)</option>
                  <option value={3}>3 Installments (Quarterly)</option>
                  <option value={6}>6 Installments (Bi-Monthly)</option>
                  <option value={9}>9 Installments (Monthly)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Save Fee Structure
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FACULTY MODAL */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4">
            <button onClick={() => setShowFacultyModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              ✕
            </button>
            <h2 className="text-xl font-bold text-white">Add Faculty Profile</h2>

            <form onSubmit={handleCreateFaculty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Faculty Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Ramesh Sharma"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="teacher@academy.com"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="Physics / Mathematics / Commerce"
                  value={facultyForm.subject}
                  onChange={(e) => setFacultyForm({ ...facultyForm, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="M.Sc. Physics, B.Ed."
                  value={facultyForm.qualification}
                  onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Save Faculty Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
