import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentAPI, submissionAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, User, Download, Clock, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Sparkles, FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

const SUB_STATUS = {
  pending:   { label: 'Pending',   cls: 'badge-amber' },
  evaluated: { label: 'Evaluated', cls: 'badge-green' },
  approved:  { label: 'Approved',  cls: 'badge-green' },
  rejected:  { label: 'Rejected',  cls: 'badge-red' },
};

export default function EvaluationWorkspace() {
  const { id: assignmentId } = useParams();
  const [searchParams]       = useSearchParams();
  const qc                   = useQueryClient();
  const { toast }            = useToast();

  const [selectedSubId, setSelectedSubId] = useState(searchParams.get('submissionId') || null);
  const [filterStatus, setFilterStatus]   = useState('All');

  // Fetch assignment details
  const { data: assignment } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn:  () => assignmentAPI.getById(assignmentId).then((r) => r.data.data ?? r.data),
    enabled: !!assignmentId,
  });

  // Fetch submissions for this assignment
  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn:  () => assignmentAPI.getSubmissions(assignmentId, {}).then((r) => r.data.data ?? r.data),
    enabled: !!assignmentId,
  });

  const submissions = Array.isArray(submissionsData) ? submissionsData : [];

  const selectedSub = submissions.find((s) => s._id === selectedSubId) ?? submissions[0] ?? null;

  const evaluateMutation = useMutation({
    mutationFn: ({ subId, data }) => submissionAPI.evaluate(subId, data),
    onMutate: async ({ subId, data }) => {
      await qc.cancelQueries(['submissions', assignmentId]);
      const prev = qc.getQueryData(['submissions', assignmentId]);
      qc.setQueryData(['submissions', assignmentId], (old) => {
        const list = Array.isArray(old) ? old : old?.data ?? [];
        return list.map((s) => s._id === subId ? { ...s, ...data, status: data.status || 'evaluated' } : s);
      });
      return { prev };
    },
    onSuccess: () => {
      toast({ title: 'Evaluation saved!', type: 'success' });
      qc.invalidateQueries(['submissions', assignmentId]);
    },
    onError: (err, _, ctx) => {
      qc.setQueryData(['submissions', assignmentId], ctx.prev);
      toast({ title: 'Failed to save evaluation', type: 'error' });
    },
  });

  const filtered = submissions.filter((s) => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Pending') return !s.status || s.status === 'pending' || s.status === 'submitted';
    if (filterStatus === 'Evaluated') return s.status === 'evaluated' || s.status === 'approved' || s.status === 'rejected';
    return true;
  });

  return (
    <div className="max-w-7xl space-y-4">
      <div>
        <h1 className="page-title">Evaluation Workspace</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {assignment?.title || 'Assignment'} — evaluate student submissions
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 h-[calc(100vh-220px)]">
        {/* LEFT: Submissions list */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
            <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
              {['All', 'Pending', 'Evaluated'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
                    filterStatus === tab
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
            {isLoading ? (
              <SubmissionListSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <CheckCircle className="w-10 h-10 text-emerald-300 dark:text-emerald-800 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-600">All evaluated!</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="visible">
                {filtered.map((sub) => {
                  const st = SUB_STATUS[sub.status] || SUB_STATUS.pending;
                  return (
                    <motion.button
                      key={sub._id}
                      variants={item}
                      onClick={() => setSelectedSubId(sub._id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${
                        selectedSubId === sub._id ? 'bg-brand-50 dark:bg-brand-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0 text-gray-600 dark:text-gray-300">
                            {sub.studentName?.[0] || 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {sub.studentName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {sub.rollNumber || sub.studentRoll || '—'}
                            </div>
                          </div>
                        </div>
                        <span className={st.cls}>{st.label}</span>
                      </div>
                      {sub.submittedAt && (
                        <div className="text-xs text-gray-400 mt-1.5 ml-10">
                          {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT: Evaluation form */}
        <div className="lg:col-span-3 card overflow-y-auto">
          {!selectedSub ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <CheckSquare className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-600">
                Select a submission from the list to evaluate it.
              </p>
            </div>
          ) : (
            <EvaluationForm
              key={selectedSub._id}
              sub={selectedSub}
              assignment={assignment}
              onSubmit={(data) =>
                evaluateMutation.mutate({ subId: selectedSub._id, data })
              }
              submitting={evaluateMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EvaluationForm({ sub, assignment, onSubmit, submitting }) {
  const [form, setForm] = useState({
    status:            sub.evaluationStatus || 'approved',
    marks:             sub.marks ?? '',
    feedback:          sub.feedback ?? '',
    strengths:         sub.strengths ?? '',
    areasOfImprovement:sub.areasOfImprovement ?? '',
  });

  const ai = sub.aiAnalysis || sub.analysis || null;
  const maxMarks = assignment?.maxMarks || 100;

  const handleChange = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Student info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
            {sub.studentName?.[0] || 'S'}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{sub.studentName}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {sub.rollNumber || sub.studentRoll || '—'}
              {sub.submittedAt && (
                <> &bull; Submitted {format(new Date(sub.submittedAt), 'MMM d, yyyy p')}</>
              )}
            </div>
          </div>
        </div>
        {sub.fileUrl && (
          <a
            href={sub.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-sm"
          >
            <Download className="w-3 h-3" /> Download
          </a>
        )}
      </div>

      {/* AI Analysis */}
      {ai && (
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI Analysis</span>
          </div>
          {[
            { label: 'Originality', value: ai.originalityScore ?? ai.originality, color: 'bg-emerald-500' },
            { label: 'Quality',     value: ai.qualityScore ?? ai.quality,         color: 'bg-blue-500' },
            { label: 'AI Probability', value: ai.aiProbability ?? ai.aiScore,     color: 'bg-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className="font-medium">{value != null ? `${Math.round(value * 100)}%` : '—'}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                {value != null && (
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${Math.round(value * 100)}%` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluation fields */}
      <div className="space-y-4">
        {/* Status */}
        <div>
          <label className="label">Evaluation Status</label>
          <div className="flex gap-3">
            {[
              { val: 'approved', icon: CheckCircle, color: 'text-emerald-500', label: 'Approved' },
              { val: 'rejected', icon: XCircle,     color: 'text-red-500',     label: 'Rejected' },
            ].map(({ val, icon: Icon, color, label }) => (
              <label
                key={val}
                className={`flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  form.status === val
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={val}
                  checked={form.status === val}
                  onChange={() => handleChange('status', val)}
                  className="sr-only"
                />
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Marks */}
        <div>
          <label className="label">Marks (out of {maxMarks})</label>
          <input
            type="number"
            min={0}
            max={maxMarks}
            className="input"
            placeholder={`0 – ${maxMarks}`}
            value={form.marks}
            onChange={(e) => handleChange('marks', e.target.value)}
          />
        </div>

        {/* Feedback */}
        <div>
          <label className="label">Feedback</label>
          <textarea
            rows={3}
            className="input resize-none"
            placeholder="Overall feedback for the student..."
            value={form.feedback}
            onChange={(e) => handleChange('feedback', e.target.value)}
          />
        </div>

        {/* Strengths */}
        <div>
          <label className="label">Strengths</label>
          <textarea
            rows={2}
            className="input resize-none"
            placeholder="What the student did well..."
            value={form.strengths}
            onChange={(e) => handleChange('strengths', e.target.value)}
          />
        </div>

        {/* Areas for improvement */}
        <div>
          <label className="label">Areas for Improvement</label>
          <textarea
            rows={2}
            className="input resize-none"
            placeholder="What the student should improve..."
            value={form.areasOfImprovement}
            onChange={(e) => handleChange('areasOfImprovement', e.target.value)}
          />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Saving...' : 'Submit Evaluation'}
      </button>
    </form>
  );
}

function SubmissionListSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-zinc-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
