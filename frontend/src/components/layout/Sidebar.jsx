import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, CheckSquare, Calendar, Clock, 
  FileText, Award, Briefcase, Users, Radio, BellRing, Bus, 
  LogOut, GraduationCap, X, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navSections = [
    {
      title: 'CORE',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'STUDY MODULE',
      items: [
        { name: 'Notes & Cheatsheets', path: '/study/notes', icon: BookOpen },
        { name: 'Tasks & To-Do', path: '/study/tasks', icon: CheckSquare },
        { name: 'Exams & Study Plans', path: '/study/exams', icon: Calendar },
        { name: 'Weekly Timetable', path: '/study/timetable', icon: Clock },
      ]
    },
    {
      title: 'CAREER MODULE',
      items: [
        { name: 'Resume Builder', path: '/career/resume', icon: FileText },
        { name: 'Skills Tracker', path: '/career/skills', icon: Award },
        { name: 'Jobs & Internships', path: '/career/jobs', icon: Briefcase },
      ]
    },
    {
      title: 'CAMPUS MODULE',
      items: [
        { name: 'Campus Events', path: '/campus/events', icon: Radio },
        { name: 'Student Clubs', path: '/campus/clubs', icon: Users },
        { name: 'Official Notices', path: '/campus/notices', icon: BellRing },
        { name: 'Bus Schedule', path: '/campus/bus', icon: Bus },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-800">
            <NavLink to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
                <GraduationCap size={20} />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  CampusOS
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                  Student Portal
                </span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav List */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon
                            size={16}
                            className={`transition-colors ${
                              isActive
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="text-brand-500" />}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={user?.profile?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'}
                alt="user avatar"
                className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-800 shrink-0 object-cover"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.profile?.branch || 'Campus Student'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
