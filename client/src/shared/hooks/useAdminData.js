import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminAPI,
  academicAPI,
  cmsAPI,
  noticeAPI,
  analyticsAPI,
} from '@services/api';
import { useToast } from '@shared/context/NotificationContext';

// ── Dashboard & analytics ─────────────────────────────────────
export const useAdminDashboard = () =>
  useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn:  () => adminAPI.getDashboardStats().then((r) => r.data.data),
    staleTime: 60_000,
  });

export const usePlatformAnalytics = () =>
  useQuery({
    queryKey: ['analytics', 'platform'],
    queryFn:  () => analyticsAPI.getPlatform().then((r) => r.data.data),
  });

export const useSemesterAnalytics = (id) =>
  useQuery({
    queryKey: ['analytics', 'semester', id],
    queryFn:  () => analyticsAPI.getSemester(id).then((r) => r.data.data),
    enabled:  !!id,
  });

export const useSubjectAnalytics = (id) =>
  useQuery({
    queryKey: ['analytics', 'subject', id],
    queryFn:  () => analyticsAPI.getSubject(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── Users ─────────────────────────────────────────────────────
export const useUsers = (params) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn:  () => adminAPI.getUsers(params).then((r) => r.data),
  });

export const useUser = (id) =>
  useQuery({
    queryKey: ['admin', 'user', id],
    queryFn:  () => adminAPI.getUserById(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── Academic Years ────────────────────────────────────────────
export const useAcademicYears = () =>
  useQuery({
    queryKey: ['academic', 'years'],
    queryFn:  () => academicAPI.getAcademicYears().then((r) => r.data.data),
  });

// ── Semesters ─────────────────────────────────────────────────
export const useSemesters = (yearId) =>
  useQuery({
    queryKey: ['academic', 'semesters', yearId],
    queryFn:  () => academicAPI.getSemesters(yearId).then((r) => r.data.data),
    enabled:  !!yearId,
  });

export const useCurrentSemester = () =>
  useQuery({
    queryKey: ['academic', 'semesters', 'current'],
    queryFn:  () => academicAPI.getCurrentSemester().then((r) => r.data.data),
  });

// ── Subjects ──────────────────────────────────────────────────
export const useSubjects = (semId) =>
  useQuery({
    queryKey: ['academic', 'subjects', semId],
    queryFn:  () => academicAPI.getSubjects(semId).then((r) => r.data.data),
    enabled:  !!semId,
  });

// ── Faculty Assignments ───────────────────────────────────────
export const useFacultyMappings = (semId) =>
  useQuery({
    queryKey: ['academic', 'faculty-mappings', semId],
    queryFn:  () => academicAPI.getFacultyMappings(semId).then((r) => r.data.data),
    enabled:  !!semId,
  });

// ── Enrollments ───────────────────────────────────────────────
export const useSemesterStudents = (semId) =>
  useQuery({
    queryKey: ['academic', 'enrollments', semId],
    queryFn:  () => academicAPI.getSemesterStudents(semId).then((r) => r.data.data),
    enabled:  !!semId,
  });

// ── Timetable ─────────────────────────────────────────────────
export const useTimetable = (params) =>
  useQuery({
    queryKey: ['academic', 'timetable', params],
    queryFn:  () => academicAPI.getTimetable(params).then((r) => r.data.data),
  });

// ── Audit logs ────────────────────────────────────────────────
export const useAuditLogs = (params) =>
  useQuery({
    queryKey: ['audit', params],
    queryFn:  () => adminAPI.getAuditLogs(params).then((r) => r.data),
  });

// ── Settings ─────────────────────────────────────────────────
export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn:  () => adminAPI.getSettings().then((r) => r.data.data),
  });

// ── Notices ───────────────────────────────────────────────────
export const useNotices = (params) =>
  useQuery({
    queryKey: ['notices', params],
    queryFn:  () => noticeAPI.getAll(params).then((r) => r.data),
  });

export const useNotice = (id) =>
  useQuery({
    queryKey: ['notice', id],
    queryFn:  () => noticeAPI.getById(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── Mutations ─────────────────────────────────────────────────
export const useCreateUser = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: adminAPI.createUser,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Created', 'User account created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateUser = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminAPI.updateUser(id, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Updated', 'User updated');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteUser = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Deleted', 'User account removed');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useResetUserPassword = () => {
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminAPI.resetPassword(id, data),
    onSuccess:  () => toast.success('Done', 'Password reset successfully'),
    onError:    (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useCreateAcademicYear = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: academicAPI.createAcademicYear,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'years'] });
      toast.success('Created', 'Academic year created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useSetCurrentYear = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => academicAPI.setCurrentYear(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'years'] });
      toast.success('Updated', 'Current academic year set');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useCreateSemester = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: academicAPI.createSemester,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic'] });
      toast.success('Created', 'Semester created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useSetCurrentSemester = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => academicAPI.setCurrentSemester(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'semesters'] });
      toast.success('Updated', 'Current semester set');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useCreateSubject = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: academicAPI.createSubject,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'subjects'] });
      toast.success('Created', 'Subject created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateSubject = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => academicAPI.updateSubject(id, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'subjects'] });
      toast.success('Updated', 'Subject updated');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteSubject = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => academicAPI.deleteSubject(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'subjects'] });
      toast.success('Deleted', 'Subject removed');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useAssignFaculty = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: academicAPI.assignFaculty,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'faculty-mappings'] });
      toast.success('Assigned', 'Faculty assigned to subject');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useRemoveFacultyMapping = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => academicAPI.removeFacultyMapping(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'faculty-mappings'] });
      toast.success('Removed', 'Faculty assignment removed');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useEnrollStudents = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: academicAPI.enrollStudents,
    onSuccess:  (r) => {
      qc.invalidateQueries({ queryKey: ['academic', 'enrollments'] });
      toast.success('Enrolled', `${r.data.data?.enrolled || 0} students enrolled`);
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useUnenrollStudent = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => academicAPI.unenrollStudent(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'enrollments'] });
      toast.success('Removed', 'Student unenrolled');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useSaveTimetable = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: academicAPI.saveTimetable,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['academic', 'timetable'] });
      toast.success('Saved', 'Timetable saved successfully');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateSetting = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ key, ...data }) => adminAPI.updateSetting(key, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Saved', 'Setting updated');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useCreateNotice = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: noticeAPI.create,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Created', 'Notice created');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useUpdateNotice = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => noticeAPI.update(id, data),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['notices'] });
      qc.invalidateQueries({ queryKey: ['notice', id] });
      toast.success('Updated', 'Notice updated');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const usePublishNotice = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: noticeAPI.publish,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Published', 'Notice sent to all users');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

export const useDeleteNotice = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => noticeAPI.delete(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Deleted', 'Notice removed');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};

// ── CMS mutations ─────────────────────────────────────────────
export const useUpsertCMSSection = () => {
  const qc    = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ key, ...data }) => cmsAPI.upsertSection(key, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['cms'] });
      toast.success('Saved', 'Section updated');
    },
    onError: (e) => toast.error('Error', e.response?.data?.message || 'Failed'),
  });
};
