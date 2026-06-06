import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { assignmentAPI, facultyAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, Plus, Trash2,
  PlusCircle, AlertCircle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@shared/context/NotificationContext';

// ── Zod schemas per step ─────────────────────────────────────
const step1Schema = z.object({
  subjectId:   z.string().min(1, 'Select a subject'),
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  type:        z.string().min(1, 'Select assignment type'),
  deadline:    z.string().min(1, 'Set a due date'),
  maxMarks:    z.coerce.number().min(1).max(100),
  instructions:z.string().optional(),
});

const ASSIGNMENT_TYPES = [
  'Assignment 1', 'Assignment 2', 'Lab Observation', 'Record', 'Tutorial', 'Mini Project',
];

const STEPS = ['Basic Details', 'Anti-Copy Topics', 'Rubric'];

const itemVar = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function CreateAssignment() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { toast }       = useToast();
  const [step, setStep] = useState(0);

  // Topic sets state (Step 2)
  const [enableTopics, setEnableTopics] = useState(false);
  const [topicSets, setTopicSets]       = useState([['']]);

  // Rubric state (Step 3)
  const [rubricItems, setRubricItems]   = useState([{ criteria: '', maxMarks: 10 }]);

  const { data: subjects = [] } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data ?? r.data),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      subjectId:    searchParams.get('subjectId') || '',
      title:        '',
      type:         '',
      deadline:     '',
      maxMarks:     20,
      instructions: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => assignmentAPI.create(data),
    onSuccess: () => {
      toast({ title: 'Assignment created successfully!', type: 'success' });
      navigate('/faculty/assignments');
    },
    onError: (err) => {
      toast({ title: err?.response?.data?.message || 'Failed to create assignment', type: 'error' });
    },
  });

  const onStep1Next = handleSubmit(() => setStep(1));

  const onFinalSubmit = handleSubmit((formData) => {
    const payload = {
      ...formData,
      topicDistribution: enableTopics ? topicSets : undefined,
      rubric:            rubricItems.filter((r) => r.criteria.trim()),
    };
    createMutation.mutate(payload);
  });

  const rubricTotal = rubricItems.reduce((s, r) => s + Number(r.maxMarks || 0), 0);

  // Topic set helpers
  const addSet       = () => setTopicSets((p) => [...p, ['']]);
  const removeSet    = (i) => setTopicSets((p) => p.filter((_, idx) => idx !== i));
  const addTopic     = (si) => setTopicSets((p) => p.map((s, i) => i === si ? [...s, ''] : s));
  const removeTopic  = (si, ti) => setTopicSets((p) => p.map((s, i) => i === si ? s.filter((_, j) => j !== ti) : s));
  const updateTopic  = (si, ti, val) =>
    setTopicSets((p) => p.map((s, i) => i === si ? s.map((t, j) => j === ti ? val : t) : s));

  // Rubric helpers
  const addRubric     = () => setRubricItems((p) => [...p, { criteria: '', maxMarks: 10 }]);
  const removeRubric  = (i) => setRubricItems((p) => p.filter((_, idx) => idx !== i));
  const updateRubric  = (i, field, val) =>
    setRubricItems((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-title">Create Assignment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fill in the details below to create a new assignment for your students.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                idx < step
                  ? 'bg-brand-500 text-white'
                  : idx === step
                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
              }`}>
                {idx < step ? <Check className="w-3 h-3" /> : idx + 1}
              </div>
              <span className={`text-sm font-medium truncate ${
                idx === step ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-600'
              }`}>{label}</span>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${idx < step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-zinc-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" variants={itemVar} initial="hidden" animate="visible" exit="exit">
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Basic Details</h2>

              {/* Subject */}
              <div>
                <label className="label">Subject *</label>
                <select className="input" {...register('subjectId')}>
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                {errors.subjectId && <FieldError msg={errors.subjectId.message} />}
              </div>

              {/* Title */}
              <div>
                <label className="label">Assignment Title *</label>
                <input className="input" placeholder="e.g., Unit 2 – Data Structures Assignment" {...register('title')} />
                {errors.title && <FieldError msg={errors.title.message} />}
              </div>

              {/* Type */}
              <div>
                <label className="label">Assignment Type *</label>
                <select className="input" {...register('type')}>
                  <option value="">Select type...</option>
                  {ASSIGNMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.type && <FieldError msg={errors.type.message} />}
              </div>

              {/* Due date & Max marks */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Due Date & Time *</label>
                  <input type="datetime-local" className="input" {...register('deadline')} />
                  {errors.deadline && <FieldError msg={errors.deadline.message} />}
                </div>
                <div>
                  <label className="label">Max Marks *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="input"
                    placeholder="20"
                    {...register('maxMarks')}
                  />
                  {errors.maxMarks && <FieldError msg={errors.maxMarks.message} />}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="label">Instructions (optional)</label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe what students need to do..."
                  {...register('instructions')}
                />
              </div>

              <div className="flex justify-end">
                <button onClick={onStep1Next} className="btn-primary">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" variants={itemVar} initial="hidden" animate="visible" exit="exit">
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="section-title">Anti-Copy Topic Distribution</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setEnableTopics((p) => !p)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${enableTopics ? 'bg-brand-500' : 'bg-gray-300 dark:bg-zinc-600'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enableTopics ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable topic distribution</span>
                </label>
              </div>

              {!enableTopics ? (
                <p className="text-sm text-gray-400 dark:text-gray-600 py-6 text-center">
                  Enable topic distribution to assign different topics to different students,
                  reducing copy chances.
                </p>
              ) : (
                <div className="space-y-4">
                  {topicSets.map((set, si) => (
                    <div key={si} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Topic Set {si + 1}
                        </span>
                        {topicSets.length > 1 && (
                          <button onClick={() => removeSet(si)} className="btn-ghost btn-sm text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {set.map((topic, ti) => (
                          <div key={ti} className="flex gap-2">
                            <input
                              className="input flex-1"
                              placeholder={`Topic ${ti + 1}`}
                              value={topic}
                              onChange={(e) => updateTopic(si, ti, e.target.value)}
                            />
                            {set.length > 1 && (
                              <button onClick={() => removeTopic(si, ti)} className="btn-ghost btn-sm text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addTopic(si)} className="btn-ghost btn-sm">
                          <Plus className="w-3 h-3" /> Add Topic
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addSet} className="btn-secondary btn-sm">
                    <Plus className="w-3 h-3" /> Add Set
                  </button>
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep(0)} className="btn-secondary">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(2)} className="btn-primary">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={itemVar} initial="hidden" animate="visible" exit="exit">
            <div className="card p-6 space-y-5">
              <h2 className="section-title">Rubric (optional)</h2>

              <div className="space-y-3">
                {rubricItems.map((r, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <input
                      className="input flex-1"
                      placeholder="Criteria name (e.g., Code Quality)"
                      value={r.criteria}
                      onChange={(e) => updateRubric(i, 'criteria', e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      className="input w-24"
                      placeholder="Marks"
                      value={r.maxMarks}
                      onChange={(e) => updateRubric(i, 'maxMarks', e.target.value)}
                    />
                    {rubricItems.length > 1 && (
                      <button onClick={() => removeRubric(i)} className="btn-ghost btn-sm text-red-400 mt-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addRubric} className="btn-secondary btn-sm">
                  <Plus className="w-3 h-3" /> Add Criteria
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Rubric total:</span>
                <span className={`font-bold ${rubricTotal > watch('maxMarks') ? 'text-red-500' : 'text-emerald-500'}`}>
                  {rubricTotal}
                </span>
                <span className="text-gray-400">/ {watch('maxMarks')} max marks</span>
                {rubricTotal > watch('maxMarks') && (
                  <span className="text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Exceeds max marks
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={onFinalSubmit}
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldError({ msg }) {
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  );
}
