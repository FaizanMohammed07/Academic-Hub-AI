import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizAPI, facultyAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Plus, X, Clock, Users, BarChart2,
  ChevronRight, Send, Eye, Trash2, Check, Circle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_BADGE = {
  draft:     'badge-amber',
  published: 'badge-green',
  closed:    'badge-red',
};

const EMPTY_QUESTION = { text: '', options: ['', '', '', ''], correctIndex: 0, marks: 1, explanation: '' };

function makeEmptyQuiz() {
  return {
    subjectId: '', title: '', description: '', duration: 30,
    startTime: '', endTime: '', questions: [{ ...EMPTY_QUESTION, options: ['', '', '', ''] }],
  };
}

export default function Quizzes() {
  const qc          = useQueryClient();
  const { toast }   = useToast();

  const [showPanel, setShowPanel]         = useState(false);
  const [showResults, setShowResults]     = useState(null); // quizId
  const [quizForm, setQuizForm]           = useState(makeEmptyQuiz());

  const { data: rawQuizzes, isLoading } = useQuery({
    queryKey: ['quizzes', 'faculty'],
    queryFn:  () => quizAPI.getMyQuizzes({}).then((r) => r.data.data ?? r.data),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data ?? r.data),
  });

  const { data: results = [] } = useQuery({
    queryKey: ['quiz-results', showResults],
    queryFn:  () => quizAPI.getResults(showResults).then((r) => r.data.data ?? r.data),
    enabled: !!showResults,
  });

  const createMutation = useMutation({
    mutationFn: (data) => quizAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['quizzes', 'faculty']);
      toast({ title: 'Quiz created!', type: 'success' });
      setShowPanel(false);
      setQuizForm(makeEmptyQuiz());
    },
    onError: () => toast({ title: 'Failed to create quiz', type: 'error' }),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => quizAPI.publish(id),
    onSuccess: () => {
      qc.invalidateQueries(['quizzes', 'faculty']);
      toast({ title: 'Quiz published!', type: 'success' });
    },
  });

  const quizzes = Array.isArray(rawQuizzes) ? rawQuizzes : [];

  // Question helpers
  const addQuestion = () =>
    setQuizForm((p) => ({ ...p, questions: [...p.questions, { ...EMPTY_QUESTION, options: ['', '', '', ''] }] }));

  const removeQuestion = (qi) =>
    setQuizForm((p) => ({ ...p, questions: p.questions.filter((_, i) => i !== qi) }));

  const updateQuestion = (qi, field, val) =>
    setQuizForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) => i === qi ? { ...q, [field]: val } : q),
    }));

  const updateOption = (qi, oi, val) =>
    setQuizForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q
      ),
    }));

  const handleSubmit = (e, status = 'draft') => {
    e.preventDefault();
    createMutation.mutate({ ...quizForm, status });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create and manage timed quizzes for your students
          </p>
        </div>
        <button onClick={() => setShowPanel(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </motion.div>

      {/* Quiz cards */}
      {isLoading ? (
        <QuizSkeleton />
      ) : quizzes.length === 0 ? (
        <motion.div variants={item} className="card p-12 flex flex-col items-center justify-center text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No quizzes yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-600 mb-4">
            Create your first quiz to assess students in real-time.
          </p>
          <button onClick={() => setShowPanel(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Quiz
          </button>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <motion.div key={quiz._id} variants={item} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {quiz.subject && (
                    <span className="badge badge-blue mb-1">{quiz.subject.code || quiz.subject.name}</span>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{quiz.description}</p>
                  )}
                </div>
                <span className={STATUS_BADGE[quiz.status] || 'badge-amber'}>{quiz.status || 'draft'}</span>
              </div>

              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> {quiz.questionsCount ?? quiz.questions?.length ?? 0} Qs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {quiz.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {quiz.attemptCount ?? 0} attempts
                </span>
              </div>

              {quiz.startTime && (
                <p className="text-xs text-gray-400">
                  {format(new Date(quiz.startTime), 'MMM d, p')} – {quiz.endTime ? format(new Date(quiz.endTime), 'p') : 'open'}
                </p>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-zinc-800">
                {quiz.status === 'draft' && (
                  <button
                    onClick={() => publishMutation.mutate(quiz._id)}
                    disabled={publishMutation.isPending}
                    className="btn-primary btn-sm flex-1"
                  >
                    <Send className="w-3 h-3" /> Publish
                  </button>
                )}
                <button
                  onClick={() => setShowResults(quiz._id)}
                  className="btn-secondary btn-sm flex-1"
                >
                  <BarChart2 className="w-3 h-3" /> Results
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Quiz Slide-over */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-zinc-900 z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between">
                <h2 className="section-title">Create Quiz</h2>
                <button onClick={() => setShowPanel(false)} className="btn-ghost btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form className="p-5 space-y-6">
                {/* Basic */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Subject *</label>
                    <select className="input" value={quizForm.subjectId} onChange={(e) => setQuizForm((p) => ({ ...p, subjectId: e.target.value }))}>
                      <option value="">Select subject...</option>
                      {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Title *</label>
                    <input className="input" placeholder="Quiz title" value={quizForm.title} onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea rows={2} className="input resize-none" value={quizForm.description} onChange={(e) => setQuizForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Duration (minutes)</label>
                    <input type="number" min={5} className="input" value={quizForm.duration} onChange={(e) => setQuizForm((p) => ({ ...p, duration: e.target.value }))} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Time</label>
                    <input type="datetime-local" className="input" value={quizForm.startTime} onChange={(e) => setQuizForm((p) => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">End Time</label>
                    <input type="datetime-local" className="input" value={quizForm.endTime} onChange={(e) => setQuizForm((p) => ({ ...p, endTime: e.target.value }))} />
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Questions ({quizForm.questions.length})
                    </h3>
                    <button type="button" onClick={addQuestion} className="btn-secondary btn-sm">
                      <Plus className="w-3 h-3" /> Add Question
                    </button>
                  </div>
                  <div className="space-y-4">
                    {quizForm.questions.map((q, qi) => (
                      <div key={qi} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Q{qi + 1}</span>
                          {quizForm.questions.length > 1 && (
                            <button type="button" onClick={() => removeQuestion(qi)} className="btn-ghost btn-sm text-red-400">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="label text-xs">Question Text *</label>
                          <textarea rows={2} className="input resize-none" placeholder="Enter question..." value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="label text-xs">Options (click radio for correct answer)</label>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuestion(qi, 'correctIndex', oi)}
                                className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  q.correctIndex === oi ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-zinc-600'
                                }`}
                              >
                                {q.correctIndex === oi && <Check className="w-2.5 h-2.5 text-white" />}
                              </button>
                              <input
                                className="input flex-1 py-1.5 text-xs"
                                placeholder={`Option ${oi + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(qi, oi, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="label text-xs">Marks</label>
                            <input type="number" min={1} className="input py-1 text-xs" value={q.marks} onChange={(e) => updateQuestion(qi, 'marks', e.target.value)} />
                          </div>
                          <div className="flex-[3]">
                            <label className="label text-xs">Explanation (optional)</label>
                            <input className="input py-1 text-xs" placeholder="Explain the answer..." value={q.explanation} onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 py-4 border-t border-gray-100 dark:border-zinc-800 -mx-5 px-5">
                  <button type="button" onClick={(e) => handleSubmit(e, 'draft')} disabled={createMutation.isPending} className="btn-secondary flex-1">
                    Save Draft
                  </button>
                  <button type="button" onClick={(e) => handleSubmit(e, 'published')} disabled={createMutation.isPending} className="btn-primary flex-1">
                    <Send className="w-4 h-4" /> Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowResults(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="section-title">Quiz Results</h2>
                <button onClick={() => setShowResults(null)} className="btn-ghost btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {results.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">No attempts yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 sticky top-0">
                      <tr>
                        {['Student', 'Roll', 'Score', '%', 'Time Taken'].map((h) => (
                          <th key={h} className="text-left text-xs text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {results.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.studentName}</td>
                          <td className="px-4 py-3 text-gray-500">{r.rollNumber || '—'}</td>
                          <td className="px-4 py-3">{r.score}/{r.totalMarks}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${r.percentage >= 60 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {r.percentage?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{r.timeTaken ? `${r.timeTaken} min` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuizSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-44 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
      ))}
    </div>
  );
}
