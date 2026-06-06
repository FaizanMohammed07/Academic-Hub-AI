import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Server, Database, Cpu, HardDrive,
  Users, GraduationCap, BookOpen, Bell, ClipboardList, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

export default function SystemMonitor() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['platform', 'analytics'],
    queryFn:  () => adminAPI.getPlatformAnalytics().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <SystemSkeleton />;

  const {
    userStats = {},
    platformStats = {},
    activityChart = [],
    systemStatus = {},
  } = data || {};

  const userBreakdown = [
    { label: 'Students',  value: userStats.students  || 0, color: 'bg-brand-500',   icon: GraduationCap },
    { label: 'Faculty',   value: userStats.faculty    || 0, color: 'bg-purple-500',  icon: Users },
    { label: 'HOD',       value: userStats.hod        || 0, color: 'bg-amber-500',   icon: Users },
    { label: 'Admins',    value: userStats.admins     || 0, color: 'bg-rose-500',    icon: Users },
  ];
  const total = userBreakdown.reduce((s, x) => s + x.value, 0) || 1;

  const systemCards = [
    { label: 'API Status',    status: systemStatus.api    !== false, icon: Server },
    { label: 'Database',      status: systemStatus.db     !== false, icon: Database },
    { label: 'AI Service',    status: systemStatus.ai     !== false, icon: Cpu },
    { label: 'S3 Storage',    status: systemStatus.s3     !== false, icon: HardDrive },
  ];

  const platformCards = [
    { label: 'Assignments',    value: platformStats.assignments    || 0, icon: ClipboardList, color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Evaluations',    value: platformStats.evaluations    || 0, icon: Activity,       color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Notifications',  value: platformStats.notifications  || 0, icon: Bell,           color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'AI Analyses',    value: platformStats.aiAnalyses     || 0, icon: Cpu,            color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const quickLinks = [
    { label: 'User Management', path: '/admin/users' },
    { label: 'Audit Logs',      path: '/admin/audit' },
    { label: 'AI Config',       path: '/admin/ai-config' },
    { label: 'Website CMS',     path: '/admin/cms' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item}>
        <h1 className="page-title">System Monitor</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time platform health — auto-refreshes every 30s</p>
      </motion.div>

      {/* System Status */}
      <motion.div variants={item}>
        <h2 className="section-title mb-3">System Status</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemCards.map(({ label, status, icon: Icon }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <Icon className={`w-5 h-5 ${status ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                <div className={`text-xs font-medium ${status ? 'text-emerald-500' : 'text-red-500'}`}>
                  {status ? 'Operational' : 'Down'}
                </div>
              </div>
              <div className={`ml-auto w-2.5 h-2.5 rounded-full ${status ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platform Stats */}
      <motion.div variants={item}>
        <h2 className="section-title mb-3">Platform Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="stat-value">{value.toLocaleString()}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* User Breakdown */}
      <motion.div variants={item} className="card p-6">
        <h2 className="section-title mb-5">Users by Role</h2>
        <div className="space-y-4">
          {userBreakdown.map(({ label, value, color, icon: Icon }) => {
            const pct = Math.round((value / total) * 100);
            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Activity Chart */}
      {activityChart.length > 0 && (
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-4">Submission Activity — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={activityChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-zinc-800" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-zinc-900)', border: 'none', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(var(--color-brand-500), 0.05)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div variants={item} className="card p-6">
        <h2 className="section-title mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const SystemSkeleton = () => (
  <div className="space-y-6 animate-pulse max-w-7xl">
    <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
    </div>
    <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
  </div>
);
