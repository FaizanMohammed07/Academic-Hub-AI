import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ClipboardList, Search, ChevronDown, Calendar, BookOpen,
  AlertCircle, CheckCircle, Clock, FileCheck, Inbox,
} from 'lucide-react';
import { studentAPI } from '@services/api';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const TABS = ['All', 'Pending', 'Submitted', 'Graded', 'Overdue'];

const STATUS_MAP = {
  pending:            { label: 'Pending',   cls: 'badge-amber', icon: Clock },
  submitted:          { label: 'Submitted', cls: 'badge-blue',  icon: FileCheck },
  graded:             { label: 'Graded',    cls: 'badge-green', icon: CheckCircle },
  approved:           { label: 'Approved',  cls: 'badge-green', icon: CheckCircle },
  rejected:           { label: 'Rejected',  cls: 'badge-red',   icon: AlertCircle },
  resubmit_requested: { label: 'Resubmit',  cls: 'badge-amber', icon: AlertCircle },
  overdue:            { label: 'Overdue',   cls: 'badge-red',   icon: AlertCircle },
};

const TYPE_MAP = {
  file_upload:  { label: 'File Upload', cls: 'badge-blue' },
  presentation: { label: 'Presentation', cls: 'badge-brand' },
  project:      { label: 'Project', cls: 'badge-amber' },
  viva:         { label: 'Viva', cls: 'badge-red' },
  quiz:         { label: 'Quiz', cls: 'badge-green' },
};

function resolveStatus(asn) {
  if (asn.submissionStatus && asn.submissionStatus !== 'pending') return asn.submissionStatus;
  if (asn.submissionStatus === 'pending' && isPast(new Date(asn.deadline))) return 'overdue';
  return asn.submissionStatus || 'pending';
}

export default function AssignmentCenter() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => studentAPI.getAssignments().then((r) => r.data.data),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['student', 'subjects'],
    queryFn: () => studentAPI.getSubjects().then((r) => r.data.data),
  });

  const assignments = useMemo(() => {
    const raw = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.assignments || []);
    return raw.map((a) => ({ ...a, resolvedStatus: resolveStatus(a) }));
  }, [assignmentsData]);

  const filtered = useMemo(() => {
    let list = assignments;
    if (activeTab !== 'All') {
      const tab = activeTab.toLowerCase();
      list = list.filter((a) => a.resolvedStatus === tab);
    }
    if (subjectFilter) {
      list = list.filter((a) => (a.subject?._id || a.subject) === subjectFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title?.toLowerCase().includes(q));
    }
    return list;
  }, [assignments, activeTab, subjectFilter, search]);

  if (isLoading) return <AssignmentSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Assignment Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track and manage all your assignments
          </p>
        </div>
      </motion.div>

      {/* Filters row */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Subject filter */}
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            className="input pl-9 pr-8 appearance-none min-w-[180px]"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Assignment cards */}
      <motion.div variants={item} className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((asn) => <AssignmentCard key={asn._id} asn={asn} />)
        )}
      </motion.div>
    </motion.div>
  );
}

function AssignmentCard({ asn }) {
  const status = STATUS_MAP[asn.resolvedStatus] || STATUS_MAP.pending;
  const type = TYPE_MAP[asn.type] || { label: asn.type || 'Assignment', cls: 'badge-blue' };
  const dueDate = asn.deadline ? new Date(asn.deadline) : null;
  const isOverdue = dueDate && isPast(dueDate) && asn.resolvedStatus === 'overdue';

  return (
    <Link
      to={`/student/assignments/${asn._id}`}
      className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group block"
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isOverdue
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-brand-50 dark:bg-brand-900/20'
        }`}>
          <ClipboardList className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-brand-500'}`} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
            {asn.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {asn.subject?.name || asn.subject?.code || 'Unknown Subject'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={type.cls}>{type.label}</span>
            <span className={status.cls}>{status.label}</span>
            {asn.maxMarks && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {asn.resolvedStatus === 'graded' && asn.marksObtained != null
                  ? `${asn.marksObtained}/${asn.maxMarks} marks`
                  : `Max ${asn.maxMarks} marks`}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0 ml-14 sm:ml-0">
        {dueDate && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            {format(dueDate, 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="card p-16 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
        <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No assignments found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Try changing the filters or check back later.
        </p>
      </div>
    </div>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
