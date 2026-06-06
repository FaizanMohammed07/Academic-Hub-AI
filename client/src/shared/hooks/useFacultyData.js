import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  facultyAPI,
  assignmentAPI,
  submissionAPI,
  observationAPI,
  quizAPI,
  aiAPI,
} from '@services/api';
import { useToast } from '@shared/context/NotificationContext';

// ── Dashboard & overview ──────────────────────────────────────
export const useFacultyDashboard = () =>
  useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn:  () => facultyAPI.getDashboard().then((r) => r.data.data),
    staleTime: 30_000,
  });

export const useFacultySubjects = (semId) =>
  useQuery({
    queryKey: ['faculty', 'subjects', semId],
    queryFn:  () => facultyAPI.getMySubjects(semId).then((r) => r.data.data),
  });

export const useSubjectStudents = (subId) =>
  useQuery({
    queryKey: ['faculty', 'students', subId],
    queryFn:  () => facultyAPI.getSubjectStudents(subId).then((r) => r.data.data),
    enabled:  !!subId,
  });

export const useFacultyStats = (subId) =>
  useQuery({
    queryKey: ['faculty', 'stats', subId],
    queryFn:  () => facultyAPI.getStats(subId).then((r) => r.data.data),
    enabled:  !!subId,
  });

// ── Assignments ───────────────────────────────────────────────
export const useFacultyAssignments = (params) =>
  useQuery({
    queryKey: ['assignments', 'faculty', params],
    queryFn:  () => assignmentAPI.getMyAssignments(params).then((r) => r.data),
  });

export const useAssignment = (id) =>
  useQuery({
    queryKey: ['assignment', id],
    queryFn:  () => assignmentAPI.getById(id).then((r) => r.data.data),
    enabled:  !!id,
  });

export const useAssignmentsBySubject = (subjectId) =>
  useQuery({
    queryKey: ['assignments', 'subject', subjectId],
    queryFn:  () => assignmentAPI.getBySubject(subjectId).then((r) => r.data.data),
    enabled:  !!subjectId,
  });

export const useAssignmentSubmissions = (id, params) =>
  useQuery({
    queryKey: ['submissions', 'assignment', id, params],
    queryFn:  () => assignmentAPI.getSubmissions(id, params).then((r) => r.data),
    enabled:  !!id,
  });

// ── Observations ──────────────────────────────────────────────
export const useFacultyObservations = (params) =>
  useQuery({
    queryKey: ['observations', 'faculty', params],
    queryFn:  () => observationAPI.getForFaculty(params).then((r) => r.data),
  });

// ── Quizzes ───────────────────────────────────────────────────
export const useFacultyQuizzes = (params) =>
  useQuery({
    queryKey: ['quizzes', 'faculty', params],
    queryFn:  () => quizAPI.getMyQuizzes(params).then((r) => r.data),
  });

export const useQuizResults = (id) =>
  useQuery({
    queryKey: ['quiz', id, 'results'],
    queryFn:  () => quizAPI.getResults(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── AI ────────────────────────────────────────────────────────
export const useSubjectAnalysis = (subId) =>
  useQuery({
    queryKey: ['ai', 'analysis', subId],
    queryFn:  () => aiAPI.getAnalysis(subId).then((r) => r.data.data),
    enabled:  !!subId,
  });

// ── Mutations ─────────────────────────────────────────────────
export const useCreateAssignment = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: assignmentAPI.create,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Created', 'Assignment created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateAssignment = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => assignmentAPI.update(id, data),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['assignment', id] });
      toast.success('Updated', 'Assignment updated');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const usePublishAssignment = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => assignmentAPI.publish(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Published', 'Students notified');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteAssignment = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => assignmentAPI.delete(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Deleted', 'Assignment deleted');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useEvaluateSubmission = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => submissionAPI.evaluate(id, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Evaluated', 'Student notified');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useCreateObservation = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: observationAPI.create,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Created', 'Observation recorded');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useBulkCreateObservations = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: observationAPI.bulkCreate,
    onSuccess:  (r) => {
      qc.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Created', `${r.data.data?.created || 0} observations recorded`);
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useCreateQuiz = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: quizAPI.create,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['quizzes', 'faculty'] });
      toast.success('Created', 'Quiz created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const usePublishQuiz = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => quizAPI.publish(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Published', 'Students can now take the quiz');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useGenerateQuestions = () => {
  const toast = useToast();
  return useMutation({
    mutationFn: aiAPI.generateQuestions,
    onError:    (e) => toast.error('Error', e.response?.data?.message || 'Generation failed'),
  });
};

export const useGenerateStudyMaterial = () => {
  const toast = useToast();
  return useMutation({
    mutationFn: aiAPI.generateStudyMaterial,
    onError:    (e) => toast.error('Error', e.response?.data?.message || 'Generation failed'),
  });
};
