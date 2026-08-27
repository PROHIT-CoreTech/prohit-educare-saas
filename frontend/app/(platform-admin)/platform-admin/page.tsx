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

  const [activeTab, setActiveTab] = useState<'tenants' | 'transactions' | 'overview'>('tenants');

  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const [selectedTenantRecords, setSelectedTenantRecords] = useState<any>(null);
  const [inspecting, setInspecting] = useState(false);

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

  const filteredAcademies = academies.filter((ac) => {
    const matchesSearch =
      ac.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      ac.slug.toLowerCase().includes(tenantSearch.toLowerCase());
    const matchesStatus = tenantStatusFilter === 'ALL' || ac.subscriptionStatus === tenantStatusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-extrabold text-lg">
              MA
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Master Admin Console</h1>
              <p className="text-sm text-slate-500 font-medium">PROHIT CoreTech System Control Room (Tabbed Multi-Tenant Manager)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowOfflineModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Offline Academy</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('prohit_platform_token');
                setToken(null);
              }}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs"
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

        {/* Master Admin Interactive Tabs Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition flex items-center space-x-2 ${
                activeTab === 'tenants'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Academy Tenants ({academies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition flex items-center space-x-2 ${
                activeTab === 'transactions'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Transactions & Audit History ({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Financial Overview</span>
            </button>
          </div>

          <button
            onClick={() => fetchAdminData(token)}
            className="text-xs bg-white hover:bg-slate-100 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-xs"
          >
            Refresh All Data
          </button>
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
                    <th className="px-6 py-4 whitespace-nowrap">Subscription Start</th>
                    <th className="px-6 py-4 whitespace-nowrap">Subscription Expiry</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Master Admin Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAcademies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
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
                          <td className="px-6 py-4 text-xs font-mono text-slate-700 font-semibold whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-orange-500" />
                              <span>{startDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-emerald-700 font-bold whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{expiryDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleInspectRecords(ac._id)}
                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200 inline-flex items-center space-x-1 transition"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                                <span>Inspect Records</span>
                              </button>

                              {ac.subscriptionStatus === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleStatusChange(ac._id, 'CANCELLED')}
                                  className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 transition font-bold"
                                >
                                  Cancel Sub
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(ac._id, 'ACTIVE')}
                                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 transition font-bold"
                                >
                                  Activate Sub
                                </button>
                              )}

                              <button
                                onClick={() => handleImpersonate(ac._id, ac.slug)}
                                className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3.5 py-1.5 rounded-xl inline-flex items-center space-x-1 shadow-md shadow-orange-500/20 transition"
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
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search transaction by tenant name or action..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-mono font-bold border border-slate-200">
                Showing {filteredAuditLogs.length} of {auditLogs.length} Records
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
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {log.action === 'OFFLINE_TENANT_REGISTERED'
                                ? 'Offline Provisioning'
                                : log.action === 'IMPERSONATE_START'
                                ? 'Admin Impersonation'
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
                          <td className="p-4 font-black text-emerald-700 font-mono whitespace-nowrap">
                            {log.action === 'OFFLINE_TENANT_REGISTERED' || log.action?.includes('Provision') ? amount : 'N/A'}
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
            <h2 className="text-xl font-extrabold text-slate-900">System Financial Breakdown & Tier Revenue</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter Tier (₹999/mo)</span>
                <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹11,988 / yr</p>
                <span className="text-xs text-slate-500 font-medium mt-1 block">Up to 200 Students per tenant</span>
              </div>

              <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Professional Tier (₹2,999/mo)</span>
                <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹35,988 / yr</p>
                <span className="text-xs text-orange-700 font-bold mt-1 block">Most Popular (Up to 1,000 Students)</span>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise Tier (₹7,999/mo)</span>
                <p className="text-3xl font-black text-slate-900 mt-2 font-mono">₹95,988 / yr</p>
                <span className="text-xs text-slate-500 font-medium mt-1 block">Unlimited Multi-Branch Chains</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Platform Health & Scalability Architecture</h3>
              <ul className="text-xs text-slate-700 space-y-2 font-medium">
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Multi-Tenant Request-Scoped Isolation (TenantContextService)</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Atomic FIFO Fee Engine with Remainder Absorption</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-600 mr-2" /> Cashfree Payments HMAC-SHA256 Webhook Verification</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Master Admin Offline Academy Registration Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowOfflineModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center space-x-2 text-emerald-700 text-sm font-bold mb-1">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Master Admin Offline Provisioning</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Register Offline Academy Tenant</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Manually provision an academy tenant when payment is collected offline via Cash, Cheque, or Bank Transfer.</p>
            </div>

            <form onSubmit={handleOfflineRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Academy Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter academy name"
                    value={offlineForm.name}
                    onChange={(e) => setOfflineForm({ ...offlineForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subdomain Slug *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter subdomain slug"
                      value={offlineForm.slug}
                      onChange={(e) =>
                        setOfflineForm({
                          ...offlineForm,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                      className="w-full bg-transparent text-slate-900 focus:outline-none font-bold"
                    />
                    <span className="text-slate-500 font-mono">.educare.prohitcoretech.com</span>
                  </div>
                </div>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 pr-10 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOfflinePassword(!showOfflinePassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Plan</label>
                  <select
                    value={offlineForm.plan}
                    onChange={(e) => setOfflineForm({ ...offlineForm, plan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="STARTER">Starter (₹999/mo)</option>
                    <option value="PROFESSIONAL">Professional (₹2,999/mo)</option>
                    <option value="ENTERPRISE">Enterprise (₹7,999/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Initial Status</label>
                  <select
                    value={offlineForm.subscriptionStatus}
                    onChange={(e) => setOfflineForm({ ...offlineForm, subscriptionStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE (Paid)</option>
                    <option value="TRIAL">TRIAL (14 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Offline Payment Mode</label>
                  <select
                    value={offlineForm.paymentMode}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none font-semibold"
                  >
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
                  placeholder="Enter payment receipt reference or notes"
                  value={offlineForm.paymentReference}
                  onChange={(e) => setOfflineForm({ ...offlineForm, paymentReference: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
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

              <button
                type="submit"
                disabled={offlineSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20 transition text-sm"
              >
                {offlineSubmitting ? 'Provisioning Academy...' : 'Provision & Activate Academy'}
              </button>
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
    </div>
  );
}
