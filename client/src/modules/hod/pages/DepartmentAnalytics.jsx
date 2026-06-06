import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hodAPI, academicAPI } from '@services/api';
import { motion } from 'framer-motion';
import { BarChart3, Download, Info } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const item    = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function DepartmentAnalytics() {
  const [semesterId, setSemesterId] = useState('');

  const { data: semesters = [], isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', 'all'],
    queryFn:  () => academicAPI.getSemesters().then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['hod', 'analytics', { semesterId }],
    queryFn:  () => hodAPI.getDeptAnalytics({ semesterId }).then((r) => r.data.data),
  });

  const {
    monthlySubmissions   = [],
    subjectSubmissionRates = [],
    assignmentTypeDistribution = [],
    topSubjectsByMarks   = [],
    summaryStats         = {},
  } = data || {};

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Department Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visual performance insights for the department</p>
        </div>
        <button disabled className="btn-secondary opacity-50 cursor-not-allowed" title="Export coming soon">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* Semester selector */}
      <motion.div variants={item} className="card p-4 flex items-center gap-4">
        <label className="label mb-0 flex-shrink-0">Semester:</label>
        <select
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          className="input max-w-xs"
          disabled={semsLoading}
        >
          <option value="">All Semesters</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>Sem {s.number} — {s.section}</option>
          ))}
        </select>
      </motion.div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => <div key={i} className="h-72 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Monthly Submission Volume */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-1">Monthly Submission Volume</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Submissions per month across all subjects</p>
              {monthlySubmissions.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlySubmissions} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-zinc-800" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: 8, fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Submissions" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Chart 2: Subject-wise Submission Rates */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-1">Subject-wise Submission Rates</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">% of students who submitted assignments</p>
              {subjectSubmissionRates.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectSubmissionRates} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-gray-100 dark:stroke-zinc-800" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
                    <YAxis dataKey="subjectCode" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={56} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v}%`, 'Rate']}
                    />
                    <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} name="Submission Rate" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Chart 3: Assignment Type Distribution */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-1">Assignment Type Distribution</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Breakdown by assignment type</p>
              {assignmentTypeDistribution.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={assignmentTypeDistribution}
                        dataKey="count"
                        nameKey="type"
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={3}
                      >
                        {assignmentTypeDistribution.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {assignmentTypeDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{entry.type}</span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-auto">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Chart 4: Top Subjects by Avg Marks */}
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-1">Top Subjects by Avg Marks</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Average marks per subject</p>
              {topSubjectsByMarks.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topSubjectsByMarks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-zinc-800" />
                    <XAxis dataKey="subjectCode" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v}%`, 'Avg Marks']}
                    />
                    <Bar dataKey="avgMarks" radius={[4, 4, 0, 0]} name="Avg Marks">
                      {topSubjectsByMarks.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Summary Stats */}
          {summaryStats && Object.keys(summaryStats).length > 0 && (
            <motion.div variants={item} className="card p-6">
              <h2 className="section-title mb-4">Summary Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(summaryStats).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{val}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

const EmptyChart = () => (
  <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
    <BarChart3 className="w-8 h-8" />
    <p className="text-sm">No data available for this period</p>
  </div>
);
