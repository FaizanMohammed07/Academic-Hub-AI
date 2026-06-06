import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@services/api';
import { useUnreadCount, useNotifications } from '@shared/hooks/useStudentData';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  // Real hooks — poll every 30 s for unread count
  const { data: unreadCount = 0 } = useUnreadCount();

  // Fetch the 10 most recent notifications only when the panel is open
  const { data: notifData } = useNotifications(open ? { limit: 10 } : null);
  const notifications = notifData?.data ?? notifData?.notifications ?? (Array.isArray(notifData) ? notifData : []);

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: notificationAPI.markAllRead,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleNotificationClick = (n) => {
    if (!n.isRead) markRead(n._id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-icon btn-ghost relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-outside overlay */}
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-80 z-40 card shadow-soft overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/40 ${
                        !n.isRead
                          ? 'bg-brand-50/50 dark:bg-brand-950/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {n.message}
                            </p>
                          )}
                          {n.createdAt && (
                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                              {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                            </p>
                          )}
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
