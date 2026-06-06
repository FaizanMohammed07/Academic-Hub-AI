import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicAPI, adminAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@shared/context/NotificationContext';
import { Library, Plus, UserPlus, X, Loader2, Trash2, LayoutGrid, TableIcon } from 'lucide-react';

const subjectSchema = z.object({
  code:    z.string().min(2, 'Required'),
  name:    z.string().min(2, 'Required'),
  credits: z.coerce.number().min(1).max(6),
  type:    z.enum(['theory', 'lab', 'elective']),
});

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

const TYPE_COLORS = {
  theory:   'badge-blue',
  lab:      'badge-green',
  elective: 'badge-amber',
};

export default function Subjects() {
  const qc    = useQueryClient();
  const toast = useToast();

  const [selectedSem, setSelectedSem]         = useState(null);
  const [addSubjectOpen, setAddSubjectOpen]   = useState(false);
  const [assignTarget, setAssignTarget]       = useState(null); // subject to assign faculty to
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [view, setView]                       = useState('card');

  // Semesters (all, for selector)
  const { data: semesters = [], isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', 'all'],
    queryFn:  () => academicAPI.getSemesters().then((r) => r.data.data),
  });

  // Subjects for selected semester
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', selectedSem],
    queryFn:  () => academicAPI.getSubjects(selectedSem).then((r) => r.data.data),
    enabled:  !!selectedSem,
  });

  // Faculty assignments for selected semester
  const { data: mappings = [] } = useQuery({
    queryKey: ['faculty-assignments', selectedSem],
    queryFn:  () => academicAPI.getFacultyMappings(selectedSem).then((r) => r.data.data),
    enabled:  !!selectedSem,
  });

  // Faculty list for assignment modal
  const { data: facultyData } = useQuery({
    queryKey: ['admin', 'users', { role: 'faculty', limit: 200 }],
    queryFn:  () => adminAPI.getUsers({ role: 'faculty', limit: 200 }).then((r) => r.data),
    enabled:  !!assignTarget,
  });
  const facultyList = facultyData?.data || [];

  const createSubjectMut = useMutation({
    mutationFn: (d) => academicAPI.createSubject({ ...d, semesterId: selectedSem }),
    onSuccess:  () => { qc.invalidateQueries(['subjects', selectedSem]); setAddSubjectOpen(false); toast.success('Subject created'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const assignFacultyMut = useMutation({
    mutationFn: (d) => academicAPI.assignFaculty(d),
    onSuccess:  () => { qc.invalidateQueries(['faculty-assignments', selectedSem]); setAssignTarget(null); toast.success('Faculty assigned'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to assign'),
  });
  const removeMappingMut = useMutation({
    mutationFn: (id) => academicAPI.removeFacultyMapping(id),
    onSuccess:  () => { qc.invalidateQueries(['faculty-assignments', selectedSem]); toast.success('Faculty removed'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteSubjectMut = useMutation({
    mutationFn: (id) => academicAPI.deleteSubject(id),
    onSuccess:  () => { qc.invalidateQueries(['subjects', selectedSem]); toast.success('Subject deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(subjectSchema) });

  // Map subject -> assigned faculty mapping
  const mappingsBySubject = {};
  (mappings || []).forEach((m) => {
    if (!mappingsBySubject[m.subject?._id || m.subject]) mappingsBySubject[m.subject?._id || m.subject] = [];
    mappingsBySubject[m.subject?._id || m.subject].push(m);
  });

  const handleAssign = () => {
    if (!selectedFaculty || !assignTarget) return;
    assignFacultyMut.mutate({
      faculty:      selectedFaculty,
      subject:      assignTarget._id,
      semester:     selectedSem,
      academicYear: semesters.find((s) => s._id === selectedSem)?.academicYear,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage subjects and faculty assignments per semester</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('card')} className={view === 'card' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('matrix')} className={view === 'matrix' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Semester selector */}
      <div className="card p-4 flex items-center gap-4">
        <label className="label mb-0 flex-shrink-0">Semester:</label>
        {semsLoading ? (
          <div className="animate-pulse h-9 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
        ) : (
          <select
            value={selectedSem || ''}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">Select semester…</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>Sem {s.number} — {s.section}</option>
            ))}
          </select>
        )}
        {selectedSem && (
          <button onClick={() => setAddSubjectOpen(true)} className="btn-primary btn-sm ml-auto">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        )}
      </div>

      {/* Content */}
      {!selectedSem ? (
        <div className="card p-14 flex flex-col items-center justify-center text-center gap-3">
          <Library className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
          <p className="text-gray-400 dark:text-gray-600">Select a semester to manage subjects</p>
        </div>
      ) : subjectsLoading ? (
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-36 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="card p-12 text-center">
          <Library className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-600">No subjects for this semester</p>
        </div>
      ) : view === 'card' ? (
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const assigned = mappingsBySubject[sub._id] || [];
            return (
              <motion.div key={sub._id} variants={item} className="card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-brand text-xs font-mono">{sub.code}</span>
                      <span className={TYPE_COLORS[sub.type] || 'badge-blue'}>{sub.type}</span>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">{sub.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub.credits} credits</div>
                  </div>
                  <button
                    onClick={() => { if (window.confirm('Delete this subject?')) deleteSubjectMut.mutate(sub._id); }}
                    className="btn-ghost btn-icon btn-sm text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Assigned faculty */}
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Faculty</div>
                  <div className="flex flex-wrap gap-1">
                    {assigned.length === 0 && <span className="text-xs text-gray-400">Unassigned</span>}
                    {assigned.map((m) => (
                      <span key={m._id}
                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-full px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300">
                        {m.faculty?.fullName || 'Faculty'}
                        <button onClick={() => removeMappingMut.mutate(m._id)} className="text-red-400 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setAssignTarget(sub); setSelectedFaculty(''); }}
                  className="btn-secondary btn-sm w-full"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign Faculty
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Matrix view */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  {['Code', 'Name', 'Credits', 'Type', 'Faculty', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => {
                  const assigned = mappingsBySubject[sub._id] || [];
                  return (
                    <tr key={sub._id} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">{sub.code}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{sub.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{sub.credits}</td>
                      <td className="px-4 py-3"><span className={TYPE_COLORS[sub.type] || 'badge-blue'}>{sub.type}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {assigned.length === 0 && <span className="text-xs text-gray-400">—</span>}
                          {assigned.map((m) => (
                            <span key={m._id} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-full px-2 py-0.5 text-xs">
                              {m.faculty?.fullName}
                              <button onClick={() => removeMappingMut.mutate(m._id)} className="text-red-400"><X className="w-2.5 h-2.5" /></button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setAssignTarget(sub); setSelectedFaculty(''); }} className="btn-secondary btn-sm">
                            <UserPlus className="w-3 h-3" />
                          </button>
                          <button onClick={() => { if (window.confirm('Delete?')) deleteSubjectMut.mutate(sub._id); }} className="btn-ghost btn-sm text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      <AnimatePresence>
        {addSubjectOpen && (
          <ModalOverlay title="Add Subject" onClose={() => setAddSubjectOpen(false)}>
            <form onSubmit={handleSubmit((d) => { createSubjectMut.mutate(d); reset(); })} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Subject Code</label>
                  <input {...register('code')} placeholder="e.g. CS301" className="input" />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="label">Credits</label>
                  <input {...register('credits')} type="number" min={1} max={6} className="input" />
                  {errors.credits && <p className="text-xs text-red-500 mt-1">{errors.credits.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Subject Name</label>
                <input {...register('name')} className="input" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Type</label>
                <select {...register('type')} className="input">
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                  <option value="elective">Elective</option>
                </select>
              </div>
              <button type="submit" disabled={createSubjectMut.isLoading} className="btn-primary w-full">
                {createSubjectMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Subject'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Assign Faculty Modal */}
      <AnimatePresence>
        {assignTarget && (
          <ModalOverlay title={`Assign Faculty — ${assignTarget.name}`} onClose={() => setAssignTarget(null)}>
            <div className="space-y-4">
              <div>
                <label className="label">Select Faculty</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="input"
                >
                  <option value="">Choose faculty…</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>{f.fullName} ({f.loginId})</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAssign}
                disabled={!selectedFaculty || assignFacultyMut.isLoading}
                className="btn-primary w-full"
              >
                {assignFacultyMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Faculty'}
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalOverlay({ title, onClose, children }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{title}</h2>
            <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
          </div>
          {children}
        </div>
      </motion.div>
    </>
  );
}
