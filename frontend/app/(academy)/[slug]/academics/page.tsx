'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Award, Plus, CheckCircle, AlertCircle, LogIn, Search, Filter, Layers, LayoutGrid, ListFilter, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function AcademicsPage({ params }: { params: { slug: string } }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped');

  const [classForm, setClassForm] = useState({
    standard: 10,
    medium: 'english',
    section: 'none',
    batchName: '',
  });
  const [formError, setFormError] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/classes');
      setClasses(res.data);
      setAuthError(false);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.data?.message?.includes('Authorization')) {
        setAuthError(true);
      }
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (classForm.standard >= 11) {
        if (classForm.medium !== 'english') {
          setFormError('Standard 11 and above is locked to "english" medium');
          return;
        }
        if (!classForm.section || classForm.section === 'none') {
          setFormError('Section (science, commerce, or arts) is required for standard 11+');
          return;
        }
      }

      await apiClient.post('/classes', classForm);
      setShowClassModal(false);
      setClassForm({
        standard: 10,
        medium: 'english',
        section: 'none',
        batchName: '',
      });
      fetchClasses();
    } catch (err: any) {
      console.error('Create Class Batch Error:', err);
      const resData = err.response?.data;
      let rawMsg = resData?.message || resData?.error || err.message || 'Unknown error occurred';

      if (Array.isArray(rawMsg)) {
        rawMsg = rawMsg.join(' | ');
      } else if (typeof rawMsg === 'object') {
        rawMsg = JSON.stringify(rawMsg);
      }

      if (err.response?.status === 401 || (typeof rawMsg === 'string' && rawMsg.includes('Authorization'))) {
        setFormError('Your session has expired or you are not logged in. Please sign in to save.');
        setAuthError(true);
      } else if (err.response?.status === 403 || (typeof rawMsg === 'string' && rawMsg.includes('subscription'))) {
        setFormError(`Access Restricted (403): ${rawMsg}`);
      } else if (err.response?.status === 500) {
        setFormError(`Server Error (500): ${rawMsg} ${resData?.error ? '(' + resData.error + ')' : ''}`);
      } else {
        setFormError(rawMsg);
      }
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        c.batchName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `std ${c.standard}`.includes(searchQuery.toLowerCase()) ||
        c.section?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStandard = selectedStandard === 'all' || String(c.standard) === selectedStandard;
      const matchesStream = selectedStream === 'all' || c.section === selectedStream;

      return matchesSearch && matchesStandard && matchesStream;
    });
  }, [classes, searchQuery, selectedStandard, selectedStream]);

  const groupedClasses = useMemo(() => {
    const groups: { [key: number]: any[] } = {};
    filteredClasses.forEach((c) => {
      const std = c.standard;
      if (!groups[std]) groups[std] = [];
      groups[std].push(c);
    });

    return Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b)
      .map((std) => ({
        standard: std,
        batches: groups[std],
      }));
  }, [filteredClasses]);

  const availableStandards = useMemo(() => {
    const stds = Array.from(new Set(classes.map((c) => c.standard))).sort((a, b) => a - b);
    return stds;
  }, [classes]);

  return (
    <div className="space-y-8 font-sans">
      {authError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-rose-900">Authentication Required</p>
              <p className="text-xs text-rose-700">Please sign in to {params?.slug || 'your'} academy to manage classes and enrollments.</p>
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <span>Academics & Batch Management</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Organize standards (Std 1st - 15th), stream sections, and batch schedules across your academy
          </p>
        </div>

        <button
          onClick={() => setShowClassModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Class Batch</span>
        </button>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{availableStandards.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Standards Active</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{classes.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Total Class Batches</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {Array.from(new Set(classes.map((c) => c.section).filter((s) => s && s !== 'none'))).length || 1}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Streams Supported</div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search batches by name or stream (e.g. Morning Batch, Science)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Standards (1-15)</option>
              {availableStandards.map((std) => (
                <option key={std} value={String(std)}>
                  Standard {std}th
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer capitalize"
            >
              <option value="all">All Streams</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="arts">Arts</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                viewMode === 'grouped' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Standard Grouped</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                viewMode === 'grid' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Class Batches Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedStandard !== 'all' || selectedStream !== 'all'
              ? 'No batches match your filter or search criteria. Try clearing search filters.'
              : 'No custom class batches created yet. Click "Create Class Batch" to get started.'}
          </p>
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="space-y-6">
          {groupedClasses.map((group) => (
            <div key={group.standard} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-black text-orange-600 text-sm font-mono">
                    {group.standard}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Standard {group.standard}th</h2>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {group.batches.length} {group.batches.length === 1 ? 'Batch' : 'Batches'} Configured
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {Array.from(new Set(group.batches.map((b) => b.section).filter((s) => s && s !== 'none'))).map((stream) => (
                    <span
                      key={stream}
                      className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase"
                    >
                      {stream}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.batches.map((c) => (
                  <div
                    key={c._id}
                    className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">{c.batchName}</span>
                      <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-orange-200">
                        {c.medium === 'semi_english' ? 'Semi-English' : c.medium === 'marathi' ? 'Marathi' : c.medium === 'hindi' ? 'Hindi' : 'English'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-medium">Stream:</span>
                      <span className="font-bold text-orange-600 capitalize">{c.section !== 'none' ? c.section : 'General'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredClasses.map((c) => (
            <div key={c._id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3 hover:border-orange-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Std {c.standard}th Batch</span>
                <span className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full uppercase font-bold border border-orange-200">
                  {c.medium === 'semi_english' ? 'Semi-English' : c.medium === 'marathi' ? 'Marathi' : c.medium === 'hindi' ? 'Hindi' : 'English'}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">{c.batchName}</h3>

              {c.standard >= 11 && (
                <div className="inline-block bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-xl border border-emerald-200 font-bold uppercase">
                  Stream: {c.section}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4">
            <button onClick={() => setShowClassModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h2 className="text-xl font-black text-slate-900">Create New Class Batch</h2>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Standard (1 - 15)</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={classForm.standard}
                  onChange={(e) => {
                    const std = Number(e.target.value);
                    setClassForm({
                      ...classForm,
                      standard: std,
                      medium: std >= 11 ? 'english' : classForm.medium,
                      section: std >= 11 ? 'science' : 'none',
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Medium {classForm.standard >= 11 && '(Locked to English)'}
                </label>
                <select
                  disabled={classForm.standard >= 11}
                  value={classForm.medium}
                  onChange={(e) => setClassForm({ ...classForm, medium: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none disabled:opacity-50 font-semibold"
                >
                  <option value="english">English</option>
                  <option value="marathi">Marathi</option>
                  <option value="semi_english">Semi-English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>

              {classForm.standard >= 11 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section / Stream (Required)</label>
                  <select
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Batch, Afternoon Batch, Batch A"
                  value={classForm.batchName}
                  onChange={(e) => setClassForm({ ...classForm, batchName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />

                <div className="mt-2.5 space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Quick Suggestions for Multiple Batches:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Morning Batch', 'Afternoon Batch', 'Evening Batch', 'Batch A', 'Batch B', 'JEE Science Batch', 'NEET Batch'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setClassForm({ ...classForm, batchName: preset })}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-orange-200 transition"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold space-y-2">
                  <div>{formError}</div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md shadow-orange-500/20 transition text-sm"
              >
                Save Class Batch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
