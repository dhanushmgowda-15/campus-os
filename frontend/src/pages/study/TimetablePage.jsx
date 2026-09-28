import React, { useState, useEffect } from 'react';
import { 
  Clock, Plus, Trash2, MapPin, User, Calendar, 
  Loader2, X 
} from 'lucide-react';
import api from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COLOR_MAP = {
  blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
  amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900'
};

export default function TimetablePage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    subject: '',
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room: 'LH-101',
    instructor: 'Prof. Turing',
    color: 'blue'
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchTimetable = async () => {
    try {
      const data = await api.getTimetable();
      setSlots(data.timetable || []);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.createTimetableSlot(slotForm);
      setShowModal(false);
      fetchTimetable();
    } catch (err) {
      alert(err.message || 'Could not save timetable slot.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Remove this class from your timetable?')) return;
    try {
      await api.deleteTimetableSlot(id);
      setSlots(slots.filter(s => s.id !== id));
    } catch (err) {
      alert('Could not delete slot.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Clock className="text-brand-600" />
            <span>Weekly Class Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual day-by-day lecture grid with classroom venues and instructor contacts.
          </p>
        </div>

        <button
          onClick={() => {
            setSlotForm({ ...slotForm, day: activeDay });
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Class Slot</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        {DAYS.map((day) => {
          const count = slots.filter(s => s.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeDay === day
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{day}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeDay === day ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid View of Day's Schedule */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading timetable grid...</p>
        </div>
      ) : (
        <div>
          {/* Day Content */}
          {(() => {
            const daySlots = slots
              .filter(s => s.day === activeDay)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));

            if (daySlots.length === 0) {
              return (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No classes scheduled for {activeDay}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Enjoy your free time or add a study session!</p>
                  <button
                    onClick={() => {
                      setSlotForm({ ...slotForm, day: activeDay });
                      setShowModal(true);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 transition inline-flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add {activeDay} Class</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daySlots.map((slot) => {
                  const colorClass = COLOR_MAP[slot.color] || COLOR_MAP.blue;
                  return (
                    <div
                      key={slot.id}
                      className={`p-5 rounded-3xl border shadow-xs transition hover:shadow-md flex flex-col justify-between ${colorClass}`}
                    >
                      <div>
                        {/* Time Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs text-xs font-bold shadow-xs">
                            <Clock size={13} />
                            <span>{slot.start_time} - {slot.end_time}</span>
                          </div>

                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition"
                            title="Delete Slot"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Subject Title */}
                        <h3 className="text-base font-black leading-snug mb-3">
                          {slot.subject}
                        </h3>
                      </div>

                      {/* Location & Instructor Footer */}
                      <div className="pt-3 border-t border-current/10 space-y-1.5 text-xs font-medium">
                        {slot.room && (
                          <div className="flex items-center space-x-2">
                            <MapPin size={13} className="shrink-0 opacity-70" />
                            <span>Room: {slot.room}</span>
                          </div>
                        )}
                        {slot.instructor && (
                          <div className="flex items-center space-x-2">
                            <User size={13} className="shrink-0 opacity-70" />
                            <span>{slot.instructor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ADD SLOT MODAL */}
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
              Add Timetable Class
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Specify lecture timings, classroom room number, and professor.
            </p>

            <form onSubmit={handleSaveSlot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Name
                </label>
                <input
                  type="text"
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  placeholder="e.g. Computer Architecture"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Day of the Week
                </label>
                <select
                  value={slotForm.day}
                  onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Classroom / Lab
                  </label>
                  <input
                    type="text"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    placeholder="e.g. LH-202"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={slotForm.instructor}
                    onChange={(e) => setSlotForm({ ...slotForm, instructor: e.target.value })}
                    placeholder="e.g. Dr. Knuth"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Accent Color
                </label>
                <select
                  value={slotForm.color}
                  onChange={(e) => setSlotForm({ ...slotForm, color: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="blue">Blue</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="purple">Purple</option>
                  <option value="amber">Amber Yellow</option>
                  <option value="rose">Rose Red</option>
                  <option value="indigo">Indigo</option>
                  <option value="cyan">Cyan</option>
                </select>
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
                  <span>Add to Timetable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
