import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { facultyAPI } from '@services/api';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, TrendingUp, Users, BookOpen,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const GRADE_COLORS = {
  A: '#10b981', // emerald
  B: '#3b82f6', // blue
  C: '#f59e0b', // amber
  D: '#f97316', // orange
  F: '#ef4444', // red
};

export default function Analytics() {
  const [subjectId, setSubjectId] = useState('');

  const { data: subjects = [] } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data ?? r.data),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['faculty', 'stats', subjectId],
    queryFn:  () => facultyAPI.getStats(subjectId).then((r) => r.data.data ?? r.data),
    enabled: !!subjectId,
  });

  const gradeDistribution = stats?.gradeDistribution ?? [];
  const submissionRates   = stats?.submissionRates ?? [];
  const students          = stats?.students ?? [];

  const pieData = Object.entries(GRADE_COLORS).map(([grade]) => ({
    name: `Grade ${grade}`,
    value: gradeDistribution.find((g) => g.grade === grade)?.count ?? 0,
    grade,
  })).filter((d) => d.value > 0);

  const getGrade = (avg, max) => {
    if (!avg || !max) return '—';
    const pct = (avg / max) * 100;
    if (pct >= 85) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 55) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Subject performance insights and statistics
          </p>
        </div>
        <button className="btn-secondary opacity-50 cursor-not-allowed" disabled title="Export coming soon">
          <Download className="w-4 h-4" /> Export
        </button>
      </motion.div>

      {/* Subject selector */}
      <motion.div variants={item} className="card p-4">
        <label className="label">Select Subject to Analyze</label>
        <select
          className="input max-w-sm"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">Choose a subject...</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
          ))}
        </select>
      </motion.div>

      {!subjectId ? (
        <motion.div variants={item} className="card p-12 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Select a Subject</h3>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Choose a subject from the dropdown above to view its analytics.
          </p>
        </motion.div>
      ) : statsLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Grade Distribution Pie */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-4">Grade Distribution</h2>
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No graded submissions yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Submission Rate Bar Chart */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-4">Submission Rate per Assignment</h2>
              {submissionRates.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No assignments data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={submissionRates} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="submitted" name="Submitted" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="enrolled"  name="Enrolled"  fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Student performance table */}
          <motion.div variants={item} className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <h2 className="section-title">Student Performance</h2>
            </div>
            {students.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400 dark:text-gray-600">
                No student data available for this subject.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50">
                    <tr>
                      {['Student', 'Roll No.', 'Submissions', 'Avg Marks', 'Grade'].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {students.map((stu) => {
                      const grade = stu.grade || getGrade(stu.avgMarks, stats?.maxMarks || 100);
                      const gradeColor = {
                        A: 'text-emerald-500', B: 'text-blue-500',
                        C: 'text-amber-500',   D: 'text-orange-500', F: 'text-red-500',
                      }[grade] || 'text-gray-500';

                      return (
                        <tr key={stu._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">
                                {stu.studentName?.[0] || stu.fullName?.[0] || 'S'}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {stu.studentName || stu.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                            {stu.rollNumber || '—'}
                          </td>
                          <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                            {stu.submissionsCount ?? stu.submissions ?? 0}
                          </td>
                          <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                            {stu.avgMarks != null ? Number(stu.avgMarks).toFixed(1) : '—'}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`font-bold text-base ${gradeColor}`}>{grade}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-72 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      </div>
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  );
}
