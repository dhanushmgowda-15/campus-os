const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

class ApiService {
  getToken() {
    return localStorage.getItem('campus_os_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('campus_os_token', token);
    } else {
      localStorage.removeItem('campus_os_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // If not already on landing page, clear token
        if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
          this.setToken(null);
          window.dispatchEvent(new Event('campus_os_auth_expired'));
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.error || data.message || 'An error occurred');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== AUTH ====================
  async signup(data) {
    const res = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(data) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  logout() {
    this.setToken(null);
    return this.request('/auth/logout', { method: 'POST' }).catch(() => ({}));
  }

  // ==================== USER & SETTINGS ====================
  async updateSettings(settings) {
    return this.request('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount() {
    const res = await this.request('/user/account', { method: 'DELETE' });
    this.setToken(null);
    return res;
  }

  // ==================== STUDY MODULE ====================
  // Notes
  async getNotes(subject = '') {
    const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return this.request(`/study/notes${q}`);
  }

  async createNote(note) {
    return this.request('/study/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id, note) {
    return this.request(`/study/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id) {
    return this.request(`/study/notes/${id}`, { method: 'DELETE' });
  }

  // Tasks
  async getTasks(status = 'all') {
    return this.request(`/study/tasks?status=${status}`);
  }

  async createTask(task) {
    return this.request('/study/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id, task) {
    return this.request(`/study/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id) {
    return this.request(`/study/tasks/${id}`, { method: 'DELETE' });
  }

  // Exams
  async getExams() {
    return this.request('/study/exams');
  }

  async createExam(exam) {
    return this.request('/study/exams', {
      method: 'POST',
      body: JSON.stringify(exam),
    });
  }

  async toggleStudyPlanStep(examId, day, completed) {
    return this.request(`/study/exams/${examId}/plan-step`, {
      method: 'PATCH',
      body: JSON.stringify({ day, completed }),
    });
  }

  async deleteExam(id) {
    return this.request(`/study/exams/${id}`, { method: 'DELETE' });
  }

  // Timetable
  async getTimetable() {
    return this.request('/study/timetable');
  }

  async createTimetableSlot(slot) {
    return this.request('/study/timetable', {
      method: 'POST',
      body: JSON.stringify(slot),
    });
  }

  async deleteTimetableSlot(id) {
    return this.request(`/study/timetable/${id}`, { method: 'DELETE' });
  }

  // ==================== CAMPUS MODULE ====================
  async getEvents() {
    return this.request('/campus/events');
  }

  async toggleRsvp(eventId) {
    return this.request(`/campus/events/${eventId}/rsvp`, { method: 'POST' });
  }

  async getClubs() {
    return this.request('/campus/clubs');
  }

  async joinClub(clubId) {
    return this.request(`/campus/clubs/${clubId}/join`, { method: 'POST' });
  }

  async leaveClub(clubId) {
    return this.request(`/campus/clubs/${clubId}/leave`, { method: 'POST' });
  }

  async getNotices(category = '') {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/campus/notices${q}`);
  }

  async getBusRoutes(search = '') {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/campus/bus${q}`);
  }

  // ==================== CAREER MODULE ====================
  async getResume() {
    return this.request('/career/resume');
  }

  async updateResume(resumeData) {
    return this.request('/career/resume', {
      method: 'PUT',
      body: JSON.stringify(resumeData),
    });
  }

  getResumePdfUrl() {
    const token = this.getToken();
    return `${API_BASE_URL}/career/resume/download-pdf?token=${token}`;
  }

  async downloadResumePdfBlob() {
    const url = `${API_BASE_URL}/career/resume/download-pdf`;
    const token = this.getToken();
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    return res.blob();
  }

  async getSkills() {
    return this.request('/career/skills');
  }

  async createSkill(skill) {
    return this.request('/career/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  async deleteSkill(id) {
    return this.request(`/career/skills/${id}`, { method: 'DELETE' });
  }

  async getJobs(type = '') {
    const q = type ? `?type=${encodeURIComponent(type)}` : '';
    return this.request(`/career/jobs${q}`);
  }

  async toggleSaveJob(id) {
    return this.request(`/career/jobs/${id}/save`, { method: 'POST' });
  }

  async toggleApplyJob(id) {
    return this.request(`/career/jobs/${id}/apply`, { method: 'POST' });
  }

  // ==================== DASHBOARD ====================
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const api = new ApiService();
export default api;
