import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentAPI, facultyAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, Eye, Edit, Send,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_TABS = ['All', 'Draft', 'Published', 'Closed'];

const STATUS_BADGE = {
  draft:     'badge-amber',
  published: 'badge-green',
  closed:    'badge-red',
};

const TYPE_COLORS = {
  'Assignment 1':    'badge-blue',
  'Assignment 2':    'badge-brand',
  'Lab Observation': 'badge-green',
  Record:            'badge-amber',
  Tutorial:          'badge-blue',
  'Mini Project':    'badge-brand',
};

export default function Assignments() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const qc             = useQueryClient();
  const { toast }      = useToast();

  const [activeTab, setActiveTab]         = useState('All');
  const [searchTerm, setSearchTerm]       = useState('');
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get('subjectId') || '');

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['assignments', 'faculty'],
    queryFn:  () => assignmentAPI.getMyAssignments({}).then((r) => r.data),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => assignmentAPI.publish(id),
    onSuccess: () => {
      qc.invalidateQueries(['assignments', 'faculty']);
      toast({ title: 'Assignment published!', type: 'success' });
    },
    onError: () => toast({ title: 'Publish failed', type: 'error' }),
  });

  const assignments = rawData?.data ?? rawData ?? [];
  const subjects    = subjectsData ?? [];

  const filtered = assignments.filter((a) => {
    const matchTab = activeTab === 'All' || a.status?.toLowerCase() === activeTab.toLowerCase();
    const matchSub = !subjectFilter || a.subject?._id === subjectFilter || a.subjectId === subjectFilter;
    const matchSrc = !searchTerm || a.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSub && matchSrc;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage and evaluate student assignments
          </p>
        </div>
        <Link to="/faculty/assignments/create" className="btn-primary">
          <Plus className="w-4 h-4" /> Create Assignment
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {isLoading ? (
        <AssignmentsSkeleton />
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="card p-12 flex flex-col items-center justify-center text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No assignments found</h3>
          <p className="text-sm text-gray-400 dark:text-gray-600 mb-4">
            {activeTab !== 'All'
              ? `No ${activeTab.toLowerCase()} assignments.`
              : 'Create your first assignment to get started.'}
          </p>
          <Link to="/faculty/assignments/create" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Assignment
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((asn) => (
              <AssignmentCard
                key={asn._id}
                asn={asn}
                onPublish={() => publishMutation.mutate(asn._id)}
                publishing={publishMutation.isPending}
                navigate={navigate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

function AssignmentCard({ asn, onPublish, publishing, navigate }) {
  const totalSubmissions  = asn.submissionsCount ?? 0;
  const enrolledStudents  = asn.enrolledStudents ?? asn.totalStudents ?? '—';
  const pendingEvaluation = asn.pendingEvaluations ?? 0;
  const avgMarks          = asn.avgMarks != null ? Number(asn.avgMarks).toFixed(1) : '—';

  return (
    <motion.div
      layout
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      exit={{ opacity: 0, y: -10 }}
      className="card p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={STATUS_BADGE[asn.status] || 'badge-blue'}>
              {asn.status ?? 'draft'}
            </span>
            {asn.type && (
              <span className={TYPE_COLORS[asn.type] || 'badge-blue'}>{asn.type}</span>
            )}
            {asn.subject && (
              <span className="badge bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                {asn.subject.code || asn.subject.name}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate">
            {asn.title}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Created {asn.createdAt ? format(new Date(asn.createdAt), 'MMM d, yyyy') : '—'}
            {asn.deadline && (
              <> &bull; Due {format(new Date(asn.deadline), 'MMM d, yyyy p')}</>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-5 text-center flex-shrink-0">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {totalSubmissions}/{enrolledStudents}
            </div>
            <div className="text-xs text-gray-400">Submissions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-500">{pendingEvaluation}</div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-500">{avgMarks}</div>
            <div className="text-xs text-gray-400">Avg Marks</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
        {asn.status === 'draft' && (
          <button
            onClick={onPublish}
            disabled={publishing}
            className="btn-primary btn-sm"
          >
            <Send className="w-3 h-3" /> Publish
          </button>
        )}
        <button
          onClick={() => navigate(`/faculty/assignments/${asn._id}/evaluate`)}
          className="btn-secondary btn-sm"
        >
          <Eye className="w-3 h-3" /> View Submissions
        </button>
        <Link to={`/faculty/assignments/${asn._id}/edit`} className="btn-ghost btn-sm">
          <Edit className="w-3 h-3" /> Edit
        </Link>
      </div>
    </motion.div>
  );
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      ))}
    </div>
  );
}
