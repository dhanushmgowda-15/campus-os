import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Settings, Moon, Sun, Menu, User, LogOut, ChevronDown, 
  Clock, AlertCircle, Calendar, CheckSquare 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function TopNavbar({ onToggleSidebar, onOpenSettings }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Fetch dashboard notifications
  const loadNotifications = async () => {
    try {
      const data = await api.getDashboardStats();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_notifications_count || data.notifications.length);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Left: Mobile Toggle & Brand / Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full">
          <Clock size={14} className="text-brand-500" />
          <span>{todayStr}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Semester</span>
        </div>
      </div>

      {/* Right: Actions (Theme, Notifications, Settings, Profile) */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun size={19} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={19} className="text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Bell Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="Notifications & Alerts"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No urgent notifications or pending alerts right now. You're all caught up!
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUrgent = notif.severity === 'high';
                    return (
                      <div
                        key={notif.id}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex items-start space-x-3"
                      >
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          notif.type === 'notice' 
                            ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' 
                            : notif.type === 'exam'
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400'
                        }`}>
                          {notif.type === 'notice' ? <AlertCircle size={15} /> : notif.type === 'exam' ? <Calendar size={15} /> : <CheckSquare size={15} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button (⚙️) */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition"
          title="Open Settings"
        >
          <Settings size={19} />
        </button>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <img
              src={user?.profile?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-800 object-cover"
            />
            <div className="hidden md:block text-left text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[120px]">
                {user?.name || 'Student'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {user?.profile?.year_of_study || 'Student'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-0.5 truncate">{user?.profile?.branch || 'Engineering'}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Settings size={15} className="text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
