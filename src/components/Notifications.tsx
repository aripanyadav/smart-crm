import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { followUpService } from '../services/followUps';
import type { FollowUp } from '../services/followUps';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState<FollowUp[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await followUpService.getFollowUps();
      // Only show Pending follow-ups that are due today or overdue
      const now = new Date();
      const filtered = data.filter(f => {
        if (f.status !== 'Pending') return false;
        const dueDate = new Date(f.due_date);
        return dueDate <= now || isSameDay(dueDate, now);
      });
      setNotifications(filtered);

      // Browser notification for extremely urgent ones (optional)
      if (filtered.length > notifications.length && Notification.permission === 'granted') {
        new Notification('Nowworks: New Follow-up Due!', {
          body: `You have ${filtered.length} follow-ups waiting.`,
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const requestPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const getStatusColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now && !isSameDay(due, now)) return 'text-red-500';
    return 'text-orange-500';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          requestPermission();
        }}
        className="relative p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {notifications.length} Due
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to="/tasks"
                    onClick={() => setIsOpen(false)}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-lg bg-current/10 ${getStatusColor(n.due_date)}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {n.leads?.contacts?.name || 'Unknown Contact'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                          {n.note}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(n.due_date).toLocaleString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/tasks"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2 text-center text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              View All Tasks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
