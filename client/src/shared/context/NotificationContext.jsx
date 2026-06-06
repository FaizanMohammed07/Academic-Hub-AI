import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = uuid();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error:   (title, message) => addToast({ type: 'error',   title, message }),
    info:    (title, message) => addToast({ type: 'info',    title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  return (
    <NotificationContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useToast must be inside NotificationProvider');
  return ctx.toast;
};

export const useToasts = () => useContext(NotificationContext);
