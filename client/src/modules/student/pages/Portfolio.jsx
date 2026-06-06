import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FolderOpen, TrendingUp, FileCheck, CheckCircle, BookOpen,
  Share2, Copy, CheckCheck, User, Hash, GraduationCap,
  BarChart2, Layers, Award,
} from 'lucide-react';
import { studentAPI, vaultAPI } from '@services/api';
import { useCurrentUser } from '@shared/hooks/useAuth';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Generate initials avatar text
function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// Derive skills from subjects
function deriveSkills(subjects = []) {
  const techSkills = {
    'Data Structures': ['Problem Solving', 'Algorithms', 'C++'],
    'Database':        ['SQL', 'Database Design', 'DBMS'],
    'Web':             ['HTML/CSS', 'JavaScript', 'React'],
    'Python':          ['Python', 'Scripting'],
    'Java':            ['Java', 'OOP'],
    'Networks':        ['Networking', 'TCP/IP'],
    'OS':              ['Operating Systems', 'Linux'],
    'AI':              ['Machine Learning', 'Python', 'Data Analysis'],
    'Cloud':           ['Cloud Computing', 'AWS'],
    'Software':        ['Software Engineering', 'SDLC'],
  };
  const skills = new Set();
  subjects.forEach((sub) => {
    const name = sub.name || '';
    Object.entries(techSkills).forEach(([key, vals]) => {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        vals.forEach((v) => skills.add(v));
      }
    });
  });
  // Always add basics
  ['Academic Writing', 'Critical Thinking', 'Teamwork'].forEach((s) => skills.add(s));
  return Array.from(skills).slice(0, 12);
}

export default function Portfolio() {
  const user = useCurrentUser();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const { data: vaultData, isLoading: vaultLoading } = useQuery({
    queryKey: ['student', 'vault', 'portfolio'],
    queryFn: () => vaultAPI.getSummary().then((r) => r.data.data),
  });

  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: () => studentAPI.getDashboard().then((r) => r.data.data),
  });

  const subjects = dashboardData?.subjects || [];
  const stats = {
    avgMarks:         vaultData?.stats?.avgMarks ?? dashboardData?.avgMarks ?? 0,
    totalSubmissions: vaultData?.stats?.totalSubmissions ?? (dashboardData?.submitted ?? 0) + (dashboardData?.graded ?? 0),
    graded:           dashboardData?.graded ?? 0,
    total:            (dashboardData?.submitted ?? 0) + (dashboardData?.graded ?? 0) + (dashboardData?.pending ?? 0),
    passRate:         vaultData?.stats?.passRate ?? 0,
  };
  const subjectStats = vaultData?.submissionStats || [];
  const skills = deriveSkills(subjects);

  const shareLink = `${window.location.origin}/portfolio/${user?.loginId}`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Portfolio link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const isLoading = vaultLoading || dashLoading;

  if (isLoading) return <PortfolioSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your academic profile and performance overview
          </p>
        </div>
        <button onClick={handleShare} className="btn-secondary">
          {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share Portfolio'}
        </button>
      </motion.div>

      {/* Profile card */}
      <motion.div variants={item} className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {initials(user?.fullName || 'ST')}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName || '—'}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {user?.loginId && (
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> {user.loginId}
                </div>
              )}
              {user?.semester && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Semester {user.semester}
                </div>
              )}
              {user?.section && (
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Section {user.section}
                </div>
              )}
              {user?.email && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {user.email}
                </div>
              )}
            </div>
          </div>

          {/* Share link */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
            <code className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {shareLink}
            </code>
            <button onClick={handleShare} className="btn-icon btn-ghost p-1 text-brand-500 flex-shrink-0">
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Performance stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Average Marks',      value: stats.avgMarks ? `${stats.avgMarks}%` : '—', icon: TrendingUp,  color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Total Submissions',  value: stats.totalSubmissions,                       icon: FileCheck,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Graded',             value: stats.graded,                                 icon: CheckCircle, color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pass Rate',          value: stats.passRate ? `${stats.passRate}%` : '—',  icon: Award,       color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject-wise performance */}
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" /> Subject Performance
          </h2>
          {subjectStats.length === 0 ? (
            subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.map((sub) => (
                  <div key={sub._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {sub.name}
                      </span>
                      <span className="text-xs text-gray-400">—</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                      <div className="bg-brand-400 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No subject data available.</p>
            )
          ) : (
            <div className="space-y-4">
              {subjectStats.map((s, i) => {
                const pct = Math.min(100, Math.round(s.avgMarks || 0));
                const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand-500' : 'bg-amber-500';
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {s.subject || s.subjectName}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`${color} h-2 rounded-full`}
                      />
                    </div>
                    {s.submissions != null && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.submissions} submissions</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Skills */}
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" /> Skills & Competencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="badge-brand">{skill}</span>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Enrolled Subjects</h3>
            <div className="space-y-2">
              {subjects.slice(0, 6).map((sub) => (
                <div key={sub._id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {sub.shortName?.[0] || sub.name?.[0] || 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{sub.name}</p>
                    {sub.code && <p className="text-xs text-gray-400 dark:text-gray-500">{sub.code}</p>}
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500">No subjects enrolled.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-36 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}
