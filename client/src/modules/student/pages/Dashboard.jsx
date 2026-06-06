import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '@services/api';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';
import { useCurrentUser } from '@shared/hooks/useAuth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function StudentDashboard() {
  const user = useCurrentUser();
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn:  () => studentAPI.getDashboard().then((r) => r.data.data),
  });

  if (isLoading) return <DashboardSkeleton />;

  const { pending = 0, submitted = 0, graded = 0, overdue = 0, recentAssignments = [], subjects = [] } = data || {};

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="page-title">
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's your academic overview for today.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending',   value: pending,   icon: ClipboardList, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Submitted', value: submitted, icon: CheckCircle,   color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Graded',    value: graded,    icon: TrendingUp,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Overdue',   value: overdue,   icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label} Assignments</div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent assignments */}
        <motion.div variants={item} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Assignments</h2>
            <Link to="/student/assignments" className="text-sm text-brand-500 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentAssignments.length === 0 && (
              <p className="text-gray-400 dark:text-gray-600 text-sm text-center py-8">No assignments yet</p>
            )}
            {recentAssignments.map((asn) => (
              <Link
                key={asn._id}
                to={`/student/assignments/${asn._id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-brand-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {asn.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Due {format(new Date(asn.deadline), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <StatusBadge status={asn.submissionStatus} />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Enrolled subjects */}
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-4">My Subjects</h2>
          <div className="space-y-2">
            {subjects.map((sub) => (
              <div key={sub._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {sub.shortName?.[0] || sub.name?.[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{sub.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{sub.code}</div>
                </div>
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No subjects enrolled</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const StatusBadge = ({ status }) => {
  const MAP = {
    submitted:       { label: 'Submitted', cls: 'badge-blue' },
    graded:          { label: 'Graded',    cls: 'badge-green' },
    rejected:        { label: 'Rejected',  cls: 'badge-red' },
    resubmit_requested: { label: 'Resubmit', cls: 'badge-amber' },
    pending:         { label: 'Pending',   cls: 'badge-amber' },
    overdue:         { label: 'Overdue',   cls: 'badge-red' },
  };
  const { label, cls } = MAP[status] || MAP.pending;
  return <span className={cls}>{label}</span>;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-800 rounded" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      ))}
    </div>
  </div>
);
