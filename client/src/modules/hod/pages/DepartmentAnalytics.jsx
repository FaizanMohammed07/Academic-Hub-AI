import { BarChart3 } from 'lucide-react';

export default function DepartmentAnalytics() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="page-title">Department Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Full implementation coming in Phase 1 sprint.</p>
        </div>
      </div>
      <div className="card p-12 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Department Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            This module is scaffolded and ready for implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
