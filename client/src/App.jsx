import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './router';
import { ThemeProvider } from './shared/context/ThemeContext';
import { NotificationProvider } from './shared/context/NotificationContext';
import { Toaster } from './shared/components/ui/Toaster';
import PageLoader from './shared/components/ui/PageLoader';

export default function App() {
  const element = useRoutes(routes);
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Suspense fallback={<PageLoader />}>
          {element}
        </Suspense>
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  );
}
