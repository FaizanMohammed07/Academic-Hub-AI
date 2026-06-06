import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { observationAPI, facultyAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Plus, X, Search, Users, Check,
  ChevronDown, AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_BADGE = {
  pending:    'badge-amber',
  evaluated:  'badge-green',
  submitted:  'badge-blue',
};

const EMPTY_OBS = {
  subjectId: '', studentId: '', experimentNo: '', title: '',
  date: '', aim: '', procedure: '', result: '', inference: '', maxMarks: 25,
};

export default function Observations() {
  const qc            = useQueryClient();
  const { toast }     = useToast();

  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchTerm, setSearchTerm]       = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [form, setForm]                   = useState(EMPTY_OBS);
  const [bulkForm, setBulkForm]           = useState({ subjectId: '', date: '', experimentNo: '', title: '', maxMarks: 25, studentIds: [] });
  const [inlineMarks, setInlineMarks]     = useState({});

  const { data: rawObs, isLoading } = useQuery({
    queryKey: ['observations', 'faculty'],
    queryFn:  () => observationAPI.getForFaculty({}).then((r) => r.data.data ?? r.data),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['faculty', 'subjects'],
    queryFn:  () => facultyAPI.getMySubjects().then((r) => r.data.data ?? r.data),
  });

  // Fetch students for selected subject (modal)
  const { data: subjectStudents = [] } = useQuery({
    queryKey: ['subject-students', form.subjectId || bulkForm.subjectId],
    queryFn:  () => facultyAPI.getSubjectStudents(form.subjectId || bulkForm.subjectId).then((r) => r.data.data ?? r.data),
    enabled: !!(form.subjectId || bulkForm.subjectId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => observationAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['observations', 'faculty']);
      toast({ title: 'Observation recorded!', type: 'success' });
      setShowModal(false);
      setForm(EMPTY_OBS);
    },
    onError: () => toast({ title: 'Failed to create observation', type: 'error' }),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (data) => observationAPI.bulkCreate(data),
    onSuccess: () => {
      qc.invalidateQueries(['observations', 'faculty']);
      toast({ title: 'Bulk observations recorded!', type: 'success' });
      setShowBulkModal(false);
    },
    onError: () => toast({ title: 'Bulk create failed', type: 'error' }),
  });

  const evaluateMutation = useMutation({
    mutationFn: ({ id, marks }) => observationAPI.evaluate(id, { marks: Number(marks) }),
    onSuccess: () => {
      qc.invalidateQueries(['observations', 'faculty']);
      toast({ title: 'Marks saved!', type: 'success' });
    },
    onError: () => toast({ title: 'Failed to save marks', type: 'error' }),
  });

  const observations = Array.isArray(rawObs) ? rawObs : [];

  const filtered = observations.filter((o) => {
    const matchSub = !subjectFilter || o.subject?._id === subjectFilter || o.subjectId === subjectFilter;
    const matchSrc = !searchTerm ||
      o.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSub && matchSrc;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleBulkCreate = (e) => {
    e.preventDefault();
    bulkCreateMutation.mutate(bulkForm);
  };

  const toggleBulkStudent = (id) =>
    setBulkForm((p) => ({
      ...p,
      studentIds: p.studentIds.includes(id) ? p.studentIds.filter((s) => s !== id) : [...p.studentIds, id],
    }));

  const handleInlineSave = (obsId) => {
    if (!inlineMarks[obsId]) return;
    evaluateMutation.mutate({ id: obsId, marks: inlineMarks[obsId] });
    setInlineMarks((p) => { const n = { ...p }; delete n[obsId]; return n; });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Lab Observations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Record and evaluate student lab observations
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkModal(true)} className="btn-secondary">
            <Users className="w-4 h-4" /> Bulk Add
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Observation
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by student or title..."
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

      {/* Table */}
      <motion.div variants={item} className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FlaskConical className="w-10 h-10 text-gray-300 dark:text-zinc-600 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-600">No observations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr>
                  {['Student', 'Roll', 'Subject', 'Exp #', 'Title', 'Date', 'Marks', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filtered.map((obs) => (
                  <tr key={obs._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {obs.studentName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{obs.rollNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue">{obs.subject?.code || obs.subjectCode || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{obs.experimentNo || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{obs.title}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {obs.date ? format(new Date(obs.date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {obs.status === 'pending' || !obs.marks ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={obs.maxMarks || 25}
                            className="input w-16 py-1 text-xs"
                            placeholder="—"
                            value={inlineMarks[obs._id] ?? ''}
                            onChange={(e) => setInlineMarks((p) => ({ ...p, [obs._id]: e.target.value }))}
                          />
                          {inlineMarks[obs._id] && (
                            <button onClick={() => handleInlineSave(obs._id)} className="btn-ghost btn-sm text-emerald-500">
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {obs.marks}/{obs.maxMarks || 25}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[obs.status] || 'badge-amber'}>
                        {obs.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {obs.status === 'pending' && (
                        <button
                          onClick={() => handleInlineSave(obs._id)}
                          disabled={!inlineMarks[obs._id]}
                          className="btn-secondary btn-sm"
                        >
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Observation Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal title="Add Observation" onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject *</label>
                  <select className="input" required value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
                    <option value="">Select subject...</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Student *</label>
                  <select className="input" required value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} disabled={!form.subjectId}>
                    <option value="">Select student...</option>
                    {subjectStudents.map((s) => <option key={s._id} value={s._id}>{s.fullName} ({s.rollNumber})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Exp #</label>
                  <input className="input" placeholder="1" value={form.experimentNo} onChange={(e) => setForm((p) => ({ ...p, experimentNo: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Title *</label>
                  <input className="input" required placeholder="Experiment title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input" required value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Max Marks</label>
                  <input type="number" min={1} className="input" value={form.maxMarks} onChange={(e) => setForm((p) => ({ ...p, maxMarks: e.target.value }))} />
                </div>
              </div>
              {['aim', 'procedure', 'result', 'inference'].map((field) => (
                <div key={field}>
                  <label className="label capitalize">{field}</label>
                  <textarea rows={2} className="input resize-none" value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? 'Saving...' : 'Save Observation'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Bulk Add Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <Modal title="Bulk Add Observations" onClose={() => setShowBulkModal(false)}>
            <form onSubmit={handleBulkCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject *</label>
                  <select className="input" required value={bulkForm.subjectId} onChange={(e) => setBulkForm((p) => ({ ...p, subjectId: e.target.value, studentIds: [] }))}>
                    <option value="">Select subject...</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input" required value={bulkForm.date} onChange={(e) => setBulkForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Exp # *</label>
                  <input className="input" required value={bulkForm.experimentNo} onChange={(e) => setBulkForm((p) => ({ ...p, experimentNo: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Max Marks</label>
                  <input type="number" min={1} className="input" value={bulkForm.maxMarks} onChange={(e) => setBulkForm((p) => ({ ...p, maxMarks: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Title *</label>
                <input className="input" required value={bulkForm.title} onChange={(e) => setBulkForm((p) => ({ ...p, title: e.target.value }))} />
              </div>

              {/* Student checkboxes */}
              {bulkForm.subjectId && (
                <div>
                  <label className="label">Select Students *</label>
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-lg max-h-48 overflow-y-auto">
                    {subjectStudents.length === 0 ? (
                      <p className="text-sm text-gray-400 p-3 text-center">No students enrolled.</p>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        <label className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <input
                            type="checkbox"
                            checked={bulkForm.studentIds.length === subjectStudents.length}
                            onChange={() => setBulkForm((p) => ({
                              ...p,
                              studentIds: p.studentIds.length === subjectStudents.length ? [] : subjectStudents.map((s) => s._id),
                            }))}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                        </label>
                        {subjectStudents.map((s) => (
                          <label key={s._id} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                              type="checkbox"
                              checked={bulkForm.studentIds.includes(s._id)}
                              onChange={() => toggleBulkStudent(s._id)}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {s.fullName} <span className="text-gray-400">({s.rollNumber})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{bulkForm.studentIds.length} selected</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowBulkModal(false)} className="btn-secondary">Cancel</button>
                <button
                  type="submit"
                  disabled={bulkCreateMutation.isPending || bulkForm.studentIds.length === 0}
                  className="btn-primary"
                >
                  {bulkCreateMutation.isPending ? 'Creating...' : `Create for ${bulkForm.studentIds.length} students`}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-zinc-800 rounded" />
      ))}
    </div>
  );
}
