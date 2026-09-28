import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, CheckCircle2, Circle, Clock, 
  MapPin, BookOpen, AlertTriangle, Loader2, X, ChevronDown, 
  ChevronUp, Sparkles 
} from 'lucide-react';
import api from '../../services/api';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExam, setExpandedExam] = useState(null);

  // New Exam Modal
  const [showModal, setShowModal] = useState(false);
  const [examForm, setExamForm] = useState({
    subject: '',
    exam_date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    room_or_venue: 'Main Examination Hall A',
    syllabus_topics: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchExams = async () => {
    try {
      const data = await api.getExams();
      const loadedExams = data.exams || [];
      setExams(loadedExams);
      if (loadedExams.length > 0 && !expandedExam) {
        setExpandedExam(loadedExams[0].id);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleToggleStep = async (examId, day, currentStatus) => {
    try {
      await api.toggleStudyPlanStep(examId, day, !currentStatus);
      setExams(exams.map(ex => {
        if (ex.id === examId) {
          const updatedPlan = (ex.study_plan || []).map(step => 
            step.day === day ? { ...step, completed: !currentStatus } : step
          );
          return { ...ex, study_plan: updatedPlan };
        }
        return ex;
      }));
    } catch (err) {
      console.error('Failed to update study step:', err);
    }
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const topicsArray = examForm.syllabus_topics.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await api.createExam({
        ...examForm,
        syllabus_topics: topicsArray
      });
      setShowModal(false);
      setExamForm({
        subject: '',
        exam_date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
        room_or_venue: 'Main Examination Hall A',
        syllabus_topics: ''
      });
      fetchExams();
    } catch (err) {
      alert(err.message || 'Could not create exam.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Delete this exam and its auto-generated study plan?')) return;
    try {
      await api.deleteExam(id);
      setExams(exams.filter(ex => ex.id !== id));
    } catch (err) {
      alert('Could not delete exam.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Calendar className="text-brand-600" />
            <span>Exams & Automated Study Plans</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track exam dates with countdowns and follow intelligent day-by-day revision milestones.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Exams Grid & Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading exam schedules and study plans...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No exams scheduled</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add an exam name and date, and CampusOS will automatically generate an actionable day-by-day study roadmap for you!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 transition inline-flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Add Exam</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {exams.map((exam) => {
            const daysLeft = exam.days_remaining ?? 0;
            const isUrgent = daysLeft <= 3;
            const isExpanded = expandedExam === exam.id;
            const plan = exam.study_plan || [];
            const completedCount = plan.filter(s => s.completed).length;
            const planProgress = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0;

            return (
              <div
                key={exam.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition"
              >
                {/* Main Exam Card Header */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    {/* Countdown Badge */}
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-center shrink-0 shadow-sm ${
                      isUrgent
                        ? 'bg-red-500 text-white shadow-red-500/20 animate-pulse'
                        : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800'
                    }`}>
                      <span className="text-xl leading-none">{daysLeft <= 0 ? '0' : daysLeft}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-0.5">
                        {daysLeft <= 0 ? 'Today' : 'Days'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {exam.subject}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{exam.exam_date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{exam.room_or_venue || 'Hall A'}</span>
                        </div>
                      </div>

                      {/* Syllabus Chips */}
                      {exam.syllabus_topics && exam.syllabus_topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {exam.syllabus_topics.map((top, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {top}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Progress Summary */}
                  <div className="flex items-center justify-between md:justify-end space-x-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {completedCount} of {plan.length} Steps Done
                      </span>
                      <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${planProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Hide Plan' : 'View Plan'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Delete Exam"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Automated Study Plan (Accordion) */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                        <Sparkles size={14} />
                        <span>Day-by-Day Study Blueprint</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Click checkmark to log study progress
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {plan.map((step) => (
                        <div
                          key={step.day}
                          onClick={() => handleToggleStep(exam.id, step.day, step.completed)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                            step.completed
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <button
                              type="button"
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                                step.completed
                                  ? 'bg-emerald-500 text-white'
                                  : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500'
                              }`}
                            >
                              {step.completed && <CheckCircle2 size={14} />}
                            </button>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Day {step.day} • {step.date}
                              </span>
                              <p className={`text-xs font-semibold leading-snug truncate ${
                                step.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {step.task}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD EXAM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
              Add Upcoming Exam
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              CampusOS will automatically generate a tailored day-by-day revision schedule for this exam!
            </p>

            <form onSubmit={handleSaveExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Exam Title
                </label>
                <input
                  type="text"
                  value={examForm.subject}
                  onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  placeholder="e.g. Operating Systems Final"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examForm.exam_date}
                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Venue / Room
                  </label>
                  <input
                    type="text"
                    value={examForm.room_or_venue}
                    onChange={(e) => setExamForm({ ...examForm, room_or_venue: e.target.value })}
                    placeholder="e.g. Hall B-201"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Syllabus Key Topics (comma separated)
                </label>
                <textarea
                  rows={3}
                  value={examForm.syllabus_topics}
                  onChange={(e) => setExamForm({ ...examForm, syllabus_topics: e.target.value })}
                  placeholder="e.g. Concurrency, Deadlocks, Paging, Virtual Memory"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5"
                >
                  {formLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Generate Plan & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
