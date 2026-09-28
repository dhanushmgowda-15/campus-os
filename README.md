# CampusOS – Digital Operating System for College Students

**CampusOS** is a modern full-stack web application designed as an all-in-one digital operating system for college students. It centralizes academic scheduling, lecture notes, exam revision plans, career preparation, and campus engagement into a unified, responsive interface.

---

## Tech Stack

- **Frontend**: React 19, Tailwind CSS v3, React Router v7, Lucide Icons, Recharts
- **Backend**: Python 3.14 Flask REST API
- **Database**: MongoDB (Service running on `localhost:27017`)
- **Authentication**: JWT-based Bearer authentication with Bcrypt password hashing
- **PDF Generation**: ReportLab for real-time resume PDF compilation

---

## Architecture & Modules

### 1. Landing Page & Authentication
- Clean landing page with feature highlights and responsive modal dialogs.
- **Sign Up**: Full Name, Email, Password, and Password Confirmation with validation checks.
- **Login**: Email and Password authentication with JWT issuance.
- **Quick Demo Login**: Instant one-click login as `alex@campus.edu`.
- **Forgot Password**: Password reset request dialog.
- Automatic routing & redirection for authenticated vs unauthenticated users.

### 2. Top Navbar & Settings Panel (⚙️)
- **Top Navbar**: Live date banner, notifications drawer, theme toggle, and settings gear.
- **Settings Panel** (Calls `PATCH /api/user/settings` and persists to MongoDB):
  1. **Profile**: Update student name, avatar selection, college, branch, and year of study.
  2. **Password**: Change password with old password verification and minimum 6-character enforcement.
  3. **Theme**: Light Mode vs Dark Mode toggle with instant interface preview.
  4. **Notifications**: Toggles for Task Reminders, Exam Alerts, and Event/Notice Updates.
  5. **Timetable Preferences**: Configure week start day (Monday/Sunday) and reminder lead time.
  6. **Privacy**: Profile visibility toggle for campus clubs and event rosters.
  7. **Account**: Secure logout and permanent account deletion with confirmation modal (cascades deletion across user documents).

### 3. Study Module
- **Notes & Cheatsheets**: Create, edit, delete rich notes, organize by subject, search, tag, and pin important cheatsheets to the top.
- **Tasks & To-Do**: Task list with priority indicators (High, Medium, Low), due dates, and one-click status toggles (Pending, In Progress, Completed).
- **Exams & Automated Study Plans**: Add upcoming exams to auto-generate a countdown timer and a custom day-by-day revision checklist with interactive completion tracking.
- **Weekly Timetable**: Interactive 6-day weekly grid (Monday–Saturday) showing start/end timings, subjects, classroom venues, and instructors.

### 4. Career Module
- **Resume Builder & PDF Export**: Sectioned resume editor (Personal Info, Education, Experience, Projects, Skills) with live formatted preview and one-click PDF export powered by ReportLab.
- **Skills Matrix**: Add and track technical skills, soft skills, tools, and languages with visual proficiency bars (Beginner, Intermediate, Advanced, Expert).
- **Jobs & Internships**: Opportunity board with filters (Internship vs Full-time), bookmarking (Save), and application tracking.

### 5. Campus Module
- **Events & Hackathons**: College events directory with dates, venues, organizing clubs, and interactive one-click RSVP counters.
- **Clubs & Societies**: Student clubs with member counts, leadership info, and instant Join/Leave toggles.
- **Official Notices**: Filterable announcement board with urgency tags (Urgent vs Normal) and category filters (Academic, Examination, Administrative, Placement).
- **Bus Schedule**: Transit timetable lookup with morning pickup and evening drop-off timings for all campus routes.

### 6. Dashboard
- **Summary Cards**: Pending Tasks, Upcoming Exams, Today's Classes, and Exam Prep Progress.
- **Charts**: Task Completion breakdown (Recharts Pie Chart) and study progress milestones.
- **Live Widgets**: Today's active lectures, upcoming exam countdowns, and latest campus announcements.
- **Notifications Bell**: Live alert drawer notifying students of imminent exams (within 7 days), urgent notices, and overdue assignments.

---

## Demo Credentials

- **Email**: `alex@campus.edu`
- **Password**: `password123`
*(Or create any new account via the Sign Up button — new accounts automatically receive pre-populated starter data)*

---

## Running the Application Locally

### 1. MongoDB
Ensure MongoDB is running locally on port `27017`.

### 2. Backend (Flask)
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate
# Run server
python run.py
```
Backend API will be live on `http://127.0.0.1:5000`.

### 3. Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Frontend will be accessible on `http://127.0.0.1:5173`.
