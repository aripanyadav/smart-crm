import { useState, useEffect } from 'react';
import { Phone, Users, MessageSquare, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Activity {
  id: string;
  type: string;
  note: string;
  created_at: string;
}

const typeConfigs: Record<string, { icon: any, color: string, bgColor: string }> = {
  call: {
    icon: Phone,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  meeting: {
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  message: {
    icon: MessageSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  }
};

interface ActivityTimelineProps {
  refreshKey?: number;
}

export default function ActivityTimeline({ refreshKey }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [refreshKey]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activities')
        .select('id, type, note, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Timeline</h2>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent dark:before:from-gray-700 dark:before:via-gray-700">
          {activities.map((activity) => {
            const config = typeConfigs[activity.type.toLowerCase()] || typeConfigs.message;
            const Icon = config.icon;
            
            return (
              <div key={activity.id} className="relative flex items-start gap-4 group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-10 ${config.bgColor} ${config.color} shadow-sm border-2 border-white dark:border-gray-800 transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {activity.note || 'No description provided.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
