import { useQuery } from '@tanstack/react-query';
import { hodAPI, noticeAPI } from '@services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@shared/hooks/useAuth';
import {
  GraduationCap, Users, TrendingUp, ClipboardCheck,
  Megaphone, BarChart3, FileText, Star
} from 'lucide-react';
import { format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

export default function HODDashboard() {
  const user     = useCurrentUser();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['hod', 'dashboard'],
    queryFn:  () => hodAPI.getDashboard().then((r) => r.data.data),
  });

  const { data: noticesData } = useQuery({
    queryKey: ['notices', 'recent'],
    queryFn:  () => noticeAPI.getAll({ limit: 3, status: 'published' }).then((r) => r.data),
  });
  const recentNotices = noticesData?.data || [];

  if (isLoading) return <HODSkeleton />;

  const {
    totalStudents   = 0,
    totalFaculty    = 0,
    submissionRate  = 0,
    pendingEvals    = 0,
    facultyActivity = [],
    topStudents     = [],
  } = data || {};

  const stats = [
    { label: 'Total Students',       value: totalStudents,                  icon: GraduationCap, color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Total Faculty',         value: totalFaculty,                   icon: Users,          color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Submission Rate',       value: `${submissionRate}%`,           icon: TrendingUp,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Evaluations',   value: pendingEvals,                   icon: ClipboardCheck, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const quickActions = [
    { label: 'Post Notice',      icon: Megaphone, action: () => navigate('/hod/notices?action=post'), color: 'bg-brand-500 hover:bg-brand-600' },
    { label: 'View Analytics',   icon: BarChart3,  action: () => navigate('/hod/analytics'),           color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'Faculty Report',   icon: FileText,   action: () => navigate('/hod/reports'),             color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Faculty Monitor',  icon: Users,      action: () => navigate('/hod/faculty-monitor'),     color: 'bg-amber-500 hover:bg-amber-600' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item}>
        <h1 className="page-title">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Department overview for IT Department</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <button key={label} onClick={action}
              className={`${color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Faculty Activity */}
        <motion.div variants={item} className="lg:col-span-2 card p-6">
          <h2 className="section-title mb-4">Faculty Activity</h2>
          {facultyActivity.length === 0 ? (
            <div className="py-8 text-center text-gray-400 dark:text-gray-600">No faculty data available</div>
          ) : (
            <div className="space-y-4">
              {facultyActivity.map((f) => {
                const rate = f.evaluationRate ?? 0;
                const rateColor = rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={f._id || f.facultyId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{f.fullName || f.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {f.subjectsCount ?? 0} subjects · {f.assignmentsCount ?? 0} assignments
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${rate >= 80 ? 'text-emerald-500' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full ${rateColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Top Students */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="section-title">Top Students</h2>
          </div>
          {topStudents.length === 0 ? (
            <div className="py-6 text-center text-gray-400 dark:text-gray-600 text-sm">No data available</div>
          ) : (
            <div className="space-y-3">
              {topStudents.slice(0, 5).map((s, idx) => (
                <div key={s._id || idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.fullName || s.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.loginId || s.rollNo}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{s.avgMarks ?? 0}%</div>
                    <div className="text-xs text-gray-400">{s.grade || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Notices */}
      {recentNotices.length > 0 && (
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Notices</h2>
            <button onClick={() => navigate('/hod/notices')} className="text-sm text-brand-500 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {recentNotices.map((n) => (
              <div key={n._id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.type === 'urgent' ? 'bg-red-500' : n.type === 'academic' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {n.publishedAt ? format(new Date(n.publishedAt), 'MMM d, yyyy') : ''}
                  </div>
                </div>
                <NoticeTypeBadge type={n.type} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const NoticeTypeBadge = ({ type }) => {
  const map = { urgent: 'badge-red', academic: 'badge-blue', event: 'badge-brand', general: 'badge-amber' };
  return <span className={map[type] || 'badge-amber'}>{type}</span>;
};

const HODSkeleton = () => (
  <div className="space-y-6 animate-pulse max-w-7xl">
    <div className="h-8 w-56 bg-gray-200 dark:bg-zinc-800 rounded" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
    </div>
    <div className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  </div>
);
