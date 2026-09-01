'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  LogIn,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  ListFilter,
  GraduationCap,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  UserMinus,
  Edit3,
  Save,
  Check,
  CalendarDays,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function AcademicsPage({ params }: { params: { slug: string } }) {
  const [activeSubTab, setActiveSubTab] = useState<'batches' | 'roster' | 'attendance'>('batches');

  // Batches state
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

  // Roster & Attendance state
  const [weeklyRoster, setWeeklyRoster] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{ facultyId: string; day: string } | null>(null);
  const [slotText, setSlotText] = useState('');

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [attendanceDayRoster, setAttendanceDayRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchClasses(), fetchFaculty(), fetchRoster()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'attendance') {
      fetchAttendanceData(attendanceDate);
    }
  }, [activeSubTab, attendanceDate]);

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

  const fetchFaculty = async () => {
    try {
      const res = await apiClient.get('/faculty');
      setFacultyList(res.data.filter((f: any) => f.status === 'ACTIVE'));
    } catch (e) {}
  };

  const fetchRoster = async () => {
    try {
      const res = await apiClient.get('/roster');
      setWeeklyRoster(res.data);
    } catch (e) {}
  };

  const fetchAttendanceData = async (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      const [rosterRes, attRes] = await Promise.all([
        apiClient.get(`/roster/today?day=${dayName}`),
        apiClient.get(`/faculty-attendance?date=${dateStr}`),
      ]);

      setAttendanceDayRoster(rosterRes.data);
      setAttendanceList(attRes.data);
    } catch (e) {}
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
      const resData = err.response?.data;
      let rawMsg = resData?.message || resData?.error || err.message || 'Unknown error occurred';
      if (Array.isArray(rawMsg)) rawMsg = rawMsg.join(' | ');
      setFormError(rawMsg);
    }
  };

  // Save Roster Cell Slots
  const handleSaveCellSlots = async (facultyId: string, day: string) => {
    const existingFacultyRoster = weeklyRoster.find((r) => r.faculty._id === facultyId);
    const updatedWeeklySchedule = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => {
      if (d === day) {
        const slotsArray = slotText
          .split(/,|\//)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        return { day: d, slots: slotsArray };
      }
      const existingDay = existingFacultyRoster?.weeklySchedule?.find((s: any) => s.day === d);
      return { day: d, slots: existingDay ? existingDay.slots : [] };
    });

    try {
      await apiClient.post('/roster/upsert', {
        facultyId,
        weeklySchedule: updatedWeeklySchedule,
      });
      setEditingCell(null);
      setSlotText('');
      fetchRoster();
    } catch (e: any) {
      alert('Failed to update roster cell');
    }
  };

  // Download CSV Roster Template
  const handleDownloadRosterTemplate = () => {
    const headers = ['Faculty Name', 'Subject', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const rows = facultyList.map((f) => {
      const roster = weeklyRoster.find((r) => r.faculty?._id === f._id);
      const getDaySlots = (dayName: string) => {
        const d = roster?.weeklySchedule?.find((s: any) => s.day === dayName);
        return d && d.slots ? d.slots.join(' / ') : '';
      };

      return [
        `"${f.name}"`,
        `"${f.subject}"`,
        `"${getDaySlots('Monday')}"`,
        `"${getDaySlots('Tuesday')}"`,
        `"${getDaySlots('Wednesday')}"`,
        `"${getDaySlots('Thursday')}"`,
        `"${getDaySlots('Friday')}"`,
        `"${getDaySlots('Saturday')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'lecture_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload CSV Roster
  const handleUploadRosterCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file is empty or invalid.');
        return;
      }

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let updatedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 2) continue;

        const facName = cols[0];
        const matchingFaculty = facultyList.find(
          (f) => f.name.toLowerCase() === facName.toLowerCase() || facName.toLowerCase().includes(f.name.toLowerCase())
        );

        if (matchingFaculty) {
          const weeklySchedule = days.map((day, idx) => {
            const slotStr = cols[idx + 2] || '';
            const slots = slotStr
              .split(/,|\//)
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            return { day, slots };
          });

          try {
            await apiClient.post('/roster/upsert', {
              facultyId: matchingFaculty._id,
              weeklySchedule,
            });
            updatedCount++;
          } catch (err) {
            console.error('Failed to update roster for faculty:', facName);
          }
        }
      }

      alert(`Successfully updated timetable slots for ${updatedCount} faculty members!`);
      fetchRoster();
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Mark Faculty Attendance
  const handleMarkFacultyAttendance = async (
    facultyId: string,
    status: 'PRESENT' | 'ABSENT' | 'SUBSTITUTED',
    substituteFacultyId?: string,
    slots?: string[],
  ) => {
    try {
      await apiClient.post('/faculty-attendance/mark', {
        date: attendanceDate,
        facultyId,
        status,
        substituteFacultyId,
        slots,
      });
      fetchAttendanceData(attendanceDate);
    } catch (e) {
      alert('Failed to mark attendance');
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
    return Array.from(new Set(classes.map((c) => c.standard))).sort((a, b) => a - b);
  }, [classes]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-8 font-sans">
      {authError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-rose-900">Authentication Required</p>
              <p className="text-xs text-rose-700">Please sign in to manage academics, roster, and attendance.</p>
            </div>
          </div>
          <a
            href={`/login`}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </a>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <span>Academics, Roster & Attendance</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage class batches, day-wise faculty timetables (Std 1st - 15th), and roster-driven daily attendance
          </p>
        </div>

        {activeSubTab === 'batches' && (
          <button
            onClick={() => setShowClassModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class Batch</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveSubTab('batches')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeSubTab === 'batches'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Class Batches</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeSubTab === 'roster'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Lecture Roster (Weekly Timetable)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            activeSubTab === 'attendance'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Roster-Driven Faculty Attendance</span>
        </button>
      </div>

      {/* Loading State Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-extrabold text-slate-800">Loading Academic Modules...</p>
            <p className="text-xs text-slate-400 font-medium">Fetching class batches, faculty directory, and weekly timetable</p>
          </div>
        </div>
      ) : (
        <>
          {/* SUB-TAB 1: CLASS BATCHES */}
          {activeSubTab === 'batches' && (
        <div className="space-y-6">
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
                  <span>Grouped</span>
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

          {/* Main Batches Display */}
          {filteredClasses.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3 shadow-sm">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Class Batches Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No custom class batches created yet. Click &quot;Create Class Batch&quot; to get started.
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
                            {c.medium === 'semi_english'
                              ? 'Semi-English'
                              : c.medium === 'marathi'
                              ? 'Marathi'
                              : c.medium === 'hindi'
                              ? 'Hindi'
                              : 'English'}
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
        </div>
      )}

      {/* SUB-TAB 2: LECTURE ROSTER (WEEKLY TIMETABLE GRID) */}
      {activeSubTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Day-Wise Faculty Schedule (Lecture Roster)</h2>
              <p className="text-xs text-slate-500 font-medium">
                Assign lecture slots standard-wise for each faculty member across Monday to Saturday
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start md:self-auto">
              <button
                onClick={handleDownloadRosterTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-orange-500" />
                <span>Download Template</span>
              </button>

              <label className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition flex items-center space-x-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Roster CSV</span>
                <input type="file" accept=".csv" onChange={handleUploadRosterCsv} className="hidden" />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-48 border-r border-slate-200">Faculty Name & Subject</th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="p-4 text-center border-r border-slate-200 last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {facultyList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      No active faculty profiles configured. Add faculty members in Settings &gt; Faculty Directory first.
                    </td>
                  </tr>
                ) : (
                  facultyList.map((faculty) => {
                    const facultyRoster = weeklyRoster.find((r) => r.faculty?._id === faculty._id);
                    return (
                      <tr key={faculty._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 border-r border-slate-200 bg-slate-50/30">
                          <div className="font-bold text-slate-900 text-sm">{faculty.name}</div>
                          <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200 inline-block mt-1">
                            {faculty.subject}
                          </span>
                        </td>

                        {daysOfWeek.map((day) => {
                          const daySched = facultyRoster?.weeklySchedule?.find((s: any) => s.day === day);
                          const slots: string[] = daySched ? daySched.slots : [];
                          const isEditing = editingCell?.facultyId === faculty._id && editingCell?.day === day;

                          return (
                            <td key={day} className="p-3 border-r border-slate-200 last:border-r-0 align-top">
                              {isEditing ? (
                                <div className="space-y-2 bg-orange-50/70 p-2.5 rounded-xl border border-orange-200 shadow-sm min-w-[150px]">
                                  <label className="text-[10px] font-bold text-orange-800 uppercase block">Assign Standard:</label>
                                  <select
                                    value={slotText}
                                    onChange={(e) => setSlotText(e.target.value)}
                                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 font-bold text-slate-900 cursor-pointer"
                                    autoFocus
                                  >
                                    <option value="">-- Select Standard --</option>
                                    {(faculty.assignedStandards && faculty.assignedStandards.length > 0
                                      ? faculty.assignedStandards
                                      : availableStandards.length > 0
                                      ? availableStandards.map((std: number) => `${std}th`)
                                      : ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th Sci', '11th Com', '11th Arts', '12th Sci', '12th Com', '12th Arts']
                                    ).map((stdItem: string) => {
                                      const stdLabel = stdItem.includes('Std') ? stdItem : `Std ${stdItem}`;
                                      return (
                                        <option key={stdItem} value={stdLabel}>
                                          {stdLabel}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <div className="flex items-center space-x-1.5 justify-end">
                                    <button
                                      onClick={() => handleSaveCellSlots(faculty._id, day)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingCell(null)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingCell({ facultyId: faculty._id, day });
                                    setSlotText(slots.join(' / '));
                                  }}
                                  className="min-h-[56px] p-2 rounded-xl hover:bg-orange-50/60 border border-transparent hover:border-orange-200 cursor-pointer transition flex flex-col items-center justify-center space-y-1 group"
                                >
                                  {slots.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 justify-center">
                                      {slots.map((slot, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-orange-200"
                                        >
                                          {slot}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] italic group-hover:text-orange-600 font-medium">
                                      + Click to Assign
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROSTER-DRIVEN FACULTY ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Roster-Driven Faculty Attendance</h2>
              <p className="text-xs text-slate-500 font-medium">
                Mark daily attendance (Present, Absent, Substituted) directly against today&apos;s active timetable schedule
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Attendance Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Scheduled Slots</th>
                  <th className="p-4">Attendance Status</th>
                  <th className="p-4">Substitute Faculty (If Substituted)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {attendanceDayRoster.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      No lectures scheduled on the active roster for this date (
                      {new Date(attendanceDate).toLocaleDateString('en-US', { weekday: 'long' })}).
                    </td>
                  </tr>
                ) : (
                  attendanceDayRoster.map((item) => {
                    const faculty = item.faculty;
                    const slots = item.slots;
                    const existingAtt = attendanceList.find(
                      (att) => att.facultyId?._id === faculty._id || att.facultyId === faculty._id,
                    );
                    const currentStatus = existingAtt?.status || 'PRESENT';

                    return (
                      <tr key={faculty._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-900">{faculty.name}</td>
                        <td className="p-4">
                          <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-orange-200">
                            {faculty.subject}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {slots.map((s: string, idx: number) => (
                              <span key={idx} className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleMarkFacultyAttendance(faculty._id, 'PRESENT', undefined, slots)}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] border transition flex items-center space-x-1 ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            <button
                              onClick={() => handleMarkFacultyAttendance(faculty._id, 'ABSENT', undefined, slots)}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] border transition flex items-center space-x-1 ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            <button
                              onClick={() => handleMarkFacultyAttendance(faculty._id, 'SUBSTITUTED', undefined, slots)}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] border transition flex items-center space-x-1 ${
                                currentStatus === 'SUBSTITUTED'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Substituted</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          {currentStatus === 'SUBSTITUTED' ? (
                            <select
                              value={existingAtt?.substituteFacultyId?._id || existingAtt?.substituteFacultyId || ''}
                              onChange={(e) =>
                                handleMarkFacultyAttendance(faculty._id, 'SUBSTITUTED', e.target.value, slots)
                              }
                              className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-amber-900 font-semibold focus:outline-none"
                            >
                              <option value="">-- Select Substitute Faculty --</option>
                              {facultyList
                                .filter((f) => f._id !== faculty._id)
                                .map((f) => (
                                  <option key={f._id} value={f._id}>
                                    {f.name} ({f.subject})
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className="text-slate-400 text-xs italic">N/A</span>
                          )}
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
        </>
      )}

      {/* CREATE CLASS BATCH MODAL */}
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
                  placeholder="Enter batch name"
                  value={classForm.batchName}
                  onChange={(e) => setClassForm({ ...classForm, batchName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {formError && (
                <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold">
                  {formError}
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
