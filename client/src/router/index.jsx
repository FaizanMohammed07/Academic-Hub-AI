import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// ── Layouts ─────────────────────────────────────────────────
const PublicLayout  = lazy(() => import('@modules/public/PublicLayout'));
const StudentLayout = lazy(() => import('@modules/student/StudentLayout'));
const FacultyLayout = lazy(() => import('@modules/faculty/FacultyLayout'));
const HODLayout     = lazy(() => import('@modules/hod/HODLayout'));
const AdminLayout   = lazy(() => import('@modules/admin/AdminLayout'));
const AuthLayout    = lazy(() => import('@modules/auth/AuthLayout'));

// ── Public pages ─────────────────────────────────────────────
const HomePage      = lazy(() => import('@modules/public/pages/HomePage'));

// ── Auth ──────────────────────────────────────────────────────
const LoginPage     = lazy(() => import('@modules/auth/pages/LoginPage'));

// ── Student ──────────────────────────────────────────────────
const StudentDashboard   = lazy(() => import('@modules/student/pages/Dashboard'));
const StudentAssignments = lazy(() => import('@modules/student/pages/AssignmentCenter'));
const StudentSubmission  = lazy(() => import('@modules/student/pages/SubmissionDetail'));
const StudentObservations= lazy(() => import('@modules/student/pages/Observations'));
const StudentNotebook    = lazy(() => import('@modules/student/pages/Notebook'));
const StudentVault       = lazy(() => import('@modules/student/pages/AcademicVault'));
const StudentPortfolio   = lazy(() => import('@modules/student/pages/Portfolio'));
const StudentTimetable   = lazy(() => import('@modules/student/pages/Timetable'));
const StudentCalendar    = lazy(() => import('@modules/student/pages/Calendar'));
const StudentCertificates= lazy(() => import('@modules/student/pages/Certificates'));

// ── Faculty ──────────────────────────────────────────────────
const FacultyDashboard   = lazy(() => import('@modules/faculty/pages/Dashboard'));
const FacultyAssignments = lazy(() => import('@modules/faculty/pages/Assignments'));
const FacultyCreateAssign= lazy(() => import('@modules/faculty/pages/CreateAssignment'));
const FacultyEvaluation  = lazy(() => import('@modules/faculty/pages/EvaluationWorkspace'));
const FacultyQuizzes     = lazy(() => import('@modules/faculty/pages/Quizzes'));
const FacultyAITools     = lazy(() => import('@modules/faculty/pages/AITools'));
const FacultyAnalytics   = lazy(() => import('@modules/faculty/pages/Analytics'));
const FacultyObservations= lazy(() => import('@modules/faculty/pages/Observations'));

// ── HOD ──────────────────────────────────────────────────────
const HODDashboard       = lazy(() => import('@modules/hod/pages/Dashboard'));
const HODFacultyMonitor  = lazy(() => import('@modules/hod/pages/FacultyMonitor'));
const HODAnalytics       = lazy(() => import('@modules/hod/pages/DepartmentAnalytics'));
const HODReports         = lazy(() => import('@modules/hod/pages/Reports'));
const HODNotices         = lazy(() => import('@modules/hod/pages/Notices'));

// ── Admin ────────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import('@modules/admin/pages/Dashboard'));
const AdminUsers         = lazy(() => import('@modules/admin/pages/UserManagement'));
const AdminSemesters     = lazy(() => import('@modules/admin/pages/Semesters'));
const AdminSubjects      = lazy(() => import('@modules/admin/pages/Subjects'));
const AdminCMS           = lazy(() => import('@modules/admin/pages/CMS'));
const AdminMedia         = lazy(() => import('@modules/admin/pages/MediaManager'));
const AdminAIConfig      = lazy(() => import('@modules/admin/pages/AIConfig'));
const AdminAudit         = lazy(() => import('@modules/admin/pages/AuditLogs'));
const AdminSystem        = lazy(() => import('@modules/admin/pages/SystemMonitor'));

const routes = [
  // ── Public website ─────────────────────────────────────────
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },

  // ── Auth ───────────────────────────────────────────────────
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },

  // ── Student panel ──────────────────────────────────────────
  {
    path: '/student',
    element: <ProtectedRoute><RoleRoute role="student"><StudentLayout /></RoleRoute></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <StudentDashboard /> },
      { path: 'assignments',   element: <StudentAssignments /> },
      { path: 'assignments/:id', element: <StudentSubmission /> },
      { path: 'observations',  element: <StudentObservations /> },
      { path: 'notebook',      element: <StudentNotebook /> },
      { path: 'vault',         element: <StudentVault /> },
      { path: 'portfolio',     element: <StudentPortfolio /> },
      { path: 'timetable',     element: <StudentTimetable /> },
      { path: 'calendar',      element: <StudentCalendar /> },
      { path: 'certificates',  element: <StudentCertificates /> },
    ],
  },

  // ── Faculty panel ──────────────────────────────────────────
  {
    path: '/faculty',
    element: <ProtectedRoute><RoleRoute role="faculty"><FacultyLayout /></RoleRoute></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <FacultyDashboard /> },
      { path: 'assignments',   element: <FacultyAssignments /> },
      { path: 'assignments/create', element: <FacultyCreateAssign /> },
      { path: 'assignments/:id/evaluate', element: <FacultyEvaluation /> },
      { path: 'observations',  element: <FacultyObservations /> },
      { path: 'quizzes',       element: <FacultyQuizzes /> },
      { path: 'ai-tools',      element: <FacultyAITools /> },
      { path: 'analytics',     element: <FacultyAnalytics /> },
    ],
  },

  // ── HOD panel ──────────────────────────────────────────────
  {
    path: '/hod',
    element: <ProtectedRoute><RoleRoute role="hod"><HODLayout /></RoleRoute></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',      element: <HODDashboard /> },
      { path: 'faculty-monitor',element: <HODFacultyMonitor /> },
      { path: 'analytics',      element: <HODAnalytics /> },
      { path: 'reports',        element: <HODReports /> },
      { path: 'notices',        element: <HODNotices /> },
    ],
  },

  // ── Admin panel ────────────────────────────────────────────
  {
    path: '/admin',
    element: <ProtectedRoute><RoleRoute role="admin"><AdminLayout /></RoleRoute></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',  element: <AdminDashboard /> },
      { path: 'users',      element: <AdminUsers /> },
      { path: 'semesters',  element: <AdminSemesters /> },
      { path: 'subjects',   element: <AdminSubjects /> },
      { path: 'cms',        element: <AdminCMS /> },
      { path: 'media',      element: <AdminMedia /> },
      { path: 'ai-config',  element: <AdminAIConfig /> },
      { path: 'audit',      element: <AdminAudit /> },
      { path: 'system',     element: <AdminSystem /> },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
