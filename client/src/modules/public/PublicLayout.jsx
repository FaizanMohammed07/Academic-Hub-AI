import { Outlet } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
