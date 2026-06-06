import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { authAPI } from '@services/api';
import { useToast } from '../context/NotificationContext';

const ROLE_HOME = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  hod:     '/hod/dashboard',
  admin:   '/admin/dashboard',
};

export const useLogin = () => {
  const { login } = useAuthStore();
  const navigate  = useNavigate();
  const toast     = useToast();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: ({ data }) => {
      login(data.data);
      toast.success('Welcome back!', data.data.user.fullName);
      navigate(ROLE_HOME[data.data.user.role] || '/');
    },
    onError: (err) => {
      toast.error('Login failed', err.response?.data?.message || 'Invalid credentials');
    },
  });
};

export const useLogout = () => {
  const { logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const toast    = useToast();

  return useMutation({
    mutationFn: () => authAPI.logout({ refreshToken }),
    onSettled: () => {
      logout();
      navigate('/login');
      toast.info('Logged out', 'See you soon!');
    },
  });
};

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
