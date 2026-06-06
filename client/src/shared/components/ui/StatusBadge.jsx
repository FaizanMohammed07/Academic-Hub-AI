/**
 * StatusBadge
 * Props:
 *   status – string  (pending | submitted | approved | graded | rejected |
 *                     overdue | draft | published | closed)
 */

const STATUS_MAP = {
  pending:   { cls: 'badge-amber',                                             label: 'Pending'   },
  submitted: { cls: 'badge-blue',                                              label: 'Submitted' },
  approved:  { cls: 'badge-green',                                             label: 'Approved'  },
  graded:    { cls: 'badge-green',                                             label: 'Graded'    },
  rejected:  { cls: 'badge-red',                                               label: 'Rejected'  },
  overdue:   { cls: 'badge-red',                                               label: 'Overdue'   },
  draft:     { cls: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 rounded-full px-2.5 py-0.5 text-xs font-medium', label: 'Draft'     },
  published: { cls: 'badge-green',                                             label: 'Published' },
  closed:    { cls: 'bg-gray-200 text-gray-500 dark:bg-zinc-700 dark:text-gray-400 rounded-full px-2.5 py-0.5 text-xs font-medium', label: 'Closed'    },
};

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  const config     = STATUS_MAP[normalized] ?? {
    cls:   'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 rounded-full px-2.5 py-0.5 text-xs font-medium',
    label: status || 'Unknown',
  };

  return <span className={config.cls}>{config.label}</span>;
}
