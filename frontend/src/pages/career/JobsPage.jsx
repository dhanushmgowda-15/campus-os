import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Bookmark, BookmarkCheck, ExternalLink, 
  MapPin, DollarSign, Calendar, CheckCircle2, Loader2 
} from 'lucide-react';
import api from '../../services/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs(typeFilter);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [typeFilter]);

  const handleToggleSave = async (job) => {
    try {
      const res = await api.toggleSaveJob(job.id);
      setJobs(jobs.map(j => j.id === job.id ? { ...j, is_saved: res.is_saved } : j));
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleToggleApply = async (job) => {
    try {
      const res = await api.toggleApplyJob(job.id);
      setJobs(jobs.map(j => j.id === job.id ? { ...j, is_applied: res.is_applied } : j));
      if (res.is_applied && job.apply_url) {
        window.open(job.apply_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to toggle apply:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Briefcase className="text-brand-600" />
            <span>Internships & Job Opportunities</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Handpicked software engineering internships and new grad opportunities for college students.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-fit">
        {['All', 'Internship', 'Full-time'].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              typeFilter === type
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {type === 'All' ? 'All Roles' : `${type}s`}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading career opportunities...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No opportunities in this category</h3>
          <p className="text-xs text-slate-500 mt-1">Check back soon as recruiters post new college openings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Type Badge + Save Bookmark */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    job.type === 'Internship'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {job.type}
                  </span>

                  <button
                    onClick={() => handleToggleSave(job)}
                    className={`p-1.5 rounded-xl transition ${
                      job.is_saved
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title={job.is_saved ? 'Saved' : 'Save Opportunity'}
                  >
                    {job.is_saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  </button>
                </div>

                {/* Job Title & Company */}
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {job.title}
                </h3>
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                  {job.company}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-3">
                  <div className="flex items-center space-x-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign size={13} className="text-emerald-500" />
                    <span>{job.stipend_or_salary}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Deadline: {job.deadline}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {job.requirements.slice(0, 2).map((req, i) => (
                      <div key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                        <CheckCircle2 size={12} className="text-brand-500 shrink-0" />
                        <span className="truncate">{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <a
                  href={job.apply_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
                >
                  <span>Company Site</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  onClick={() => handleToggleApply(job)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    job.is_applied
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                  }`}
                >
                  {job.is_applied ? <CheckCircle2 size={14} /> : null}
                  <span>{job.is_applied ? 'Applied' : 'Apply Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
