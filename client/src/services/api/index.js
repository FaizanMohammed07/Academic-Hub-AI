import api from './apiClient';

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  refresh:        (data) => api.post('/auth/refresh', data),
  logout:         (data) => api.post('/auth/logout', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.patch('/auth/me', data),
};

// ── Academic (admin manages these) ──────────────────────────
export const academicAPI = {
  // Academic Years
  getAcademicYears:     ()           => api.get('/academic/academic-years'),
  createAcademicYear:   (data)       => api.post('/academic/academic-years', data),
  setCurrentYear:       (id)         => api.patch(`/academic/academic-years/${id}/current`),
  // Semesters
  getSemesters:         (yearId)     => api.get('/academic/semesters', { params: { yearId } }),
  createSemester:       (data)       => api.post('/academic/semesters', data),
  setCurrentSemester:   (id)         => api.patch(`/academic/semesters/${id}/current`),
  getCurrentSemester:   ()           => api.get('/academic/semesters/current'),
  // Subjects
  getSubjects:          (semesterId) => api.get('/academic/subjects', { params: { semesterId } }),
  createSubject:        (data)       => api.post('/academic/subjects', data),
  updateSubject:        (id, data)   => api.patch(`/academic/subjects/${id}`, data),
  deleteSubject:        (id)         => api.delete(`/academic/subjects/${id}`),
  // Faculty assignments
  getFacultyMappings:   (semId)      => api.get('/academic/faculty-assignments', { params: { semesterId: semId } }),
  assignFaculty:        (data)       => api.post('/academic/faculty-assignments', data),
  removeFacultyMapping: (id)         => api.delete(`/academic/faculty-assignments/${id}`),
  // Enrollments
  enrollStudents:       (data)       => api.post('/academic/enrollments', data),
  unenrollStudent:      (id)         => api.delete(`/academic/enrollments/${id}`),
  getSemesterStudents:  (semId)      => api.get('/academic/enrollments', { params: { semesterId: semId } }),
  // Timetable
  saveTimetable:        (data)       => api.post('/timetable', data),
  getTimetable:         (p)          => api.get('/timetable', { params: p }),
  getStudentTimetable:  ()           => api.get('/timetable/student'),
  getFacultyTimetable:  ()           => api.get('/timetable/faculty'),
};

// ── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  getDashboardStats: ()           => api.get('/admin/dashboard-stats'),
  // Users
  getUsers:         (params)      => api.get('/admin/users', { params }),
  createUser:       (data)        => api.post('/admin/users', data),
  getUserById:      (id)          => api.get(`/admin/users/${id}`),
  updateUser:       (id, data)    => api.patch(`/admin/users/${id}`, data),
  resetPassword:    (id, data)    => api.patch(`/admin/users/${id}/password`, data),
  deleteUser:       (id)          => api.delete(`/admin/users/${id}`),
  // Settings
  getSettings:      ()            => api.get('/settings'),
  updateSetting:    (key, data)   => api.patch(`/settings/${key}`, data),
  // Audit logs
  getAuditLogs:     (params)      => api.get('/audit', { params }),
  // Platform analytics
  getPlatformAnalytics: ()        => api.get('/analytics/platform'),
};

// ── Students ─────────────────────────────────────────────────
export const studentAPI = {
  getDashboard:   ()        => api.get('/students/dashboard'),
  getSubjects:    ()        => api.get('/students/subjects'),
  getAssignments: (params)  => api.get('/students/assignments', { params }),
  getStats:       ()        => api.get('/students/stats'),
};

// ── Faculty ──────────────────────────────────────────────────
export const facultyAPI = {
  getDashboard:       ()         => api.get('/faculty/dashboard'),
  getMySubjects:      (semId)    => api.get('/faculty/subjects', { params: { semesterId: semId } }),
  getStats:           (subId)    => api.get('/faculty/stats', { params: { subjectId: subId } }),
  getSubjectStudents: (subId)    => api.get(`/faculty/subjects/${subId}/students`),
};

// ── Assignments ───────────────────────────────────────────────
export const assignmentAPI = {
  create:           (data)         => api.post('/assignments', data),
  getMyAssignments: (params)       => api.get('/assignments', { params }),
  getBySubject:     (subjectId)    => api.get(`/assignments/subject/${subjectId}`),
  getById:          (id)           => api.get(`/assignments/${id}`),
  update:           (id, data)     => api.patch(`/assignments/${id}`, data),
  delete:           (id)           => api.delete(`/assignments/${id}`),
  publish:          (id)           => api.patch(`/assignments/${id}/publish`),
  getSubmissions:   (id, params)   => api.get(`/assignments/${id}/submissions`, { params }),
};

// ── Submissions ───────────────────────────────────────────────
export const submissionAPI = {
  getUploadUrl:     (data)       => api.post('/submissions/upload-url', data),
  submit:           (data)       => api.post('/submissions', data),
  getMySubmissions: (params)     => api.get('/submissions', { params }),
  getById:          (id)         => api.get(`/submissions/${id}`),
  evaluate:         (id, data)   => api.patch(`/submissions/${id}/evaluate`, data),
};

// ── Observations ──────────────────────────────────────────────
export const observationAPI = {
  create:         (data)     => api.post('/observations', data),
  bulkCreate:     (data)     => api.post('/observations/bulk', data),
  getForFaculty:  (params)   => api.get('/observations', { params }),
  getForStudent:  ()         => api.get('/observations/my'),
  evaluate:       (id, data) => api.patch(`/observations/${id}/evaluate`, data),
};

// ── HOD ──────────────────────────────────────────────────────
export const hodAPI = {
  getDashboard:          ()  => api.get('/hod/dashboard'),
  getFacultyPerformance: (p) => api.get('/hod/faculty-performance', { params: p }),
  getStudentPerformance: (p) => api.get('/hod/student-performance', { params: p }),
  getDeptAnalytics:      (p) => api.get('/hod/analytics', { params: p }),
  getAssignmentStats:    (p) => api.get('/hod/assignment-stats', { params: p }),
};

// ── Notices ───────────────────────────────────────────────────
export const noticeAPI = {
  getAll:     (params)   => api.get('/notices', { params }),
  getById:    (id)       => api.get(`/notices/${id}`),
  create:     (data)     => api.post('/notices', data),
  update:     (id, data) => api.patch(`/notices/${id}`, data),
  publish:    (id)       => api.patch(`/notices/${id}/publish`),
  delete:     (id)       => api.delete(`/notices/${id}`),
};

// ── Notifications ─────────────────────────────────────────────
export const notificationAPI = {
  getAll:         (params) => api.get('/notifications', { params }),
  getUnreadCount: ()       => api.get('/notifications/unread-count'),
  markRead:       (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead:    ()       => api.patch('/notifications/read-all'),
};

// ── Quizzes ───────────────────────────────────────────────────
export const quizAPI = {
  create:            (data)     => api.post('/quizzes', data),
  getMyQuizzes:      (params)   => api.get('/quizzes', { params }),
  getStudentQuizzes: ()         => api.get('/quizzes/student'),
  getById:           (id)       => api.get(`/quizzes/${id}`),
  publish:           (id)       => api.patch(`/quizzes/${id}/publish`),
  submitAttempt:     (id, data) => api.post(`/quizzes/${id}/attempt`, data),
  getResults:        (id)       => api.get(`/quizzes/${id}/results`),
  getMyAttempt:      (id)       => api.get(`/quizzes/${id}/my-attempt`),
};

// ── AI ────────────────────────────────────────────────────────
export const aiAPI = {
  // Learning Assistant
  startConversation:    (data)     => api.post('/ai/conversations', data),
  getConversations:     (params)   => api.get('/ai/conversations', { params }),
  getConversation:      (id)       => api.get(`/ai/conversations/${id}`),
  sendMessage:          (id, data) => api.post(`/ai/conversations/${id}/message`, data),
  deleteConversation:   (id)       => api.delete(`/ai/conversations/${id}`),
  generateStudyMaterial:(data)     => api.post('/ai/study-material', data),
  // Faculty
  generateQuestions:    (data)     => api.post('/ai/generate-questions', data),
  getAnalysis:          (subId)    => api.get(`/ai/analysis/${subId}`),
};

// ── Vault ─────────────────────────────────────────────────────
export const vaultAPI = {
  getSummary:      ()     => api.get('/vault/summary'),
  getCertificates: ()     => api.get('/vault/certificates'),
  getById:         (id)   => api.get(`/vault/certificates/${id}`),
  verify:          (code) => api.get(`/vault/verify/${code}`),
  generate:        (data) => api.post('/vault/certificates', data),
};

// ── CMS (public + admin) ─────────────────────────────────────
export const cmsAPI = {
  // Public
  getPublicSections:    ()           => api.get('/cms/public'),
  getPublicGallery:     (params)     => api.get('/cms/public/gallery', { params }),
  getPublicVideos:      (params)     => api.get('/cms/public/videos', { params }),
  getPublicAchievements:(params)     => api.get('/cms/public/achievements', { params }),
  getPublicPlacements:  (params)     => api.get('/cms/public/placements', { params }),
  getPublicAlumni:      (params)     => api.get('/cms/public/alumni', { params }),
  getPublicEvents:      (params)     => api.get('/cms/public/events', { params }),
  // Admin CMS management
  upsertSection:        (key, data)  => api.post('/cms/sections', { sectionKey: key, ...data }),
  createGallery:        (data)       => api.post('/cms/gallery', data),
  updateGallery:        (id, data)   => api.patch(`/cms/gallery/${id}`, data),
  deleteGallery:        (id)         => api.delete(`/cms/gallery/${id}`),
  createVideo:          (data)       => api.post('/cms/videos', data),
  updateVideo:          (id, data)   => api.patch(`/cms/videos/${id}`, data),
  deleteVideo:          (id)         => api.delete(`/cms/videos/${id}`),
  createAchievement:    (data)       => api.post('/cms/achievements', data),
  updateAchievement:    (id, data)   => api.patch(`/cms/achievements/${id}`, data),
  deleteAchievement:    (id)         => api.delete(`/cms/achievements/${id}`),
  createPlacement:      (data)       => api.post('/cms/placements', data),
  updatePlacement:      (id, data)   => api.patch(`/cms/placements/${id}`, data),
  deletePlacement:      (id)         => api.delete(`/cms/placements/${id}`),
  createAlumni:         (data)       => api.post('/cms/alumni', data),
  updateAlumni:         (id, data)   => api.patch(`/cms/alumni/${id}`, data),
  deleteAlumni:         (id)         => api.delete(`/cms/alumni/${id}`),
  createEvent:          (data)       => api.post('/cms/events', data),
  updateEvent:          (id, data)   => api.patch(`/cms/events/${id}`, data),
  deleteEvent:          (id)         => api.delete(`/cms/events/${id}`),
};

// ── Media (S3) ────────────────────────────────────────────────
export const mediaAPI = {
  getUploadUrl:   (data) => api.post('/media/upload-url', data),
  getDownloadUrl: (data) => api.post('/media/download-url', data),
  deleteFile:     (data) => api.delete('/media/file', { data }),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  getPlatform: ()   => api.get('/analytics/platform'),
  getSemester: (id) => api.get(`/analytics/semester/${id}`),
  getSubject:  (id) => api.get(`/analytics/subject/${id}`),
};
