'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Plus, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function AcademicsPage({ params }: { params: { slug: string } }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);

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

  return (
    <div className="space-y-8">
      {authError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Academics & Batch Management</h1>
          <p className="text-sm text-slate-400 font-medium">Class batch rules and exam grading system</p>
        </div>

        <button
          onClick={() => setShowClassModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Class Batch</span>
        </button>
      </div>

      {/* Class Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-3 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 text-sm">
            No custom class batches created yet. Click &quot;Create Class Batch&quot; above to add one.
          </div>
        ) : (
          classes.map((c) => (
            <div key={c._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
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
          ))
        )}
      </div>

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
