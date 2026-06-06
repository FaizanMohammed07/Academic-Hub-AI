import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentAPI,
  academicAPI,
  assignmentAPI,
  submissionAPI,
  observationAPI,
  vaultAPI,
  notificationAPI,
  quizAPI,
  aiAPI,
} from '@services/api';

// ── Dashboard & overview ──────────────────────────────────────
export const useStudentDashboard = () =>
  useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn:  () => studentAPI.getDashboard().then((r) => r.data.data),
    staleTime: 30_000,
  });

export const useStudentSubjects = () =>
  useQuery({
    queryKey: ['student', 'subjects'],
    queryFn:  () => studentAPI.getSubjects().then((r) => r.data.data),
  });

export const useStudentAssignments = (params) =>
  useQuery({
    queryKey: ['student', 'assignments', params],
    queryFn:  () => studentAPI.getAssignments(params).then((r) => r.data),
    enabled:  true,
  });

export const useStudentStats = () =>
  useQuery({
    queryKey: ['student', 'stats'],
    queryFn:  () => studentAPI.getStats().then((r) => r.data.data),
  });

export const useStudentTimetable = () =>
  useQuery({
    queryKey: ['student', 'timetable'],
    queryFn:  () => academicAPI.getStudentTimetable().then((r) => r.data.data),
  });

// ── Submissions ───────────────────────────────────────────────
export const useMySubmissions = (params) =>
  useQuery({
    queryKey: ['submissions', 'mine', params],
    queryFn:  () => submissionAPI.getMySubmissions(params).then((r) => r.data),
  });

export const useSubmission = (id) =>
  useQuery({
    queryKey: ['submission', id],
    queryFn:  () => submissionAPI.getById(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── Observations ──────────────────────────────────────────────
export const useStudentObservations = () =>
  useQuery({
    queryKey: ['observations', 'student'],
    queryFn:  () => observationAPI.getForStudent().then((r) => r.data.data),
  });

// ── Vault ─────────────────────────────────────────────────────
export const useVaultSummary = () =>
  useQuery({
    queryKey: ['vault', 'summary'],
    queryFn:  () => vaultAPI.getSummary().then((r) => r.data.data),
  });

export const useCertificates = () =>
  useQuery({
    queryKey: ['vault', 'certificates'],
    queryFn:  () => vaultAPI.getCertificates().then((r) => r.data.data),
  });

// ── Notifications ─────────────────────────────────────────────
export const useNotifications = (params) =>
  useQuery({
    queryKey:        ['notifications', params],
    queryFn:         () => notificationAPI.getAll(params).then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey:        ['notifications', 'unread'],
    queryFn:         () => notificationAPI.getUnreadCount().then((r) => r.data.data?.count || 0),
    refetchInterval: 30_000,
  });

// ── Quizzes ───────────────────────────────────────────────────
export const useStudentQuizzes = () =>
  useQuery({
    queryKey: ['quizzes', 'student'],
    queryFn:  () => quizAPI.getStudentQuizzes().then((r) => r.data.data),
  });

export const useQuiz = (id) =>
  useQuery({
    queryKey: ['quiz', id],
    queryFn:  () => quizAPI.getById(id).then((r) => r.data.data),
    enabled:  !!id,
  });

export const useMyQuizAttempt = (id) =>
  useQuery({
    queryKey: ['quiz', id, 'attempt'],
    queryFn:  () => quizAPI.getMyAttempt(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── AI Conversations ──────────────────────────────────────────
export const useAIConversations = (params) =>
  useQuery({
    queryKey: ['ai', 'conversations', params],
    queryFn:  () => aiAPI.getConversations(params).then((r) => r.data.data),
  });

export const useAIConversation = (id) =>
  useQuery({
    queryKey: ['ai', 'conversation', id],
    queryFn:  () => aiAPI.getConversation(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── Mutations ─────────────────────────────────────────────────
export const useSubmitAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submissionAPI.submit,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['submissions', 'mine'] });
      qc.invalidateQueries({ queryKey: ['student', 'assignments'] });
    },
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAllRead,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useSubmitQuizAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => quizAPI.submitAttempt(id, data),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['quiz', id, 'attempt'] });
      qc.invalidateQueries({ queryKey: ['quizzes', 'student'] });
    },
  });
};
