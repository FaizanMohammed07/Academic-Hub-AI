import { useQuery } from '@tanstack/react-query';
import { hodAPI, noticeAPI } from '@services/api';

export const useHODDashboard = () =>
  useQuery({
    queryKey: ['hod', 'dashboard'],
    queryFn:  () => hodAPI.getDashboard().then((r) => r.data.data),
    staleTime: 30_000,
  });

export const useFacultyPerformance = (params) =>
  useQuery({
    queryKey: ['hod', 'faculty-perf', params],
    queryFn:  () => hodAPI.getFacultyPerformance(params).then((r) => r.data.data),
    enabled:  true,
  });

export const useStudentPerformance = (params) =>
  useQuery({
    queryKey: ['hod', 'student-perf', params],
    queryFn:  () => hodAPI.getStudentPerformance(params).then((r) => r.data),
    enabled:  true,
  });

export const useDeptAnalytics = (params) =>
  useQuery({
    queryKey: ['hod', 'analytics', params],
    queryFn:  () => hodAPI.getDeptAnalytics(params).then((r) => r.data.data),
    enabled:  true,
  });

export const useAssignmentStats = (params) =>
  useQuery({
    queryKey: ['hod', 'assignment-stats', params],
    queryFn:  () => hodAPI.getAssignmentStats(params).then((r) => r.data.data),
  });

export const useNotices = (params) =>
  useQuery({
    queryKey: ['notices', params],
    queryFn:  () => noticeAPI.getAll(params).then((r) => r.data),
  });
