import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Pin, PinOff, Trash2, Edit3, Search, 
  Tag, Loader2, X, Check 
} from 'lucide-react';
import api from '../../services/api';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    subject: 'General',
    content: '',
    tags: '',
    is_pinned: false
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchNotes = async () => {
    try {
      const data = await api.getNotes();
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const subjects = ['All', ...new Set(notes.map(n => n.subject).filter(Boolean))];

  const handleOpenCreate = () => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      subject: 'General',
      content: '',
      tags: '',
      is_pinned: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      subject: note.subject || 'General',
      content: note.content || '',
      tags: (note.tags || []).join(', '),
      is_pinned: note.is_pinned || false
    });
    setShowModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const tagsArray = noteForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...noteForm,
      tags: tagsArray
    };

    try {
      if (editingNote) {
        await api.updateNote(editingNote.id, payload);
      } else {
        await api.createNote(payload);
      }
      setShowModal(false);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Could not save note.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await api.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      alert('Could not delete note.');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const updated = await api.updateNote(note.id, { is_pinned: !note.is_pinned });
      fetchNotes();
    } catch (err) {
      console.error('Pin toggle failed:', err);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchSubject = selectedSubject === 'All' || n.subject === selectedSubject;
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSubject && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <BookOpen className="text-brand-600" />
            <span>Notes & Cheatsheets</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize lecture summaries, exam formulas, and revision notes by course.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        
        {/* Subject Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === sub
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, topics, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading your notes collection...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No notes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? "Try changing your search term or subject filter." : "Create your first subject note to start organizing your study material."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 transition inline-flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Create Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group relative p-5 rounded-3xl bg-white dark:bg-slate-900 border transition hover:shadow-lg flex flex-col justify-between ${
                note.is_pinned
                  ? 'border-brand-300 dark:border-brand-800 shadow-brand-500/5 ring-1 ring-brand-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div>
                {/* Note Top Bar */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    {note.subject}
                  </span>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1.5 rounded-lg transition ${
                        note.is_pinned
                          ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/60'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title={note.is_pinned ? 'Unpin' : 'Pin to top'}
                    >
                      {note.is_pinned ? <Pin size={14} className="fill-brand-600" /> : <PinOff size={14} />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                      title="Edit Note"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                  {note.title}
                </h3>

                {/* Content Render */}
                <div 
                  className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>

              {/* Tags & Date Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(note.tags || []).slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT NOTE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 relative">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Supports HTML & rich text formatting for formulas and bullets.
            </p>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Operating Systems: Semaphore Implementations"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    value={noteForm.subject}
                    onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                    placeholder="e.g. Mutex, IPC, Finals"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note Content (HTML / Plain text)
                </label>
                <textarea
                  rows={6}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Write your study notes here... Supports <b>bold</b>, <ul><li>lists</li></ul>, etc."
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={noteForm.is_pinned}
                  onChange={(e) => setNoteForm({ ...noteForm, is_pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin this note to the top of your library
                </label>
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
                  <span>{editingNote ? 'Update Note' : 'Save Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
