'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Building2, Users, ExternalLink, Lock, CheckCircle, PauseCircle, XCircle, Database, Eye, EyeOff, PlusCircle, Check, AlertCircle, History, Calendar, CreditCard, Receipt, Search, Filter, Layers, Upload, ArrowRight, ArrowLeft, User } from 'lucide-react';
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
  const [offlineStep, setOfflineStep] = useState<number>(1);
  const [showOfflinePassword, setShowOfflinePassword] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    name: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    logoUrl: '',
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
          logoUrl: '',
          institutionType: 'High School',
          institutionTypes: ['High School'],
          educationBoard: 'SSC / State Board',
          educationBoards: ['SSC / State Board'],
          plan: 'PROFESSIONAL',
          subscriptionStatus: 'ACTIVE',
          paymentMode: 'CASH',
          paymentReference: '',
        });
        setOfflineMessage('');
      }, 2000);
    } catch (err: any) {
      const rawMsg = err.response?.data?.message;
      const msgStr = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : 'Offline registration failed';
      setOfflineMessage(msgStr);
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
              onClick={() => {
                setOfflineStep(1);
                setShowOfflineModal(true);
              }}
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
              <span>Transaction History ({filteredAuditLogs.length})</span>
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
                    <th className="px-6 py-4 whitespace-nowrap">Type & Board</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Master Admin Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAcademies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
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
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {(ac.institutionTypes && ac.institutionTypes.length > 0
                                  ? ac.institutionTypes
                                  : [ac.institutionType || 'High School']
                                ).map((typeItem: string) => (
                                  <span key={typeItem} className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold">
                                    {typeItem}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {(ac.educationBoards && ac.educationBoards.length > 0
                                  ? ac.educationBoards
                                  : [ac.educationBoard || 'SSC / State Board']
                                ).map((boardItem: string) => (
                                  <span key={boardItem} className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold">
                                    {boardItem}
                                  </span>
                                ))}
                              </div>
                            </div>
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
                            <div className="flex items-center justify-end space-x-2">
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
                        placeholder="e.g. Chopra Academy"
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
                          placeholder="e.g. chopra"
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
                      <label className="block font-bold text-slate-700 uppercase mb-1">Plan</label>
                      <select
                        value={offlineForm.plan}
                        onChange={(e) => setOfflineForm({ ...offlineForm, plan: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-semibold"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-semibold"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none font-semibold"
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
                      <div><span className="text-slate-400">Email:</span> <span className="font-bold text-slate-900">{offlineForm.adminEmail}</span></div>
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
    </div>
  );
}
