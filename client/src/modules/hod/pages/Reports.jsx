import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hodAPI, academicAPI } from '@services/api';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const GRADE_COLORS = {
  'A+': 'badge-green', A: 'badge-green', B: 'badge-blue',
  C: 'badge-amber', D: 'badge-amber', F: 'badge-red',
};

export default function Reports() {
  const [semesterId, setSemesterId] = useState('');

  const { data: semesters = [], isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', 'all'],
    queryFn:  () => academicAPI.getSemesters().then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['hod', 'assignment-stats', { semesterId }],
    queryFn:  () => hodAPI.getAssignmentStats({ semesterId }).then((r) => r.data.data),
  });

  const {
    summary       = {},
    assignments   = [],
    topStudents   = [],
    statusDistribution = [],
  } = data || {};

  const exportCsv = (tableData, filename) => {
    if (!tableData || tableData.length === 0) return;
    const keys = Object.keys(tableData[0]);
    const csv  = [keys, ...tableData.map((r) => keys.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: 'Total Assignments',  value: summary.totalAssignments  ?? 0, icon: ClipboardList,  color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Total Submissions',  value: summary.totalSubmissions  ?? 0, icon: TrendingUp,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Evaluated',          value: summary.evaluated          ?? 0, icon: CheckCircle,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending',            value: summary.pending            ?? 0, icon: Clock,          color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Overdue',            value: summary.overdue            ?? 0, icon: AlertTriangle,  color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assignment and student performance reports</p>
        </div>
        <button
          onClick={() => exportCsv(assignments, 'assignment-report')}
          disabled={!assignments.length}
          className="btn-secondary disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Download CSV
        </button>
      </motion.div>

      {/* Semester selector */}
      <motion.div variants={item} className="card p-4 flex items-center gap-4">
        <label className="label mb-0 flex-shrink-0">Semester:</label>
        <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} className="input max-w-xs" disabled={semsLoading}>
          <option value="">All Semesters</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>Sem {s.number} — {s.section}</option>
          ))}
        </select>
      </motion.div>

      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Status Pie */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-4">Assignment Status</h2>
              {statusDistribution.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                      {statusDistribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Top Students */}
            <motion.div variants={item} className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Student Performance</h2>
                <button onClick={() => exportCsv(topStudents, 'student-performance')} disabled={!topStudents.length} className="btn-secondary btn-sm disabled:opacity-50">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
              {topStudents.length === 0 ? (
                <div className="py-8 text-center text-gray-400 dark:text-gray-600">No student data available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-zinc-800">
                        {['Rank', 'Name', 'Roll', 'Submissions', 'Avg Marks', 'Grade'].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((s, idx) => (
                        <tr key={s._id || idx} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                          <td className="py-2 pr-4">
                            <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold
                              ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{s.fullName || s.name}</td>
                          <td className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{s.loginId || s.rollNo}</td>
                          <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{s.submissionsCount ?? 0}</td>
                          <td className="py-2 pr-4 font-semibold text-gray-900 dark:text-white">{s.avgMarks ?? 0}%</td>
                          <td className="py-2"><span className={GRADE_COLORS[s.grade] || 'badge-amber'}>{s.grade || '—'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* Assignments Table */}
          <motion.div variants={item} className="card p-6">
            <h2 className="section-title mb-4">Assignment Details</h2>
            {assignments.length === 0 ? (
              <div className="py-10 text-center text-gray-400 dark:text-gray-600">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                No assignments data
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                      {['Title', 'Subject', 'Type', 'Submissions', 'Eval Rate', 'Avg Marks'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => {
                      const evalRate = a.submissionsCount > 0
                        ? Math.round((a.evaluatedCount / a.submissionsCount) * 100)
                        : 0;
                      return (
                        <tr key={a._id} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.title}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.subject?.name || a.subjectName || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="badge-blue capitalize">{a.type || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {a.submissionsCount ?? 0} / {a.enrolledCount ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${evalRate >= 80 ? 'bg-emerald-500' : evalRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${evalRate}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{evalRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                            {a.avgMarks != null ? `${a.avgMarks}%` : '—'}
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
