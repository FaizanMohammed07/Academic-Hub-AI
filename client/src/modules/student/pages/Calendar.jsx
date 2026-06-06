import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, ClipboardList,
  Bell, Clock, Inbox,
} from 'lucide-react';
import { studentAPI, notificationAPI } from '@services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, isPast } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AcademicCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Assignments (due dates)
  const { data: assignmentsData } = useQuery({
    queryKey: ['student', 'assignments', 'calendar'],
    queryFn: () => studentAPI.getAssignments().then((r) => r.data.data),
  });

  // Notices / notifications
  const { data: noticesData } = useQuery({
    queryKey: ['student', 'notifications', 'calendar'],
    queryFn: () => notificationAPI.getAll({ limit: 50 }).then((r) => r.data.data),
  });

  const assignments = useMemo(() => {
    const raw = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.assignments || []);
    return raw.filter((a) => a.deadline);
  }, [assignmentsData]);

  const notices = useMemo(() => {
    const raw = Array.isArray(noticesData) ? noticesData : (noticesData?.notifications || []);
    return raw.filter((n) => n.createdAt);
  }, [noticesData]);

  // Build a map: dateString -> { assignments, notices }
  const eventMap = useMemo(() => {
    const map = {};
    assignments.forEach((a) => {
      const key = format(new Date(a.deadline), 'yyyy-MM-dd');
      if (!map[key]) map[key] = { assignments: [], notices: [] };
      map[key].assignments.push(a);
    });
    notices.forEach((n) => {
      const key = format(new Date(n.createdAt), 'yyyy-MM-dd');
      if (!map[key]) map[key] = { assignments: [], notices: [] };
      map[key].notices.push(n);
    });
    return map;
  }, [assignments, notices]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate));
    const end = endOfWeek(endOfMonth(viewDate));
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  // Events for selected date
  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEvents = eventMap[selectedKey] || { assignments: [], notices: [] };

  // Upcoming events (next 7 days)
  const upcomingAssignments = useMemo(() => {
    const now = new Date();
    const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return assignments
      .filter((a) => {
        const d = new Date(a.deadline);
        return d >= now && d <= inAWeek;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [assignments]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item}>
        <h1 className="page-title">Academic Calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Assignment deadlines and academic notices at a glance
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div variants={item} className="lg:col-span-2 card p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{format(viewDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="btn-icon btn-ghost">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewDate(new Date()); setSelectedDate(new Date()); }}
                className="btn-ghost text-xs px-3 py-1.5 rounded-lg"
              >
                Today
              </button>
              <button onClick={nextMonth} className="btn-icon btn-ghost">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {DOW.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const events = eventMap[key];
              const inMonth = isSameMonth(day, viewDate);
              const selected = isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center py-1.5 px-1 rounded-xl transition-colors ${
                    selected
                      ? 'bg-brand-500 text-white'
                      : today
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                      : inMonth
                      ? 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                      : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className={`text-sm font-medium leading-none ${today && !selected ? 'font-bold' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {/* Event dots */}
                  {events && (
                    <div className="flex gap-0.5 mt-1">
                      {events.assignments.length > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/80' : 'bg-red-400'}`} />
                      )}
                      {events.notices.length > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/60' : 'bg-blue-400'}`} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Assignment due</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Notice</span>
            </div>
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.div variants={item} className="space-y-4">
          {/* Selected date events */}
          <div className="card p-5">
            <h3 className="section-title mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand-500" />
              {format(selectedDate, 'MMM d, yyyy')}
            </h3>

            {selectedEvents.assignments.length === 0 && selectedEvents.notices.length === 0 ? (
              <div className="text-center py-6">
                <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Nothing on this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEvents.assignments.map((a) => (
                  <div key={a._id} className="flex items-start gap-2.5 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <ClipboardList className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 truncate">{a.title}</p>
                      <p className="text-xs text-red-500 dark:text-red-400/80">{a.subject?.name}</p>
                    </div>
                  </div>
                ))}
                {selectedEvents.notices.map((n, i) => (
                  <div key={n._id || i} className="flex items-start gap-2.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 truncate">
                        {n.title || n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="card p-5">
            <h3 className="section-title mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Upcoming (7 days)
            </h3>
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-6">
                <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">No deadlines this week</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAssignments.map((a) => {
                  const due = new Date(a.deadline);
                  const isUrgent = (due - new Date()) < 48 * 60 * 60 * 1000;
                  return (
                    <div
                      key={a._id}
                      className={`p-3 rounded-lg border ${
                        isUrgent
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                          : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700'
                      }`}
                    >
                      <p className={`text-xs font-semibold truncate ${
                        isUrgent ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {a.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        isUrgent ? 'text-red-500 dark:text-red-400/80' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        Due {format(due, 'MMM d')} · {a.subject?.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
