import { useQuery } from '@tanstack/react-query';
import { facultyAPI, assignmentAPI } from '@services/api';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, ClipboardList, Clock, TrendingUp,
  ChevronRight, Plus, FlaskConical, Sparkles, LayoutDashboard,
} from 'lucide-react';
import { useCurrentUser } from '@shared/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

export default function FacultyDashboard() {
  const user     = useCurrentUser();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn:  () => facultyAPI.getDashboard().then((r) => r.data.data),
  });

  if (isLoading) return <DashboardSkeleton />;

  const {
    subjectsCount      = 0,
    totalStudents      = 0,
    pendingEvaluations = 0,
    assignmentsCreated = 0,
    recentSubmissions  = [],
    subjects           = [],
  } = data || {};

  const STATS = [
    { label: 'My Subjects',        value: subjectsCount,      icon: BookOpen,      color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Total Students',     value: totalStudents,      icon: Users,         color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Evaluations',value: pendingEvaluations, icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Assignments Created',value: assignmentsCreated, icon: ClipboardList, color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const QUICK = [
    { label: 'Create Assignment',    to: '/faculty/assignments/create', icon: Plus,        color: 'bg-brand-500' },
    { label: 'Record Observation',   to: '/faculty/observations',       icon: FlaskConical, color: 'bg-emerald-500' },
    { label: 'Generate Questions',   to: '/faculty/ai-tools',           icon: Sparkles,    color: 'bg-purple-500' },
  ];

  const typeColors = {
    theory:      'badge-blue',
    lab:         'badge-green',
    tutorial:    'badge-amber',
    'mini-project': 'badge-brand',
    elective:    'badge-red',
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="page-title">
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's your teaching overview for today.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent submissions needing evaluation */}
        <motion.div variants={item} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Pending Evaluations</h2>
            <Link to="/faculty/assignments" className="text-sm text-brand-500 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubmissions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="w-8 h-8 text-gray-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-600">All caught up! No pending evaluations.</p>
              </div>
            )}
            {recentSubmissions.map((sub) => (
              <div
                key={sub._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-600 dark:text-brand-400 text-xs font-bold">
                      {sub.studentName?.[0] || 'S'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {sub.studentName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {sub.assignmentTitle} &bull;{' '}
                      {sub.submittedAt
                        ? formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })
                        : '—'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/faculty/assignments/${sub.assignmentId}/evaluate?submissionId=${sub._id}`
                    )
                  }
                  className="btn-secondary btn-sm flex-shrink-0 ml-2"
                >
                  Evaluate
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={item} className="space-y-4">
          <div className="card p-5">
            <h2 className="section-title mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {QUICK.map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1">
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* My Subjects grid */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">My Subjects</h2>
          <Link to="/faculty/analytics" className="text-sm text-brand-500 hover:underline font-medium">
            View Analytics
          </Link>
        </div>
        {subjects.length === 0 ? (
          <div className="card p-10 flex flex-col items-center justify-center text-center">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-600">No subjects assigned for the current semester.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub._id} className="card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-0.5">{sub.code}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{sub.name}</h3>
                  </div>
                  <span className={typeColors[sub.type] || 'badge-blue'}>
                    {sub.type || 'Theory'}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{sub.assignmentCount ?? 0} assignments</span>
                  <span className="text-amber-500">{sub.pendingEvaluations ?? 0} pending</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/faculty/assignments/create?subjectId=${sub._id}`}
                    className="btn-secondary btn-sm flex-1 justify-center"
                  >
                    <Plus className="w-3 h-3" /> Assign
                  </Link>
                  <Link
                    to={`/faculty/assignments?subjectId=${sub._id}`}
                    className="btn-ghost btn-sm flex-1 justify-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-48 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
