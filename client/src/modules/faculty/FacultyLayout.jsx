import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, FlaskConical, HelpCircle,
  Sparkles, BarChart3, LogOut, Moon, Sun, Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useLogout, useCurrentUser } from '@shared/hooks/useAuth';
import { useTheme } from '@shared/context/ThemeContext';
import { cn } from '@shared/utils/cn';
import NotificationBell from '@shared/components/ui/NotificationBell';

const NAV = [
  { to: '/faculty/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/faculty/assignments', label: 'Assignments',  icon: ClipboardList },
  { to: '/faculty/observations',label: 'Observations', icon: FlaskConical },
  { to: '/faculty/quizzes',     label: 'Quizzes',      icon: HelpCircle },
  { to: '/faculty/ai-tools',    label: 'AI Tools',     icon: Sparkles },
  { to: '/faculty/analytics',   label: 'Analytics',    icon: BarChart3 },
];

export default function FacultyLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const user = useCurrentUser();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">VJIT IT Hub</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Faculty Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white')
            }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                {user.fullName?.[0] || 'F'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.fullName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Faculty</div>
              </div>
            </div>
          )}
          <div className="flex gap-1">
            <button onClick={toggleTheme} className="btn-icon btn-ghost flex-1">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => logout()} className="btn-icon btn-ghost flex-1 text-red-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden btn-icon btn-ghost">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={useLocation().pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
