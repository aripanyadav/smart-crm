import { useState, useEffect } from 'react';
import { X, Phone, Users, MessageSquare, Loader2, AlertCircle, Clock, Plus } from 'lucide-react';
import { activityService } from '../services/activities';
import type { Activity, ActivityType } from '../services/activities';

interface LeadActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

export default function LeadActivitiesModal({ isOpen, onClose, leadId, leadName }: LeadActivitiesModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'call' as ActivityType,
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivitiesByLead(leadId);
      setActivities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchActivities();
    }
  }, [isOpen, leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.note.trim()) return;

    try {
      setIsSubmitting(true);
      await activityService.createActivity({
        lead_id: leadId,
        type: formData.type,
        note: formData.note
      });
      setFormData({ type: 'call', note: '' });
      setIsFormOpen(false);
      fetchActivities();
    } catch (err: any) {
      setError(err.message || 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Timeline</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Interactions with {leadName}</p>
          </div>
          <div className="flex items-center gap-3">
            {!isFormOpen && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Log Activity
              </button>
            )}
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isFormOpen && (
            <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-4 duration-200">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Log New Activity</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(['call', 'meeting', 'message'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
                        formData.type === type
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {getActivityIcon(type)}
                      <span className="text-xs font-medium capitalize">{type}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  placeholder="What was discussed?"
                  rows={3}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white resize-none text-sm"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Activity'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No activities logged yet.</p>
              {!isFormOpen && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 text-primary text-sm font-medium hover:underline"
                >
                  Log your first activity
                </button>
              )}
            </div>
          ) : (
            <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex gap-6 pl-2">
                  <div className={`absolute left-[0.625rem] w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 mt-1.5 z-10 ${
                    activity.type === 'call' ? 'bg-blue-500' :
                    activity.type === 'meeting' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-sm">
                        <span className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm">
                          {getActivityIcon(activity.type)}
                        </span>
                        <span className="capitalize">{activity.type}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                        {new Date(activity.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {activity.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
