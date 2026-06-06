import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@shared/context/NotificationContext';
import {
  Users, Search, Plus, Pencil, KeyRound, UserX, UserCheck,
  ChevronLeft, ChevronRight, X, Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const createSchema = z.object({
  role:     z.enum(['student', 'faculty', 'hod', 'admin']),
  loginId:  z.string().min(2, 'Required'),
  fullName: z.string().min(2, 'Required'),
  email:    z.string().email('Invalid email'),
  phone:    z.string().optional(),
  password: z.string().min(6, 'Min 6 characters'),
});
const editSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  email:    z.string().email('Invalid email'),
  phone:    z.string().optional(),
  isActive: z.boolean(),
});
const pwSchema = z.object({ newPassword: z.string().min(6, 'Min 6 characters') });

const ROLES = ['all', 'student', 'faculty', 'hod', 'admin'];
const ROLE_LABELS = { all: 'All', student: 'Students', faculty: 'Faculty', hod: 'HOD', admin: 'Admin' };

const stagger = { visible: { transition: { staggerChildren: 0.04 } } };
const rowAnim = { hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.2 } } };

export default function UserManagement() {
  const qc   = useQueryClient();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [addOpen, setAddOpen]       = useState(searchParams.get('action') === 'add');
  const [editUser, setEditUser]     = useState(null);
  const [pwUser, setPwUser]         = useState(null);

  const params = {
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(search && { search }),
    page,
    limit: 15,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn:  () => adminAPI.getUsers(params).then((r) => r.data),
    keepPreviousData: true,
  });

  const users      = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const createMut = useMutation({
    mutationFn: (d) => adminAPI.createUser(d),
    onSuccess:  () => { qc.invalidateQueries(['admin', 'users']); setAddOpen(false); toast.success('User created successfully'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });
  const editMut = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess:  () => { qc.invalidateQueries(['admin', 'users']); setEditUser(null); toast.success('User updated'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to update user'),
  });
  const pwMut = useMutation({
    mutationFn: ({ id, data }) => adminAPI.resetPassword(id, data),
    onSuccess:  () => { setPwUser(null); toast.success('Password reset successfully'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to reset password'),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }) => adminAPI.updateUser(id, { isActive }),
    onSuccess:  () => qc.invalidateQueries(['admin', 'users']),
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all platform users</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={roleFilter === r ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, login ID, email…"
            className="input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
            <p className="text-gray-400 dark:text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  {['User', 'Login ID', 'Email', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={stagger} initial="hidden" animate="visible">
                {users.map((u) => (
                  <motion.tr
                    key={u._id}
                    variants={rowAnim}
                    className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.fullName?.[0] || '?'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{u.loginId}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3">
                      <span className={u.isActive !== false ? 'badge-green' : 'badge-red'}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditUser(u)} className="btn-ghost btn-icon btn-sm" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setPwUser(u)} className="btn-ghost btn-icon btn-sm" title="Reset Password">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleMut.mutate({ id: u._id, isActive: u.isActive === false })}
                          className="btn-ghost btn-icon btn-sm"
                          title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive !== false
                            ? <UserX className="w-3.5 h-3.5 text-red-400" />
                            : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {addOpen && (
          <SlideOver title="Add New User" onClose={() => setAddOpen(false)}>
            <AddUserForm onSubmit={(d) => createMut.mutate(d)} loading={createMut.isLoading} />
          </SlideOver>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editUser && (
          <SlideOver title="Edit User" onClose={() => setEditUser(null)}>
            <EditUserForm user={editUser} onSubmit={(d) => editMut.mutate({ id: editUser._id, data: d })} loading={editMut.isLoading} />
          </SlideOver>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pwUser && (
          <ModalOverlay title={`Reset Password — ${pwUser.fullName}`} onClose={() => setPwUser(null)}>
            <ResetPwForm onSubmit={(d) => pwMut.mutate({ id: pwUser._id, data: d })} loading={pwMut.isLoading} />
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddUserForm({ onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(createSchema) });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Role" error={errors.role}>
        <select {...register('role')} className="input">
          <option value="">Select role…</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="admin">Admin</option>
        </select>
      </FormField>
      <FormField label="Login ID" error={errors.loginId}>
        <input {...register('loginId')} placeholder="Roll No / Emp ID / Username" className="input" />
      </FormField>
      <FormField label="Full Name" error={errors.fullName}>
        <input {...register('fullName')} className="input" />
      </FormField>
      <FormField label="Email" error={errors.email}>
        <input {...register('email')} type="email" className="input" />
      </FormField>
      <FormField label="Phone" error={errors.phone}>
        <input {...register('phone')} className="input" />
      </FormField>
      <FormField label="Password" error={errors.password}>
        <input {...register('password')} type="password" className="input" />
      </FormField>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
      </button>
    </form>
  );
}

function EditUserForm({ user, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { fullName: user.fullName, email: user.email, phone: user.phone || '', isActive: user.isActive !== false },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Full Name" error={errors.fullName}>
        <input {...register('fullName')} className="input" />
      </FormField>
      <FormField label="Email" error={errors.email}>
        <input {...register('email')} type="email" className="input" />
      </FormField>
      <FormField label="Phone" error={errors.phone}>
        <input {...register('phone')} className="input" />
      </FormField>
      <div className="flex items-center gap-3">
        <input {...register('isActive')} type="checkbox" id="isActive" className="w-4 h-4 rounded" />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
      </button>
    </form>
  );
}

function ResetPwForm({ onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(pwSchema) });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="New Password" error={errors.newPassword}>
        <input {...register('newPassword')} type="password" className="input" />
      </FormField>
      <button type="submit" disabled={loading} className="btn-danger w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
      </button>
    </form>
  );
}

function SlideOver({ title, onClose, children }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </motion.div>
    </>
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

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

const RoleBadge = ({ role }) => {
  const map = { student: 'badge-blue', faculty: 'badge-brand', hod: 'badge-amber', admin: 'badge-red' };
  return <span className={map[role] || 'badge-blue'}>{role}</span>;
};

const TableSkeleton = () => (
  <div className="animate-pulse p-4 space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-12 bg-gray-100 dark:bg-zinc-800 rounded" />
    ))}
  </div>
);
