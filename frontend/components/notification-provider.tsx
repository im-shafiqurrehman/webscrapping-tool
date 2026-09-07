'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  href: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  notify: (notification: Omit<AppNotification, 'id'>) => void;
  markAllRead: () => void;
}

const initialNotifications: AppNotification[] = [
  {
    id: 'reply',
    title: 'Valley Smile Studio replied',
    detail: '24 minutes ago',
    href: '/pipeline',
  },
  {
    id: 'meeting',
    title: 'Orchard Auto Care booked a meeting',
    detail: '1 hour ago',
    href: '/pipeline',
  },
  {
    id: 'audit',
    title: 'Cedar & Stone audit was updated',
    detail: 'Yesterday',
    href: '/businesses/prospect-2',
  },
];

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const notify = useCallback((notification: Omit<AppNotification, 'id'>) => {
    const next = { ...notification, id: `notification-${Date.now()}-${Math.random()}` };
    setNotifications((current) => [next, ...current]);
    toast.success(notification.title, { description: notification.detail });
  }, []);

  const value = useMemo(
    () => ({ notifications, notify, markAllRead: () => setNotifications([]) }),
    [notifications, notify],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
