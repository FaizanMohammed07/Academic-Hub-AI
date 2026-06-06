import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, Upload, Download, CheckCircle, AlertCircle,
  Clock, Calendar, BookOpen, Award, Tag, Info, X, File, Shield,
  Brain, Star, TrendingUp, ChevronRight, RefreshCw,
} from 'lucide-react';
import { studentAPI, mediaAPI } from '@services/api';
import { useParams, Link } from 'react-router-dom';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ALLOWED_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export default function SubmissionDetail() {
  const { id } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['student', 'assignment', id],
    queryFn: () => studentAPI.getAssignment(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      setUploadProgress(10);

      // 1. Get S3 presigned URL
      const urlRes = await mediaAPI.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        folder: 'submissions',
      });
      const { uploadUrl, fileUrl } = urlRes.data.data;
      setUploadProgress(30);

      // 2. PUT file to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      setUploadProgress(70);

      // 3. Submit record
      await studentAPI.submitAssignment(id, {
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      });
      setUploadProgress(100);
    },
    onSuccess: () => {
      toast.success('Assignment submitted successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
      queryClient.invalidateQueries(['student', 'assignment', id]);
      queryClient.invalidateQueries(['student', 'assignments']);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Submission failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const handleFile = useCallback((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF and DOC/DOCX files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('File must be under 50 MB.');
      return;
    }
    setSelectedFile(file);
  }, [toast]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  if (isLoading) return <SubmissionSkeleton />;
  if (!assignment) return (
    <div className="card p-12 text-center">
      <p className="text-gray-500">Assignment not found.</p>
    </div>
  );

  const submission = assignment.mySubmission;
  const isSubmitted = !!submission;
  const isEvaluated = submission?.status === 'graded' || submission?.status === 'approved' || submission?.status === 'rejected';
  const dueDate = assignment.deadline ? new Date(assignment.deadline) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isSubmitted;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      {/* Back */}
      <motion.div variants={item}>
        <Link to="/student/assignments" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Link>
      </motion.div>

      {/* Assignment header */}
      <motion.div variants={item} className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <TypeBadge type={assignment.type} />
              <StatusBadge status={isOverdue ? 'overdue' : (submission?.status || 'pending')} />
            </div>
            <h1 className="page-title">{assignment.title}</h1>
            {assignment.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                {assignment.description}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
          <MetaItem icon={BookOpen} label="Subject" value={assignment.subject?.name || '—'} />
          <MetaItem
            icon={Calendar}
            label="Due Date"
            value={dueDate ? format(dueDate, 'MMM d, yyyy') : '—'}
            danger={isOverdue}
          />
          <MetaItem icon={Award} label="Max Marks" value={assignment.maxMarks ?? '—'} />
          <MetaItem icon={Tag} label="Type" value={assignment.type?.replace('_', ' ') || '—'} />
        </div>

        {/* Instructions */}
        {assignment.instructions && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Instructions</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {assignment.instructions}
            </p>
          </div>
        )}

        {/* Allocated topics */}
        {assignment.allocatedTopics?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Allocated Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {assignment.allocatedTopics.map((topic, i) => (
                <span key={i} className="badge-brand">{typeof topic === 'string' ? topic : topic.title}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Submission card */}
      <motion.div variants={item} className="card p-6">
        <h2 className="section-title mb-4">
          {isEvaluated ? 'Evaluation Result' : isSubmitted ? 'Your Submission' : 'Submit Assignment'}
        </h2>

        {/* Not submitted */}
        {!isSubmitted && (
          <div className="space-y-4">
            {isOverdue && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Deadline has passed. Late submissions may not be accepted.
              </div>
            )}

            {/* Drag-drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-200 dark:border-zinc-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-brand-500 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="btn-icon btn-ghost ml-2 text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drag & drop your file here, or <span className="text-brand-500">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    PDF or DOC/DOCX only — max 50 MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={onFileChange}
            />

            {/* Upload progress */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className="btn-primary w-full"
              disabled={!selectedFile || uploading}
              onClick={() => submitMutation.mutate(selectedFile)}
            >
              {uploading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> Submit Assignment</>
              )}
            </button>
          </div>
        )}

        {/* Submitted — not evaluated */}
        {isSubmitted && !isEvaluated && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Submitted Successfully</p>
                <p className="text-xs text-blue-500 dark:text-blue-400/80 mt-0.5">
                  {submission.submittedAt
                    ? `Submitted ${formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}`
                    : 'Awaiting evaluation'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{submission.fileName || 'Submitted file'}</p>
                  {submission.fileSize && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
              {submission.fileUrl && (
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary btn-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              )}
            </div>
          </div>
        )}

        {/* Evaluated */}
        {isEvaluated && (
          <div className="space-y-5">
            {/* Marks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="stat-value text-brand-600 dark:text-brand-400">
                  {submission.marksObtained ?? '—'}/{assignment.maxMarks ?? '—'}
                </div>
                <div className="stat-label">Marks Obtained</div>
              </div>
              <div className="stat-card">
                <StatusBadge status={submission.status} />
                <div className="stat-label mt-1">Status</div>
              </div>
              {submission.submittedAt && (
                <div className="stat-card">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                  </div>
                  <div className="stat-label">Submitted On</div>
                </div>
              )}
            </div>

            {/* Feedback */}
            {submission.feedback && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-500" /> Faculty Feedback
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{submission.feedback}</p>
              </div>
            )}

            {/* Strengths & Improvements */}
            {(submission.strengths?.length > 0 || submission.improvements?.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {submission.strengths?.length > 0 && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-1">
                      {submission.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                          <span className="mt-0.5 flex-shrink-0">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {submission.improvements?.length > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Improvements
                    </h4>
                    <ul className="space-y-1">
                      {submission.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                          <span className="mt-0.5 flex-shrink-0">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* File download */}
            {submission.fileUrl && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {submission.fileName || 'Submitted file'}
                  </p>
                </div>
                <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* AI Analysis */}
      {isEvaluated && submission?.aiAnalysis && (
        <motion.div variants={item} className="card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-500" /> AI Analysis
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Originality Score', value: submission.aiAnalysis.originalityScore, color: 'bg-emerald-500', icon: Shield },
              { label: 'AI Probability', value: submission.aiAnalysis.aiProbability, color: 'bg-red-500', icon: Brain },
              { label: 'Quality Score', value: submission.aiAnalysis.qualityScore, color: 'bg-brand-500', icon: Star },
            ].map(({ label, value, color, icon: Icon }) =>
              value != null ? (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icon className="w-4 h-4 text-gray-400" /> {label}
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const MetaItem = ({ icon: Icon, label, value, danger }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className={`w-3.5 h-3.5 ${danger ? 'text-red-400' : 'text-gray-400'}`} />
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
    <p className={`text-sm font-semibold ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'} capitalize`}>
      {value}
    </p>
  </div>
);

const STATUS_MAP = {
  pending:            { label: 'Pending',   cls: 'badge-amber' },
  submitted:          { label: 'Submitted', cls: 'badge-blue' },
  graded:             { label: 'Graded',    cls: 'badge-green' },
  approved:           { label: 'Approved',  cls: 'badge-green' },
  rejected:           { label: 'Rejected',  cls: 'badge-red' },
  resubmit_requested: { label: 'Resubmit',  cls: 'badge-amber' },
  overdue:            { label: 'Overdue',   cls: 'badge-red' },
};

const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className={cls}>{label}</span>;
};

const TYPE_MAP = {
  file_upload:  'badge-blue',
  presentation: 'badge-brand',
  project:      'badge-amber',
  viva:         'badge-red',
  quiz:         'badge-green',
};

const TypeBadge = ({ type }) => {
  const cls = TYPE_MAP[type] || 'badge-blue';
  return <span className={cls}>{type?.replace(/_/g, ' ') || 'Assignment'}</span>;
};

function SubmissionSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <div className="h-5 w-36 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-56 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      <div className="h-48 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  );
}
