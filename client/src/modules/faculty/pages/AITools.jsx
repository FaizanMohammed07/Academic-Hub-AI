import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiAPI, facultyAPI, assignmentAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, ChevronDown, AlertTriangle,
  BookOpen, FileText, Loader2,
} from 'lucide-react';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TABS = ['Question Generator', 'Submission Analysis', 'Study Material'];

export default function AITools() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      <motion.div variants={item}>
        <h1 className="page-title">AI Tools</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          AI-powered tools to enhance your teaching workflow
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === idx
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 0 && <QuestionGenerator key="qgen" />}
        {activeTab === 1 && <SubmissionAnalysis key="analysis" />}
        {activeTab === 2 && <StudyMaterialGenerator key="study" />}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Tab 1: Question Generator ────────────────────────────────
function QuestionGenerator() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    subjectId: '', topic: '', difficulty: 'Medium', count: 10, type: 'MCQ',
  });
  const [questions, setQuestions] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const { data: subjects = [] } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data ?? r.data),
  });

  const generateMutation = useMutation({
    mutationFn: (data) => aiAPI.generateQuestions(data),
    onSuccess: (res) => {
      const qs = res.data?.data?.questions ?? res.data?.questions ?? [];
      setQuestions(qs);
      if (qs.length === 0) toast({ title: 'No questions returned', type: 'warning' });
    },
    onError: () => toast({ title: 'Generation failed', type: 'error' }),
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    generateMutation.mutate(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="card p-6">
        <h2 className="section-title mb-4">Generate Questions</h2>
        <form onSubmit={handleGenerate} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
              <option value="">Select subject...</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Topic *</label>
            <input
              className="input" required placeholder="e.g., Linked Lists, Recursion"
              value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
              {['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Count</label>
            <select className="input" value={form.count} onChange={(e) => setForm((p) => ({ ...p, count: Number(e.target.value) }))}>
              {[5, 10, 15, 20].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {['MCQ', 'Short Answer', 'Essay'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={generateMutation.isPending || !form.topic} className="btn-primary">
              {generateMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate</>
              }
            </button>
          </div>
        </form>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          <h3 className="section-title">Generated Questions ({questions.length})</h3>
          {questions.map((q, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-600">Q{idx + 1}</span>
                    {q.difficulty && <span className="badge badge-blue">{q.difficulty}</span>}
                    {q.type && <span className="badge badge-amber">{q.type}</span>}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{q.text || q.question}</p>
                  {q.options && (
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt, oi) => (
                        <li key={oi} className={`text-sm px-2 py-1 rounded ${oi === q.correctIndex || opt === q.correct ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {(q.explanation || q.answer) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                      {q.explanation || q.answer}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(q.text || q.question, idx)}
                  className="btn-ghost btn-sm flex-shrink-0"
                >
                  {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Tab 2: Submission Analysis ───────────────────────────────
function SubmissionAnalysis() {
  const [assignmentId, setAssignmentId] = useState('');

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', 'faculty'],
    queryFn:  () => assignmentAPI.getMyAssignments({}).then((r) => r.data.data ?? r.data ?? []),
  });

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['submissions', 'ai', assignmentId],
    queryFn:  () => assignmentAPI.getSubmissions(assignmentId, {}).then((r) => r.data.data ?? r.data),
    enabled: !!assignmentId,
  });

  const submissions = Array.isArray(submissionsData) ? submissionsData : [];

  const sorted = [...submissions].sort((a, b) => {
    const aP = a.aiAnalysis?.aiProbability ?? a.analysis?.aiProbability ?? 0;
    const bP = b.aiAnalysis?.aiProbability ?? b.analysis?.aiProbability ?? 0;
    return bP - aP;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="card p-5">
        <label className="label">Select Assignment</label>
        <select
          className="input"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
        >
          <option value="">Select an assignment...</option>
          {(Array.isArray(assignments) ? assignments : []).map((a) => (
            <option key={a._id} value={a._id}>{a.title}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="card p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : assignmentId && sorted.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-600">No submissions yet for this assignment.</p>
        </div>
      ) : sorted.length > 0 ? (
        <div className="space-y-3">
          <h3 className="section-title">Submissions — sorted by AI probability (highest first)</h3>
          {sorted.map((sub) => {
            const ai = sub.aiAnalysis || sub.analysis || {};
            const aiProb = ai.aiProbability ?? 0;
            const originality = ai.originalityScore ?? ai.originality ?? 0;
            const quality = ai.qualityScore ?? ai.quality ?? 0;

            return (
              <div key={sub._id} className="card p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                      {sub.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{sub.studentName}</div>
                      <div className="text-xs text-gray-400">{sub.rollNumber || '—'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {aiProb > 0.7 && (
                      <span className="badge badge-red flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> High AI
                      </span>
                    )}
                    <span className={`badge ${sub.status === 'evaluated' || sub.status === 'approved' ? 'badge-green' : 'badge-amber'}`}>
                      {sub.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Originality',    value: originality, color: 'bg-emerald-500' },
                    { label: 'Quality',        value: quality,     color: 'bg-blue-500' },
                    { label: 'AI Probability', value: aiProb,      color: aiProb > 0.7 ? 'bg-red-500' : aiProb > 0.4 ? 'bg-amber-500' : 'bg-emerald-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {value != null ? `${Math.round(value * 100)}%` : '—'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        {value != null && (
                          <div
                            className={`h-full ${color} rounded-full`}
                            style={{ width: `${Math.round(value * 100)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
}

// ── Tab 3: Study Material Generator ─────────────────────────
function StudyMaterialGenerator() {
  const { toast } = useToast();
  const [form, setForm] = useState({ subjectId: '', topic: '', type: 'Notes' });
  const [result, setResult] = useState(null);

  const { data: subjects = [] } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data ?? r.data),
  });

  const generateMutation = useMutation({
    mutationFn: (data) => aiAPI.generateStudyMaterial(data),
    onSuccess: (res) => {
      const content = res.data?.data?.content ?? res.data?.content ?? null;
      setResult(content);
      if (!content) toast({ title: 'No content returned', type: 'warning' });
    },
    onError: () => toast({ title: 'Generation failed', type: 'error' }),
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    setResult(null);
    generateMutation.mutate(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="card p-6">
        <h2 className="section-title mb-4">Generate Study Material</h2>
        <form onSubmit={handleGenerate} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
              <option value="">Select subject...</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Topic *</label>
            <input
              className="input" required placeholder="e.g., Binary Trees, Sorting Algorithms"
              value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Material Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {['Notes', 'MCQs', 'Important Questions', 'Summary'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={generateMutation.isPending || !form.topic} className="btn-primary w-full">
              {generateMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><BookOpen className="w-4 h-4" /> Generate</>
              }
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">{form.type}: {form.topic}</h3>
            <button
              onClick={() => { navigator.clipboard.writeText(result); toast({ title: 'Copied!', type: 'success' }); }}
              className="btn-secondary btn-sm"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('## '))
                return <h3 key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-1">{line.slice(3)}</h3>;
              if (line.startsWith('# '))
                return <h2 key={i} className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-2">{line.slice(2)}</h2>;
              if (line.startsWith('- ') || line.startsWith('* '))
                return <div key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 my-0.5"><span className="text-brand-500">•</span><span>{line.slice(2)}</span></div>;
              if (line.match(/^\d+\./))
                return <div key={i} className="text-sm text-gray-700 dark:text-gray-300 my-0.5">{line}</div>;
              if (line.trim() === '')
                return <div key={i} className="my-2" />;
              return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
