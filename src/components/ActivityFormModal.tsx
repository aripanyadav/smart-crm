import { useState } from 'react';
import { X, Phone, Users, MessageSquare, FileText, Loader2, AlertCircle } from 'lucide-react';
import { activityService } from '../services/activities';
import type { ActivityType } from '../services/activities';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadId: string;
  leadName: string;
}

export default function ActivityFormModal({ isOpen, onClose, onSuccess, leadId, leadName }: ActivityFormModalProps) {
  const [formData, setFormData] = useState({
    type: 'call' as ActivityType,
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.note.trim()) {
      setError('Please add a note about the activity');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await activityService.createActivity({
        lead_id: leadId,
        type: formData.type,
        note: formData.note
      });
      onSuccess();
      onClose();
      setFormData({ type: 'call', note: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Log Activity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For {leadName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['call', 'meeting', 'message'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    formData.type === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  {type === 'call' && <Phone className="w-5 h-5 mb-1" />}
                  {type === 'meeting' && <Users className="w-5 h-5 mb-1" />}
                  {type === 'message' && <MessageSquare className="w-5 h-5 mb-1" />}
                  <span className="text-xs font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                required
                placeholder="What happened during this activity?"
                rows={4}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
