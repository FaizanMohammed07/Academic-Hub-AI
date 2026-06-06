import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hodAPI, academicAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

const stagger = { visible: { transition: { staggerChildren: 0.05 } } };
const rowAnim = { hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.22 } } };

export default function FacultyMonitor() {
  const [semesterId, setSemesterId] = useState('');
  const [expanded, setExpanded]     = useState(null);
  const [sortKey, setSortKey]       = useState('fullName');
  const [sortDir, setSortDir]       = useState('asc');

  const { data: semesters = [], isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', 'all'],
    queryFn:  () => academicAPI.getSemesters().then((r) => r.data.data),
  });

  const { data: performance = [], isLoading } = useQuery({
    queryKey: ['hod', 'faculty-perf', { semesterId }],
    queryFn:  () => hodAPI.getFacultyPerformance({ semesterId }).then((r) => r.data.data),
    enabled:  true,
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...performance].sort((a, b) => {
    let va = a[sortKey] ?? 0;
    let vb = b[sortKey] ?? 0;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const rowColor = (rate) => {
    if (rate >= 80) return 'border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/5';
    if (rate >= 50) return 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/5';
    return 'border-l-red-500 bg-red-50/30 dark:bg-red-900/5';
  };

  const SortIcon = ({ col }) => (
    <button onClick={() => toggleSort(col)} className="inline-flex ml-1 opacity-50 hover:opacity-100">
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="page-title">Faculty Performance Monitor</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track faculty activity and evaluation metrics</p>
      </div>

      {/* Semester Selector */}
      <div className="card p-4 flex items-center gap-4">
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
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-zinc-800 rounded" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
            <p className="text-gray-400 dark:text-gray-600">No faculty performance data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Faculty Name <SortIcon col="fullName" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Subjects <SortIcon col="subjectsCount" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Assignments <SortIcon col="assignmentsCount" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Submissions <SortIcon col="submissionsReceived" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Evaluated <SortIcon col="evaluationsDone" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Eval Rate <SortIcon col="evaluationRate" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Avg Turnaround
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <motion.tbody variants={stagger} initial="hidden" animate="visible">
                {sorted.map((f) => {
                  const rate = f.evaluationRate ?? 0;
                  return (
                    <>
                      <motion.tr
                        key={f._id || f.facultyId}
                        variants={rowAnim}
                        className={`border-b border-gray-50 dark:border-zinc-800/50 border-l-2 cursor-pointer hover:brightness-95 transition-all ${rowColor(rate)}`}
                        onClick={() => setExpanded(expanded === (f._id || f.facultyId) ? null : (f._id || f.facultyId))}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(f.fullName || f.name)?.[0] || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{f.fullName || f.name}</div>
                              <div className="text-xs text-gray-400">{f.loginId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.subjectsCount ?? 0}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.assignmentsCount ?? 0}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.submissionsReceived ?? 0}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.evaluationsDone ?? 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${rate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {f.avgTurnaround ? `${f.avgTurnaround}h` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {expanded === (f._id || f.facultyId) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </motion.tr>

                      <AnimatePresence>
                        {expanded === (f._id || f.facultyId) && (
                          <motion.tr
                            key={`${f._id}-detail`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          >
                            <td colSpan={8} className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/20">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Per-Subject Breakdown</h4>
                              {(!f.subjectBreakdown || f.subjectBreakdown.length === 0) ? (
                                <p className="text-xs text-gray-400">No per-subject data available</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {f.subjectBreakdown.map((sub) => (
                                    <div key={sub._id || sub.subjectId} className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-gray-100 dark:border-zinc-700">
                                      <div className="font-medium text-sm text-gray-900 dark:text-white">{sub.subjectName || sub.name}</div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {sub.assignments ?? 0} assignments · {sub.submissions ?? 0} submissions · {sub.evaluated ?? 0} evaluated
                                      </div>
                                      <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${(sub.evalRate ?? 0) >= 80 ? 'bg-emerald-500' : (sub.evalRate ?? 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(sub.evalRate ?? 0, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500">{sub.evalRate ?? 0}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> &gt;= 80% (Good)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500" /> 50–79% (Average)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> &lt; 50% (Needs Attention)</div>
      </div>
    </div>
  );
}
