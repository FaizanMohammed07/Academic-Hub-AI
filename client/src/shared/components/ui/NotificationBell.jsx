import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn:  () => notificationAPI.getUnreadCount().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationAPI.getAll({ limit: 10 }).then((r) => r.data.data),
    enabled:  open,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: notificationAPI.markAllRead,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = countData?.count || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-icon btn-ghost relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-80 z-40 card shadow-soft overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                {unread > 0 && (
                  <button onClick={() => markAllRead()} className="text-xs text-brand-500 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {(!notifications || notifications.length === 0) && (
                  <p className="text-center text-sm text-gray-400 py-8">No notifications</p>
                )}
                {notifications?.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 ${
                      !n.isRead ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        {n.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.message}</p>}
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
