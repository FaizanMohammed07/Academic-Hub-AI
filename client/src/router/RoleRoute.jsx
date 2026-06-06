import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

const ROLE_HOME = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  hod:     '/hod/dashboard',
  admin:   '/admin/dashboard',
};

export default function RoleRoute({ role, children }) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  // HOD can also access faculty panel for backward compat
  const effectiveRole = user.role === 'hod' && role === 'faculty' ? 'faculty' : user.role;
  if (effectiveRole !== role) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return children;
}
