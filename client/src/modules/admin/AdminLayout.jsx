import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BookMarked, Library, Globe, Image, Cpu, ScrollText, Activity, LogOut, Moon, Sun } from 'lucide-react';
import { useLogout, useCurrentUser } from '@shared/hooks/useAuth';
import { useTheme } from '@shared/context/ThemeContext';
import { cn } from '@shared/utils/cn';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/users',     label: 'Users',         icon: Users },
  { to: '/admin/semesters', label: 'Semesters',     icon: BookMarked },
  { to: '/admin/subjects',  label: 'Subjects',      icon: Library },
  { to: '/admin/cms',       label: 'Website CMS',   icon: Globe },
  { to: '/admin/media',     label: 'Media Manager', icon: Image },
  { to: '/admin/ai-config', label: 'AI Config',     icon: Cpu },
  { to: '/admin/audit',     label: 'Audit Logs',    icon: ScrollText },
  { to: '/admin/system',    label: 'System',         icon: Activity },
];

export default function AdminLayout() {
  const { mutate: logout } = useLogout();
  const user = useCurrentUser();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">VJIT IT Hub</div>
              <div className="text-xs text-rose-400 font-medium">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-rose-500/20 text-rose-400'
                         : 'text-zinc-400 hover:bg-zinc-800 hover:text-white')
            }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-zinc-800">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
                {user.fullName?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.fullName}</div>
                <div className="text-xs text-rose-400 font-medium">Super Admin</div>
              </div>
            </div>
          )}
          <div className="flex gap-1">
            <button onClick={toggleTheme} className="btn-icon btn-ghost flex-1 text-zinc-400">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => logout()} className="btn-icon btn-ghost flex-1 text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-6">
          <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Administration Console</h1>
          <span className="text-xs text-gray-400">VJIT IT Academic Hub</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={useLocation().pathname}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }} className="p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
