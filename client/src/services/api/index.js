import api from './apiClient';

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:         (data)  => api.post('/auth/login', data),
  refresh:       (data)  => api.post('/auth/refresh', data),
  logout:        (data)  => api.post('/auth/logout', data),
  forgotPassword:(data)  => api.post('/auth/forgot-password', data),
  resetPassword: (data)  => api.post('/auth/reset-password', data),
  getMe:         ()      => api.get('/auth/me'),
};

// ── Student ──────────────────────────────────────────────────
export const studentAPI = {
  getDashboard:    ()         => api.get('/students/dashboard'),
  getSubjects:     ()         => api.get('/students/subjects'),
  getAssignments:  (params)   => api.get('/students/assignments', { params }),
  getAssignment:   (id)       => api.get(`/students/assignments/${id}`),
  submitAssignment:(id, data) => api.post(`/students/assignments/${id}/submit`, data),
  getSubmissions:  (params)   => api.get('/students/submissions', { params }),
  getSubmission:   (id)       => api.get(`/students/submissions/${id}`),
  getObservations: ()         => api.get('/students/observations'),
  getTimetable:    ()         => api.get('/students/timetable'),
  getCalendar:     ()         => api.get('/students/calendar'),
  getVault:        (params)   => api.get('/students/vault', { params }),
  addVaultItem:    (data)     => api.post('/students/vault', data),
  deleteVaultItem: (id)       => api.delete(`/students/vault/${id}`),
  generatePortfolio: ()       => api.get('/students/portfolio/generate', { responseType: 'blob' }),
  getNotifications: (params)  => api.get('/students/notifications', { params }),
  markNotificationRead: (id)  => api.patch(`/students/notifications/${id}/read`),
};

// ── Faculty ──────────────────────────────────────────────────
export const facultyAPI = {
  getDashboard:     ()          => api.get('/faculty/dashboard'),
  getSubjects:      ()          => api.get('/faculty/subjects'),
  getStudents:      (params)    => api.get('/faculty/students', { params }),
  createAssignment: (data)      => api.post('/faculty/assignments', data),
  getAssignments:   (params)    => api.get('/faculty/assignments', { params }),
  getAssignment:    (id)        => api.get(`/faculty/assignments/${id}`),
  updateAssignment: (id, data)  => api.patch(`/faculty/assignments/${id}`, data),
  publishAssignment:(id)        => api.post(`/faculty/assignments/${id}/publish`),
  closeAssignment:  (id)        => api.post(`/faculty/assignments/${id}/close`),
  setTopicPool:     (id, data)  => api.post(`/faculty/assignments/${id}/topic-pool`, data),
  getSubmissions:   (id, p)     => api.get(`/faculty/assignments/${id}/submissions`, { params: p }),
  getSubmission:    (id)        => api.get(`/faculty/submissions/${id}`),
  evaluateSubmission:(id, data) => api.post(`/faculty/submissions/${id}/evaluate`, data),
  createObservation:(data)      => api.post('/faculty/observations', data),
  getObservations:  (params)    => api.get('/faculty/observations', { params }),
  createQuiz:       (data)      => api.post('/faculty/quizzes', data),
  getQuizzes:       (params)    => api.get('/faculty/quizzes', { params }),
  getAnalytics:     (params)    => api.get('/faculty/analytics/students', { params }),
  exportMarks:      (subjectId) => api.get(`/faculty/marks/export/${subjectId}`, { responseType: 'blob' }),
  sendBulkFeedback: (data)      => api.post('/faculty/bulk-feedback', data),
};

// ── AI ───────────────────────────────────────────────────────
export const aiAPI = {
  generateQuestions: (data) => api.post('/ai/generate-questions', data),
  getAnalysis:       (submissionId) => api.get(`/ai/analysis/${submissionId}`),
};

// ── HOD ──────────────────────────────────────────────────────
export const hodAPI = {
  getDashboard:      ()         => api.get('/hod/dashboard'),
  getFaculty:        (params)   => api.get('/hod/faculty', { params }),
  getFacultyAnalytics:(id)      => api.get(`/hod/faculty/${id}/analytics`),
  getDeptAnalytics:  (params)   => api.get('/hod/analytics/department', { params }),
  getStudentAnalytics:(params)  => api.get('/hod/analytics/students', { params }),
  getSemesterAnalytics:(params) => api.get('/hod/analytics/semester', { params }),
  publishNotice:     (data)     => api.post('/hod/notices', data),
  downloadReport:    (params)   => api.get('/hod/reports/performance', { params, responseType: 'blob' }),
};

// ── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  getUsers:         (params)   => api.get('/admin/users', { params }),
  createUser:       (data)     => api.post('/admin/users', data),
  updateUser:       (id, data) => api.patch(`/admin/users/${id}`, data),
  deactivateUser:   (id)       => api.delete(`/admin/users/${id}`),
  bulkImport:       (file)     => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/admin/users/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getSemesters:     ()         => api.get('/admin/semesters'),
  createSemester:   (data)     => api.post('/admin/semesters', data),
  activateSemester: (id)       => api.post(`/admin/semesters/${id}/activate`),
  getSubjects:      (params)   => api.get('/admin/subjects', { params }),
  createSubject:    (data)     => api.post('/admin/subjects', data),
  getAuditLogs:     (params)   => api.get('/admin/audit-logs', { params }),
  getSystemStats:   ()         => api.get('/admin/system/stats'),
  getAIConfig:      ()         => api.get('/admin/ai/config'),
  updateAIConfig:   (data)     => api.patch('/admin/ai/config', data),
};

// ── CMS ──────────────────────────────────────────────────────
export const cmsAPI = {
  getPublicSections: ()          => api.get('/cms/public'),
  getSections:       ()          => api.get('/cms/sections'),
  getSection:        (key)       => api.get(`/cms/sections/${key}`),
  updateSection:     (key, data) => api.put(`/cms/sections/${key}`, data),
  toggleVisibility:  (key)       => api.patch(`/cms/sections/${key}/visibility`),
};

// ── Media ────────────────────────────────────────────────────
export const mediaAPI = {
  getUploadUrl:  (params)  => api.get('/media/upload-url', { params }),
  registerMedia: (data)    => api.post('/media', data),
  getMedia:      (params)  => api.get('/media', { params }),
  getPublicMedia:(params)  => api.get('/media/public', { params }),
  deleteMedia:   (id)      => api.delete(`/media/${id}`),
};

// ── Notifications ────────────────────────────────────────────
export const notificationAPI = {
  getAll:       (params) => api.get('/notifications', { params }),
  markRead:     (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead:  ()       => api.patch('/notifications/read-all'),
  getUnreadCount: ()     => api.get('/notifications/unread-count'),
  delete:       (id)     => api.delete(`/notifications/${id}`),
};
