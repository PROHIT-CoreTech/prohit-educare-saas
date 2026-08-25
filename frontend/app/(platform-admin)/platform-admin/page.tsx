'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Building2, Users, ExternalLink, Lock, CheckCircle, PauseCircle, XCircle, Database, Eye, EyeOff, PlusCircle, Check, AlertCircle, History, Calendar, CreditCard, Receipt, Search, Filter, Layers } from 'lucide-react';
import { apiClient } from '../../../lib/api';

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

  // Tab State: 'tenants' | 'transactions' | 'overview'
  const [activeTab, setActiveTab] = useState<'tenants' | 'transactions' | 'overview'>('tenants');

  // Search & Filter state
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const [selectedTenantRecords, setSelectedTenantRecords] = useState<any>(null);
  const [inspecting, setInspecting] = useState(false);

  // Offline Registration Modal State
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showOfflinePassword, setShowOfflinePassword] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    name: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
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
      const [metricsRes, academiesRes, auditRes] = await Promise.all([
        apiClient.get('/platform/metrics', { headers: { Authorization: `Bearer ${authToken}` } }),
        apiClient.get('/platform/academies', { headers: { Authorization: `Bearer ${authToken}` } }),
        apiClient.get('/platform/audit-logs', { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      setMetrics(metricsRes.data);
      setAcademies(academiesRes.data);
      setAuditLogs(auditRes.data);
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
          ? `http://${slug}.localhost:3000/dashboard`
          : `https://${slug}.educare.prohitcoretech.com/dashboard`;
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

  const handleOfflineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
          plan: 'PROFESSIONAL',
          subscriptionStatus: 'ACTIVE',
          paymentMode: 'CASH',
          paymentReference: '',
        });
        setOfflineMessage('');
      }, 2000);
    } catch (err: any) {
      setOfflineMessage(err.response?.data?.message || 'Offline registration failed');
    } finally {
      setOfflineSubmitting(false);
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

  // Filtered Academies
  const filteredAcademies = academies.filter((ac) => {
    const matchesSearch =
      ac.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      ac.slug.toLowerCase().includes(tenantSearch.toLowerCase());
    const matchesStatus = tenantStatusFilter === 'ALL' || ac.subscriptionStatus === tenantStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Master Admin Console</h1>
              <p className="text-xs text-slate-400">PROHIT CoreTech Master System Access</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Master Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Master Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {loginError && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{loginError}</div>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition"
            >
              Sign In as Master Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              MA
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Master Admin Console</h1>
              <p className="text-sm text-slate-400">PROHIT CoreTech System Control Room (Tabbed Multi-Tenant Manager)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Offline Tenant Registration Button */}
            <button
              onClick={() => setShowOfflineModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Offline Academy</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('prohit_platform_token');
                setToken(null);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Monthly Recurring Revenue</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-2">₹{metrics.mrr?.toLocaleString('en-IN')}</p>
              <span className="text-xs text-emerald-400 mt-1 block">Active Subscriptions</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Total Academies</span>
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-2">{metrics.totalAcademies}</p>
              <span className="text-xs text-slate-400 mt-1 block">{metrics.activeAcademies} Active | {metrics.trialAcademies} Trial</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Total System Students</span>
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-2">{metrics.totalStudents}</p>
              <span className="text-xs text-slate-400 mt-1 block">Across all tenants</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">Master Access Level</span>
                <Database className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400 mt-2">Full Cross-Tenant Inspector</p>
              <span className="text-xs text-slate-400 mt-1 block">Global Data Control Active</span>
            </div>
          </div>
        )}

        {/* Master Admin Interactive Tabs Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition flex items-center space-x-2 ${
                activeTab === 'tenants'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Academy Tenants ({academies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition flex items-center space-x-2 ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Transactions & Audit History ({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Financial Overview</span>
            </button>
          </div>

          <button
            onClick={() => fetchAdminData(token)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition"
          >
            Refresh All Data
          </button>
        </div>

        {/* TAB 1: ACADEMY TENANTS ROSTER */}
        {activeTab === 'tenants' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            {/* Search & Filter Bar */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search academy or slug..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 font-semibold uppercase">Status:</span>
                {['ALL', 'ACTIVE', 'TRIAL', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTenantStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      tenantStatusFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Academy Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Subdomain</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap">Subscription Start</th>
                    <th className="px-6 py-4 whitespace-nowrap">Subscription Expiry</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Master Admin Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAcademies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No academy tenants found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAcademies.map((ac) => {
                      const startDate = formatDate(ac.createdAt);
                      const expiryDate = formatDate(
                        ac.subscriptionStatus === 'ACTIVE'
                          ? ac.subscriptionEndsAt || new Date(new Date(ac.createdAt).setFullYear(new Date(ac.createdAt).getFullYear() + 1))
                          : ac.trialEndsAt
                      );

                      return (
                        <tr key={ac._id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                            <div className="text-sm">{ac.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">ID: {ac._id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-xl text-xs font-mono inline-flex items-center space-x-1">
                              <span>{ac.slug}.educare.prohitcoretech.com</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                ac.subscriptionStatus === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : ac.subscriptionStatus === 'TRIAL'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {ac.subscriptionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{startDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-emerald-400 font-semibold whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{expiryDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleInspectRecords(ac._id)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 inline-flex items-center space-x-1 transition"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                <span>Inspect Records</span>
                              </button>

                              {ac.subscriptionStatus === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleStatusChange(ac._id, 'CANCELLED')}
                                  className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl border border-rose-500/20 transition font-semibold"
                                >
                                  Cancel Sub
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(ac._id, 'ACTIVE')}
                                  className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition font-semibold"
                                >
                                  Activate Sub
                                </button>
                              )}

                              <button
                                onClick={() => handleImpersonate(ac._id, ac.slug)}
                                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3.5 py-1.5 rounded-xl inline-flex items-center space-x-1 shadow-lg shadow-indigo-600/20 transition"
                              >
                                <span>Impersonate</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
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

        {/* TAB 2: TRANSACTIONS & AUDIT HISTORY */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            {/* Search Bar */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search transaction by tenant name or action..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl font-mono">
                Showing {filteredAuditLogs.length} of {auditLogs.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
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
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No subscription transaction logs found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const details = log.details || {};
                      const academyName = details.academyName || log.academyId?.name || 'Platform System';
                      const academySlug = details.academySlug || log.academyId?.slug || 'admin';
                      const amount = details.amount ? `₹${details.amount?.toLocaleString('en-IN')}` : details.plan === 'STARTER' ? '₹11,988 / yr' : '₹35,988 / yr';
                      const paymentMode = details.paymentMode || (log.action === 'OFFLINE_TENANT_REGISTERED' ? 'OFFLINE_CASH' : 'CASHFREE_PG');

                      const subStart = formatDate(details.subscriptionStart || log.academyId?.createdAt || log.createdAt);
                      const subExpiry = formatDate(
                        details.subscriptionExpiry ||
                        (log.academyId?.subscriptionStatus === 'ACTIVE'
                          ? log.academyId?.subscriptionEndsAt || new Date(new Date(log.createdAt).setFullYear(new Date(log.createdAt).getFullYear() + 1))
                          : log.academyId?.trialEndsAt || new Date(new Date(log.createdAt).setDate(new Date(log.createdAt).getDate() + 14)))
                      );

                      return (
                        <tr key={log._id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-4 font-semibold text-white whitespace-nowrap">
                            <div>{academyName}</div>
                            <span className="text-indigo-400 font-mono text-[10px]">{academySlug}.educare.prohitcoretech.com</span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                log.action === 'OFFLINE_TENANT_REGISTERED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : log.action === 'IMPERSONATE_START'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {log.action === 'OFFLINE_TENANT_REGISTERED'
                                ? 'Offline Provisioning'
                                : log.action === 'IMPERSONATE_START'
                                ? 'Admin Impersonation'
                                : log.action}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{subStart}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-mono text-emerald-400 font-semibold whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{subExpiry}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              <span>{paymentMode}</span>
                            </div>
                            {details.paymentReference && (
                              <span className="text-[10px] text-slate-500 block">Ref: {details.paymentReference}</span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-emerald-400 font-mono whitespace-nowrap">
                            {log.action === 'OFFLINE_TENANT_REGISTERED' || log.action?.includes('Provision') ? amount : 'N/A'}
                          </td>
                          <td className="p-4 text-slate-400 whitespace-nowrap">
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">System Financial Breakdown & Tier Revenue</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Tier (₹999/mo)</span>
                <p className="text-3xl font-extrabold text-white mt-2">₹11,988 / yr</p>
                <span className="text-xs text-slate-400 mt-1 block">Up to 200 Students per tenant</span>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-500/40">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Professional Tier (₹2,999/mo)</span>
                <p className="text-3xl font-extrabold text-white mt-2">₹35,988 / yr</p>
                <span className="text-xs text-indigo-300 mt-1 block">Most Popular (Up to 1,000 Students)</span>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Tier (₹7,999/mo)</span>
                <p className="text-3xl font-extrabold text-white mt-2">₹95,988 / yr</p>
                <span className="text-xs text-slate-400 mt-1 block">Unlimited Multi-Branch Chains</span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Platform Health & Scalability Architecture</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> Multi-Tenant Request-Scoped Isolation (TenantContextService)</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> Atomic FIFO Fee Engine with Remainder Absorption</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2" /> Cashfree Payments HMAC-SHA256 Webhook Verification</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Master Admin Offline Academy Registration Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowOfflineModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold mb-1">
                <PlusCircle className="w-4 h-4" />
                <span>Master Admin Offline Provisioning</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Register Offline Academy Tenant</h2>
              <p className="text-xs text-slate-400 mt-1">Manually provision an academy tenant when payment is collected offline via Cash, Cheque, or Bank Transfer.</p>
            </div>

            <form onSubmit={handleOfflineRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Academy Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Patel Science Classes"
                    value={offlineForm.name}
                    onChange={(e) => setOfflineForm({ ...offlineForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Subdomain Slug *</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <input
                      type="text"
                      required
                      placeholder="patel"
                      value={offlineForm.slug}
                      onChange={(e) =>
                        setOfflineForm({
                          ...offlineForm,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                      className="w-full bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">.educare.prohitcoretech.com</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Director Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. Rajesh Patel"
                    value={offlineForm.adminName}
                    onChange={(e) => setOfflineForm({ ...offlineForm, adminName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Director Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@patelclasses.com"
                    value={offlineForm.adminEmail}
                    onChange={(e) => setOfflineForm({ ...offlineForm, adminEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Default Password</label>
                  <div className="relative">
                    <input
                      type={showOfflinePassword ? 'text' : 'password'}
                      placeholder="Academy123! (Default)"
                      value={offlineForm.adminPassword}
                      onChange={(e) => setOfflineForm({ ...offlineForm, adminPassword: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOfflinePassword(!showOfflinePassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                    >
                      {showOfflinePassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={offlineForm.phone}
                    onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Plan</label>
                  <select
                    value={offlineForm.plan}
                    onChange={(e) => setOfflineForm({ ...offlineForm, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="STARTER">Starter (₹999/mo)</option>
                    <option value="PROFESSIONAL">Professional (₹2,999/mo)</option>
                    <option value="ENTERPRISE">Enterprise (₹7,999/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Initial Status</label>
                  <select
                    value={offlineForm.subscriptionStatus}
                    onChange={(e) => setOfflineForm({ ...offlineForm, subscriptionStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE (Paid)</option>
                    <option value="TRIAL">TRIAL (14 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Offline Payment Mode</label>
                  <select
                    value={offlineForm.paymentMode}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CASH">Cash Payment</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                    <option value="CHEQUE">Cheque Payment</option>
                    <option value="CONTRACT">Annual Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">Payment Receipt Ref / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Ref #TXN998234 or Receipt #OFF-102"
                  value={offlineForm.paymentReference}
                  onChange={(e) => setOfflineForm({ ...offlineForm, paymentReference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {offlineMessage && (
                <div
                  className={`text-xs p-3 rounded-xl ${
                    offlineMessage.startsWith('Success')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {offlineMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={offlineSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition text-sm"
              >
                {offlineSubmitting ? 'Provisioning Academy...' : 'Provision & Activate Academy'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Master Admin Cross-Tenant Records Inspector Modal */}
      {selectedTenantRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedTenantRecords(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">
                Master Record Inspector: {selectedTenantRecords.academy?.name}
              </h2>
              <p className="text-xs text-indigo-400 font-mono">
                {selectedTenantRecords.academy?.slug}.educare.prohitcoretech.com (Tenant ID: {selectedTenantRecords.academy?._id})
              </p>
            </div>

            {/* Tenant Record Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Students</span>
                <p className="text-2xl font-bold text-white mt-1">{selectedTenantRecords.summary?.totalStudents}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Staff Users</span>
                <p className="text-2xl font-bold text-white mt-1">{selectedTenantRecords.summary?.totalStaff}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Collected</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">₹{selectedTenantRecords.summary?.totalCollected?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Pending Fees</span>
                <p className="text-2xl font-bold text-rose-400 mt-1">₹{selectedTenantRecords.summary?.pendingBalance?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Students List preview */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Enrolled Student Records ({selectedTenantRecords.students?.length})</h3>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-48 overflow-y-auto text-xs space-y-2">
                {selectedTenantRecords.students?.map((s: any) => (
                  <div key={s._id} className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="font-semibold text-white">{s.name} ({s.studentCode})</span>
                    <span className="text-slate-400">Parent: {s.parentName} ({s.parentPhone})</span>
                    <span className="text-indigo-400 font-semibold">Advance: ₹{s.advanceBalance || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments List preview */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Recorded Payment Ledger ({selectedTenantRecords.payments?.length})</h3>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-48 overflow-y-auto text-xs space-y-2">
                {selectedTenantRecords.payments?.map((p: any) => (
                  <div key={p._id} className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="font-mono text-indigo-400">{p.receiptNumber}</span>
                    <span className="text-emerald-400 font-semibold">₹{p.totalAmountPaid} ({p.paymentMode})</span>
                    <span className="text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
