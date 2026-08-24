'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, Award, CheckCircle, BookOpen, Layers } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

const DEFAULT_BATCH_PRESETS = [
  { id: 'preset_10_eng', standard: 10, medium: 'english', section: 'none', batchName: 'Class 10th (English Medium)' },
  { id: 'preset_10_mar', standard: 10, medium: 'marathi', section: 'none', batchName: 'Class 10th (Marathi Medium)' },
  { id: 'preset_10_semi', standard: 10, medium: 'semi_english', section: 'none', batchName: 'Class 10th (Semi-English Medium)' },
  { id: 'preset_9_eng', standard: 9, medium: 'english', section: 'none', batchName: 'Class 9th (English Medium)' },
  { id: 'preset_8_eng', standard: 8, medium: 'english', section: 'none', batchName: 'Class 8th (English Medium)' },
  { id: 'preset_11_sci', standard: 11, medium: 'english', section: 'science', batchName: 'Class 11th Science (English)' },
  { id: 'preset_11_com', standard: 11, medium: 'english', section: 'commerce', batchName: 'Class 11th Commerce (English)' },
  { id: 'preset_12_sci', standard: 12, medium: 'english', section: 'science', batchName: 'Class 12th Science (English)' },
  { id: 'preset_12_com', standard: 12, medium: 'english', section: 'commerce', batchName: 'Class 12th Commerce (English)' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classBatchId: 'preset_10_eng',
    standard: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stuRes, classRes] = await Promise.all([
        apiClient.get('/students'),
        apiClient.get('/classes'),
      ]);
      setStudents(stuRes.data);
      setClasses(classRes.data);

      if (classRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, classBatchId: classRes.data[0]._id, standard: classRes.data[0].standard }));
      } else {
        setFormData((prev) => ({ ...prev, classBatchId: 'preset_10_eng', standard: 10 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let targetBatchId = formData.classBatchId;

      // If selected batch is a preset and not yet in database, create the class batch first
      if (targetBatchId.startsWith('preset_')) {
        const preset = DEFAULT_BATCH_PRESETS.find((p) => p.id === targetBatchId);
        if (preset) {
          const newBatchRes = await apiClient.post('/classes', {
            standard: preset.standard,
            medium: preset.medium,
            section: preset.section,
            batchName: preset.batchName,
          });
          targetBatchId = newBatchRes.data._id;
        }
      }

      await apiClient.post('/students', {
        name: formData.name,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        classBatchId: targetBatchId,
        standard: formData.standard,
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        classBatchId: classes.length > 0 ? classes[0]._id : 'preset_10_eng',
        standard: 10,
      });
      fetchData();
    } catch (err: any) {
      alert('Error enrolling student: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm),
  );

  const activeBatchList = classes.length > 0 ? classes : DEFAULT_BATCH_PRESETS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Student Roster</h1>
          <p className="text-sm text-slate-400">Manage student enrollments and fee profiles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center px-4">
        <Search className="w-4 h-4 text-slate-500 mr-3" />
        <input
          type="text"
          placeholder="Search by student name, code, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full text-sm"
        />
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4">Student Code</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class Batch</th>
                <th className="p-4">Parent Phone</th>
                <th className="p-4">Advance Credit</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No enrolled students found. Click &quot;Add New Student&quot; to enroll.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono text-indigo-400 font-semibold">{s.studentCode}</td>
                    <td className="p-4 font-medium text-white">{s.name}</td>
                    <td className="p-4 text-slate-300">
                      <span className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                        {s.classBatchId?.batchName || `Std ${s.standard}`}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{s.parentPhone}</td>
                    <td className="p-4 text-indigo-400 font-semibold">₹{s.advanceBalance || 0}</td>
                    <td className="p-4">
                      <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Enroll New Student</h2>
              <p className="text-xs text-slate-400 mt-1">Select class batch & parent details to register a new student.</p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Rajesh Sharma"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Parent Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Class Batch *</label>
                <select
                  value={formData.classBatchId}
                  onChange={(e) => {
                    const val = e.target.value;
                    const sel = activeBatchList.find((c: any) => (c._id || c.id) === val);
                    setFormData({
                      ...formData,
                      classBatchId: val,
                      standard: sel ? sel.standard : 10,
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <optgroup label="Academic Class Batches">
                    {activeBatchList.map((c: any) => {
                      const id = c._id || c.id;
                      const secLabel = c.section && c.section !== 'none' ? ` - ${c.section.toUpperCase()}` : '';
                      return (
                        <option key={id} value={id}>
                          {c.batchName || `Std ${c.standard} ${c.medium}${secLabel}`}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Standards 1–10 support English, Marathi & Semi-English. Standards 11–12 are locked to English (Science/Commerce/Arts).
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm"
              >
                {isSubmitting ? 'Enrolling Student...' : 'Save & Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
