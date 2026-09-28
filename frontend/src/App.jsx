import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Dashboard
import Dashboard from './pages/Dashboard';

// Study Module
import NotesPage from './pages/study/NotesPage';
import TasksPage from './pages/study/TasksPage';
import ExamsPage from './pages/study/ExamsPage';
import TimetablePage from './pages/study/TimetablePage';

// Career Module
import ResumeBuilderPage from './pages/career/ResumeBuilderPage';
import SkillsPage from './pages/career/SkillsPage';
import JobsPage from './pages/career/JobsPage';

// Campus Module
import EventsPage from './pages/campus/EventsPage';
import ClubsPage from './pages/campus/ClubsPage';
import NoticesPage from './pages/campus/NoticesPage';
import BusSchedulePage from './pages/campus/BusSchedulePage';

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected App Routes under DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 1. Study Module */}
        <Route path="/study/notes" element={<NotesPage />} />
        <Route path="/study/tasks" element={<TasksPage />} />
        <Route path="/study/exams" element={<ExamsPage />} />
        <Route path="/study/timetable" element={<TimetablePage />} />

        {/* 2. Career Module */}
        <Route path="/career/resume" element={<ResumeBuilderPage />} />
        <Route path="/career/skills" element={<SkillsPage />} />
        <Route path="/career/jobs" element={<JobsPage />} />

        {/* 3. Campus Module */}
        <Route path="/campus/events" element={<EventsPage />} />
        <Route path="/campus/clubs" element={<ClubsPage />} />
        <Route path="/campus/notices" element={<NoticesPage />} />
        <Route path="/campus/bus" element={<BusSchedulePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
