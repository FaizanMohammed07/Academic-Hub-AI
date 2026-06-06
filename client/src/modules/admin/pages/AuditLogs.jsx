import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@services/api';
import { motion } from 'framer-motion';
import { ScrollText, Search, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const stagger = { visible: { transition: { staggerChildren: 0.04 } } };
const rowAnim = { hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.2 } } };

const STATUS_COLORS = {
  success: 'badge-green',
  failed:  'badge-red',
  error:   'badge-red',
  warning: 'badge-amber',
};

const ACTIONS = ['', 'login', 'logout', 'create', 'update', 'delete', 'publish', 'reset_password', 'enroll', 'assign'];

export default function AuditLogs() {
  const [page, setPage]         = useState(1);
  const [action, setAction]     = useState('');
  const [userSearch, setUser]   = useState('');
  const [fromDate, setFrom]     = useState('');
  const [toDate, setTo]         = useState('');
  const [expanded, setExpanded] = useState(null);

  const params = {
    page,
    limit: 20,
    ...(action && { action }),
    ...(userSearch && { user: userSearch }),
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['audit', params],
    queryFn:  () => adminAPI.getAuditLogs(params).then((r) => r.data),
    keepPreviousData: true,
  });

  const logs       = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const exportCsv = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'IP', 'Status'];
    const rows = logs.map((l) => [
      l.createdAt ? format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
      l.user?.fullName || l.userId || '',
      l.user?.role || '',
      l.action || '',
      l.resource || '',
      l.ipAddress || '',
      l.status || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all platform activity</p>
        </div>
        <button onClick={exportCsv} disabled={!logs.length} className="btn-secondary">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label">Action</label>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="input">
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a || 'All Actions'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">User Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={userSearch} onChange={(e) => { setUser(e.target.value); setPage(1); }} placeholder="Name or ID…" className="input pl-9" />
          </div>
        </div>
        <div>
          <label className="label">From Date</label>
          <input type="date" value={fromDate} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="input" />
        </div>
        <div>
          <label className="label">To Date</label>
          <input type="date" value={toDate} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="input" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-zinc-800 rounded" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ScrollText className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
            <p className="text-gray-400 dark:text-gray-600">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  {['Timestamp', 'User', 'Role', 'Action', 'Resource', 'IP', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={stagger} initial="hidden" animate="visible">
                {logs.map((log) => (
                  <>
                    <motion.tr
                      key={log._id}
                      variants={rowAnim}
                      className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm:ss') : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {log.user?.fullName || log.userId || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={log.user?.role} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{log.resource || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ipAddress || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={STATUS_COLORS[log.status] || 'badge-blue'}>{log.status || 'success'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {expanded === log._id
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </td>
                    </motion.tr>
                    {expanded === log._id && (
                      <tr key={`${log._id}-detail`} className="bg-gray-50 dark:bg-zinc-800/20">
                        <td colSpan={8} className="px-4 py-4">
                          <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                            {JSON.stringify(log.details || log.metadata || {}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
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
    </div>
  );
}

const RoleBadge = ({ role }) => {
  const map = { student: 'badge-blue', faculty: 'badge-brand', hod: 'badge-amber', admin: 'badge-red' };
  return role ? <span className={map[role] || 'badge-blue'}>{role}</span> : null;
};
