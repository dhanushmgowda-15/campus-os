import React, { useState, useEffect } from 'react';
import { 
  Award, Plus, Trash2, CheckCircle2, TrendingUp, 
  Loader2, X, Sparkles 
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = ['All', 'Technical', 'Soft Skills', 'Tools', 'Languages'];

const PROFICIENCY_SCORES = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100
};

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Technical',
    proficiency: 'Intermediate',
    target_date: 'Current'
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const data = await api.getSkills();
      setSkills(data.skills || []);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.createSkill(skillForm);
      setShowModal(false);
      setSkillForm({
        name: '',
        category: 'Technical',
        proficiency: 'Intermediate',
        target_date: 'Current'
      });
      fetchSkills();
    } catch (err) {
      alert(err.message || 'Failed to save skill.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await api.deleteSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      alert('Could not delete skill.');
    }
  };

  const filteredSkills = skills.filter(
    s => selectedCategory === 'All' || s.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Award className="text-brand-600" />
            <span>Skills & Competency Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your programming languages, frameworks, developer tooling, and soft skills.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-fit overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading skills portfolio...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No skills listed yet</h3>
          <p className="text-xs text-slate-500 mt-1">Add your technical languages or tools to build out your resume matrix!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const score = PROFICIENCY_SCORES[skill.proficiency] || 50;
            return (
              <div
                key={skill.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {skill.category}
                    </span>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                      title="Delete Skill"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {skill.name}
                  </h3>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {skill.proficiency}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Proficiency</span>
                    <span>{score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-brand-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD SKILL MODAL */}
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
              Add Skill
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Record a programming framework, technical concept, or tool.
            </p>

            <form onSubmit={handleSaveSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. React.js, Python, Docker"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Tools">Tools</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proficiency
                  </label>
                  <select
                    value={skillForm.proficiency}
                    onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Beginner">Beginner (25%)</option>
                    <option value="Intermediate">Intermediate (50%)</option>
                    <option value="Advanced">Advanced (75%)</option>
                    <option value="Expert">Expert (100%)</option>
                  </select>
                </div>
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
                  <span>Save Skill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
