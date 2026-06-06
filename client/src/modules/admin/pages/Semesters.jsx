import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicAPI, adminAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@shared/context/NotificationContext';
import {
  BookMarked, Plus, Star, Users, X, Loader2, ChevronRight, Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const yearSchema = z.object({
  name:      z.string().min(2, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate:   z.string().min(1, 'Required'),
});
const semSchema = z.object({
  number:    z.coerce.number().min(1).max(8),
  section:   z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate:   z.string().min(1, 'Required'),
});

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Semesters() {
  const qc    = useQueryClient();
  const toast = useToast();

  const [selectedYear, setSelectedYear]     = useState(null);
  const [selectedSem, setSelectedSem]       = useState(null);
  const [enrollOpen, setEnrollOpen]         = useState(false);
  const [addSemOpen, setAddSemOpen]         = useState(false);
  const [studentSearch, setStudentSearch]   = useState('');
  const [checkedStudents, setCheckedStudents] = useState([]);

  const { data: years = [], isLoading: yearsLoading } = useQuery({
    queryKey: ['academic', 'years'],
    queryFn:  () => academicAPI.getAcademicYears().then((r) => r.data.data),
  });

  const { data: semesters = [], isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', selectedYear?._id],
    queryFn:  () => academicAPI.getSemesters(selectedYear._id).then((r) => r.data.data),
    enabled:  !!selectedYear,
  });

  const { data: allStudentsData } = useQuery({
    queryKey: ['admin', 'users', { role: 'student', limit: 200 }],
    queryFn:  () => adminAPI.getUsers({ role: 'student', limit: 200 }).then((r) => r.data),
    enabled:  enrollOpen,
  });
  const allStudents = allStudentsData?.data || [];

  const setCurrentYearMut = useMutation({
    mutationFn: (id) => academicAPI.setCurrentYear(id),
    onSuccess:  () => { qc.invalidateQueries(['academic', 'years']); toast.success('Current year updated'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const createYearMut = useMutation({
    mutationFn: (d) => academicAPI.createAcademicYear(d),
    onSuccess:  (res) => { qc.invalidateQueries(['academic', 'years']); toast.success('Academic year created'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const createSemMut = useMutation({
    mutationFn: (d) => academicAPI.createSemester({ ...d, academicYear: selectedYear._id }),
    onSuccess:  () => { qc.invalidateQueries(['semesters', selectedYear?._id]); setAddSemOpen(false); toast.success('Semester created'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const setCurrentSemMut = useMutation({
    mutationFn: (id) => academicAPI.setCurrentSemester(id),
    onSuccess:  () => { qc.invalidateQueries(['semesters', selectedYear?._id]); toast.success('Current semester updated'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const enrollMut = useMutation({
    mutationFn: (d) => academicAPI.enrollStudents(d),
    onSuccess:  () => { setEnrollOpen(false); setCheckedStudents([]); toast.success('Students enrolled'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to enroll'),
  });

  const { register: yrReg, handleSubmit: yrSubmit, reset: yrReset, formState: { errors: yrErr } } = useForm({ resolver: zodResolver(yearSchema) });
  const { register: semReg, handleSubmit: semSubmit, reset: semReset, formState: { errors: semErr } } = useForm({ resolver: zodResolver(semSchema) });

  const filteredStudents = allStudents.filter(
    (s) => !studentSearch || s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || s.loginId?.includes(studentSearch)
  );

  const toggleStudent = (id) => setCheckedStudents((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="page-title">Semesters & Enrollment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage academic years, semesters and student enrollments</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Academic Years */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <h2 className="section-title mb-4">Add Academic Year</h2>
            <form onSubmit={yrSubmit((d) => { createYearMut.mutate(d); yrReset(); })} className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input {...yrReg('name')} placeholder="e.g. 2025-26" className="input" />
                {yrErr.name && <p className="text-xs text-red-500 mt-1">{yrErr.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Start Date</label>
                  <input {...yrReg('startDate')} type="date" className="input" />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input {...yrReg('endDate')} type="date" className="input" />
                </div>
              </div>
              <button type="submit" disabled={createYearMut.isLoading} className="btn-primary w-full">
                {createYearMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Add Year</>}
              </button>
            </form>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="section-title">Academic Years</h2>
            </div>
            {yearsLoading ? (
              <div className="animate-pulse p-4 space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded" />)}
              </div>
            ) : years.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No academic years yet</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                {years.map((yr) => (
                  <motion.div
                    key={yr._id}
                    variants={item}
                    onClick={() => setSelectedYear(yr)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-3
                      ${selectedYear?._id === yr._id ? 'bg-brand-50 dark:bg-brand-950/20 border-l-2 border-brand-500' : ''}`}
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {yr.name}
                        {yr.isCurrent && <span className="badge-green text-xs">Current</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {yr.startDate ? format(new Date(yr.startDate), 'MMM yyyy') : '—'} – {yr.endDate ? format(new Date(yr.endDate), 'MMM yyyy') : '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!yr.isCurrent && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentYearMut.mutate(yr._id); }}
                          className="btn-secondary btn-sm"
                        >
                          <Star className="w-3 h-3" /> Set Current
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Semesters */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedYear ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <BookMarked className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
              <p className="text-gray-400 dark:text-gray-600">Select an academic year to view semesters</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="section-title">Semesters — {selectedYear.name}</h2>
                <button onClick={() => setAddSemOpen(true)} className="btn-primary btn-sm">
                  <Plus className="w-4 h-4" /> Add Semester
                </button>
              </div>

              {semsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
                </div>
              ) : semesters.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">No semesters added yet</div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                  {semesters.map((sem) => (
                    <motion.div key={sem._id} variants={item} className="card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Semester {sem.number} — {sem.section}
                            </span>
                            {sem.isCurrent && <span className="badge-green">Current</span>}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {sem.startDate ? format(new Date(sem.startDate), 'MMM d, yyyy') : '—'} – {sem.endDate ? format(new Date(sem.endDate), 'MMM d, yyyy') : '—'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex gap-3">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sem.studentCount ?? 0} students</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!sem.isCurrent && (
                            <button onClick={() => setCurrentSemMut.mutate(sem._id)} className="btn-secondary btn-sm">
                              <Star className="w-3 h-3" /> Set Current
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedSem(sem); setEnrollOpen(true); }}
                            className="btn-primary btn-sm"
                          >
                            <Users className="w-3 h-3" /> Enroll Students
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Semester Modal */}
      <AnimatePresence>
        {addSemOpen && (
          <ModalOverlay title="Add Semester" onClose={() => setAddSemOpen(false)}>
            <form
              onSubmit={semSubmit((d) => { createSemMut.mutate(d); semReset(); })}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Semester No.</label>
                  <input {...semReg('number')} type="number" min={1} max={8} className="input" />
                  {semErr.number && <p className="text-xs text-red-500 mt-1">{semErr.number.message}</p>}
                </div>
                <div>
                  <label className="label">Section</label>
                  <input {...semReg('section')} placeholder="A / B / C" className="input" />
                  {semErr.section && <p className="text-xs text-red-500 mt-1">{semErr.section.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Date</label>
                  <input {...semReg('startDate')} type="date" className="input" />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input {...semReg('endDate')} type="date" className="input" />
                </div>
              </div>
              <button type="submit" disabled={createSemMut.isLoading} className="btn-primary w-full">
                {createSemMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Semester'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Enroll Students Modal */}
      <AnimatePresence>
        {enrollOpen && selectedSem && (
          <ModalOverlay
            title={`Enroll Students — Sem ${selectedSem.number} ${selectedSem.section}`}
            onClose={() => { setEnrollOpen(false); setCheckedStudents([]); }}
            wide
          >
            <div className="space-y-4">
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student…"
                className="input"
              />
              <div className="max-h-72 overflow-y-auto space-y-2 border border-gray-100 dark:border-zinc-700 rounded-lg p-2">
                {filteredStudents.length === 0 && <p className="text-center text-gray-400 py-4">No students found</p>}
                {filteredStudents.map((s) => (
                  <label key={s._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedStudents.includes(s._id)}
                      onChange={() => toggleStudent(s._id)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                      {s.fullName?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{s.fullName}</div>
                      <div className="text-xs text-gray-400">{s.loginId}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{checkedStudents.length} selected</span>
                <button
                  onClick={() => enrollMut.mutate({ studentIds: checkedStudents, semesterId: selectedSem._id })}
                  disabled={checkedStudents.length === 0 || enrollMut.isLoading}
                  className="btn-primary"
                >
                  {enrollMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enroll Selected'}
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalOverlay({ title, onClose, children, wide = false }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full ${wide ? 'max-w-lg' : 'max-w-md'} p-6`}>
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
