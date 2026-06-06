import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@services/api';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, BookOpen, ClipboardCheck,
  Upload, Bell, UserPlus, CalendarPlus, BookPlus,
  Megaphone, CheckCircle, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminAPI.getDashboardStats().then((r) => r.data.data),
  });

  if (isLoading) return <DashboardSkeleton />;

  const {
    totalStudents = 0,
    totalFaculty = 0,
    activeSubjects = 0,
    pendingEvaluations = 0,
    todaysSubmissions = 0,
    publishedNotices = 0,
    recentUsers = [],
    recentAssignments = [],
    recentSubmissions = [],
  } = data || {};

  const stats = [
    { label: 'Total Students',       value: totalStudents,       icon: GraduationCap, color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Total Faculty',         value: totalFaculty,         icon: Users,          color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Active Subjects',       value: activeSubjects,       icon: BookOpen,       color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Evaluations',   value: pendingEvaluations,   icon: ClipboardCheck, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: "Today's Submissions",   value: todaysSubmissions,    icon: Upload,         color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Published Notices',     value: publishedNotices,     icon: Bell,           color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  const quickActions = [
    { label: 'Add User',      icon: UserPlus,     action: () => navigate('/admin/users?action=add'),      color: 'bg-brand-500 hover:bg-brand-600' },
    { label: 'New Semester',  icon: CalendarPlus, action: () => navigate('/admin/semesters'),             color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'New Subject',   icon: BookPlus,     action: () => navigate('/admin/subjects'),              color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'Post Notice',   icon: Megaphone,    action: () => navigate('/hod/notices?action=post'),     color: 'bg-amber-500 hover:bg-amber-600' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform overview and quick actions.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="card p-6">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, action, color }) => (
            <button
              key={label}
              onClick={action}
              className={`${color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* System Health */}
      <motion.div variants={item} className="card p-6 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <Activity className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
        <span className="ml-auto text-xs text-gray-400">Last checked: {format(new Date(), 'HH:mm')}</span>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="grid lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 && <EmptyState message="No recent users" />}
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.fullName?.[0] || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.fullName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{u.role}</div>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Assignments</h2>
          <div className="space-y-3">
            {recentAssignments.length === 0 && <EmptyState message="No recent assignments" />}
            {recentAssignments.map((a) => (
              <div key={a._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {a.createdAt ? format(new Date(a.createdAt), 'MMM d') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {recentSubmissions.length === 0 && <EmptyState message="No recent submissions" />}
            {recentSubmissions.map((s) => (
              <div key={s._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {s.student?.fullName || 'Student'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {s.submittedAt ? format(new Date(s.submittedAt), 'MMM d, HH:mm') : ''}
                  </div>
                </div>
                <span className={s.status === 'graded' ? 'badge-green' : 'badge-blue'}>
                  {s.status || 'submitted'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const RoleBadge = ({ role }) => {
  const map = {
    student: 'badge-blue',
    faculty: 'badge-brand',
    hod: 'badge-amber',
    admin: 'badge-red',
  };
  return <span className={map[role] || 'badge-blue'}>{role}</span>;
};

const EmptyState = ({ message }) => (
  <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">{message}</p>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse max-w-7xl">
    <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      ))}
    </div>
    <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    <div className="grid lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      ))}
    </div>
  </div>
);
