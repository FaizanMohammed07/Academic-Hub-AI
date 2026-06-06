import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, ClipboardList, FlaskConical,
  NotebookPen, Archive, FolderOpen, Calendar, Clock,
  Award, Bell, LogOut, ChevronLeft, Menu, Moon, Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useLogout, useCurrentUser } from '@shared/hooks/useAuth';
import { useTheme } from '@shared/context/ThemeContext';
import { cn } from '@shared/utils/cn';
import NotificationBell from '@shared/components/ui/NotificationBell';

const NAV = [
  { to: '/student/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/student/assignments',  label: 'Assignments',  icon: ClipboardList },
  { to: '/student/observations', label: 'Observations', icon: FlaskConical },
  { to: '/student/notebook',     label: 'Notebook',     icon: NotebookPen },
  { to: '/student/vault',        label: 'Academic Vault',icon: Archive },
  { to: '/student/portfolio',    label: 'Portfolio',    icon: FolderOpen },
  { to: '/student/certificates', label: 'Certificates', icon: Award },
  { to: '/student/timetable',    label: 'Timetable',    icon: Clock },
  { to: '/student/calendar',     label: 'Calendar',     icon: Calendar },
];

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const user = useCurrentUser();
  const { isDark, toggleTheme } = useTheme();

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 h-full transition-all duration-300',
      mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">VJIT IT Hub</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Student Portal</div>
            </div>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed((c) => !c)} className="btn-icon btn-ghost flex-shrink-0">
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || mobile) && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user + actions */}
      <div className="p-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.fullName?.[0] || 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.fullName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.loginId}</div>
            </div>
          </div>
        )}
        <div className="flex gap-1">
          <button onClick={toggleTheme} className="btn-icon btn-ghost flex-1">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => logout()} className="btn-icon btn-ghost flex-1 text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-icon btn-ghost"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
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
