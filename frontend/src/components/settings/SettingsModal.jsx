import React, { useState, useEffect } from 'react';
import { 
  X, User, KeyRound, Sun, Moon, Bell, Calendar, Shield, Trash2, 
  LogOut, Check, AlertTriangle, Loader2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Taylor',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Morgan',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Casey'
];

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateSettings, updateProfile, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    college: '',
    branch: '',
    year_of_study: '',
    avatar: ''
  });

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Settings State
  const [notifications, setNotifications] = useState({
    task_reminders: true,
    exam_alerts: true,
    event_notice_updates: true
  });

  const [timetablePrefs, setTimetablePrefs] = useState({
    week_start_day: 'Monday',
    class_reminder_time: '15 mins before'
  });

  const [privacy, setPrivacy] = useState({
    profile_visible: true
  });

  // Delete Confirmation Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        college: user.profile?.college || '',
        branch: user.profile?.branch || '',
        year_of_study: user.profile?.year_of_study || '',
        avatar: user.profile?.avatar || AVATAR_OPTIONS[0]
      });

      if (user.settings) {
        if (user.settings.notifications) {
          setNotifications(user.settings.notifications);
        }
        if (user.settings.timetable_preferences) {
          setTimetablePrefs(user.settings.timetable_preferences);
        }
        if (user.settings.privacy) {
          setPrivacy(user.settings.privacy);
        }
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setSuccessMsg('');
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 3500);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: profileForm.name,
        profile: {
          college: profileForm.college,
          branch: profileForm.branch,
          year_of_study: profileForm.year_of_study,
          avatar: profileForm.avatar
        }
      });
      showNotification('Profile updated successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to update profile.', true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotification('New password and confirmation do not match.', true);
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(passwordForm);
      showNotification('Password updated successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showNotification(err.message || 'Failed to change password.', true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Notification Toggle
  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await updateSettings({ notifications: updated });
      showNotification('Notification preferences saved.');
    } catch (err) {
      showNotification('Could not save settings to server.', true);
    }
  };

  // Handle Timetable Pref Change
  const handleTimetablePrefChange = async (key, val) => {
    const updated = { ...timetablePrefs, [key]: val };
    setTimetablePrefs(updated);
    try {
      await updateSettings({ timetable_preferences: updated });
      showNotification('Timetable preferences updated.');
    } catch (err) {
      showNotification('Could not save timetable settings.', true);
    }
  };

  // Handle Privacy Toggle
  const handlePrivacyToggle = async () => {
    const updated = { profile_visible: !privacy.profile_visible };
    setPrivacy(updated);
    try {
      await updateSettings({ privacy: updated });
      showNotification('Privacy preference saved.');
    } catch (err) {
      showNotification('Could not save privacy settings.', true);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.deleteAccount();
      window.location.href = '/';
    } catch (err) {
      showNotification(err.message || 'Could not delete account.', true);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: KeyRound },
    { id: 'theme', label: 'Theme', icon: theme === 'dark' ? Moon : Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: Trash2, danger: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-60 bg-slate-50 dark:bg-slate-950/60 p-4 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  ⚙️
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Settings</h2>
              </div>
              <button 
                onClick={onClose} 
                className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : tab.danger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 md:mt-0">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto relative flex flex-col justify-between">
          <div className="absolute top-4 right-4 hidden md:block">
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Toast Alert Feedback */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center space-x-2">
              <Check size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm flex items-center space-x-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Student Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Update your personal college information and avatar.</p>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Select Avatar</label>
                    <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                      {AVATAR_OPTIONS.map((url, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setProfileForm({ ...profileForm, avatar: url })}
                          className={`relative w-12 h-12 rounded-full border-2 p-0.5 transition ${
                            profileForm.avatar === url 
                              ? 'border-brand-600 ring-2 ring-brand-400/50 scale-105' 
                              : 'border-transparent hover:border-slate-300'
                          }`}
                        >
                          <img src={url} alt="avatar" className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">College Email (Locked)</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">College / University</label>
                    <input
                      type="text"
                      value={profileForm.college}
                      onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                      placeholder="e.g. Apex Institute of Technology"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Branch / Major</label>
                      <input
                        type="text"
                        value={profileForm.branch}
                        onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                        placeholder="e.g. Computer Science"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Year of Study</label>
                      <select
                        value={profileForm.year_of_study}
                        onChange={(e) => setProfileForm({ ...profileForm, year_of_study: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-md shadow-brand-500/20 transition flex items-center space-x-2"
                    >
                      {loading && <Loader2 size={16} className="animate-spin" />}
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. CHANGE PASSWORD TAB */}
            {activeTab === 'password' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Change Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Update your password to keep your account secure.</p>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">New Password (min 6 characters)</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-md shadow-brand-500/20 transition flex items-center space-x-2"
                    >
                      {loading && <Loader2 size={16} className="animate-spin" />}
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. THEME TAB */}
            {activeTab === 'theme' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Appearance & Theme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Customize the visual interface of CampusOS.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <div
                    onClick={() => setTheme('light')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                      theme === 'light'
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                        <Sun size={22} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Light Mode</h4>
                        <p className="text-xs text-slate-500">Crisp, high-contrast reading</p>
                      </div>
                    </div>
                    <div className="w-full h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center px-3 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <div className="w-16 h-2 rounded bg-slate-300"></div>
                    </div>
                  </div>

                  <div
                    onClick={() => setTheme('dark')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                      theme === 'dark'
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-xl bg-indigo-900 text-indigo-300">
                        <Moon size={22} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Dark Mode</h4>
                        <p className="text-xs text-slate-500">Easy on the eyes for night study</p>
                      </div>
                    </div>
                    <div className="w-full h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center px-3 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-16 h-2 rounded bg-slate-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Notification Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Choose which alerts appear in your top navigation bell.</p>

                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Study Task Reminders</h4>
                      <p className="text-xs text-slate-500">Alert me when homework or project tasks are due</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.task_reminders}
                      onChange={() => handleToggleNotification('task_reminders')}
                      className="w-5 h-5 rounded text-brand-600 accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Exam & Quiz Countdown Alerts</h4>
                      <p className="text-xs text-slate-500">Highlight exams scheduled within the next 7 days</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.exam_alerts}
                      onChange={() => handleToggleNotification('exam_alerts')}
                      className="w-5 h-5 rounded text-brand-600 accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Urgent Campus Notices & Events</h4>
                      <p className="text-xs text-slate-500">Notify me immediately about emergency campus announcements</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.event_notice_updates}
                      onChange={() => handleToggleNotification('event_notice_updates')}
                      className="w-5 h-5 rounded text-brand-600 accent-brand-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. TIMETABLE PREFERENCES TAB */}
            {activeTab === 'timetable' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Timetable Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Customize your weekly schedule display and reminder timings.</p>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Week Starts On</label>
                    <select
                      value={timetablePrefs.week_start_day}
                      onChange={(e) => handleTimetablePrefChange('week_start_day', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Class Reminder Interval</label>
                    <select
                      value={timetablePrefs.class_reminder_time}
                      onChange={(e) => handleTimetablePrefChange('class_reminder_time', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="5 mins before">5 minutes before class</option>
                      <option value="10 mins before">10 minutes before class</option>
                      <option value="15 mins before">15 minutes before class</option>
                      <option value="30 mins before">30 minutes before class</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Privacy Controls</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Manage your visibility across college clubs and event rosters.</p>

                <div className="max-w-lg p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Public Profile Visibility</h4>
                    <p className="text-xs text-slate-500">Allow other students in your joined clubs and events to view your student name and year</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.profile_visible}
                    onChange={handlePrivacyToggle}
                    className="w-5 h-5 rounded text-brand-600 accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 7. ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Account & Danger Zone</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Manage your active session or irreversibly remove your student account.</p>

                <div className="space-y-4 max-w-lg">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sign Out of CampusOS</h4>
                      <p className="text-xs text-slate-500">Safely terminate your current active browser session</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                    >
                      Logout
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
                    <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Delete Student Account</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      Permanently wipes your account and cascades deletion of all your study notes, tasks, exams, timetable slots, resume, and skills from MongoDB.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition flex items-center space-x-2"
                    >
                      <Trash2 size={14} />
                      <span>Delete My Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete Account */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-red-200 dark:border-red-900 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-center text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Permanently Delete Account?
            </h3>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-6">
              This action is permanent and cannot be undone. All your notes, exams, timetable, and career documents will be deleted.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition flex items-center justify-center space-x-1"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Confirm Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
