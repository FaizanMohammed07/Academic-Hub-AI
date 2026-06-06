import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, CalendarDays, MapPin, User, Inbox } from 'lucide-react';
import { studentAPI } from '@services/api';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

// Generate a stable pastel color from a string id
function subjectColor(id = '') {
  const colors = [
    { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800' },
    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
    { bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-800' },
    { bg: 'bg-rose-50 dark:bg-rose-900/20',    text: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-800' },
    { bg: 'bg-cyan-50 dark:bg-cyan-900/20',    text: 'text-cyan-700 dark:text-cyan-300',    border: 'border-cyan-200 dark:border-cyan-800' },
    { bg: 'bg-pink-50 dark:bg-pink-900/20',    text: 'text-pink-700 dark:text-pink-300',    border: 'border-pink-200 dark:border-pink-800' },
    { bg: 'bg-indigo-50 dark:bg-indigo-900/20',text: 'text-indigo-700 dark:text-indigo-300',border: 'border-indigo-200 dark:border-indigo-800' },
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

const TODAY_INDEX = new Date().getDay(); // 0=Sun, 1=Mon...

export default function Timetable() {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: () => studentAPI.getTimetable().then((r) => r.data.data),
  });

  // Build grid: grid[dayIndex][periodNumber] = slot
  const grid = useMemo(() => {
    const slots = Array.isArray(data) ? data : (data?.slots || data?.timetable || []);
    const g = {};
    DAYS.forEach((_, di) => {
      g[di] = {};
      PERIODS.forEach((p) => { g[di][p] = null; });
    });
    slots.forEach((slot) => {
      const dayIdx = typeof slot.day === 'number' ? slot.day - 1 : DAYS.findIndex(
        (d) => d.toLowerCase().startsWith((slot.day || '').toLowerCase().slice(0, 3))
      );
      if (dayIdx < 0 || dayIdx >= 6) return;
      const period = slot.period || slot.periodNumber;
      if (period >= 1 && period <= 8) g[dayIdx][period] = slot;
    });
    return g;
  }, [data]);

  const hasData = useMemo(() => {
    return DAYS.some((_, di) => PERIODS.some((p) => grid[di]?.[p] != null));
  }, [grid]);

  // Subject color map
  const colorMap = useMemo(() => {
    const slots = Array.isArray(data) ? data : (data?.slots || data?.timetable || []);
    const map = {};
    slots.forEach((slot) => {
      const sid = slot.subject?._id || slot.subject || slot.subjectId;
      if (sid && !map[sid]) map[sid] = subjectColor(sid);
    });
    return map;
  }, [data]);

  if (isLoading) return <TimetableSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Weekly Timetable</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your class schedule for the current semester
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg">
          <CalendarDays className="w-4 h-4" />
          {DAYS[TODAY_INDEX - 1] || 'Weekend'}
        </div>
      </motion.div>

      {!hasData ? (
        <motion.div variants={item} className="card p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
            <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">No timetable assigned yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your class schedule will appear here once it's been configured.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <th className="w-20 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-left">
                    Period
                  </th>
                  {DAYS.map((day, di) => {
                    const isToday = di === TODAY_INDEX - 1;
                    return (
                      <th
                        key={day}
                        className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-center ${
                          isToday
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div>{DAY_SHORT[di]}</div>
                        {isToday && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mx-auto mt-1" />
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {PERIODS.map((period) => (
                  <tr key={period} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">P{period}</span>
                      </div>
                    </td>
                    {DAYS.map((_, di) => {
                      const slot = grid[di]?.[period];
                      const isToday = di === TODAY_INDEX - 1;
                      const sid = slot?.subject?._id || slot?.subject || slot?.subjectId;
                      const color = sid ? colorMap[sid] : null;
                      return (
                        <td
                          key={di}
                          className={`px-2 py-2 text-center ${
                            isToday ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''
                          }`}
                        >
                          {slot ? (
                            <div className={`rounded-lg p-2 border ${color?.bg} ${color?.border} text-left`}>
                              <p className={`text-xs font-semibold leading-tight truncate ${color?.text}`}>
                                {slot.subject?.shortName || slot.subject?.name || slot.subjectName || '—'}
                              </p>
                              {(slot.faculty?.fullName || slot.facultyName) && (
                                <div className={`flex items-center gap-1 mt-1 ${color?.text} opacity-70`}>
                                  <User className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="text-[10px] truncate">
                                    {slot.faculty?.fullName || slot.facultyName}
                                  </span>
                                </div>
                              )}
                              {(slot.room || slot.roomNumber) && (
                                <div className={`flex items-center gap-1 mt-0.5 ${color?.text} opacity-70`}>
                                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="text-[10px] truncate">{slot.room || slot.roomNumber}</span>
                                </div>
                              )}
                              {slot.time && (
                                <div className={`flex items-center gap-1 mt-0.5 ${color?.text} opacity-70`}>
                                  <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="text-[10px]">{slot.time}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full min-h-[56px] flex items-center justify-center">
                              <span className="text-gray-200 dark:text-zinc-700 text-xs">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {hasData && (
        <motion.div variants={item} className="flex flex-wrap gap-2">
          {Object.entries(colorMap).map(([sid, color]) => {
            const slots = (Array.isArray(data) ? data : (data?.slots || data?.timetable || []));
            const slot = slots.find((s) => (s.subject?._id || s.subject || s.subjectId) === sid);
            const name = slot?.subject?.shortName || slot?.subject?.name || slot?.subjectName || sid;
            return (
              <div key={sid} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${color.bg} ${color.border}`}>
                <div className={`w-2 h-2 rounded-full ${color.text.replace('text-', 'bg-').split(' ')[0]}`} />
                <span className={`text-xs font-medium ${color.text}`}>{name}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

function TimetableSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-[480px] bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  );
}
