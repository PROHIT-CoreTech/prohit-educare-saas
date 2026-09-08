'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit3, ShieldCheck, MapPin, Phone, Mail, Users, CheckCircle2, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchBranchesData();
  }, []);

  const fetchBranchesData = async () => {
    setLoading(true);
    try {
      const [branchesRes, usageRes] = await Promise.all([
        apiClient.get('/branches'),
        apiClient.get('/branches/usage-stats'),
      ]);
      setBranches(branchesRes.data);
      setUsageStats(usageRes.data);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a valid branch name');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/branches', formData);
      setShowAddModal(false);
      setFormData({ name: '', code: '', address: '', phone: '', email: '' });
      fetchBranchesData();
    } catch (err: any) {
      alert('Error creating branch: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/branches/${editingBranch._id}`, editFormData);
      setShowEditModal(false);
      setEditingBranch(null);
      fetchBranchesData();
    } catch (err: any) {
      alert('Error updating branch: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (b: any) => {
    setEditingBranch(b);
    setEditFormData({
      name: b.name || '',
      code: b.code || '',
      address: b.address || '',
      phone: b.phone || '',
      email: b.email || '',
      status: b.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Academy Branches & Campuses</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage multi-branch campuses, onboarding main branch, and branch capacity limits by subscription plan
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={usageStats ? usageStats.remainingBranches <= 0 : false}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-2 self-start sm:self-auto shrink-0 text-xs sm:text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Usage Quota Card */}
      {usageStats && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900">
                  Branch Quota Capacity ({usageStats.planKey} Plan)
                </span>
                <span className="text-xs text-slate-500 font-medium block -mt-0.5">
                  {usageStats.totalBranches} Created / {usageStats.branchLimit} Allowed ({usageStats.remainingBranches} Remaining Capacity)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`text-xs font-black px-3 py-1 rounded-xl border ${
                  usageStats.remainingBranches === 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {usageStats.remainingBranches} Additional Branch Slots Remaining
              </span>
              <a
                href="/subscription"
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition"
              >
                Upgrade Plan
              </a>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((usageStats.totalBranches / usageStats.branchLimit) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-800">Loading Academy Branches...</p>
        </div>
      ) : (
        /* Branch Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b._id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden transition ${
                b.isMain ? 'border-orange-300 ring-2 ring-orange-400/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {b.isMain && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-bl-2xl shadow-xs tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Main Onboarding Branch</span>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-sm shrink-0">
                    {b.code}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{b.name}</h3>
                    <span className="text-xs text-slate-400 font-mono font-semibold block">{b.code}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {b.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </div>
                  )}
                  {b.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{b.phone}</span>
                    </div>
                  )}
                  {b.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{b.studentCount || 0} Students</span>
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      b.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <button
                  onClick={() => openEditModal(b)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Branch */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Add New Branch Campus</h3>
                  <p className="text-xs text-slate-500 font-medium">Create a new branch under your academy account</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kothrud Main Campus"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BR-KOTHRUD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Address</label>
                <input
                  type="text"
                  placeholder="e.g. Paud Road, Kothrud, Pune - 411038"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Email</label>
                  <input
                    type="email"
                    placeholder="e.g. kothrud@academy.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Branch */}
      {showEditModal && editingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Edit Branch Details</h3>
                  <p className="text-xs text-slate-500 font-medium">{editingBranch.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Code *</label>
                <input
                  type="text"
                  required
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Branch Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {!editingBranch.isMain && (
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
