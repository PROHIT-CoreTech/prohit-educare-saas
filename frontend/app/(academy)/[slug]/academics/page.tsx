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

  // Filtered classes
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

  // Group classes by Standard
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

  // Unique Standards for Filter Dropdown
  const availableStandards = useMemo(() => {
    const stds = Array.from(new Set(classes.map((c) => c.standard))).sort((a, b) => a - b);
    return stds;
  }, [classes]);

  return (
    <div className="space-y-8">
      {authError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-sm font-semibold text-rose-200">Authentication Required</p>
              <p className="text-xs text-rose-400">Please sign in to {params?.slug || 'your'} academy to manage classes and enrollments.</p>
            </div>
          </div>
          <a
            href={`/login`}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Academy</span>
          </a>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Academics & Batch Management</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Organize standards, stream sections, and batch schedules across your academy
          </p>
        </div>

        <button
          onClick={() => setShowClassModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Class Batch</span>
        </button>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{availableStandards.length}</div>
            <div className="text-xs font-medium text-slate-400">Standards Active</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{classes.length}</div>
            <div className="text-xs font-medium text-slate-400">Total Class Batches</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {Array.from(new Set(classes.map((c) => c.section).filter((s) => s && s !== 'none'))).length || 1}
            </div>
            <div className="text-xs font-medium text-slate-400">Streams Supported</div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search batches by name or stream (e.g. Morning Batch, Science)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Standard Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Standards</option>
              {availableStandards.map((std) => (
                <option key={std} value={String(std)}>
                  Standard {std}th
                </option>
              ))}
            </select>
          </div>

          {/* Stream Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer capitalize"
            >
              <option value="all">All Streams</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="arts">Arts</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'grouped' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Group batches by Standard"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Standard Grouped</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Flat Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredClasses.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-3xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Class Batches Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedStandard !== 'all' || selectedStream !== 'all'
              ? 'No batches match your filter or search criteria. Try clearing search filters.'
              : 'No custom class batches created yet. Click "Create Class Batch" to get started.'}
          </p>
          {(searchQuery || selectedStandard !== 'all' || selectedStream !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStandard('all');
                setSelectedStream('all');
              }}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grouped' ? (
        /* GROUPED BY STANDARD VIEW */
        <div className="space-y-6">
          {groupedClasses.map((group) => (
            <div key={group.standard} className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              {/* Standard Header Banner */}
              <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
                    {group.standard}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Standard {group.standard}th</h2>
                    <span className="text-[11px] text-slate-400">
                      {group.batches.length} {group.batches.length === 1 ? 'Batch' : 'Batches'} Configured
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {Array.from(new Set(group.batches.map((b) => b.section).filter((s) => s && s !== 'none'))).map((stream) => (
                    <span
                      key={stream}
                      className="bg-violet-500/10 text-violet-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-violet-500/20 uppercase"
                    >
                      {stream}
                    </span>
                  ))}
                </div>
              </div>

              {/* Batches Grid inside Standard */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.batches.map((c) => (
                  <div
                    key={c._id}
                    className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 p-5 rounded-2xl transition space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">{c.batchName}</span>
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md uppercase">
                        {c.medium}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/40">
                      <span className="text-slate-400">Stream:</span>
                      <span className="font-semibold text-indigo-400 capitalize">{c.section !== 'none' ? c.section : 'General'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* FLAT GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredClasses.map((c) => (
            <div key={c._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3 hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Std {c.standard}th Batch</span>
                <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full uppercase font-mono">
                  {c.medium}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{c.batchName}</h3>

              {c.standard >= 11 && (
                <div className="inline-block bg-violet-500/10 text-violet-400 text-xs px-3 py-1 rounded-xl border border-violet-500/20 font-semibold uppercase">
                  Stream: {c.section}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-4">
            <button onClick={() => setShowClassModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              ✕
            </button>
            <h2 className="text-xl font-bold text-white">Create New Class Batch</h2>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Standard (1 - 12)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Medium {classForm.standard >= 11 && '(Locked to English)'}
                </label>
                <select
                  disabled={classForm.standard >= 11}
                  value={classForm.medium}
                  onChange={(e) => setClassForm({ ...classForm, medium: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none disabled:opacity-50"
                >
                  <option value="english">English</option>
                  <option value="marathi">Marathi</option>
                  <option value="semi_english">Semi-English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>

              {classForm.standard >= 11 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Section / Stream (Required)</label>
                  <select
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  >
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Batch, Afternoon Batch, Batch A"
                  value={classForm.batchName}
                  onChange={(e) => setClassForm({ ...classForm, batchName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />

                <div className="mt-2.5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Quick Suggestions for Multiple Batches:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Morning Batch', 'Afternoon Batch', 'Evening Batch', 'Batch A', 'Batch B', 'JEE Science Batch', 'NEET Batch'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setClassForm({ ...classForm, batchName: preset })}
                        className="bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-indigo-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 space-y-2">
                  <div>{formError}</div>
                  {authError && (
                    <a
                      href="/login"
                      className="inline-block bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Click Here to Sign In to Academy
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition"
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
