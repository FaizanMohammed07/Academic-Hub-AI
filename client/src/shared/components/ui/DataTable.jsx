import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DataTable
 * Props:
 *   columns      – Array<{ key: string, label: string, render?: (value, row) => ReactNode }>
 *   data         – Array<object>
 *   loading      – boolean
 *   pagination   – { page, limit, total, totalPages }
 *   onPageChange – (page: number) => void
 *   onLimitChange– (limit: number) => void
 *   emptyMessage – string  (default: 'No data found')
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  emptyMessage = 'No data found',
}) {
  const { page = 1, limit = 10, total = 0, totalPages = 1 } = pagination || {};

  const LIMIT_OPTIONS = [10, 25, 50, 100];

  return (
    <div className="card overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 dark:border-zinc-800/50 last:border-0"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-400 dark:text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className="border-b border-gray-50 dark:border-zinc-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-gray-700 dark:text-gray-300"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800 flex-wrap gap-2">
          {/* Left: rows info + limit select */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {total === 0
                ? '0 results'
                : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
            </span>
            {onLimitChange && (
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="border border-gray-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-sm bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {LIMIT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: page buttons */}
          {onPageChange && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="btn btn-secondary p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-gray-400 text-sm select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => onPageChange(item)}
                      disabled={loading}
                      className={`btn px-3 py-1 text-sm ${
                        item === page
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : 'btn-secondary'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="btn btn-secondary p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
