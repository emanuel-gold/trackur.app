import { useEffect, useRef, useState, useCallback } from 'react';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY = 'trackur_lastNotifiedDates';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getLastNotified() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function setLastNotified(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function collectDueTodos(jobs, profile) {
  const today = getToday();
  const tomorrow = getTomorrow();
  const dueToday = [];
  const overdue = [];
  const dueTomorrow = [];

  for (const job of jobs) {
    for (const todo of job.todos ?? []) {
      if (todo.completed || !todo.dueDate) continue;
      if (profile.notifyDueToday && todo.dueDate === today) {
        dueToday.push({ ...todo, company: job.company, role: job.role });
      }
      if (profile.notifyOverdue && todo.dueDate < today) {
        overdue.push({ ...todo, company: job.company, role: job.role });
      }
      if (profile.notifyDueTomorrow && todo.dueDate === tomorrow) {
        dueTomorrow.push({ ...todo, company: job.company, role: job.role });
      }
    }
  }

  return { dueToday, overdue, dueTomorrow };
}

function formatBody(items, max = 3) {
  const lines = items.slice(0, max).map((t) => `${t.company} — ${t.role}: ${t.text}`);
  if (items.length > max) lines.push(`+${items.length - max} more`);
  return lines.join('\n');
}

function fireNotification(title, items) {
  if (items.length === 0) return;
  try {
    new Notification(title, {
      body: formatBody(items),
      icon: '/favicon.svg',
      tag: title, // collapse duplicates
    });
  } catch {
    // Notification constructor may fail in some contexts
  }
}

export default function useNotifications(jobs, profile) {
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const intervalRef = useRef(null);

  const notificationsSupported = typeof Notification !== 'undefined';

  const requestPermission = useCallback(async () => {
    if (!notificationsSupported) return 'denied';
    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result;
  }, [notificationsSupported]);

  const checkAndNotify = useCallback(() => {
    if (!notificationsSupported || Notification.permission !== 'granted') return;
    if (!profile || !jobs) return;

    const today = getToday();
    const lastNotified = getLastNotified();

    // Only fire each trigger type once per calendar day
    const { dueToday, overdue, dueTomorrow } = collectDueTodos(jobs, profile);

    if (dueToday.length > 0 && lastNotified.dueToday !== today) {
      fireNotification('trackur: Follow-ups due today', dueToday);
      lastNotified.dueToday = today;
    }

    if (overdue.length > 0 && lastNotified.overdue !== today) {
      fireNotification('Trackur: Overdue follow-ups', overdue);
      lastNotified.overdue = today;
    }

    if (dueTomorrow.length > 0 && lastNotified.dueTomorrow !== today) {
      fireNotification('trackur: Follow-ups due tomorrow', dueTomorrow);
      lastNotified.dueTomorrow = today;
    }

    setLastNotified(lastNotified);
  }, [jobs, profile, notificationsSupported]);

  // Check on mount and periodically
  useEffect(() => {
    // Small delay on initial check to let data load
    const timeout = setTimeout(checkAndNotify, 2000);
    intervalRef.current = setInterval(checkAndNotify, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, [checkAndNotify]);

  return {
    notificationsSupported,
    permissionState,
    requestPermission,
  };
}
