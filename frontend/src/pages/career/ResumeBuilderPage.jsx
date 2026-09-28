import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Save, Plus, Trash2, ExternalLink, 
  Sparkles, Check, Loader2, Briefcase, GraduationCap, Code 
} from 'lucide-react';
import api from '../../services/api';

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchResume = async () => {
    try {
      const data = await api.getResume();
      setResume(data.resume);
    } catch (err) {
      console.error('Failed to load resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.updateResume(resume);
      setStatusMsg('Resume saved successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      alert('Failed to save resume.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await api.downloadResumePdfBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${(resume?.personal_info?.full_name || 'Student').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  // Field helpers
  const updatePersonalInfo = (field, val) => {
    setResume({
      ...resume,
      personal_info: { ...resume.personal_info, [field]: val }
    });
  };

  // Education Helpers
  const addEducation = () => {
    setResume({
      ...resume,
      education: [
        ...(resume.education || []),
        { institution: '', degree: '', start_year: '2023', end_year: '2027', grade: 'GPA: 3.8' }
      ]
    });
  };

  const updateEducation = (index, field, val) => {
    const list = [...(resume.education || [])];
    list[index][field] = val;
    setResume({ ...resume, education: list });
  };

  const removeEducation = (index) => {
    const list = [...(resume.education || [])];
    list.splice(index, 1);
    setResume({ ...resume, education: list });
  };

  // Experience Helpers
  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...(resume.experience || []),
        { title: '', company: '', location: 'Remote', start_date: 'Jun 2025', end_date: 'Aug 2025', description: '' }
      ]
    });
  };

  const updateExperience = (index, field, val) => {
    const list = [...(resume.experience || [])];
    list[index][field] = val;
    setResume({ ...resume, experience: list });
  };

  const removeExperience = (index) => {
    const list = [...(resume.experience || [])];
    list.splice(index, 1);
    setResume({ ...resume, experience: list });
  };

  // Project Helpers
  const addProject = () => {
    setResume({
      ...resume,
      projects: [
        ...(resume.projects || []),
        { title: '', technologies: '', link: '', description: '' }
      ]
    });
  };

  const updateProject = (index, field, val) => {
    const list = [...(resume.projects || [])];
    list[index][field] = val;
    setResume({ ...resume, projects: list });
  };

  const removeProject = (index) => {
    const list = [...(resume.projects || [])];
    list.splice(index, 1);
    setResume({ ...resume, projects: list });
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading your resume documents...</p>
      </div>
    );
  }

  const pInfo = resume?.personal_info || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FileText className="text-brand-600" />
            <span>Resume Builder & PDF Exporter</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Edit your ATS-ready college resume with real-time preview and instant PDF export.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs transition"
          >
            {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition"
          >
            {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <Check size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Two Column Layout: Editor on Left, Live Clean Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Contact & Header Info */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Personal & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={pInfo.full_name || ''}
                  onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={pInfo.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={pInfo.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={pInfo.location || ''}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={pInfo.linkedin || ''}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">GitHub / Portfolio</label>
                <input
                  type="text"
                  value={pInfo.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={pInfo.summary || ''}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed"
              />
            </div>
          </div>

          {/* 2. Education */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Education
              </h3>
              <button
                onClick={addEducation}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Degree</span>
              </button>
            </div>

            {(resume.education || []).map((edu, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 relative">
                <button
                  onClick={() => removeEducation(idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Institution / University"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Degree / Major"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Graduation Year (e.g. 2027)"
                    value={edu.end_year}
                    onChange={(e) => updateEducation(idx, 'end_year', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Grade / GPA"
                    value={edu.grade}
                    onChange={(e) => updateEducation(idx, 'grade', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 3. Experience */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Work & Internships
              </h3>
              <button
                onClick={addExperience}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Role</span>
              </button>
            </div>

            {(resume.experience || []).map((exp, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 relative">
                <button
                  onClick={() => removeExperience(idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Role Title (e.g. Frontend Intern)"
                    value={exp.title}
                    onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Company / Organization"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Key contributions and achievements..."
                  value={exp.description}
                  onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            ))}
          </div>

          {/* 4. Projects */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Key Academic Projects
              </h3>
              <button
                onClick={addProject}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            {(resume.projects || []).map((proj, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 relative">
                <button
                  onClick={() => removeProject(idx)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={proj.title}
                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (e.g. Python, React)"
                    value={proj.technologies}
                    onChange={(e) => updateProject(idx, 'technologies', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Project impact and architecture..."
                  value={proj.description}
                  onChange={(e) => updateProject(idx, 'description', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            ))}
          </div>

          {/* 5. Skills */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Technical Skills List (comma-separated)
            </h3>
            <textarea
              rows={2}
              value={(resume.skills || []).join(', ')}
              onChange={(e) => setResume({ ...resume, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g. Python, React, Flask, MongoDB, Docker, Git"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

        </div>

        {/* Right Column: Live Styled Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-3xl bg-white text-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-200 text-left font-sans text-xs leading-relaxed">
            
            <div className="flex items-center justify-between pb-3 border-b border-blue-600 mb-3">
              <div>
                <h2 className="text-xl font-black text-blue-900 tracking-tight">
                  {pInfo.full_name || 'STUDENT NAME'}
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {[pInfo.email, pInfo.phone, pInfo.location].filter(Boolean).join(' • ')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {[pInfo.github, pInfo.linkedin].filter(Boolean).join(' • ')}
                </p>
              </div>
            </div>

            {pInfo.summary && (
              <div className="mb-4">
                <h4 className="text-[10px] font-black uppercase text-blue-800 tracking-wider mb-1">
                  Professional Summary
                </h4>
                <p className="text-[11px] text-slate-700 leading-normal">
                  {pInfo.summary}
                </p>
              </div>
            )}

            {resume.education && resume.education.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] font-black uppercase text-blue-800 tracking-wider mb-1">
                  Education
                </h4>
                {resume.education.map((edu, i) => (
                  <div key={i} className="mb-1.5">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>{edu.degree || 'Degree'}</span>
                      <span className="text-slate-500 font-normal">{edu.end_year}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>{edu.institution || 'University'}</span>
                      <span>{edu.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resume.experience && resume.experience.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] font-black uppercase text-blue-800 tracking-wider mb-1">
                  Experience
                </h4>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>{exp.title || 'Role'}</span>
                      <span className="text-slate-500 font-normal">{exp.start_date} - {exp.end_date}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium">{exp.company} ({exp.location})</p>
                    <p className="text-[10px] text-slate-700 mt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {resume.projects && resume.projects.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] font-black uppercase text-blue-800 tracking-wider mb-1">
                  Key Projects
                </h4>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="mb-1.5">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>{proj.title || 'Project'}</span>
                      <span className="text-blue-600 text-[10px]">{proj.technologies}</span>
                    </div>
                    <p className="text-[10px] text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-blue-800 tracking-wider mb-1">
                  Technical Skills
                </h4>
                <p className="text-[10px] text-slate-700">
                  {resume.skills.join(', ')}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
