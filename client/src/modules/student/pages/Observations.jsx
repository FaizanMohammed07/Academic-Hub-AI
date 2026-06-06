import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FlaskConical, CheckCircle, AlertCircle, Clock, Inbox,
  TrendingUp, BookOpen, Hash,
} from 'lucide-react';
import { studentAPI } from '@services/api';
import { format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const STATUS_MAP = {
  completed: { label: 'Completed', cls: 'badge-green', icon: CheckCircle },
  pending:   { label: 'Pending',   cls: 'badge-amber', icon: Clock },
  absent:    { label: 'Absent',    cls: 'badge-red',   icon: AlertCircle },
  evaluated: { label: 'Evaluated', cls: 'badge-green', icon: CheckCircle },
};

export default function Observations() {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'observations'],
    queryFn: () => studentAPI.getObservations().then((r) => r.data.data),
  });

  const observations = Array.isArray(data) ? data : (data?.observations || []);

  const grouped = useMemo(() => {
    const map = new Map();
    observations.forEach((obs) => {
      const subjectId = obs.subject?._id || obs.subject || 'unknown';
      const subjectName = obs.subject?.name || obs.subjectName || 'Unknown Subject';
      if (!map.has(subjectId)) map.set(subjectId, { name: subjectName, observations: [] });
      map.get(subjectId).observations.push(obs);
    });
    return Array.from(map.values());
  }, [observations]);

  const stats = useMemo(() => {
    const total = observations.length;
    const totalMarks = observations.reduce((sum, o) => sum + (o.marksObtained ?? 0), 0);
    const maxMarks = observations.reduce((sum, o) => sum + (o.maxMarks ?? 0), 0);
    const avg = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
    return { total, totalMarks, maxMarks, avg };
  }, [observations]);

  if (isLoading) return <ObservationSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item}>
        <h1 className="page-title">Lab Observations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Your lab experiment records across all subjects
        </p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Experiments', value: stats.total,      icon: FlaskConical, color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Marks Scored',      value: stats.totalMarks, icon: Hash,         color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Max Marks',         value: stats.maxMarks,   icon: TrendingUp,   color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Average %',         value: `${stats.avg}%`,  icon: BookOpen,     color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
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

      {observations.length === 0 ? (
        <motion.div variants={item}><EmptyState /></motion.div>
      ) : (
        grouped.map((group) => (
          <motion.div variants={item} key={group.name} className="card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <FlaskConical className="w-4 h-4 text-brand-500" />
              <h2 className="section-title">{group.name}</h2>
              <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
                {group.observations.length} experiment{group.observations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800">
                    {['Exp #', 'Title', 'Date', 'Marks', 'Status'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {group.observations.map((obs, idx) => {
                    const status = STATUS_MAP[obs.status] || STATUS_MAP.pending;
                    return (
                      <tr key={obs._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-xs font-semibold text-brand-600 dark:text-brand-400">
                            {obs.experimentNumber || idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {obs.title || obs.experimentTitle || '—'}
                          </p>
                          {obs.aim && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{obs.aim}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {obs.date ? format(new Date(obs.date), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {obs.marksObtained != null ? `${obs.marksObtained}/${obs.maxMarks ?? '?'}` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={status.cls}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
                    <td colSpan={3} className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Subject Total
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900 dark:text-white text-sm">
                      {group.observations.reduce((s, o) => s + (o.marksObtained ?? 0), 0)}/
                      {group.observations.reduce((s, o) => s + (o.maxMarks ?? 0), 0)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="card p-16 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
        <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No observations recorded</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Lab experiment records will appear here once your faculty adds them.
        </p>
      </div>
    </div>
  );
}

function ObservationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl">
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
