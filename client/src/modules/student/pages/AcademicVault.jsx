import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Award, FileCheck, TrendingUp, Star, Trophy,
  X, Copy, CheckCheck, Download, Inbox, BarChart2,
} from 'lucide-react';
import { vaultAPI } from '@services/api';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const CERT_ICON_MAP = {
  course_completion: Award,
  achievement:       Trophy,
  participation:     Star,
  excellence:        Star,
  default:           FileCheck,
};

export default function AcademicVault() {
  const [verifyModal, setVerifyModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'vault'],
    queryFn: () => vaultAPI.getSummary().then((r) => r.data.data),
  });

  const certificates = data?.certificates || [];
  const submissionStats = data?.submissionStats || [];
  const achievements = data?.achievements || [];
  const stats = data?.stats || {};

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <VaultSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="page-title">Academic Vault</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Your academic portfolio, certificates, and performance history
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Certificates',      value: certificates.length,          icon: Award,     color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Total Submissions', value: stats.totalSubmissions ?? 0,  icon: FileCheck,  color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Average Marks',     value: stats.avgMarks != null ? `${stats.avgMarks}%` : '—', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Achievements',      value: achievements.length,          icon: Trophy,    color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
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

      {/* Certificates */}
      <motion.div variants={item} className="card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" /> Certificates
        </h2>
        {certificates.length === 0 ? (
          <EmptySection message="No certificates earned yet. Keep up the great work!" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => {
              const Icon = CERT_ICON_MAP[cert.type] || CERT_ICON_MAP.default;
              return (
                <div key={cert._id} className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="badge-amber capitalize">{cert.type?.replace(/_/g, ' ') || 'Certificate'}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{cert.title}</h3>
                  {cert.issuedBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">By {cert.issuedBy}</p>
                  )}
                  {cert.issueDate && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {format(new Date(cert.issueDate), 'MMM d, yyyy')}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setVerifyModal(cert)}
                      className="btn-secondary btn-sm flex-1"
                    >
                      Verify
                    </button>
                    {cert.fileUrl && (
                      <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-violet-500" /> Achievements
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((ach, i) => (
              <div key={ach._id || i} className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-800/30 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-violet-800 dark:text-violet-300 truncate">
                    {ach.title || ach.name}
                  </p>
                  {ach.description && (
                    <p className="text-xs text-violet-600 dark:text-violet-400/80 line-clamp-1">{ach.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Submission History Chart */}
      {submissionStats.length > 0 && (
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" /> Submission Performance
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionStats} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-zinc-800" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  className="text-gray-500 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  className="text-gray-500 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--tooltip-bg, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="avgMarks" name="Avg Marks %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="submissions" name="Submissions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Verify Modal */}
      <AnimatePresence>
        {verifyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
              onClick={() => setVerifyModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="card p-6 w-full max-w-sm pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title">Certificate Verification</h3>
                  <button onClick={() => setVerifyModal(null)} className="btn-icon btn-ghost">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto">
                    <Award className="w-7 h-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{verifyModal.title}</p>
                    {verifyModal.issuedBy && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Issued by {verifyModal.issuedBy}</p>
                    )}
                  </div>
                  {verifyModal.verificationCode && (
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Verification Code</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono font-bold text-gray-900 dark:text-white tracking-widest">
                          {verifyModal.verificationCode}
                        </code>
                        <button
                          onClick={() => copyCode(verifyModal.verificationCode)}
                          className="btn-icon btn-ghost text-brand-500"
                        >
                          {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptySection({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

function VaultSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  );
}
