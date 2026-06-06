import { AnimatePresence, motion } from 'framer-motion';
import { useToasts } from '@shared/context/NotificationContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  error:   'text-red-500 bg-red-50 dark:bg-red-900/20',
  info:    'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
};

export const Toaster = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="card flex items-start gap-3 p-4 shadow-soft"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${COLORS[t.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                {t.title   && <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.title}</p>}
                {t.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => removeToast(t.id)} className="btn-icon btn-ghost -mt-1 -mr-1 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
