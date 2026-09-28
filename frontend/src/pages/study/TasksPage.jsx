import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Trash2, Calendar, AlertCircle, 
  Clock, CheckCircle, Loader2, X 
} from 'lucide-react';
import api from '../../services/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // New Task Modal
  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',
    subject: 'General'
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks(statusFilter);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.createTask(taskForm);
      setShowModal(false);
      setTaskForm({
        title: '',
        description: '',
        due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending',
        subject: 'General'
      });
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Could not save task.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      alert('Could not delete task.');
    }
  };

  const priorityBadge = (p) => {
    switch (p) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <CheckSquare className="text-brand-600" />
            <span>Tasks & Study To-Do</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep track of homework assignments, lab reports, and study deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 w-fit">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'pending', label: 'Pending' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks in this category</h3>
          <p className="text-xs text-slate-500 mt-1">All clear! Add a new task to stay organized.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition flex items-center justify-between gap-4 ${
                  isDone
                    ? 'border-slate-200/50 dark:border-slate-800/50 opacity-70 bg-slate-50/50 dark:bg-slate-950/40'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-500/40'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => handleToggleStatus(task)}
                    className="w-5 h-5 rounded-md text-brand-600 accent-brand-600 cursor-pointer mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {task.subject || 'General'}
                      </span>
                      {priorityBadge(task.priority)}
                    </div>
                    <h4 className={`text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {task.due_date && (
                    <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{task.due_date}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
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
              Add Study Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Set assignment milestones and target due dates.
            </p>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Solve Algorithms Homework 5"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Subject
                  </label>
                  <input
                    type="text"
                    value={taskForm.subject}
                    onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                    placeholder="e.g. Data Structures"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Additional instructions, reference chapters, etc."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  <span>Create Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
