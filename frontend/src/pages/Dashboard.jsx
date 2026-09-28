import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, CheckSquare, Clock, BellRing, BookOpen, Briefcase, 
  Users, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle, 
  Plus, Loader2, Sparkles 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500">Synthesizing student dashboard...</p>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const charts = stats?.charts || {};
  const todayClasses = stats?.today_classes || [];
  const upcomingExams = stats?.upcoming_exams || [];
  const latestNotices = stats?.latest_notices || [];

  // Chart colors
  const taskData = charts.task_distribution || [
    { name: 'Completed', value: summary.completed_tasks || 0, color: '#10B981' },
    { name: 'In Progress', value: summary.in_progress_tasks || 0, color: '#F59E0B' },
    { name: 'Pending', value: summary.pending_tasks || 0, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-amber-300" />
            <span>Welcome to your digital terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100 leading-relaxed">
            You have <b className="text-white">{summary.pending_tasks || 0} pending tasks</b> and{' '}
            <b className="text-white">{summary.today_classes_count || 0} scheduled classes</b> today. 
            Keep up the momentum!
          </p>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-8 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Tasks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.pending_tasks ?? 0}
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {summary.completion_rate || 0}% Done
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.completion_rate || 0}%` }}
            />
          </div>
        </div>

        {/* Card 2: Upcoming Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upcoming Exams</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.upcoming_exams_count ?? 0}
            </h3>
            <span className="text-[11px] text-slate-400">Next 30 Days</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 truncate">
            {upcomingExams[0] ? `Next: ${upcomingExams[0].subject}` : 'No exams scheduled'}
          </p>
        </div>

        {/* Card 3: Today's Classes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Classes</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.today_classes_count ?? 0}
            </h3>
            <span className="text-[11px] text-slate-400">Lectures & Labs</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 truncate">
            {todayClasses[0] ? `Next: ${todayClasses[0].subject} (${todayClasses[0].start_time})` : 'No classes remaining today'}
          </p>
        </div>

        {/* Card 4: Study Prep Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Exam Study Progress</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.study_progress_pct ?? 0}%
            </h3>
            <span className="text-[11px] text-slate-400">Plan Steps Done</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.study_progress_pct || 0}%` }}
            />
          </div>
        </div>

      </div>

      {/* Analytics Charts & Today's Schedule Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Task Completion % Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Task Completion Health</h3>
                <p className="text-[11px] text-slate-500">Distribution of active vs finished assignments</p>
              </div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full">
                {summary.completion_rate}% Completed
              </span>
            </div>

            {/* Recharts Pie Chart */}
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{summary.total_tasks || 0}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Total Tasks</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="block text-sm font-bold text-emerald-600 dark:text-emerald-400">{summary.completed_tasks || 0}</span>
              <span className="text-[10px] text-slate-400">Completed</span>
            </div>
            <div>
              <span className="block text-sm font-bold text-amber-600 dark:text-amber-400">{summary.in_progress_tasks || 0}</span>
              <span className="text-[10px] text-slate-400">In Progress</span>
            </div>
            <div>
              <span className="block text-sm font-bold text-red-600 dark:text-red-400">{summary.pending_tasks || 0}</span>
              <span className="text-[10px] text-slate-400">Pending</span>
            </div>
          </div>
        </div>

        {/* Center: Today's Class Schedule */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Today's Class Schedule</h3>
                <p className="text-[11px] text-slate-500">Live lecture timetable for today</p>
              </div>
              <NavLink
                to="/study/timetable"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>Full Timetable</span>
                <ArrowUpRight size={13} />
              </NavLink>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                No classes on the schedule for today! Great day for exam study or project work.
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between hover:border-brand-500/50 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex flex-col items-center justify-center font-bold text-xs">
                        <span>{cls.start_time}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {cls.subject}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {cls.instructor} • <span className="font-semibold text-brand-600 dark:text-brand-400">{cls.room}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {cls.start_time} - {cls.end_time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Remember to arrive 5 minutes before scheduled start time.</span>
            <NavLink to="/study/timetable" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Add Class +
            </NavLink>
          </div>
        </div>

      </div>

      {/* Upcoming Exams & Official Notices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Exams with Countdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Upcoming Exams Countdown</h3>
              <p className="text-[11px] text-slate-500">Auto-generated countdowns & revision milestones</p>
            </div>
            <NavLink
              to="/study/exams"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>View All Exams</span>
              <ArrowUpRight size={13} />
            </NavLink>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No exams currently scheduled. Add your first exam in the Study module!
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const daysLeft = exam.days_remaining ?? 0;
                const isUrgent = daysLeft <= 3;
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {exam.subject}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Venue: {exam.room_or_venue} • Date: {exam.exam_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                        isUrgent
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 animate-pulse'
                          : 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                      }`}>
                        {daysLeft <= 0 ? 'Today!' : `${daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Latest College Notices Feed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Latest College Notices</h3>
              <p className="text-[11px] text-slate-500">Official administration & department feed</p>
            </div>
            <NavLink
              to="/campus/notices"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>Notice Board</span>
              <ArrowUpRight size={13} />
            </NavLink>
          </div>

          <div className="space-y-3">
            {latestNotices.map((notice) => (
              <div
                key={notice.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    notice.priority === 'urgent'
                      ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {notice.priority}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                    {notice.category}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">
                  {notice.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
