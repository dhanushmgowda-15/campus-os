import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Briefcase, Users, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, Sparkles, X, Loader2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { isAuthenticated, login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm_password: '' 
  });
  const [forgotEmail, setForgotEmail] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (signupForm.password !== signupForm.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (signupForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(signupForm);
      setShowSignupModal(false);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login('alex@campus.edu', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Demo login failed. Make sure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // simulate API dispatch
      setTimeout(() => {
        setSuccessMsg('Reset instructions dispatched to your email!');
        setLoading(false);
        setTimeout(() => {
          setShowForgotModal(false);
          setSuccessMsg('');
        }, 2500);
      }, 700);
    } catch (err) {
      setErrorMsg('Could not process reset request.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white transition-colors">
      
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
                CampusOS
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                Digital Operating System
              </span>
            </div>
          </div>

          {/* Top-Right Corner Buttons: Login & Sign Up */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => {
                setErrorMsg('');
                setShowLoginModal(true);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Login
            </button>
            <button
              onClick={() => {
                setErrorMsg('');
                setShowSignupModal(true);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex flex-col items-center text-center justify-center">
        
        {/* Release Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-xs animate-bounce">
          <Sparkles size={14} className="text-brand-500" />
          <span>The All-In-One Workspace for College Students</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl leading-tight">
          Your Entire College Journey, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Unified in One Digital OS.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Say goodbye to fragmented bookmarks, missed class notifications, and messy notes. 
          CampusOS centralizes your <b>Study Planner</b>, <b>Career Portfolio</b>, and <b>Campus Life</b> into a beautifully integrated, responsive web app.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowSignupModal(true)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition flex items-center justify-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="text-amber-500" />}
            <span>Instant Demo Login (Alex Rivers)</span>
          </button>
        </div>

        {/* Feature Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          {/* Card 1: Study Module */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
              1. Study Module
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Organize rich-text notes by subject, manage priority-ranked tasks, track upcoming exams with auto-generated study plans, and navigate your weekly timetable grid.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Rich Notes with pinned cheatsheets</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Exam countdown & day-by-day plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Weekly interactive timetable schedule</span>
              </div>
            </div>
          </div>

          {/* Card 2: Career Module */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Briefcase size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
              2. Career Module
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Build an ATS-optimized student resume with one-click downloadable PDF export, track technical skills with proficiency meters, and apply to top internships and jobs.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Resume builder with instant PDF download</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Skill proficiency progression matrix</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internships & jobs board with save/apply</span>
              </div>
            </div>
          </div>

          {/* Card 3: Campus Module */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
              3. Campus Module
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Discover upcoming campus hackathons and seminars with RSVP tracking, join student clubs, stay informed with official college notices, and lookup college bus routes.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Event RSVPs with live attendee counters</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Clubs directory with one-click join/leave</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Filterable notices & bus route stop times</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© 2026 CampusOS. Built with React, Tailwind CSS, Python Flask, and MongoDB.</p>
      </footer>

      {/* ================= LOGIN MODAL ================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <div className="mb-5 text-left">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Welcome Back</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your student dashboard.
              </p>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="e.g. alex@campus.edu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Log In</span>
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowSignupModal(true);
                }}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SIGN UP MODAL ================= */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
            
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <div className="mb-5 text-left">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Create Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Register with your student details to activate CampusOS.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College Email
                </label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="e.g. jordan@campus.edu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupForm.confirm_password}
                  onChange={(e) => setSignupForm({ ...signupForm, confirm_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Create Student Account</span>
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setShowSignupModal(false);
                  setShowLoginModal(true);
                }}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <div className="mb-5 text-left">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Reset Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your registered student email and we'll dispatch reset instructions.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. alex@campus.edu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Send Reset Link</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setShowLoginModal(true);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
